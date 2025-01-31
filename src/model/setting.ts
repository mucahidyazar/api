import mongoose from 'mongoose'

import { DEFAULTS, MODEL_OPTIONS } from '@/constants'

const settingSchema = new mongoose.Schema(
  {
    themeMode: {
      type: String,
      default: 'light',
    },
    primaryCurrency: {
      type: String,
      default: DEFAULTS.currency,
    },
    secondaryCurrency: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      immutable: true,
    },
  },
  MODEL_OPTIONS,
)

const Setting = mongoose.model('Setting', settingSchema)

export { Setting }
