import mongoose from 'mongoose'

import { VALIDATION_RULES } from '@/constants'

import { IAccessor } from './accessor'
import { IBaseModel, baseSchema } from './base.model'
import { IWishlistItem } from './wishlist-item'

interface IWishlist extends IBaseModel {
  name: string
  description: string
  isPublic: boolean
  isReservable: boolean

  items: mongoose.Types.ObjectId[] | IWishlistItem['_id'][]
  accessors: mongoose.Types.ObjectId[] | IAccessor['_id'][]
}

const wishlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: VALIDATION_RULES.input.min,
    maxlength: VALIDATION_RULES.input.mid,
  },
  description: {
    type: String,
    required: false,
    maxlength: VALIDATION_RULES.input.max,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isReservable: {
    type: Boolean,
    default: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}).add(baseSchema)

wishlistSchema.virtual('items', {
  ref: 'WishlistItem',
  localField: '_id',
  foreignField: 'wishlistId',
  justOne: false,
})

wishlistSchema.virtual('totalItems', {
  ref: 'WishlistItem',
  localField: '_id',
  foreignField: 'wishlistId',
  justOne: false,
})

wishlistSchema.virtual('accessors', {
  ref: 'WishlistAccessor',
  localField: '_id',
  foreignField: 'wishlistId',
  justOne: false,
})

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema)

export { IWishlist, Wishlist }
