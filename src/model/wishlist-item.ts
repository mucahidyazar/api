import mongoose from 'mongoose'

import { VALIDATION_RULES } from '@/constants'

import { IBaseModel, baseSchema } from './base.model'
import { IUser } from './user'
import { IWishlist } from './wishlist'

interface IWishlistItem extends IBaseModel {
  wishlistStatus: 'draft' | 'active' | 'archived' | 'pending'
  link: string
  name: string
  price: number
  image: string

  reservedBy: mongoose.Types.ObjectId | IUser['_id']
  reservedAt: Date

  wishlist: mongoose.Types.ObjectId | IWishlist['_id']
}

const WishlistItemSchema = new mongoose.Schema({
  wishlistStatus: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'archived', 'pending'],
    default: 'pending',
  },
  link: {
    type: String,
    required: true,
    trim: true,
    minLength: VALIDATION_RULES.input.min,
    maxLength: VALIDATION_RULES.input.max,
  },
  name: {
    type: String,
    required: false,
    minLength: VALIDATION_RULES.input.min,
    maxLength: VALIDATION_RULES.input.max,
  },
  price: {
    type: Number,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  reservedAt: {
    type: Date,
    required: false,
  },
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    immutable: true,
  },
}).add(baseSchema)

const WishlistItem = mongoose.model<IWishlistItem>(
  'WishlistItem',
  WishlistItemSchema,
)

export { IWishlistItem, WishlistItem }
