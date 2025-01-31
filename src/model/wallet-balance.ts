import mongoose from 'mongoose'

import { DEFAULTS, MODEL_OPTIONS } from '@/constants'

export const walletBalanceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: DEFAULTS.currency,
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      immutable: true,
    },
  },
  MODEL_OPTIONS,
)

walletBalanceSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'walletBalance',
})

export const WalletBalance = mongoose.model(
  'WalletBalance',
  walletBalanceSchema,
)
