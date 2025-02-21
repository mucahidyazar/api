import mongoose, { Model, model } from 'mongoose'

import { VALIDATION_RULES } from '../constants'

import { IBaseModel, baseSchema } from './base.model'

interface IWalletType extends IBaseModel {
  label: string
  multipleBalance: boolean
  hasPlatform: boolean
}

interface IWalletTypeModel extends Model<IWalletType> {
  checkHasPlatform(walletTypeId: string): Promise<boolean>
}

const walletTypeSchema = new mongoose.Schema<IWalletType, IWalletTypeModel>({
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
}).add(baseSchema)

walletTypeSchema.statics.checkHasPlatform = async function (
  walletTypeId: string,
) {
  const walletType = await this.findById(walletTypeId)
    .select('hasPlatform')
    .lean()
  return walletType?.hasPlatform
}

const WalletType = model<IWalletType, IWalletTypeModel>(
  'WalletType',
  walletTypeSchema,
)

export { IWalletType, IWalletTypeModel, WalletType }
