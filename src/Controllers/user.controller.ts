import { Request, Response } from 'express'
import { UserService } from '../Services/user.service'
import { asyncHandler } from '../Utils/handlerWrapper'
import { LoginRequest, RegisterRequest } from '../dtos/user.dto'
import fieldRequiredValidation from '../Utils/fieldRequiredValidation'
import { UserError } from '../Error/user.error'

export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    // Login

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
        console.log(userRegister)

        res.status(201).json({
            status: 201,
            message: 'Register Successfull',
            data: userRegister,
        })
    })
}
