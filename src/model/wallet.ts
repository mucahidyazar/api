import mongoose from 'mongoose'

import { VALIDATION_RULES } from '@/constants'

import { IBaseModel, baseSchema } from './base.model'
import { IWalletAccessor } from './wallet-accessor'
import { IWalletBalance } from './wallet-balance'
import { IWalletType } from './wallet-type'

interface IWallet extends IBaseModel {
  title: string
  description: string
  design: string
  platform: string

  walletType: mongoose.Types.ObjectId | IWalletType['_id']

  walletBalances: mongoose.Types.ObjectId[] | IWalletBalance['_id'][]
  accessors: mongoose.Types.ObjectId[] | IWalletAccessor['_id'][]

  totalBalance: number

  addAccessor(userId: string): Promise<IWallet>
  getMonthlySpendings(year: number, month: number): Promise<IWallet[]>

  hasSufficientBalance(amount: number, currency: string): Promise<boolean>

  activeAccessors: any[]
  getActiveAccessors(): Promise<IWallet[]>

  isOwner(userId: string): Promise<boolean>
}

const walletSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: VALIDATION_RULES.input.min,
    maxlength: VALIDATION_RULES.input.mid,
    required: true,
  },
  description: {
    type: String,
    maxlength: VALIDATION_RULES.input.max,
    default: '',
  },
  design: {
    type: String,
    minlength: VALIDATION_RULES.input.min,
    maxlength: VALIDATION_RULES.input.max,
    required: true,
    default: 'design-0',
  },
  platform: {
    type: String,
    maxlength: 50,
    default: '',
  },
  walletType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletType',
    required: true,
  },
}).add(baseSchema)

walletSchema.virtual('walletBalances', {
  ref: 'WalletBalance',
  localField: '_id',
  foreignField: 'wallet',
})

walletSchema.virtual('accessors', {
  ref: 'WalletAccessor',
  localField: '_id',
  foreignField: 'wallet',
})

walletSchema.virtual('totalBalance').get(async function (this: IWallet) {
  const balances = await mongoose
    .model('WalletBalance')
    .find({ wallet: this._id })
  return balances.reduce((acc, bal) => acc + bal.amount, 0)
})

walletSchema.methods.addAccessor = async function (userId: string) {
  const WalletAccessor = mongoose.model('WalletAccessor')
  return new WalletAccessor({
    wallet: this._id,
    user: userId,
    status: 'pending',
  }).save()
}

walletSchema.methods.getMonthlySpendings = async function (
  year: number,
  month: number,
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  return mongoose.model('Transaction').aggregate([
    {
      $match: {
        wallet: this._id,
        direction: 'expense',
        dueDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$wallet',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])
}

walletSchema.methods.hasSufficientBalance = async function (
  amount: number,
  currency: string,
) {
  const balance = await mongoose.model('WalletBalance').findOne({
    wallet: this._id,
    currency: currency,
  })
  return balance && balance.amount >= amount
}

walletSchema.methods.getActiveAccessors = async function () {
  return mongoose
    .model('WalletAccessor')
    .find({
      wallet: this._id,
      status: 'active',
    })
    .populate('accessor', 'firstName lastName email')
}

walletSchema.virtual('activeAccessors').get(async function (this: IWallet) {
  return await this.getActiveAccessors()
})

walletSchema.methods.isOwner = async function (userId: string) {
  return this.createdBy.id === userId
}

const Wallet = mongoose.model<IWallet>('Wallet', walletSchema)

export { IWallet, Wallet }
