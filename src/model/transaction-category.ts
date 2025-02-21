import mongoose from 'mongoose'

import { VALIDATION_RULES } from '@/constants'

import { IBaseModel, baseSchema } from './base.model'

interface ITransactionCategory extends IBaseModel {
  name: string
  usageCount: number
  icon: string
  color: string
}

const transactionCategorySchema = new mongoose.Schema({
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
}).add(baseSchema)

const TransactionCategory = mongoose.model<ITransactionCategory>(
  'TransactionCategory',
  transactionCategorySchema,
)

export { ITransactionCategory, TransactionCategory }
