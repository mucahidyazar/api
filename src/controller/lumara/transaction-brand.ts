import { Request, Response } from 'express';

import { TransactionBrand } from '@/model/lumara/transaction-brand';
import { ApiError } from '@/services/api-error';

async function transactionBrandCreate(req: Request, res: Response) {
  const newTransactionBrand = new TransactionBrand({
    ...req.body,
    user: req.user?.id
  });

  const data = await newTransactionBrand.save();

  return res.response({
    status: 'success',
    code: 201,
    message: 'Transaction brand created successfully',
    data
  });
}

async function transactionBrandList(req: Request, res: Response) {
  const data = await TransactionBrand.find({
    $or: [{ user: req.user?.id }, { user: "6714c1614412e8a0efa8f5ff" }]
  });

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction brand list fetched successfully',
    data
  })
}

async function transactionBrandGet(req: Request, res: Response) {
  const data = await TransactionBrand.findOne({
    _id: req.params.id,
    $or: [{ user: req.user?.id }]
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction brand not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction brand fetched successfully',
    data
  })
}


async function transactionBrandUpdate(req: Request, res: Response) {
  const allowedUpdates = ['name', 'usageCount'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new ApiError('InvalidInput')
  }

  const data = await TransactionBrand.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction brand not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction brand updated successfully',
    data
  });
}

async function transactionBrandDelete(req: Request, res: Response) {
  const data = await TransactionBrand.findOneAndDelete({
    _id: req.params.id,
    user: req.user?.id
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction brand not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction brand deleted successfully',
    data
  });
}

export { transactionBrandCreate, transactionBrandDelete, transactionBrandGet, transactionBrandList, transactionBrandUpdate };
