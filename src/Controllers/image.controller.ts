import { Request, Response } from 'express'
import { asyncHandler } from '../Utils/handlerWrapper'

import cloudinary, { CLOUD_NAME } from '../config/cloudinary'
import { ImageError } from '../Error/image.error'
import { randomUUID } from 'crypto'
import { TypeImageRequest } from '../types/custom'
import { ImageService } from '../Services/image.service'
import { ImageRequest } from '../dtos/image.dto'
import fieldRequiredValidation from '../Utils/fieldRequiredValidation'

export class ImageController {
    imageService: ImageService

    constructor() {
        this.imageService = new ImageService()
    }

    getImageSignature = asyncHandler(async (req: Request, res: Response) => {
        const fileName = req.body?.fileName
        const type = req.body?.type
        if (!fileName) {
            throw ImageError.InvalidRequest()
        }

        if (
            !type ||
            ![TypeImageRequest.CATEGORIES, TypeImageRequest.PRODUCTS].includes(
                type
            )
        ) {
            throw ImageError.InvalidTypeRequest()
        }

        // Generate timestamp valid
        const timestamp = Math.round(new Date().getTime() / 1000)
        const uuid = randomUUID()
        const publicId = `${type}/tmp/${uuid}-${fileName}`
        const eager = 'f_webp,q_auto|w_500,f_webp,q_auto'
        const folder = 'e-commerce' // in bytes

        const paramsToSign = {
            timestamp,
            eager,
            public_id: publicId,
            folder,
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_SECRET_KEY as string
        )

        res.status(200).json({
            Status: 200,
            message: 'Successfully generated upload signature',
            data: {
                signature,
                timestamp,
                eager,
                publicId,
                folder,
                key: process.env.CLOUDINARY_API_KEY,
                cloudname: CLOUD_NAME,
            },
        })
    })

    saveImages = asyncHandler(async (req: Request, res: Response) => {
        const type = req.body?.type
        if (
            !type ||
            ![TypeImageRequest.CATEGORIES, TypeImageRequest.PRODUCTS].includes(
                type
            )
        ) {
            throw ImageError.InvalidTypeRequest()
        }
        const images = req.body?.images

        if (!images || images.length === 0) {
            throw new ImageError('Please include images', 400)
        }

        const requiredField: (keyof ImageRequest)[] = [
            'publicId',
            'urlMedium',
            'urlOptimized',
            'urlOriginal',
        ]
        const isValid = []
        for (let i = 0; i < images.length; i++) {
            const result = fieldRequiredValidation(requiredField, images[i])
            if (result.length > 0) {
                isValid.push({
                    index: i,
                    missingField: result,
                })
            }
        }

        if (isValid.length > 0) {
            res.status(400).json({
                status: 400,
                message: 'Missing required field',
                missingField: isValid,
            })
            return
        }

        const result = await this.imageService.saveImages({ images, type })
        res.status(201).json({
            status: 200,
            message: 'Success upload image',
            type,
            data: result,
        })
    })
}
