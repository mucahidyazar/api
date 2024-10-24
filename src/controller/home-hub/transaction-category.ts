import { Request, Response } from 'express';

import { TransactionCategory } from '../../model/home-hub/transaction-category';

async function transactionCategoryCreate(req: Request, res: Response) {
  try {
    const transactionCategory = new TransactionCategory({
      ...req.body,
      user: req.user?.id
    });
    await transactionCategory.save();

    return res.response({
      status: 'success',
      code: 201,
      message: 'Transaction category created successfully',
      data: transactionCategory
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function transactionCategoryList(req: Request, res: Response) {
  try {
    const transactionCategorys = await TransactionCategory.find({
      $or: [{ user: req.user?.id }, { user: "6714c1614412e8a0efa8f5ff" }]
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction category list fetched successfully',
      data: transactionCategorys
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function transactionCategoryGet(req: Request, res: Response) {
  try {
    const transactionCategory = await TransactionCategory.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user?.id }]
    });

    if (!transactionCategory) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Transaction category not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction category fetched successfully',
      data: transactionCategory
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}


async function transactionCategoryUpdate(req: Request, res: Response) {
  try {
    const allowedUpdates = [
      'name',
      'usageCount'
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid updates'
      })
    }

    const transactionCategory = await TransactionCategory.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transactionCategory) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Transaction category not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction category updated successfully',
      data: transactionCategory
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function transactionCategoryDelete(req: Request, res: Response) {
  try {
    const transactionCategory = await TransactionCategory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (!transactionCategory) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Transaction category not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction category deleted successfully',
      data: transactionCategory
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

export { transactionCategoryCreate, transactionCategoryDelete, transactionCategoryGet, transactionCategoryList, transactionCategoryUpdate };
