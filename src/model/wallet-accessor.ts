import mongoose from 'mongoose'

import { IBaseModel, baseSchema } from './base.model'
import { IUser } from './user'
import { IWallet } from './wallet'

interface IWalletAccessor extends IBaseModel {
  walletAccessorStatus: 'active' | 'pending'

  accessor: mongoose.Types.ObjectId | IUser['_id']

  wallet: mongoose.Types.ObjectId | IWallet['_id']
}

const walletAccessorSchema = new mongoose.Schema({
  walletAccessorStatus: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  accessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    immutable: true,
  },
}).add(baseSchema)

const WalletAccessor = mongoose.model<IWalletAccessor>(
  'WalletAccessor',
  walletAccessorSchema,
)

export { IWalletAccessor, WalletAccessor }
