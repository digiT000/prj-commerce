import { ProductResponse } from '../dtos/product.dto'
import { Product } from '../entity/Product'

export function mappedProductResponse(items: Product[]): ProductResponse[] {
    return items.map((item) => {
        const images =
            item.images?.map((img) => ({
                urlThumbnail: img.urlOriginal,
                urlWebp: img.urlOptimized,
            })) || []
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            images,
        }
    })
}
