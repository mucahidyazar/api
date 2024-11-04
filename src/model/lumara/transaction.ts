import mongoose from 'mongoose';

import { MODEL_OPTIONS } from '../../constants';

export const transactionBalanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
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
    maxlength: 500,
  },
  link: {
    type: String,
    maxlength: 500,
  },
  installments: {
    type: Number,
    default: 1,
    min: 1,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function () {
      return (this as { isRecurring: boolean }).isRecurring;
    },
    validate: {
      validator: function (value: string) {
        return !(this as { isRecurring: boolean }).isRecurring || value.length > 0;
      },
      message: 'Recurring type is required when the transaction is recurring.'
    }
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

  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    immutable: true,
  },
  transactionValue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionValue',
    required: true,
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
