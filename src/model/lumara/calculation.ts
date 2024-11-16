import mongoose from 'mongoose';
import z from 'zod';

import { MODEL_OPTIONS } from '@/constants';
import { calculationLoanDataSchema } from '@/validation';

export const calculationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['loan'],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: (value: any) => {
      if (value.type === 'loan') {
        return calculationLoanDataSchema.safeParse(value);
      }
      return false
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
}, MODEL_OPTIONS);


export const Calculation = mongoose.model('Calculation', calculationSchema);
