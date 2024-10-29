import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

export const wishlistAccessorSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
  }
}, MODEL_OPTIONS);

export const WishlistAccessor = mongoose.model('WishlistAccessor', wishlistAccessorSchema);
