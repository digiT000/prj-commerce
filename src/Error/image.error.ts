export class ImageError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 400) {
        super(message)
        this.name = 'ImageError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }

    static InvalidRequest() {
        return new ImageError('Please include filename', 400)
    }
    static InvalidTypeRequest() {
        return new ImageError('Please inclure type : product or category', 400)
    }
}
