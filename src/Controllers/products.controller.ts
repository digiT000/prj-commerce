import { Request, Response } from 'express'
import { ProductService } from '../Services/products.service'
import { ProductError } from '../Error/products.error'
import {
    CreateNewProductRequest,
    GetProductsParamsRequest,
    UpdateProductRequest,
} from '../dtos/product.dto'
import fieldRequiredValidation from '../Utils/fieldRequiredValidation'
import { OrderBy, SourceWeb, Status } from '../types/custom'
import { asyncHandler } from '../Utils/handlerWrapper'
import { AppError } from '../Error/app.error'
import { ImageService } from '../Services/image.service'

export class ProductController {
    productService: ProductService
    imageService: ImageService

    constructor() {
        this.productService = new ProductService()
        this.imageService = new ImageService()
    }

    getProducts = asyncHandler(async (req: Request, res: Response) => {
        const sourceWeb = req.sourceWeb as SourceWeb
        const catagoryId = req.query.categoryId as string | undefined
        const orderBy = req.query.orderBy as OrderBy
        const status = req.query.status as Status
        const priceMin = req.query.min
        const priceMax = req.query.max

        // INTERNAL SOURCE
        const page = req.query.page as number | undefined
        const limit = req.query.limit as number | undefined

        // USER SOURCE
        const cursor = req.query.cursor as string | undefined

        const productParams: GetProductsParamsRequest = {
            categoryId: catagoryId || undefined,
            page,
            limit,
            cursor,
            orderBy,
            sourceWeb,
            priceMax: priceMax ? Number(priceMax) : undefined,
            priceMin: priceMin ? Number(priceMin) : undefined,
            status,
        }
        const response = await this.productService.getProducts(productParams)
        res.status(200).json({
            status: 200,
            message: 'Success',
            data: response,
        })
    })

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        const productSlug = req.params.slug

        if (!productSlug) {
            throw ProductError.MissingIdOrSlug()
        }
        const response = await this.productService.getProductsById(productSlug)

        res.status(200).json({
            status: 200,
            message: 'Success get product',
            data: response,
        })
    })

    createNewProduct = asyncHandler(async (req: Request, res: Response) => {
        const data = req.body
        const newProduct = data as CreateNewProductRequest

        const requiredFields: (keyof CreateNewProductRequest)[] = [
            'name',
            'price',
            'categoryId',
            'imageIds',
            'type',
        ]
        const missingFileds = fieldRequiredValidation(
            requiredFields,
            newProduct
        )

        if (missingFileds.length > 0) {
            throw new AppError(
                `Missing required field : [${missingFileds.join(', ')}]`,
                400
            )
        }

        // Validate Image Data
        const imageIds = newProduct.imageIds
        if (imageIds.length === 0) {
            throw new ProductError('No images provided', 400)
        }

        await this.imageService.validatedImages(imageIds, newProduct.type)

        const product = await this.productService.createNewProduct(newProduct)

        // Update Image Data
        await this.imageService.linkImageToEntity(imageIds, product.id)

        res.status(201).json({
            status: 201,
            message: 'Product created',
            data: product,
        })
    })

    deleteProduct = asyncHandler(async (req: Request, res: Response) => {
        const productId = req.params.id

        if (!productId) {
            throw new ProductError('Product Id is missing', 400)
        }

        await this.productService.deleteProduct(productId)
        res.status(201).json({
            status: 201,
            message: 'Product deleted',
        })
    })

    updateProducts = asyncHandler(async (req: Request, res: Response) => {
        const productId = req.params.id

        if (!productId) {
            throw new ProductError('Product Id is missing', 400)
        }

        const data = req.body
        const updated: UpdateProductRequest = {
            price: data?.price,
            categoryId: data?.catagoryId,
            name: data?.name,
        }

        const requiredFields: (keyof UpdateProductRequest)[] = [
            'name',
            'price',
            'categoryId',
        ]
        const missingFileds = fieldRequiredValidation(requiredFields, updated)

        if (missingFileds.length === requiredFields.length) {
            throw new AppError(
                `Missing field : [${missingFileds.join(', ')}]`,
                400
            )
        }

        const product = await this.productService.updateProduct(
            productId,
            updated
        )

        res.status(200).json({
            status: 200,
            message: 'Success Update',
            data: product,
        })
    })
}
