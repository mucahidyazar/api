import { add } from 'date-fns';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { queryHelper } from '@/helpers';

import { Transaction } from '@/model/lumara/transaction';
import { TransactionBrand } from '@/model/lumara/transaction-brand';
import { TransactionCategory } from '@/model/lumara/transaction-category';
import { Wallet } from '@/model/lumara/wallet';
import { WalletAccessor } from '@/model/lumara/wallet-accessor';
import { WalletBalance } from '@/model/lumara/wallet-balance';
import { ApiError } from '@/services/api-error';

async function transactionCreate(req: Request, res: Response) {
  const isIncome = req.body.type === "income";

  const walletBalance = await WalletBalance.findOne({
    _id: req.body.walletBalance,
  });

  if (!walletBalance) {
    throw new ApiError(
      'InsufficientFunds',
      'No enough wallet balance',
    )
  }

  const transactionAmount = req.body.transactionAmount;
  const transactionCurrency = req.body.transactionCurrency;

  if (!isIncome && walletBalance.amount < transactionAmount) {
    throw new ApiError(
      'InsufficientFunds',
      'Transaction amount exceeds wallet balance',
    )
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

  walletBalance.amount = isIncome ? walletBalance.amount + transactionAmount : walletBalance.amount - transactionAmount;
  await walletBalance.save();


  const subscriptionIdData = req.body.isSubscription ? { subscriptionId: new mongoose.Types.ObjectId().toHexString() } : {};
  const addingMap = {
    daily: { days: 1 },
    weekly: { weeks: 1 },
    monthly: { months: 1 },
    yearly: { years: 1 },
  }
  let transactionDate = new Date(req.body.date ?? '');
  for (let subscriptionRecurrence = 1; subscriptionRecurrence <= req.body?.subscriptionRecurrence ?? 1; subscriptionRecurrence++) {

    if (subscriptionRecurrence > 1) {
      transactionDate = add(transactionDate, addingMap[req.body.subscriptionType]);
    }
    const newTransaction = new Transaction({
      ...req.body,
      ...subscriptionIdData,
      date: transactionDate,
      user: req.user?.id,
    });
    await newTransaction.save();
  }

  return res.response({
    status: 'success',
    code: 201,
    message: 'Transaction created successfully',
    data: null
  });
}

async function transactionList(req: Request, res: Response) {
  const wallet = req.query.wallet;
  const walletObjectId = new mongoose.Types.ObjectId(wallet as string);

  const user = req.user?.id;

  let walletIds: Object[] = [];
  const accessors = await WalletAccessor.find({ user: req.user?.id }).select('modelId');
  const accessorWalletIds = accessors.map(accessor => accessor.id);
  const accessibleWallets = await Wallet.find({
    $or: [
      { user: user },
      { accessors: { $in: accessorWalletIds } }
    ]
  }).select('_id');

  walletIds = accessibleWallets.map(wallet => wallet._id);

  const totalItems = await Transaction.countDocuments({
    $or: [
      { user: user },
      { wallet: { $in: [...walletIds, walletObjectId] } }
    ],
    ...(req.query.subscription && { subscription: true }),
  });

  const query = Transaction.find({
    $or: [
      { user: user },
      { wallet: { $in: [...walletIds, walletObjectId] } }
    ],
    ...(req.query.subscription && { subscription: true }),
  });

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  });

  const data = await query.exec();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction list fetched successfully',
    data,
    metadata
  });
}

async function subscriptionList(req: Request, res: Response) {
  const wallet = req.query.wallet;
  const walletObjectId = wallet ? new mongoose.Types.ObjectId(wallet as string) : null;
  const isAccessorSubscriptions = req.query.isAccessorSubscriptions;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const user = req.user?.id;

  try {
    // Erişilebilir cüzdanları al
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

    // Ana sorgu koşulları
    const queryConditions = {
      $or: [
        { user: user },
        ...(walletObjectId || walletIds.length > 0
          ? [{ wallet: { $in: [...walletIds, ...(walletObjectId ? [walletObjectId] : [])] } }]
          : []
        )
      ],
      // Sadece parent subscription'ları al (kendisi bir subscription ama başka bir subscription'a bağlı değil)
      subscriptionType: { $exists: true },
      subscriptionId: null // Ana subscription'lar
    };

    // Toplam kayıt sayısını al
    const totalItems = await Transaction.countDocuments(queryConditions);

    // Ana sorguyu oluştur
    const query = Transaction.find(queryConditions)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(['wallet', 'transactionCategory', 'transactionBrand']);

    const subscriptions = await query.exec();

    // Her subscription için toplam transaction sayısını al
    const subscriptionsWithStats = await Promise.all(
      subscriptions.map(async (subscription) => {
        const totalTransactions = await Transaction.countDocuments({
          subscriptionId: subscription._id
        });

        const [firstTransaction, lastTransaction] = await Promise.all([
          Transaction.findOne({ subscriptionId: subscription._id })
            .sort({ date: 1 })
            .select('date'),
          Transaction.findOne({ subscriptionId: subscription._id })
            .sort({ date: -1 })
            .select('date')
        ]);

        return {
          ...subscription.toObject(),
          subscriptionStats: {
            totalTransactions,
            firstTransactionDate: firstTransaction?.date,
            lastTransactionDate: lastTransaction?.date
          }
        };
      })
    );

    const metadata = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    };

    return res.response({
      status: 'success',
      code: 200,
      message: 'Subscription list fetched successfully',
      data: subscriptionsWithStats,
      metadata
    });

  } catch (error) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Error fetching subscription list',
      details: error
    });
  }
}

