import mongoose from 'mongoose'

import { DEFAULTS } from '@/constants'

import { IBaseModel, baseSchema } from './base.model'
import { ITransaction } from './transaction'
import { IWallet } from './wallet'

interface IWalletBalance extends IBaseModel {
  amount: number
  currency: string

  wallet: mongoose.Types.ObjectId | IWallet['_id']

  transactions: mongoose.Types.ObjectId[] | ITransaction['_id'][]
}

const walletBalanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: DEFAULTS.currency,
    required: true,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    immutable: true,
  },
}).add(baseSchema)

walletBalanceSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'walletBalance',
  justOne: false,
})

const WalletBalance = mongoose.model<IWalletBalance>(
  'WalletBalance',
  walletBalanceSchema,
)

export { IWalletBalance, WalletBalance }
