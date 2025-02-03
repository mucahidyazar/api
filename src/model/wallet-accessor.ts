import mongoose from 'mongoose'

import { MODEL_OPTIONS } from '@/constants'

export const WalletAccessor = mongoose.model(
  'WalletAccessor',
  walletAccessorchema,
)

export const walletAccessorchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
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
