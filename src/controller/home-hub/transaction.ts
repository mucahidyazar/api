import { Request, Response } from 'express';

import { Transaction } from '../../model/home-hub/transaction';
import { TransactionBrand } from '../../model/home-hub/transaction-brand';
import { TransactionCategory } from '../../model/home-hub/transaction-category';
import { TransactionValue } from '../../model/home-hub/transaction-value';
import { queryHelper } from '../../helpers/query-helper';
import { WalletBalance } from '../../model/home-hub/wallet-balance';

async function transactionCreate(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findOne({
      _id: req.body.walletBalance,
    });
    if (!walletBalance?.amount) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet balance not found'
      })
    }

    const transactionValue = req.body.transactionValue;

    if (walletBalance.amount < transactionValue.amount) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Insufficient balance'
      })
    }

    await TransactionBrand.findOneAndUpdate(
      { _id: req.body.transactionBrand },
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    await TransactionCategory.findOneAndUpdate(
      { _id: req.body.transactionCategory },
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    await WalletBalance.findOneAndUpdate(
      { _id: req.body.walletBalance },
      { $inc: { amount: req.body.type === "income" ? transactionValue.amount : -transactionValue.amount } },
      { new: true }
    );

    const transactionValueRecord = new TransactionValue(transactionValue);
    await transactionValueRecord.save();

    const transaction = new Transaction({
      ...req.body,
      transactionValue: transactionValueRecord.id,
      user: req.user?.id,
    });
    await transaction.save();

    return res.response({
      status: 'success',
      code: 201,
      message: 'Transaction created successfully',
      data: transaction,
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

async function transactionList(req: Request, res: Response) {
  try {
    const wallet = req.query.wallet;

    const query = Transaction.find({
      user: req.user?.id,
      ...(wallet && { wallet }),
      ...(req.query.isRecurring && { isRecurring: true }),
    });

    const populateFields = req.query.populateFields
      ? (req.query.populateFields as string).split(',')
      : [];
    populateFields.forEach(field => {
      query.populate(field);
    });

    const transactions = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction list fetched successfully',
      data: transactions,
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

async function transactionChartGet(req: Request, res: Response) {
  try {
    const query = Transaction.find({
      user: req.user?.id,
    });

    const populateFields = ['user', 'walletBalance', 'transactionBrand', 'transactionCategory', 'transactionValue']
    populateFields.forEach(field => {
      query.populate(field);
    });

    const queryResponse = await query.exec();

    const chartObjectData = queryResponse?.reduce(
      (acc, transaction) => {
        const category = (transaction.transactionCategory as any)?.name
        if (!acc[category]) {
          acc[category] = {}
        }
        acc[category] = {
          ...acc[category],
          color: (transaction.transactionCategory as any)?.color,
          amount:
            (acc[category]?.amount || 0) + (transaction.transactionValue as any)?.amount,
        }
        return acc
      },
      {}
    ) as Record<string, { amount: number, color: number }>

    const chartData = Object.entries(
      chartObjectData || [],
    ).map(([label, chart]) => ({
      label,
      color: chart.color,
      value: chart.amount,
      balance: {
        amount: chart.amount,
      },
    }))

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction list fetched successfully',
      data: chartData,
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

async function transactionGet(req: Request, res: Response) {
  try {
    const query = Transaction.findOne({
      _id: req.params.id,
      $or: [{ user: req.user?.id }]
    })

    queryHelper({ queries: req.query, query })

    const transaction = await query.exec();

    if (!transaction) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Transaction not found',
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction fetched successfully',
      data: transaction,
    })
  } catch (error: any) {
    console.log('error123', error)
    return res.response({
      status: 'error',
      code: 500,
      message: "There was an error while fetching the transaction",
    })
  }
}


async function transactionUpdate(req: Request, res: Response) {
  try {
    const allowedUpdates = [
      'type',
      'description',
      'link',
      'installments',
      'date',
      'balance',
      'primaryBalance',
      'secondaryBalance',
      'groupId',
      'transactionCategoryId',
      'transactionBrandId',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Transaction not found',
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction updated successfully',
      data: transaction,
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

async function transactionDelete(req: Request, res: Response) {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export { transactionCreate, transactionChartGet, transactionDelete, transactionGet, transactionList, transactionUpdate };
