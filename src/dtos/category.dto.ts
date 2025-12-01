import { Category } from '../entity/Category'

export interface CreateNewCategoryRequest extends Pick<Category, 'name'> {}

interface Meta {
    total: number
}

export interface GetCategoryParamsRequest {
    page?: number
    limit?: number
}

export interface CategoryWithMeta {
    id: string
    name: string
    slug: string
    totalProducts: number
}

export interface GetCategoryResponse {
    data: CategoryWithMeta[]
    meta: {
        totalCategories: number
        totalPages: number
        currentPage: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}

export interface UpdateCategoryRequest extends Pick<Category, 'name'> {}
