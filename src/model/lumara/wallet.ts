import mongoose from 'mongoose';

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants';

const walletSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: VALIDATION_RULES.input.min,
    maxlength: VALIDATION_RULES.input.mid,
    required: true,
  },
  description: {
    type: String,
    maxlength: VALIDATION_RULES.input.max,
    default: ''
  },
  design: {
    type: String,
    minlength: VALIDATION_RULES.input.min,
    maxlength: VALIDATION_RULES.input.max,
    required: true,
    default: 'design-0',
  },
  platform: {
    type: String,
    maxlength: 50,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
  walletBalances: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletBalance',
    }
  ],
  walletType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletType',
    required: true,
    immutable: true,
  }
}, MODEL_OPTIONS);

export const Wallet = mongoose.model('Wallet', walletSchema);
