import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '@/constants';

const walletTypeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  multipleBalance: {
    type: Boolean,
    default: false,
  },
  hasPlatform: {
    type: Boolean,
    default: false,
  },
}, MODEL_OPTIONS);

export const WalletType = mongoose.model('WalletType', walletTypeSchema);
