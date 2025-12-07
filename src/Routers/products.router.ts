import express from 'express'
import { ProductController } from '../Controllers/products.controller'
import { authenticateRoleAdmin } from '../Middleware/authenticateRole.middleware'
import { authenticateUser } from '../Middleware/authenticateUser.middleware'

const productRouter = express()
const productController = new ProductController()

productRouter.get(
    '/v1/products',
    productController.getProducts.bind(productController)
)
productRouter.get(
    '/v1/products/:slug',
    productController.getProductById.bind(productController)
)
productRouter.post(
    '/v1/products',
    authenticateUser,
    authenticateRoleAdmin,
    productController.createNewProduct.bind(productController)
)
productRouter.delete(
    '/v1/products/:id',
    authenticateUser,
    authenticateRoleAdmin,
    productController.deleteProduct.bind(productController)
)
productRouter.put(
    '/v1/products/:id',
    authenticateUser,
    authenticateRoleAdmin,
    productController.updateProducts.bind(productController)
)

export default productRouter
