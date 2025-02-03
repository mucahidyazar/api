import { Request, Response } from 'express'

import { ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { TransactionCategory } from '@/model/transaction-category'
import { ApiResponse } from '@/utils'

async function transactionCategoryCreate(req: Request, res: Response) {
  const newTransactionCategory = new TransactionCategory({
    ...req.body,
    user: req.user?.id,
  })
  const data = await newTransactionCategory.save()

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionCategoryList(req: Request, res: Response) {
  const data = await TransactionCategory.find({
    $or: [{ user: req.user?.id }, { user: '6714c1614412e8a0efa8f5ff' }],
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionCategoryGet(req: Request, res: Response) {
  const data = await TransactionCategory.findOne({
    _id: req.params.id,
    $or: [{ user: req.user?.id }],
  })

  if (!data) {
    throw new ApiError(
      'Transaction category not found',
      ERROR_CODE.EntityNotFound,
    )
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionCategoryUpdate(req: Request, res: Response) {
  const allowedUpdates = ['name', 'usageCount']
  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update),
  )

  if (!isValidOperation) {
    throw new ApiError('Invalid updates', ERROR_CODE.InvalidParameters)
  }

  const data = await TransactionCategory.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    { $set: req.body },
    { new: true, runValidators: true },
  )

  if (!data) {
    throw new ApiError(
      'Transaction category not found',
      ERROR_CODE.EntityNotFound,
    )
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionCategoryDelete(req: Request, res: Response) {
  const data = await TransactionCategory.findOneAndDelete({
    _id: req.params.id,
    user: req.user?.id,
  })

  if (!data) {
    throw new ApiError(
      'Transaction category not found',
      ERROR_CODE.EntityNotFound,
    )
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

export {
  transactionCategoryCreate,
  transactionCategoryDelete,
  transactionCategoryGet,
  transactionCategoryList,
  transactionCategoryUpdate,
}
