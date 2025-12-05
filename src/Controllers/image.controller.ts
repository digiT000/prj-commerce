import { Request, Response } from 'express'
import { asyncHandler } from '../Utils/handlerWrapper'

import cloudinary, { CLOUD_NAME } from '../config/cloudinary'
import { ImageError } from '../Error/image.error'
import { randomUUID } from 'crypto'
import { TypeImageRequest } from '../types/custom'

export class ImageController {
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
}
