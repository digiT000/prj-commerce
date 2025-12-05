import express from 'express'
import { ImageController } from '../Controllers/image.controller'
const imageRouter = express()
const imageController = new ImageController()

imageRouter.get(
    '/v1/image/get-signature',
    imageController.getImageSignature.bind(imageController)
)
imageRouter.post('/v1/image', imageController.saveImages.bind(imageController))

export default imageRouter
