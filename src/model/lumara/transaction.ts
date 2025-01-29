import mongoose from 'mongoose';

import { DEFAULTS, MODEL_OPTIONS, VALIDATION_RULES } from '@/constants';

export const transactionBalanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: DEFAULTS.currency,
    required: true
  },
  rate: {
    type: Number,
    default: 1,
    required: true
  }
}, MODEL_OPTIONS);


const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  description: {
    type: String,
    maxlength: VALIDATION_RULES.input.max,
  },
  link: {
    type: String,
    maxlength: VALIDATION_RULES.input.max,
  },
  date: {
    type: Date,
    required: true
  },

  primaryBalance: {
    type: transactionBalanceSchema,
  },
  secondaryBalance: {
    type: transactionBalanceSchema,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },

  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  walletBalance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletBalance',
    required: true,
  },

  // subscriptionRecurrence: {
  //   type: Number,
  //   default: 1,
  //   min: 1,
  // },
  // subscriptionType: {
  //   type: String,
  //   enum: ['daily', 'weekly', 'monthly', 'yearly'],
  //   required: function () {
  //     return (this as { subscription: boolean }).subscription;
  //   },
  //   validate: {
  //     validator: function (value: string) {
  //       return !(this as { subscription: boolean }).subscription || value.length > 0;
  //     },
  //     message: 'Subscription type is required when the transaction is subscription.'
  //   }
  // },

  transactionAmount: {
    type: Number,
    required: true,
  },
  transactionCurrency: {
    type: String,
    default: DEFAULTS.currency,
  },
  transactionCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionCategory',
  },
  transactionBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionBrand',
  },
}, MODEL_OPTIONS);

export const Transaction = mongoose.model('Transaction', transactionSchema);
