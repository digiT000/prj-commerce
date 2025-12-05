import { Image } from '../entity/Image'
import { TypeImageRequest } from '../types/custom'

export interface ImageRequest extends Pick<
    Image,
    'publicId' | 'urlMedium' | 'urlOptimized' | 'urlOriginal'
> {}

export interface SaveImagesRequest {
    type: TypeImageRequest
    images: ImageRequest[]
}

export interface SaveImagesResponse {
    imageIds: string[]
}
