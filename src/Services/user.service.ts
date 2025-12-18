import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import bcyrpt from 'bcrypt'
import { LoginRequest, LoginResponse, RegisterRequest } from '../dtos/user.dto'
import { UserError } from '../Error/user.error'
import { JwtPayload, TokenUtils } from '../Utils/token.utils'

const saltRounds = 10

export class UserService {
    private userRepository: Repository<User>

    constructor() {
        this.userRepository = AppDataSource.getRepository(User)
    }

    // Login
    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email: loginRequest.email })
            .addSelect('user.hashPassword') // ✅ Explicitly select hidden field
            .getOne()

        if (!user) {
            throw UserError.EmailNotValid()
        }

        const isValidPassword = await bcyrpt.compare(
            loginRequest.password,
            user.hashPassword
        )

        if (!isValidPassword) {
            throw UserError.PasswordNotValid()
        }

        if (!user.hasVerifiedEmail) {
            throw UserError.NotYetVerified()
        }

        const payloadToken: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        }

        const { accessToken, refreshToken } =
            TokenUtils.generatePairToken(payloadToken)

        user.refreshToken = refreshToken
        await this.userRepository.update(user.id, {
            refreshToken: refreshToken,
            expiryTimeRefreshToken: Date.now() + 30 * 24 * 60 * 60 * 1000,
            lastLoginAt: new Date(),
        })
        return {
            accessToken,
            refreshToken,
            email: user.email,
            name: user.name,
        }
    }

    async register(registerRequest: RegisterRequest) {
        const queryRunner = AppDataSource.createQueryRunner()

        try {
            const { email, name, password } = registerRequest

            const user = await this.getUserData(email)

            if (user) {
                throw UserError.UserAlreadyExist()
            }

            const hashedPassword = await bcyrpt.hash(password, saltRounds)

            await queryRunner.connect()
            await queryRunner.startTransaction()

            // Save data to db
            queryRunner.manager.create(User, {
                email,
                name,
                hashPassword: hashedPassword,
            })

            await queryRunner.commitTransaction()

            return {
                email,
                name,
                emailVerification: 'token-to-be-sent-via-email',
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            queryRunner.release()
        }
    }

    async getUserData(email: string) {
        const user = await this.userRepository.findOneBy({
            email: email,
        })
        return user
    }

    // Logout
    async logout(userId: string) {
        const user = this.userRepository.findOneBy({
            id: userId,
        })

        if (!user) {
            throw UserError.NotFound(userId)
        }

        await this.userRepository.update(userId, {
            refreshToken: null,
        })
    }

    async refreshToken(userId: string, oldRefreshToken: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where({
                id: userId,
            })
            .addSelect('user.refreshToken')
            .getOne()
        if (!user) {
            throw UserError.NotFound(userId)
        }

        if (user.refreshToken !== oldRefreshToken) {
            throw UserError.InvalidToken()
        }

        if (
            TokenUtils.isRefreshTokenExpiry(
                new Date(user.expiryTimeRefreshToken || '')
            )
        ) {
            await this.userRepository.update(userId, {
                refreshToken: null,
                expiryTimeRefreshToken: null,
            })
            throw UserError.TokenIsExpired()
        }

        return TokenUtils.generateAccessToken({
            email: user.email,
            userId: user.id,
            role: user.role,
        })
    }

    // Verified Email

    // Send Verification
}
