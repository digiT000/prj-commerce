import { v2 as cloudinary } from 'cloudinary'

export const CLOUD_NAME = 'prj-commerce'

export function initCloudinary() {
    cloudinary.config({
        secure: true,
        cloud_name: CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
        signature_algorithm: 'sha256',
    })
    console.log(cloudinary.config())
}

export default cloudinary
