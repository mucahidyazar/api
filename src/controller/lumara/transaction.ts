import { Request, Response } from 'express';

import { Transaction } from '../../model/lumara/transaction';
import { TransactionBrand } from '../../model/lumara/transaction-brand';
import { TransactionCategory } from '../../model/lumara/transaction-category';
import { TransactionValue } from '../../model/lumara/transaction-value';
import { queryHelper } from '../../helpers/query-helper';
import { Wallet } from '../../model/lumara/wallet';
import { WalletAccessor } from '../../model/lumara/wallet-accessor';
import { WalletBalance } from '../../model/lumara/wallet-balance';
import mongoose, { ObjectId } from 'mongoose';

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
    const walletObjectId = new mongoose.Types.ObjectId(wallet as string);
    const isAccessorSubscriptions = req.query.isAccessorSubscriptions;

    const user = req.user?.id;

    let walletIds: Object[] = [];
    if (isAccessorSubscriptions !== 'false') {
      const accessors = await WalletAccessor.find({ user: req.user?.id }).select('modelId');
      const accessorWalletIds = accessors.map(accessor => accessor.id);
      const accessibleWallets = await Wallet.find({
        $or: [
          { user: user },
          { accessors: { $in: accessorWalletIds } }
        ]
      }).select('_id');

      walletIds = accessibleWallets.map(wallet => wallet._id);
    }

    const totalItems = await Transaction.countDocuments({
      $or: [
        { user: user },
        { wallet: { $in: [...walletIds, walletObjectId] } }
      ],
      ...(req.query.isRecurring && { isRecurring: true }),
    });

    const query = Transaction.find({
      $or: [
        { user: user },
        { wallet: { $in: [...walletIds, walletObjectId] } }
      ],
      ...(req.query.isRecurring && { isRecurring: true }),
    });

    const { metadata } = queryHelper({
      queries: { ...req.query, totalItems },
      query,
    });

    const transactions = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction list fetched successfully',
      data: transactions,
      metadata
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

async function transactionStatsGet(req: Request, res: Response) {
  try {
    const wallet = req.query.wallet;

    const totalItems = await Transaction.countDocuments({
      user: req.user?.id,
      ...(wallet && { wallet }),
      ...(req.query.isRecurring && { isRecurring: true }),
    });

    const query = Transaction.find({
      user: req.user?.id,
      ...(wallet && { wallet }),
      ...(req.query.isRecurring && { isRecurring: true }),
    });

    const populateFields = ['user', 'walletBalance', 'transactionBrand', 'transactionCategory', 'transactionValue']
    populateFields.forEach(field => {
      query.populate(field);
    });

    const response = await query.exec();

    const totalsMap = response.reduce((acc, transaction) => {
      const balance = (transaction.transactionValue as any);

      if (transaction.type === 'income') {
        const incomes = acc.incomes;
        if (!incomes[balance.currency]) {
          incomes[balance.currency] = 0
        }
        incomes[balance.currency] += balance?.amount
        return { ...acc, incomes };
      }
      const expenses = acc.expenses;
      if (!expenses[balance.currency]) {
        expenses[balance.currency] = 0
      }
      expenses[balance.currency] += balance?.amount
      return { ...acc, expenses };
    }, { incomes: {}, expenses: {} });
    const totals = {
      income: Object.entries(totalsMap.incomes).map(([currency, amount]) => ({ currency, amount })),
      expense: Object.entries(totalsMap.expenses).map(([currency, amount]) => ({ currency, amount })),
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Transaction list fetched successfully',
      data: {
        totalItems,
        totals,
      },
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
    const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

    const query = Transaction.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user?.id },
        { wallet: { $in: allUniqueWalletIds } }
      ]
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
      'isRecurring',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid updates',
      })
    }

    const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { user: req.user?.id },
          { wallet: { $in: allUniqueWalletIds } }
        ]
      },
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

    const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { user: req.user?.id },
        { wallet: { $in: allUniqueWalletIds } }
      ]
    });
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
      message: 'Transaction deleted successfully',
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

export { transactionCreate, transactionChartGet, transactionDelete, transactionGet, transactionList, transactionStatsGet, transactionUpdate };


type TGetUniqueWalletIdsArgs = {
  user: string;
}
async function getUniqueWalletIds({ user }: TGetUniqueWalletIdsArgs): Promise<string[]> {
  const walletsResponse = await Wallet.find({ user: user }).select('_id');
  const walletIds = walletsResponse.map(wallet => wallet._id);

  const accessors = await WalletAccessor.find({ user: user })
  const accessorWalletIds = accessors.map(accessor => accessor.id);
  const accessibleWallets = await Wallet.find({
    $or: [
      { user: user }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
    ]
  })
  const accessibleWalletIds = accessibleWallets.map(wallet => wallet.id)

  const allUniqueWalletIds = [...new Set([...walletIds, ...accessibleWalletIds])]

  return allUniqueWalletIds
}