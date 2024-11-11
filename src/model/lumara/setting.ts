import mongoose from 'mongoose'

import { MODEL_OPTIONS } from '../../constants/general'

const settingSchema = new mongoose.Schema(
  {
    themeMode: {
      type: String,
      default: 'light',
    },
    primaryCurrency: {
      type: String,
      default: 'USD',
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
    },
  }, MODEL_OPTIONS
)

const Setting = mongoose.model('Setting', settingSchema)

export { Setting }
