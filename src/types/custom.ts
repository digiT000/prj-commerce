export const SOURCE_WEB = ['USER', 'INTERNAL']
export type SourceWeb = (typeof SOURCE_WEB)[number]

export type OrderBy = 'ASC' | 'DESC'
export enum Status {
    ACTIVE = 'ACTIVE',
    DISABLE = 'DISABLED',
    DELETED = 'DELETED',
}

export enum TYPE_IMAGE_REQUEST {
    PRODUCTS = 'products',
    CATEGORIES = 'categories',
}
