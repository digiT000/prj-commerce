import { UserRole } from '../types/custom'
import jwt from 'jsonwebtoken'
import { UserError } from '../Error/user.error'

export interface JwtPayload {
    userId: string
    email: string
    role: UserRole
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}

export class TokenUtils {
    private static ACCESS_TOKEN_SECRET =
        process.env.JWT_ACCESS_SECRET || 'your-access-secret'
    private static REFRESH_TOKEN_SECRET =
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'

    // Generate access token
    static generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: '30m',
        })
    }

    // Generate refresh token
    static generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: '5d',
        })
    }

    static generatePairToken(payload: JwtPayload): TokenPair {
        const accessToken = this.generateAccessToken(payload)
        const refreshToken = this.generateRefreshToken(payload)

        return { accessToken, refreshToken }
    }

    static async validateAccessToken(token: string) {
        try {
            const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET)
            return decoded
        } catch (err) {
            console.log('Error Happen when validate', err)
            if (err instanceof jwt.JsonWebTokenError) {
                throw UserError.InvalidToken()
            } else if (err instanceof jwt.TokenExpiredError) {
                throw UserError.TokenIsExpired()
            } else {
                throw new UserError('Failed to verify token', 400)
            }
        }
    }
}
