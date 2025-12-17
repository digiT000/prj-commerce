import express from 'express'
import { CategoryController } from '../Controllers/category.controller'
import { authenticateUser } from '../Middleware/authenticateUser.middleware'
import { authenticateRoleAdmin } from '../Middleware/authenticateRole.middleware'

const categoryRouter = express()
const categoryController = new CategoryController()

categoryRouter.post(
    '/v1/category',
    authenticateUser,
    authenticateRoleAdmin,
    categoryController.createNewCategory.bind(categoryController)
)

categoryRouter.get(
    '/v1/category/:id',
    categoryController.getCategoryById.bind(categoryController)
)

categoryRouter.get(
    '/v1/category',
    categoryController.getCategory.bind(categoryController)
)

categoryRouter.delete(
    '/v1/category/:id',
    authenticateUser,
    authenticateRoleAdmin,
    categoryController.deleteCategory.bind(categoryController)
)
categoryRouter.put(
    '/v1/category/:id',
    authenticateUser,
    authenticateRoleAdmin,
    categoryController.updateCategory.bind(categoryController)
)

export default categoryRouter
