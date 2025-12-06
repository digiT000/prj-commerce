import {
    EntityManager,
    In,
    IsNull,
    Not,
    QueryFailedError,
    Repository,
} from 'typeorm'
import { Image } from '../entity/Image'
import { AppDataSource } from '../data-source'
import { SaveImagesRequest } from '../dtos/image.dto'
import { ImageError } from '../Error/image.error'
import { StatusImage, TypeImageRequest } from '../types/custom'
import { SelectQueryBuilder } from 'typeorm/browser'
import { DeleteQueryBuilder } from 'typeorm/browser'

export class ImageService {
    private imageRepository: Repository<Image>

    constructor() {
        this.imageRepository = AppDataSource.getRepository(Image)
    }

    async saveImages({ images, type }: SaveImagesRequest): Promise<string[]> {
        const imageToInsert = images.map((img) => ({
            publicId: img.publicId,
            urlOriginal: img.urlOriginal,
            urlMedium: img.urlMedium,
            urlOptimized: img.urlOptimized,
            entityType: type,
        }))
        try {
            const imageResult = await this.imageRepository.insert(imageToInsert)
            if (imageResult.generatedMaps.length === 0) {
                throw new ImageError('Failed to generate image IDs', 400)
            }

            const responseIds = imageResult.generatedMaps.map((map) => map.id)
            return responseIds
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new ImageError('Failed to save images', 400)
            }
            throw error
        }
    }

    async validatedImages(imagesIds: string[], type: TypeImageRequest) {
        try {
            const images = await this.imageRepository.find({
                where: {
                    id: In(imagesIds),
                },
            })

            if (images.length !== imagesIds.length) {
                throw new ImageError(
                    `Expected ${imagesIds.length} images, but found ${images.length}`,
                    400
                )
            }

            const deletedImage = images
                .filter((img) => img.deletedDate !== null)
                .map((newImg) => newImg.id)
            if (deletedImage.length > 0) {
                throw new ImageError(
                    `Validation error: some images are already deleted. IDs: ${deletedImage.join(', ')}`,
                    400
                )
            }

            const invalidTypeImages = images
                .filter((img) => img.entityType !== type)
                .map((img) => img.id)
            if (invalidTypeImages.length > 0) {
                throw new ImageError(
                    `Validation error: image type mismatch. Expected '${type}'. Invalid IDs: ${invalidTypeImages.join(', ')}`,
                    400
                )
            }

            return images
        } catch (error) {
            if (error instanceof ImageError) {
                throw error
            }
            throw new ImageError('Failed to validate images', 500)
        }
    }
    async linkImageToEntity(
        imageIds: string[],
        entityId: string,
        manager?: EntityManager
    ) {
        try {
            let alreadyLinkedImages: Image[]
            let result

            if (manager) {
                alreadyLinkedImages = await manager.find(Image, {
                    where: {
                        id: In(imageIds),
                        entityId: Not(IsNull()),
                    },
                })

                if (alreadyLinkedImages.length > 0) {
                    const linkedIds = alreadyLinkedImages
                        .map((img) => img.id)
                        .join(', ')
                    throw new ImageError(
                        `Images [${linkedIds}] are already linked to another entity and cannot be overridden`,
                        400
                    )
                }

                result = await manager
                    .createQueryBuilder(Image, 'image')
                    .update(Image)
                    .set({ status: StatusImage.ACTIVE, entityId: entityId })
                    .where('image.id IN (:...imageIds)', { imageIds })
                    .andWhere('image."entityId" IS NULL')
                    .execute()
            } else {
                console.log('Execute non manager operation')

                alreadyLinkedImages = await this.imageRepository.find({
                    where: {
                        id: In(imageIds),
                        entityId: Not(IsNull()), // Find images that already have entityId
                    },
                })

                if (alreadyLinkedImages.length > 0) {
                    const linkedIds = alreadyLinkedImages
                        .map((img) => img.id)
                        .join(', ')
                    throw new ImageError(
                        `Images [${linkedIds}] are already linked to another entity and cannot be overridden`,
                        400
                    )
                }

                result = await this.imageRepository
                    .createQueryBuilder('image')
                    .update(Image)
                    .set({ status: StatusImage.ACTIVE, entityId: entityId })
                    .where('image.id IN (:...imageIds)', { imageIds })
                    .andWhere('image."entityId" IS NULL')
                    .execute()
            }

            if (result.affected === 0) {
                throw new ImageError(
                    'No images were updated. All may already be linked to another entity',
                    400
                )
            }

            if (result.affected !== imageIds.length) {
                throw new ImageError(
                    `Expected to update ${imageIds.length} images, but updated ${result.affected}`,
                    400
                )
            }
            return result
        } catch (error) {
            if (error instanceof ImageError) {
                throw error
            }
            if (error instanceof QueryFailedError) {
                throw new ImageError('Failed to link images to product', 400)
            }
            throw new ImageError('An unexpected error occurred', 500)
        }
    }

    async deleteImage(
        id: string, // imageId or entityId
        entityTypeRequest?: TypeImageRequest,
        manager?: EntityManager
    ) {
        try {
            if (!id) {
                throw new ImageError('ID (entityId/imageId) is required', 400)
            }

            let deletedImages
            let deleteImageQuey

            if (manager) {
                // Soft delete using imageId
                if (!entityTypeRequest) {
                    deletedImages = await manager.softDelete(Image, {
                        id: id,
                    })
                } else if (entityTypeRequest === TypeImageRequest.PRODUCTS) {
                    // soft delete using entityId and selected type
                    deleteImageQuey = manager.createQueryBuilder(Image, 'image')

                    deletedImages = await this.executeDeleteBuilder(
                        deleteImageQuey,
                        TypeImageRequest.PRODUCTS,
                        id
                    )
                } else if (entityTypeRequest === TypeImageRequest.CATEGORIES) {
                    deleteImageQuey = manager.createQueryBuilder(Image, 'image')
                    deletedImages = await this.executeDeleteBuilder(
                        deleteImageQuey,
                        TypeImageRequest.CATEGORIES,
                        id
                    )
                } else {
                    throw new ImageError(
                        `Invalid entity type: ${entityTypeRequest}`,
                        400
                    )
                }
            } else {
                // Soft delete using imageId
                if (!entityTypeRequest) {
                    deletedImages = await this.imageRepository.softDelete({
                        id: id,
                    })
                } else if (entityTypeRequest === TypeImageRequest.PRODUCTS) {
                    // soft delete using entityId and selected type
                    deleteImageQuey =
                        this.imageRepository.createQueryBuilder('image')

                    deletedImages = await this.executeDeleteBuilder(
                        deleteImageQuey,
                        TypeImageRequest.PRODUCTS,
                        id
                    )
                } else if (entityTypeRequest === TypeImageRequest.CATEGORIES) {
                    deleteImageQuey =
                        this.imageRepository.createQueryBuilder('image')

                    deletedImages = await this.executeDeleteBuilder(
                        deleteImageQuey,
                        TypeImageRequest.CATEGORIES,
                        id
                    )
                } else {
                    throw new ImageError(
                        `Invalid entity type: ${entityTypeRequest}`,
                        400
                    )
                }
            }

            if (deletedImages.affected === 0) {
                throw new ImageError(
                    `No images found for with id : ${id} ${entityTypeRequest ? `or it has invalid typeRequest ${entityTypeRequest}` : ''}`,
                    400
                )
            }
        } catch (error) {
            if (error instanceof ImageError) {
                throw error
            }
            if (error instanceof QueryFailedError) {
                throw new ImageError(
                    'Database error while deleting images',
                    400
                )
            }
            throw new ImageError('Failed to delete images', 500)
        }
    }
    async executeDeleteBuilder(
        fn: SelectQueryBuilder<Image>,
        type: TypeImageRequest.CATEGORIES | TypeImageRequest.PRODUCTS,
        entityId: string
    ) {
        try {
            const deleteResult = await fn
                .softDelete()
                .where('"image"."entityId" = :entityId', { entityId })
                .andWhere('"image"."entityType" = :entityType', {
                    entityType: type,
                })
                .execute()

            return deleteResult
        } catch (error) {
            throw error
        }
    }
}
