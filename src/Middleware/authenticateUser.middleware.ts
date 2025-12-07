import { UserError } from '../Error/user.error'
import { asyncHandler } from '../Utils/handlerWrapper'
import { NextFunction, Request, Response } from 'express'
import { JwtPayload, TokenUtils } from '../Utils/token.utils'

export const authenticateUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        try {
            if (!token) {
                throw UserError.TokenNotProvided()
            }
            const user = await TokenUtils.validateAccessToken(token)

            req.user = user as JwtPayload
            next()
        } catch (error) {
            throw error
        }
    }
)
