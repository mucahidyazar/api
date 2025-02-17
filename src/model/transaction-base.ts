import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants'

interface IBaseTransaction extends mongoose.Document {
  description: string
  direction: 'income' | 'expense'
  amount: number
  category: string
  brand: string
  wallet: string
  walletBalance: string
  createdBy: string
  updatedBy: string
}

const baseTransactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      describe: 'Description of the financial movement',
      maxlength: VALIDATION_RULES.input.max,
    },
    direction: {
      type: String,
      describe: 'Direction of the financial movement',
      enum: ['income', 'expense'],
      required: true,
    },

    amount: {
      type: Number,
      describe: 'Amount of the financial movement',
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'Category of the financial movement',
      ref: 'TransactionCategory',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'Brand of the financial movement',
      ref: 'TransactionBrand',
    },

    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'Wallet of the financial movement',
      ref: 'Wallet',
      required: true,
    },
    walletBalance: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'Wallet balance of the financial movement',
      ref: 'WalletBalance',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'User who created the financial movement',
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      describe: 'User who updated the financial movement',
      ref: 'User',
    },
  },
  MODEL_OPTIONS,
)

export { IBaseTransaction, baseTransactionSchema }
