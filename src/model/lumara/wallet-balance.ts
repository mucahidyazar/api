import mongoose from 'mongoose';

import { DEFAULTS, MODEL_OPTIONS } from '@/constants';

export const walletBalanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: DEFAULTS.currency,
    required: true
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    }
  ],
}, MODEL_OPTIONS);

export const WalletBalance = mongoose.model('WalletBalance', walletBalanceSchema);
