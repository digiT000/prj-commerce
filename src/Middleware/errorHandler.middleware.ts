import { Request, Response, NextFunction } from 'express'
import { ProductError } from '../Error/products.error'
import { CategoryError } from '../Error/category.error'
import { QueryFailedError } from 'typeorm'
import { AppError } from '../Error/app.error'
import { UserError } from '../Error/user.error'
import { ImageError } from '../Error/image.error'

export function errorHandle(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error('Error:', error)

    if (
        error instanceof ProductError ||
        error instanceof CategoryError ||
        error instanceof UserError ||
        error instanceof ImageError
    ) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            error: error.name,
        })
    }

    if (error instanceof QueryFailedError) {
        const pgError = error.driverError
        const errorMap: Record<string, { message: string; status: number }> = {
            '23505': { message: 'Duplicate entry', status: 409 },
            '23503': { message: 'Related record not found', status: 400 },
            '23502': { message: 'Required field missing', status: 400 },
        }

        const mappedError = errorMap[pgError.code]

        if (mappedError) {
            return res.status(mappedError.status).json({
                status: mappedError.status,
                message: mappedError.message,
                error: 'DatabaseError',
            })
        }

        return res.status(400).json({
            status: 400,
            message: `[${pgError.code}] - Database operation failed`,
            error: 'DatabaseError',
        })
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            error: error.name,
        })
    }
    return res.status(500).json({
        status: 500,
        message: 'An unexpected error occurred',
        error: 'InternalServerError',
    })
}
