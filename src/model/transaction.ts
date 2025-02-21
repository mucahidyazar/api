import mongoose from 'mongoose'

import { VALIDATION_RULES } from '@/constants'

import { IInstallment } from './installment'
import { ISubscription } from './subscription'
import { baseTransactionSchema, IBaseTransaction } from './transaction-base'

interface ITransaction extends IBaseTransaction {
  type: 'single' | 'installment' | 'subscription'
  parent:
    | mongoose.Schema.Types.ObjectId
    | IInstallment['_id']
    | ISubscription['_id']
    | null
  transactionStatus: 'pending' | 'paid' | 'overdue' | 'canceled'
  link: string
  dueDate: Date

  markAsPaid(): Promise<ITransaction>
  getOverdueTransactions(): Promise<ITransaction[]>
  getByType(type: string, page: number, limit: number): Promise<ITransaction[]>
  getSubscriptionsSummary(userId: string): Promise<
    {
      _id: mongoose.Types.ObjectId
      totalAmount: number
      count: number
    }[]
  >
  getInstallmentsSummary(userId: string): Promise<
    {
      _id: mongoose.Types.ObjectId
      totalAmount: number
      count: number
    }[]
  >
  getMonthlyStats(
    userId: string,
    year: number,
    month: number,
  ): Promise<
    {
      _id: string
      total: number
      count: number
    }[]
  >
}

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    describe: 'Type of the transaction',
    enum: ['single', 'installment', 'subscription'],
    required: true,
    default: 'single',
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    describe: 'Parent transaction of the financial movement',
    refPath: 'type',
    default: null,
    validate: {
      validator: function (
        this: ITransaction,
        v: mongoose.Types.ObjectId | null,
      ): boolean {
        return this.type === 'single' || v != null
      },
      message:
        'ParentId is required for installment and subscription transactions',
    },
  },

  transactionStatus: {
    type: String,
    describe: 'Status of the transaction',
    enum: ['pending', 'paid', 'overdue', 'canceled'],
    default: 'paid',
  },

  link: {
    type: String,
    describe: 'Link of the transaction',
    maxlength: VALIDATION_RULES.input.max,
  },
  dueDate: {
    type: Date,
    describe: 'Due date of the transaction',
    required: true,
  },
}).add(baseTransactionSchema)

transactionSchema.methods.markAsPaid = async function () {
  this.status = 'paid'
  this.updatedAt = new Date()
  return this.save()
}

transactionSchema.statics.getOverdueTransactions = async function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'paid' },
  })
}

transactionSchema.statics.getByType = async function (
  type: string,
  page: number,
  limit: number,
) {
  return this.find({ type })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
}

transactionSchema.statics.getSubscriptionsSummary = async function (
  userId: string,
) {
  return this.aggregate([
    {
      $match: {
        type: 'subscription',
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$parentId',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])
}

transactionSchema.statics.getInstallmentsSummary = async function (
  userId: string,
) {
  return this.aggregate([
    {
      $match: {
        type: 'installment',
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$parentId',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])
}

transactionSchema.statics.getMonthlyStats = async function (
  userId: string,
  year: number,
  month: number,
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])
}

const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema,
)

export { ITransaction, Transaction }
