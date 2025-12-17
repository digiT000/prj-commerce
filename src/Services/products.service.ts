import { Repository, QueryFailedError, In } from 'typeorm'
import {
    CreateNewProductRequest,
    CreateNewProductResponse,
    DeleteProductResponse,
    GetProductsParamsRequest,
    GetProductsResponse,
    ProductResponse,
    UpdateProductRequest,
} from '../dtos/product.dto'
import { ProductError } from '../Error/products.error'
import { AppDataSource } from '../data-source'
import { Product } from '../entity/Product'

import { CategoryService } from './category.service'
import { Status, StatusImage, TypeImageRequest } from '../types/custom'
import { Image } from '../entity/Image'
import { ImageError } from '../Error/image.error'
import { ImageService } from './image.service'
import { mappedImageReponse } from '../Utils/mappedImageResponse'
import { mappedProductResponse } from '../Utils/mappedProductResponse'

export class ProductService {
    // Constructor
    // Access DB
    private productRepository: Repository<Product>
    private imageRepositoy: Repository<Image>
    private categoryService: CategoryService
    private imageService: ImageService

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product)
        this.imageRepositoy = AppDataSource.getRepository(Image)
        this.categoryService = new CategoryService()
        this.imageService = new ImageService()
    }

    // GET PRODUCTS
    async getProducts(
        productsParams: GetProductsParamsRequest
    ): Promise<GetProductsResponse> {
        const {
            categoryId,
            orderBy,
            limit = 10,
            priceMin,
            priceMax,
            status,
        } = productsParams
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndMapMany(
                'product.images',
                Image,
                'image',
                'image.types = :imageType AND image.entityId = product.id AND image.status = :imageStatus',
                {}
            )
            .setParameters({
                imageType: TypeImageRequest.PRODUCTS,
                imageStatus: StatusImage.ACTIVE,
            })
            .orderBy('product.createdAt', orderBy)

        if (categoryId) {
            query.where('product.categoryId = :categoryId', {
                categoryId: categoryId,
            })
        }
        if (priceMin && priceMax) {
            query.where('product.price BETWEEN :priceMin AND :priceMax', {
                priceMin: priceMin,
                priceMax: priceMax,
            })
        }

        if (priceMin) {
            query.where('product.price >= :priceMin', {
                priceMin: priceMin,
            })
        }

        if (priceMax) {
            query.where('product.price <= :priceMax', {
                priceMax: priceMax,
            })
        }

        if (productsParams.sourceWeb === 'INTERNAL') {
            if (status) {
                query.andWhere('product.status = :status', {
                    status: status,
                })
            }

            const { page = 1 } = productsParams
            const skip = (page - 1) * limit

            const [products, totalProducts] = await query
                .skip(skip)
                .take(limit)
                .withDeleted()
                .getManyAndCount()

            const totalPages = Math.ceil(totalProducts / limit)
            const mappedProduct = mappedProductResponse(products)

            return {
                products: mappedProduct,
                totalProducts,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > totalPages,
            }
        } else if (productsParams.sourceWeb === 'USER') {
            const { cursor } = productsParams

            if (cursor) {
                const [cursorDate, cursorId] = cursor.split('_')
                query.andWhere(
                    '(product.createdAt < :cursorDate OR product.createdAt = :cursorDate',
                    { cursorDate, cursorId }
                )
            }

            query.take(limit + 1)

            const products = await query.getMany()
            const hasNextPage = products.length > limit

            const items = hasNextPage ? products.slice(0, limit) : products

            const finalProduct = mappedProductResponse(items)

            const nextCursor = hasNextPage
                ? `${items[items.length - 1].createdAt.toISOString()}_${items[items.length - 1].id}`
                : null

            return {
                products: finalProduct,
                nextCursor,
                hasNextPage,
            }
        } else {
            throw new ProductError('Invalid Web Source', 400)
        }
    }

    async getProductsById(slug: string): Promise<ProductResponse> {
        const product = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndMapMany(
                'product.images',
                Image,
                'image',
                'image.entityType = :imageType AND image.entityId = product.id AND image.status = :imageStatus',
                {}
            )
            .setParameters({
                imageType: TypeImageRequest.PRODUCTS, // Use enum, not string
                imageStatus: StatusImage.ACTIVE,
            })
            .where('product.slug = :slug', { slug })
            .getOne()

        if (!product) throw ProductError.NotFound(slug)

        const images = mappedImageReponse(product?.images || [])

        const finalProduct: ProductResponse = {
            id: product.id,
            name: product.name,
            price: product.price,
            slug: product.slug,
            images,
        }

        return finalProduct
    }

    async createNewProduct(
        product: CreateNewProductRequest
    ): Promise<CreateNewProductResponse> {
        const category = await this.categoryService.getCategoryById(
            product.categoryId
        )

        if (
            category.status === Status.DELETED ||
            category.status === Status.DISABLE
        ) {
            throw ProductError.CategoryInactive(category.name, category.status)
        }

        const createProduct = this.productRepository.create({
            name: product.name,
            price: product.price,
            categoryId: product.categoryId,
        })

        const newProduct = await this.productRepository.save(createProduct)

        return {
            name: newProduct.name,
            price: newProduct.price,
            slug: newProduct.slug,
            id: newProduct.id,
        }
    }

    async deleteProduct(productId: string): Promise<DeleteProductResponse> {
        return await AppDataSource.transaction(async (manager) => {
            const product = await manager.findOne(Product, {
                where: {
                    id: productId,
                },
            })
            if (!product) {
                throw ProductError.NotFound(productId)
            }

            await manager.softDelete(Product, { id: productId })
            await manager.update(
                Product,
                { id: productId },
                {
                    status: Status.DELETED,
                }
            )
            await manager.softDelete(Image, {
                entityType: 'products',
                entityId: productId,
            })

            return { id: productId, deleted: true }
        })
    }

    async updateProduct(
        productId: string,
        updateData: UpdateProductRequest
    ): Promise<ProductResponse> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
        })

        if (!product) {
            throw ProductError.NotFound(productId)
        }

        if (updateData.categoryId) {
            product.categoryId = updateData.categoryId
        }

        if (updateData.name) {
            product.name = updateData.name
        }

        if (updateData.price) {
            product.price = updateData.price
        }

        const queryRunner = AppDataSource.createQueryRunner()
        try {
            await queryRunner.connect()
            await queryRunner.startTransaction()

            const updatedProduct = await queryRunner.manager.save(product)

            const imageIds = updateData.imageIds
            let updatedImages

            if (imageIds.length > 0) {
                const listImages = await queryRunner.manager.find(Image, {
                    where: {
                        id: In(imageIds),
                    },
                })

                if (listImages.length !== imageIds.length) {
                    throw new ProductError(
                        `Expected ${imageIds.length} images, but found ${listImages.length}`,
                        400
                    )
                }
                updatedImages = mappedImageReponse(listImages)

                const imageWithDifferentEntityId = listImages.filter(
                    (img) => img.entityId !== productId && img.entityId !== null
                )

                if (imageWithDifferentEntityId.length > 0) {
                    throw new ProductError(
                        `Image you submit is already use by other products. ImageIds : ${imageWithDifferentEntityId}`
                    )
                }

                const imagesToLink = listImages.filter((img) => !img.entityId)
                if (imagesToLink.length > 0) {
                    const imageIdsToLink = imagesToLink.map((img) => img.id)
                    const linkedImages =
                        await this.imageService.linkImageToEntity(
                            imageIdsToLink,
                            productId,
                            queryRunner.manager
                        )

                    if (linkedImages.affected === 0) {
                        throw new ImageError(
                            'No images were updated. All may already be linked to another entity',
                            400
                        )
                    }

                    if (linkedImages.affected !== imageIdsToLink.length) {
                        throw new ImageError(
                            `Expected to update ${imageIds.length} images, but updated ${linkedImages.affected}`,
                            400
                        )
                    }

                    await queryRunner.manager
                        .createQueryBuilder(Image, 'image')
                        .softDelete()
                        .where('"image"."entityId" = :entityId', {
                            entityId: productId,
                        })
                        .andWhere('"image"."id" NOT IN (:...imageIds)', {
                            imageIds,
                        })
                        .execute()
                }
            }

            await queryRunner.commitTransaction()

            return {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price,
                slug: updatedProduct.slug,
                images: updatedImages || [],
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            if (error instanceof ProductError) {
                throw error
            }

            if (error instanceof QueryFailedError) {
                const pgError = error.driverError
                if (pgError.code === '23503') {
                    throw ProductError.CategoryNotExist()
                }
            }

            throw new ProductError('Failed to update product', 500)
        } finally {
            await queryRunner.release()
        }
    }
}
