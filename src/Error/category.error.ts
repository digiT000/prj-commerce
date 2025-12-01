export class CategoryError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 400) {
        super(message)
        this.name = 'CategoryError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }

    static NotFound(category: string) {
        return new CategoryError(
            `Category with id/slug ${category} not found`,
            404
        )
    }

    static DuplicateCategory() {
        return new CategoryError('Category already exists.', 409)
    }

    static MissingCategoryId() {
        return new CategoryError('Missing category Id', 400)
    }
}
