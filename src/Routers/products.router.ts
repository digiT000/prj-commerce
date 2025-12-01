import express from 'express'
import { ProductController } from '../Controllers/products.controller'

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
    productController.createNewProduct.bind(productController)
)
productRouter.delete(
    '/v1/products/:id',
    productController.deleteProduct.bind(productController)
)
productRouter.put(
    '/v1/products/:id',
    productController.updateProducts.bind(productController)
)

export default productRouter
