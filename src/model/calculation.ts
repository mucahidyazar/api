import mongoose from 'mongoose'

import { calculationLoanDataSchema } from '@/validation'

import { IBaseModel, baseSchema } from './base.model'

interface ICalculation extends IBaseModel {
  type: 'loan'
  data: any
}

const calculationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['loan'],
    immutable: true,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: (value: any) => {
      if (value.type === 'loan') {
        return calculationLoanDataSchema.safeParse(value)
      }
      return false
    },
  },
}).add(baseSchema)

const Calculation = mongoose.model<ICalculation>(
  'Calculation',
  calculationSchema,
)

export { Calculation, ICalculation }
