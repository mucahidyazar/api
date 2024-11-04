import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

export const walletAccessorchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  }
}, MODEL_OPTIONS);

export const WalletAccessor = mongoose.model('WalletAccessor', walletAccessorchema);
