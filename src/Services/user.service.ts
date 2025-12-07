import { QueryFailedError, Repository } from 'typeorm'
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
        try {
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
                lastLoginAt: new Date(),
            })
            return {
                accessToken,
                refreshToken,
                email: user.email,
                name: user.name,
            }
        } catch (error) {
            throw error
        }
    }

    async register(registerRequest: RegisterRequest) {
        try {
            const { email, name, password } = registerRequest

            const user = await this.getUserData(email)

            if (user) {
                throw UserError.UserAlreadyExist()
            }

            const hashedPassword = await bcyrpt.hash(password, saltRounds)

            // Save data to db
            const newUser = this.userRepository.create({
                email,
                name,

                hashPassword: hashedPassword,
            })

            await this.userRepository.insert(newUser)
            return {
                email,
                name,
            }
        } catch (error) {
            throw error
        }
    }

    async getUserData(email: string) {
        try {
            const user = await this.userRepository.findOneBy({
                email: email,
            })
            return user
        } catch (error) {
            throw error
        }
    }

    // Register

    // Verified Email

    // Send Verification
}
