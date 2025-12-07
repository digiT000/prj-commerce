import { Status } from 'cloudinary'
import { Category } from '../entity/Category'
import { Product } from '../entity/Product'

export interface CreateNewCategoryRequest extends Pick<Category, 'name'> {}

export interface MetaDataCategory {
    totalProducts: number
}

export interface CategoryResponse extends Pick<
    Category,
    'id' | 'slug' | 'products' | 'name'
> {
    totalProduct: number
}

export interface GetCategoryParamsRequest {
    page?: number
    limit?: number
}

export interface CategoryWithMetaResponse extends Pick<
    Category,
    'id' | 'name' | 'slug'
> {
    products?: Product[]
    status?: Status
    metadata: MetaDataCategory
}

export interface GetCategoryResponse {
    data: CategoryWithMetaResponse[]
    metadata: {
        totalCategories: number
        totalPages: number
        currentPage: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}

export interface UpdateCategoryRequest extends Pick<Category, 'name'> {}
