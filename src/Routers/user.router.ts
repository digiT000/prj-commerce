import express from 'express'
import { UserController } from '../Controllers/user.controller'
import { authenticateUser } from '../Middleware/authenticateUser.middleware'

const userRouter = express()
const userController = new UserController()

userRouter.put('/v1/user', userController.login.bind(userController))
userRouter.post('/v1/user', userController.register.bind(userController))
userRouter.put(
    '/v1/user/logout',
    authenticateUser,
    userController.logout.bind(userController)
)

export default userRouter
