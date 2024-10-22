import { Request, Response } from 'express';

import { TransactionBrand } from '../../model/home-hub/transaction-brand';

async function transactionBrandCreate(req: Request, res: Response) {
  try {
    const transactionBrand = new TransactionBrand({
      ...req.body,
      user: req.user?.id
    });
    await transactionBrand.save();
    return res.status(201).json({ data: transactionBrand });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function transactionBrandList(req: Request, res: Response) {
  try {
    const response = await TransactionBrand.find({
      $or: [{ user: req.user?.id }, { user: "6714c1614412e8a0efa8f5ff" }]
    });
    console.log('response', response)

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction brand list fetched successfully',
      data: response
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    })
  }
}

async function transactionBrandGet(req: Request, res: Response) {
  try {
    const transactionBrand = await TransactionBrand.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user?.id }]
    });

    if (!transactionBrand) {
      return res.status(404).json({ message: 'Transaction brand not found' });
    }
    return res.json({ data: transactionBrand });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


async function transactionBrandUpdate(req: Request, res: Response) {
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

    const transactionBrand = await TransactionBrand.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transactionBrand) {
      return res.status(404).json({ message: 'Transaction brand not found' });
    }

    return res.json({ data: transactionBrand });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function transactionBrandDelete(req: Request, res: Response) {
  try {
    const transactionBrand = await TransactionBrand.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (!transactionBrand) {
      return res.status(404).json({ message: 'Transaction brand not found' });
    }

    return res.json({ message: 'Transaction brand deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export { transactionBrandCreate, transactionBrandDelete, transactionBrandGet, transactionBrandList, transactionBrandUpdate };
