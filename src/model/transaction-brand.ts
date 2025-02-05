import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants'

const transactionBrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: VALIDATION_RULES.input.min,
      maxlength: VALIDATION_RULES.input.mid,
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
  },
  MODEL_OPTIONS,
)

const TransactionBrand = mongoose.model(
  'TransactionBrand',
  transactionBrandSchema,
)

export { TransactionBrand, transactionBrandSchema }
