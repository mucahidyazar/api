import mongoose from 'mongoose'

import { MODEL_OPTIONS } from '@/constants'

const walletAccessorSchema = new mongoose.Schema(
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

const WalletAccessor = mongoose.model('WalletAccessor', walletAccessorSchema)

export { WalletAccessor, walletAccessorSchema }
