import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '@/constants';

const WishlistItemSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: false,
    min: 0
  },
  image: {
    type: String,
    required: false
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reservedAt: {
    type: Date,
    required: false
  }
}, MODEL_OPTIONS);

const WishlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  description: {
    type: String,
    required: false,
    maxlength: 500,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isReservable: {
    type: Boolean,
    default: false,
  },
  items: [WishlistItemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, MODEL_OPTIONS);

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export { Wishlist };
