import express from 'express'
import { CategoryController } from '../Controllers/category.controller'

const categoryRouter = express()
const categoryController = new CategoryController()

categoryRouter.post(
    '/v1/category',
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
    categoryController.deleteCategory.bind(categoryController)
)
categoryRouter.put(
    '/v1/category/:id',
    categoryController.updateCategory.bind(categoryController)
)

export default categoryRouter
