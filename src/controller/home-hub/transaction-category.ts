import { Request, Response } from 'express';

import { TransactionCategory } from '../../model/home-hub/transaction-category';

async function transactionCategoryCreate(req: Request, res: Response) {
  try {
    const transactionCategory = new TransactionCategory({
      ...req.body,
      user: req.user?.id
    });
    await transactionCategory.save();
    return res.status(201).json({ data: transactionCategory });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function transactionCategoryList(req: Request, res: Response) {
  try {
    const transactionCategorys = await TransactionCategory.find({
      $or: [{ user: req.user?.id }, { user: "6714c1614412e8a0efa8f5ff" }]
    });
    return res.json({ data: transactionCategorys });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function transactionCategoryGet(req: Request, res: Response) {
  try {
    const transactionCategory = await TransactionCategory.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user?.id }]
    });

    if (!transactionCategory) {
      return res.status(404).json({ message: 'Transaction category not found' });
    }
    return res.json({ data: transactionCategory });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const transactionCategory = await TransactionCategory.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transactionCategory) {
      return res.status(404).json({ message: 'Transaction category not found' });
    }

    return res.json({ data: transactionCategory });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function transactionCategoryDelete(req: Request, res: Response) {
  try {
    const transactionCategory = await TransactionCategory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (!transactionCategory) {
      return res.status(404).json({ message: 'Transaction category not found' });
    }

    return res.json({ message: 'Transaction category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export { transactionCategoryCreate, transactionCategoryDelete, transactionCategoryGet, transactionCategoryList, transactionCategoryUpdate };
