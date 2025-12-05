import { Image } from '../entity/Image'
import { Product } from '../entity/Product'
import { OrderBy, SourceWeb, Status, TypeImageRequest } from '../types/custom'

export interface imageResponse {
    urlWebp: string
    urlThumbnail: string
}

export interface ProductByIdResponse extends Pick<
    Product,
    'id' | 'name' | 'price' | 'slug'
> {
    images: imageResponse[]
}

export interface CreateNewProductRequest extends Pick<
    Product,
    'name' | 'price' | 'categoryId'
> {
    imageIds: string[]
    type: TypeImageRequest
}

export interface CreateNewProductResponse extends Pick<
    Product,
    'name' | 'price' | 'slug' | 'id'
> {}

export interface UpdateProductRequest extends Pick<
    Product,
    'name' | 'categoryId' | 'price'
> {}

export interface GetProductsParamsRequest {
    categoryId?: string
    priceMin?: number
    priceMax?: number
    status?: Status
    page?: number
    limit?: number
    cursor?: string
    sourceWeb: SourceWeb
    orderBy: OrderBy
}
