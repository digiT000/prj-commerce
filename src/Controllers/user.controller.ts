import { Request, Response } from 'express'
import { UserService } from '../Services/user.service'
import { asyncHandler } from '../Utils/handlerWrapper'
import { LoginRequest, RegisterRequest } from '../dtos/user.dto'
import fieldRequiredValidation from '../Utils/fieldRequiredValidation'
import { UserError } from '../Error/user.error'
import { JwtPayload } from '../Utils/token.utils'

export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    login = asyncHandler(async (req: Request, res: Response) => {
        const loginData = req.body

        const requiredFields: (keyof LoginRequest)[] = ['email', 'password']
        const missingField = fieldRequiredValidation(requiredFields, loginData)

        if (missingField.length > 0) {
            throw new UserError(
                `Missing required fields [${missingField}]`,
                400
            )
        }

        const userLogin = await this.userService.login(
            loginData as LoginRequest
        )

        res.cookie('refreshToken', userLogin.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            status: 200,
            message: 'Login Successfull',
            data: userLogin,
        })
    })

    register = asyncHandler(async (req: Request, res: Response) => {
        const registerData = req.body

        const requiredFields: (keyof RegisterRequest)[] = [
            'email',
            'password',
            'name',
        ]
        const missingField = fieldRequiredValidation(
            requiredFields,
            registerData
        )

        if (missingField.length > 0) {
            throw new UserError(
                `Missing required fields [${missingField}]`,
                400
            )
        }

        const userRegister = await this.userService.register(registerData)

        res.status(201).json({
            status: 201,
            message: 'Register Successfull',
            data: userRegister,
        })
    })

    logout = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload

        if (!user) {
            throw new UserError('user information is missing', 400)
        }
        await this.userService.logout(user.userId)
        res.status(200).json({
            status: 200,
            message: 'Logout success',
        })
    })

    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.cookies
        const user = req.user as JwtPayload

        if (!refreshToken) {
            throw UserError.TokenNotProvided()
        }
        const newTokens = await this.userService.refreshToken(
            user.userId,
            refreshToken
        )

        res.status(200).json({
            status: 200,
            message: 'Token refreshed successfully',
            data: newTokens,
        })
    })
}
