import { Repository, QueryFailedError } from 'typeorm'
import {
    CreateNewProductRequest,
    CreateNewProductResponse,
    GetProductsParamsRequest,
    imageResponse,
    ProductByIdResponse,
    UpdateProductRequest,
} from '../dtos/product.dto'
import { ProductError } from '../Error/products.error'
import { AppDataSource } from '../data-source'
import { Product } from '../entity/Product'
import { Category } from '../entity/Category'
import { CategoryService } from './category.service'
import { Status, StatusImage, TypeImageRequest } from '../types/custom'
import { Image } from '../entity/Image'

export class ProductService {
    // Constructor
    // Access DB
    productRepository: Repository<Product>
    categoryService: CategoryService

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product)
        this.categoryService = new CategoryService()
    }

    // GET PRODUCTS
    async getProducts(productsParams: GetProductsParamsRequest) {
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

        try {
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

                return {
                    products,
                    totalProducts,
                    totalPages,
                    currentPage: page,
                    hasNextPage: page < totalPages,
                    hasPreviosPage: page > totalPages,
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

                const nextCursor = hasNextPage
                    ? `${items[items.length - 1].createdAt.toISOString()}_${items[items.length - 1].id}`
                    : null

                return {
                    products: items,
                    nextCursor,
                    hasNextPage,
                }
            } else {
                throw new ProductError('Invalid Web Source', 400)
            }
        } catch (error) {
            throw error
        }
    }

    async getProductsById(slug: string): Promise<ProductByIdResponse> {
        try {
            const product = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndMapMany(
                    'product.images',
                    Image,
                    'image',
                    'image.types = :imageType AND image.entityId = product.id AND image.status = :imageStatus',
                    {}
                )
                .setParameters({
                    imageType: TypeImageRequest.PRODUCTS, // Use enum, not string
                    imageStatus: StatusImage.ACTIVE,
                })
                .where('product.slug = :slug', { slug })
                .getOne()

            if (!product) throw ProductError.NotFound(slug)

            const images: imageResponse[] =
                product.images?.map((img) => ({
                    urlThumbnail: img.urlOriginal,
                    urlWebp: img.urlOptimized,
                })) || []

            const finalProduct: ProductByIdResponse = {
                id: product.id,
                name: product.name,
                price: product.price,
                slug: product.slug,
                images,
            }

            return finalProduct
        } catch (error) {
            throw error
        }
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

    async deleteProduct(productId: string) {
        const deleted = await this.productRepository.softDelete(productId)
        await this.productRepository.update(productId, {
            status: Status.DELETED,
        })

        if (!deleted.affected) {
            throw ProductError.NotFound(productId)
        }
        return productId
    }

    async updateProduct(productId: string, updateData: UpdateProductRequest) {
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

        try {
            const updatedProduct = await this.productRepository.save(product)

            return {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price,
                slug: updatedProduct.slug,
            }
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const pgError = error.driverError
                if (pgError.code === '23503') {
                    throw ProductError.CategoryNotExist()
                }
            }
            throw error
        }
    }
}
