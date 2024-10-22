import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

const walletSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    maxlength: 255,
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  design: {
    type: String,
    minlength: 2,
    maxlength: 500,
    required: true,
    default: 'design-0',
  },
  platform: {
    type: String,
    maxlength: 50,
    default: ''
  },
  accessors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accessor',
    }
  ],
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
