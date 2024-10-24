import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

export const walletAccessorSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, MODEL_OPTIONS);

export const WalletAccessor = mongoose.model('WalletAccessor', walletAccessorSchema);
