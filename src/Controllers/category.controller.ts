import { Request, Response } from 'express'
import { CategoryService } from '../Services/category.service'
import { CreateNewCategoryRequest } from '../dtos/category.dto'
import { CategoryError } from '../Error/category.error'
import fieldRequiredValidation from '../Utils/fieldRequiredValidation'
import { asyncHandler } from '../Utils/handlerWrapper'
import { AppError } from '../Error/app.error'

export class CategoryController {
    categoryService: CategoryService

    constructor() {
        this.categoryService = new CategoryService()
    }

    createNewCategory = asyncHandler(async (req: Request, res: Response) => {
        const data = req.body

        const newCategory = data as CreateNewCategoryRequest

        const requiredFields: (keyof CreateNewCategoryRequest)[] = ['name']
        const missingFileds = fieldRequiredValidation(
            requiredFields,
            newCategory
        )

        if (missingFileds.length > 0) {
            throw new AppError(
                `Missing required field : [${missingFileds.join(', ')}]`,
                400
            )
        }
        await this.categoryService.createNewCategory(newCategory)
        res.status(201).json({
            status: 201,
            message: 'Category created',
        })
    })

    getCategory = asyncHandler(async (req: Request, res: Response) => {
        const categories = await this.categoryService.getCategory({
            limit: req.query?.limit ? Number(req.query?.limit) : undefined,
            page: req.query?.page ? Number(req.query?.page) : undefined,
        })

        res.status(200).json({
            status: 200,
            message: 'Success get Category',
            data: categories,
        })
    })

    getCategoryById = asyncHandler(async (req: Request, res: Response) => {
        const categoryId = req.params.id

        if (!categoryId) {
            throw CategoryError.MissingCategoryId()
        }

        const category = await this.categoryService.getCategoryById(categoryId)
        res.status(200).send({
            status: 200,
            message: 'Success Get Category',
            data: category,
        })
    })

    deleteCategory = asyncHandler(async (req: Request, res: Response) => {
        const categoryId = req.params.id

        if (!categoryId) {
            throw CategoryError.MissingCategoryId()
        }
        const deletedId = await this.categoryService.deleteCategory(categoryId)
        res.status(204).json({
            status: 200,
            message: `Success delete category ${deletedId}`,
        })
    })

    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        const categoryId = req.params.id

        if (!categoryId) {
            throw CategoryError.MissingCategoryId()
        }

        const name = req.body.name

        if (!name) {
            throw new CategoryError('Missing field name', 400)
        }

        const updatedData = await this.categoryService.updateCategory(
            categoryId,
            {
                name,
            }
        )
        res.status(200).json({
            status: 200,
            message: 'Update successfully',
            data: updatedData,
        })
    })
}
