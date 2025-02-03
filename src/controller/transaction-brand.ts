import { Request, Response } from 'express'

import { ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { TransactionBrand } from '@/model/transaction-brand'
import { ApiResponse } from '@/utils'

async function transactionBrandCreate(req: Request, res: Response) {
  const newTransactionBrand = new TransactionBrand({
    ...req.body,
    user: req.user?.id,
  })

  const data = await newTransactionBrand.save()

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionBrandList(req: Request, res: Response) {
  const data = await TransactionBrand.find({
    $or: [{ user: req.user?.id }, { user: '6714c1614412e8a0efa8f5ff' }],
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionBrandGet(req: Request, res: Response) {
  const data = await TransactionBrand.findOne({
    _id: req.params.id,
    $or: [{ user: req.user?.id }],
  })

  if (!data) {
    throw new ApiError('Transaction brand not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionBrandUpdate(req: Request, res: Response) {
  const allowedUpdates = ['name', 'usageCount']
  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update),
  )

  if (!isValidOperation) {
    throw new ApiError('Invalid updates', ERROR_CODE.InvalidParameters)
  }

  const data = await TransactionBrand.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    { $set: req.body },
    { new: true, runValidators: true },
  )

  if (!data) {
    throw new ApiError('Transaction brand not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function transactionBrandDelete(req: Request, res: Response) {
  const data = await TransactionBrand.findOneAndDelete({
    _id: req.params.id,
    user: req.user?.id,
  })

  if (!data) {
    throw new ApiError('Transaction brand not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

export {
  transactionBrandCreate,
  transactionBrandDelete,
  transactionBrandGet,
  transactionBrandList,
  transactionBrandUpdate,
}
