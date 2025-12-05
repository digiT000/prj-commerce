import { In, IsNull, Not, QueryFailedError, Repository } from 'typeorm'
import { Image } from '../entity/Image'
import { AppDataSource } from '../data-source'
import { SaveImagesRequest, SaveImagesResponse } from '../dtos/image.dto'
import { ImageError } from '../Error/image.error'
import { AppError } from '../Error/app.error'
import { StatusImage, TypeImageRequest } from '../types/custom'

export class ImageService {
    imageRepostiory: Repository<Image>

    constructor() {
        this.imageRepostiory = AppDataSource.getRepository(Image)
    }

    async saveImages({ images, type }: SaveImagesRequest): Promise<string[]> {
        const imageToInsert = images.map((img) => ({
            publicId: img.publicId,
            urlOriginal: img.urlOriginal,
            urlMedium: img.urlMedium,
            urlOptimized: img.urlOptimized,
            types: type,
        }))
        try {
            const imageResult = await this.imageRepostiory.insert(imageToInsert)
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
            const images = await this.imageRepostiory.find({
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
                .filter((img) => img.types !== type)
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
        entityId: string
    ): Promise<void> {
        try {
            // TODO : Improve this query because its 2 queries in one go,Explore solution

            // Step 1: Check if any images already have an entityId
            const alreadyLinkedImages = await this.imageRepostiory.find({
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

            const result = await this.imageRepostiory
                .createQueryBuilder('image')
                .update(Image)
                .set({ status: StatusImage.ACTIVE, entityId: entityId })
                .where('image.id IN (:...imageIds)', { imageIds })
                .andWhere('image.entityId IS NULL')
                .execute()

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
}
