export class ProductError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 400) {
        super(message)
        this.name = 'ProductError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }

    static MissingIdOrSlug() {
        return new ProductError(`Product Id or slug is missing`, 400)
    }

    static NotFound(productId: string) {
        return new ProductError(`Product with id ${productId} not found`, 404)
    }

    static DuplicateProduct() {
        return new ProductError('Product already exists.', 409)
    }

    static CategoryNotExist() {
        return new ProductError('Category not exist', 400)
    }

    static UnexpectedError() {
        return new ProductError('An unexpected error occurred.', 500)
    }
    static CategoryInactive(categoryName: string, status: string) {
        return new ProductError(
            `Cannot create product. Category "${categoryName}" is ${status.toLowerCase()}`,
            400
        )
    }
}
