import { ImageResponse } from '../dtos/image.dto'
import { Image } from '../entity/Image'

export function mappedImageReponse(images: Image[]): ImageResponse[] {
    if (images.length === 0) return []

    const newImages =
        images?.map((img) => ({
            urlThumbnail: img.urlOriginal,
            urlWebp: img.urlOptimized,
        })) || []
    return newImages
}
