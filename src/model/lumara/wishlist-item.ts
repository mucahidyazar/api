import mongoose from 'mongoose';

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants';

const WishlistItemSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'archived', 'pending'],
    default: 'pending'
  },
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
  },
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    immutable: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, MODEL_OPTIONS);

const WishlistItem = mongoose.model('WishlistItem', WishlistItemSchema);

export { WishlistItem };
