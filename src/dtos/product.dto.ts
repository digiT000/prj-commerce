import { Product } from '../entity/Product'
import { OrderBy, SourceWeb, Status } from '../types/custom'

export type ProductByIdResponse = Pick<
    Product,
    'id' | 'name' | 'price' | 'slug'
>

export interface CreateNewProductRequest extends Pick<
    Product,
    'name' | 'price' | 'categoryId'
> {}

export interface CreateNewProductResponse extends Pick<
    Product,
    'name' | 'price' | 'slug'
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
