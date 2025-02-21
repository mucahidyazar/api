import mongoose from 'mongoose'

import { IBaseModel, baseSchema } from './base.model'

interface ISetting extends IBaseModel {
  themeMode: string
  language: string
}

const settingSchema = new mongoose.Schema({
  themeMode: {
    type: String,
    default: 'light',
  },
  language: {
    type: String,
    default: 'en',
  },
}).add(baseSchema)

const Setting = mongoose.model<ISetting>('Setting', settingSchema)

export { ISetting, Setting }
