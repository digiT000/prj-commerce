import express from 'express'
import { UserController } from '../Controllers/user.controller'

const userRouter = express()
const userController = new UserController()

userRouter.put('/v1/user', userController.login.bind(userController))
userRouter.post('/v1/user', userController.register.bind(userController))

export default userRouter
