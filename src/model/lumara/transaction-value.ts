import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '@/constants';

export const transactionValueSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    required: true
  }
}, MODEL_OPTIONS);

export const TransactionValue = mongoose.model('TransactionValue', transactionValueSchema);
