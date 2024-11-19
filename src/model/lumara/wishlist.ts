import mongoose from 'mongoose';

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants';

const WishlistItemSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
    trim: true,
    minLength: VALIDATION_RULES.input.min,
    maxLength: VALIDATION_RULES.input.max
  },
  name: {
    type: String,
    required: false,
    minLength: VALIDATION_RULES.input.min,
    maxLength: VALIDATION_RULES.input.max
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
  items: [WishlistItemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, MODEL_OPTIONS);

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export { Wishlist };
