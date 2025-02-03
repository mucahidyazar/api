import mongoose from 'mongoose'
import { z } from 'zod'

import { calculationLoanDataSchema } from '@/validation'

type TCalculationDto = z.infer<typeof calculationDto>

const calculationDto = z.object({
  type: z.literal('loan'),
  data: calculationLoanDataSchema,
  user: z.string().refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId format',
  }),
})

export { TCalculationDto, calculationDto }
