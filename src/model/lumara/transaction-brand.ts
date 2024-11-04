import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

export const transactionBrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
}, MODEL_OPTIONS);


export const TransactionBrand = mongoose.model('TransactionBrand', transactionBrandSchema);
