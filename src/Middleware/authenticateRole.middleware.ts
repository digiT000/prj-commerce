import { Request, NextFunction } from 'express'
import { asyncHandler } from '../Utils/handlerWrapper'
import { UserError } from '../Error/user.error'
import { UserRole } from '../types/custom'

export const authenticateRoleAdmin = asyncHandler(
    async (req: Request, _, next: NextFunction) => {
        const user = req?.user
        if (!user) {
            throw new UserError('No data user provided', 400)
        }
        if (user.role !== UserRole.ADMIN) {
            throw UserError.AdminOnly()
        }
        next()
    }
)
