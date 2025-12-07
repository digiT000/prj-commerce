import { Repository, QueryFailedError } from 'typeorm'
import { Category } from '../entity/Category'
import { AppDataSource } from '../data-source'
import {
    CategoryWithMetaResponse,
    CreateNewCategoryRequest,
    GetCategoryParamsRequest,
    GetCategoryResponse,
    UpdateCategoryRequest,
} from '../dtos/category.dto'
import { CategoryError } from '../Error/category.error'
import { Product } from '../entity/Product'
import { Status } from '../types/custom'

export class CategoryService {
    categoryRepository: Repository<Category>
    productRepository: Repository<Product>

    constructor() {
        this.categoryRepository = AppDataSource.getRepository(Category)
        this.productRepository = AppDataSource.getRepository(Product)
    }

    async createNewCategory(
        newCategory: CreateNewCategoryRequest
    ): Promise<Category> {
        const { name } = newCategory

        try {
            const category = this.categoryRepository.create({
                name: name,
            })
            await this.categoryRepository.save(category)

            return category
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const pgError = error.driverError
                if (pgError.code === '23505') {
                    throw CategoryError.DuplicateCategory()
                }
                throw new CategoryError(error.message, 400)
            } else {
                throw new CategoryError(`Something went wrong `, 500)
            }
        }
    }

    async getCategory(
        params: GetCategoryParamsRequest
    ): Promise<GetCategoryResponse> {
        const { page = 1, limit = 10 } = params
        const skip = (page - 1) * limit

        const query = this.categoryRepository.createQueryBuilder('category')

        const [categories, totalCategories] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount()

        const totalPages = Math.ceil(totalCategories / limit)

        if (totalCategories === 0) {
            return {
                data: [],
                metadata: {
                    totalCategories: totalCategories,
                    currentPage: page,
                    hasNextPage: totalPages > page,
                    hasPreviousPage: totalPages < page,
                    totalPages,
                },
            }
        }

        // Step 2: Get product counts for all categories in ONE query
        const categoryIds = categories.map((cat) => cat.id)

        const productCounts = await this.productRepository
            .createQueryBuilder('product')
            .select('product.categoryId', 'categoryId')
            .addSelect('COUNT(product.id)', 'count')
            .where('product.categoryId IN (:...categoryIds)', {
                categoryIds,
            })
            .groupBy('product.categoryId')
            .getRawMany()

        const countMap = new Map<string, number>()
        productCounts.forEach((item) => {
            countMap.set(item.categoryId, parseInt(item.count))
        })

        // Step 4: Build response with product counts
        const categoriesWithTotalProducts: CategoryWithMetaResponse[] =
            categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,

                metadata: {
                    totalProducts: countMap.get(category.id) || 0,
                },
            }))

        return {
            data: categoriesWithTotalProducts,
            metadata: {
                totalCategories,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        }
    }

    async getCategoryById(
        categoryId: string
    ): Promise<CategoryWithMetaResponse> {
        try {
            const category = await this.categoryRepository.findOne({
                where: {
                    id: categoryId,
                },
                withDeleted: true,
            })
            if (!category) {
                throw CategoryError.NotFound(categoryId)
            }

            const totalProduct = await this.productRepository.count({
                where: { categoryId: categoryId },
            })

            return {
                id: category.id,
                name: category.name,
                slug: category.slug,
                products: category.products,
                metadata: {
                    totalProducts: totalProduct,
                },
            }
        } catch (error) {
            throw error
        }
    }

    async deleteCategory(categoryId: string) {
        try {
            const deleted = await this.categoryRepository.softDelete(categoryId)
            await this.categoryRepository.update(categoryId, {
                status: Status.DELETED,
            })

            if (!deleted.affected) {
                throw CategoryError.NotFound(categoryId)
            }
            return categoryId
        } catch (error) {
            throw error
        }
    }

    async updateCategory(categoryId: string, params: UpdateCategoryRequest) {
        const category = await this.categoryRepository.findOne({
            where: {
                id: categoryId,
            },
        })
        if (!category) {
            throw CategoryError.NotFound(categoryId)
        }

        if (params.name) {
            category.name = params.name
        }

        const updatedCategory = await this.categoryRepository.save(category)
        return {
            id: updatedCategory.id,
            name: updatedCategory.name,
            slug: updatedCategory.slug,
        }
    }
}
