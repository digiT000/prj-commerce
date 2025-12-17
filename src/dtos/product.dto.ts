import { Product } from '../entity/Product'
import { OrderBy, SourceWeb, Status, TypeImageRequest } from '../types/custom'
import { ImageResponse } from './image.dto'

export interface ProductResponse extends Pick<
    Product,
    'id' | 'name' | 'price' | 'slug'
> {
    images: ImageResponse[]
}

export interface CreateNewProductRequest extends Pick<
    Product,
    'name' | 'price' | 'categoryId'
> {
    imageIds: string[]
    type: TypeImageRequest
}

export type CreateNewProductResponse = Pick<
    Product,
    'name' | 'price' | 'slug' | 'id'
>

export interface UpdateProductRequest extends Pick<
    Product,
    'name' | 'categoryId' | 'price'
> {
    imageIds: string[]
}
export type DeleteProductResponse = {
    id: string
    deleted: boolean
}

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

export interface GetProductsPaginationResponse {
    products: ProductResponse[]
    totalProducts: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export interface GetProductsCursorResponse {
    products: ProductResponse[]
    nextCursor: string | null
    hasNextPage: boolean
}

export type GetProductsResponse =
    | GetProductsPaginationResponse
    | GetProductsCursorResponse