async function transactionChartGet(req: Request, res: Response) {
  const query = Transaction.find({
    user: req.user?.id,
  });

  const populateFields = ['user', 'walletBalance', 'transactionBrand', 'transactionCategory']
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
          (acc[category]?.amount || 0) + (transaction.transactionAmount || 0),
      }
      return acc
    },
    {}
  ) as Record<string, { amount: number, color: number }>

  const data = Object.entries(
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
    data,
  });
}

async function transactionStatsGet(req: Request, res: Response) {
  const wallet = req.query.wallet;

  const totalItems = await Transaction.countDocuments({
    user: req.user?.id,
    ...(wallet && { wallet }),
    ...(req.query.subscription && { subscription: true }),
  });

  const query = Transaction.find({
    user: req.user?.id,
    ...(wallet && { wallet }),
    ...(req.query.subscription && { subscription: true }),
  });

  const populateFields = ['user', 'walletBalance', 'transactionBrand', 'transactionCategory']
  populateFields.forEach(field => {
    query.populate(field);
  });

  const response = await query.exec();

  const totalsMap = response.reduce((acc, transaction) => {
    const balance = (transaction.transactionAmount as any);

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
}

async function transactionGet(req: Request, res: Response) {
  const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

  const query = Transaction.findOne({
    _id: req.params.id,
    $or: [
      { user: req.user?.id },
      { wallet: { $in: allUniqueWalletIds } }
    ]
  })

  queryHelper({ queries: req.query, query })

  const data = await query.exec();

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction fetched successfully',
    data,
  })
}

async function transactionUpdate(req: Request, res: Response) {
  const allowedUpdates = [
    'type',
    'description',
    'link',
    'date',
    'balance',
    'primaryBalance',
    'secondaryBalance',
    'groupId',
    'transactionCategoryId',
    'transactionBrandId',
    'subscription',
    'subscriptionType',
    'subscriptionRecurrence',
    'walletBalance'
  ];
  const updates = Object.keys(req.body);
  // const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  const validFields = updates.filter(update => allowedUpdates.includes(update));
  const invalidFields = updates.filter(update => !allowedUpdates.includes(update));

  if (!invalidFields.length) {
    return res.response({
      status: 'error',
      code: 400,
      message: 'Invalid updates',
      details: {
        validFields,
        invalidFields,
      }
    })
  }

  const walletBalance = await WalletBalance.findOne({
    _id: req.body.walletBalance,
  });

  if (!walletBalance) {
    throw new ApiError(
      'InsufficientFunds',
      'No enough wallet balance',
    )
  }

  const isUpdateIncome = req.body.type === "income";
  const transactionAmount = req.body.transactionAmount;

  if (!isUpdateIncome && walletBalance.amount < transactionAmount) {
    throw new ApiError(
      'InsufficientFunds',
      'Transaction amount exceeds wallet balance',
    )
  }

  const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

  const transactionData = await Transaction.findOne(
    {
      _id: req.params.id,
      $or: [
        { user: req.user?.id },
        { wallet: { $in: allUniqueWalletIds } }
      ]
    },
  );

  if (!transactionData) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction not found',
    )
  }

  const isTransactionIncome = transactionData?.type === 'income';
  if (transactionAmount) {
    if (isTransactionIncome) {
      if (isUpdateIncome) {
        walletBalance.amount = walletBalance.amount - (transactionAmount ?? 0) + transactionData.transactionAmount;
      } else {
        walletBalance.amount = walletBalance.amount - (transactionAmount ?? 0) - transactionData.transactionAmount;
      }
    } else {
      if (isUpdateIncome) {
        walletBalance.amount = walletBalance.amount + (transactionAmount ?? 0) + transactionData.transactionAmount;
      } else {
        walletBalance.amount = walletBalance.amount + (transactionAmount ?? 0) - transactionData.transactionAmount;
      }
    }

    transactionData.transactionAmount = transactionAmount;
    await transactionData?.save();
  }
  await walletBalance.save();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction updated successfully',
    data: transactionData,
  })
}

async function transactionDelete(req: Request, res: Response) {
  const allUniqueWalletIds = await getUniqueWalletIds({ user: req.user?.id });

  const data = await Transaction.findOneAndDelete({
    _id: req.params.id,
    $or: [
      { user: req.user?.id },
      { wallet: { $in: allUniqueWalletIds } }
    ]
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Transaction not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Transaction deleted successfully',
    data,
  });
}

export { transactionCreate, transactionChartGet, transactionDelete, transactionGet, transactionList, subscriptionList, transactionStatsGet, transactionUpdate };


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