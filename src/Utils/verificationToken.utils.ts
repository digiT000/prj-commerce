import crypto from 'crypto'
import bcrypt from 'bcrypt'

export class VerifcationToken {
    static generateToken(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    static async hashToken(token: string) {
        return await bcrypt.hash(token, 10)
    }

    static async verifyToken(token: string, hashToken: string) {
        return await bcrypt.compare(token, hashToken)
    }
}
