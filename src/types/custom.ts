export const SOURCE_WEB = ['USER', 'INTERNAL']
export type SourceWeb = (typeof SOURCE_WEB)[number]

export type OrderBy = 'ASC' | 'DESC'
export enum Status {
    ACTIVE = 'ACTIVE',
    DISABLE = 'DISABLED',
    DELETED = 'DELETED',
}

export enum StatusImage {
    TEMPORARY = 'TEMPORARY',
    ACTIVE = 'ACTIVE',
}

export enum TypeImageRequest {
    PRODUCTS = 'products',
    CATEGORIES = 'categories',
}
