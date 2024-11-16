import { Request, Response } from 'express';

import { TransactionCategory } from '@/model/lumara/transaction-category';
import { ApiError } from '@/services/api-error';

async function transactionCategoryCreate(req: Request, res: Response) {
  const newTransactionCategory = new TransactionCategory({
    ...req.body,
    user: req.user?.id
  });
  const data = await newTransactionCategory.save();

  return res.response({
    status: 'success',
    code: 201,
    message: 'Transaction category created successfully',
    data
  });
}

async function transactionCategoryList(req: Request, res: Response) {
  const data = await TransactionCategory.find({
    $or: [{ user: req.user?.id }, { user: "6714c1614412e8a0efa8f5ff" }]
  });

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction category list fetched successfully',
    data
  })

}

async function transactionCategoryGet(req: Request, res: Response) {
  const data = await TransactionCategory.findOne({
    _id: req.params.id,
    $or: [{ user: req.user?.id }]
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction category not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction category fetched successfully',
    data
  });
}


async function transactionCategoryUpdate(req: Request, res: Response) {
  const allowedUpdates = [
    'name',
    'usageCount'
  ];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new ApiError('InvalidInput')
  }

  const data = await TransactionCategory.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction category not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction category updated successfully',
    data
  });
}

async function transactionCategoryDelete(req: Request, res: Response) {
  const data = await TransactionCategory.findOneAndDelete({
    _id: req.params.id,
    user: req.user?.id
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction category not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction category deleted successfully',
    data
  });
}

export { transactionCategoryCreate, transactionCategoryDelete, transactionCategoryGet, transactionCategoryList, transactionCategoryUpdate };
