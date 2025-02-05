import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants'

const transactionCategorySchema = new mongoose.Schema(
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

const TransactionCategory = mongoose.model(
  'TransactionCategory',
  transactionCategorySchema,
)

export { TransactionCategory, transactionCategorySchema }
