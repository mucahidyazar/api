import mongoose from 'mongoose';
import z from 'zod';

import { MODEL_OPTIONS } from '../../constants';

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
        return validateLoanData(value);
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

function validateLoanData(data: any) {
  const schema = z.object({
    amount: z.number().positive(),
    interestRate: z.number().positive(),
    term: z.number().positive(),
    yearlyInflation: data.yearlyInflation
      ? z.number().positive()
      : z.number().optional(),
  });
  return schema.safeParse(data).success;
}