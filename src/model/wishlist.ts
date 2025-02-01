import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants'

const wishlistSchema = new mongoose.Schema(
  {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  MODEL_OPTIONS,
)

wishlistSchema.virtual('items', {
  ref: 'WishlistItem',
  localField: '_id',
  foreignField: 'wishlist',
})

wishlistSchema.virtual('accessors', {
  ref: 'WishlistAccessor',
  localField: '_id',
  foreignField: 'wishlist',
})

// wishlistSchema.methods.isOwner = async function (userId) {
//   return this.user.toString() === userId.toString();
// }

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export { Wishlist }
