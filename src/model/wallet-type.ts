import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '../constants'

const walletTypeSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      minlength: VALIDATION_RULES.input.min,
      maxlength: VALIDATION_RULES.input.mid,
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
  },
  MODEL_OPTIONS,
)

export const WalletType = mongoose.model('WalletType', walletTypeSchema)
