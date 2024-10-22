import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
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
      default: 'EUR',
    },
    language: {
      type: String,
      default: 'en',
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Settings = mongoose.model('Settings', settingsSchema)

export { Settings }
