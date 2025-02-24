import mongoose from 'mongoose'

import { IBaseModel, baseSchema } from './base.model'
import { IUser } from './user'
import { IWishlist } from './wishlist'

interface IWishlistAccessor extends IBaseModel {
  wishlistAccessorStatus: 'active' | 'pending'
  accessor: mongoose.Types.ObjectId | IUser['_id']
  wishlist: mongoose.Types.ObjectId | IWishlist['_id']
}

const wishlistAccessorSchema = new mongoose.Schema({
  wishlistAccessorStatus: {
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
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    required: true,
    immutable: true,
  },
}).add(baseSchema)

const WishlistAccessor = mongoose.model<IWishlistAccessor>(
  'WishlistAccessor',
  wishlistAccessorSchema,
)

export { WishlistAccessor }
