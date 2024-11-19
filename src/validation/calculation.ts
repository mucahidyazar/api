import { z } from 'zod';
import { createObjectIdSchema } from './general';

const calculationLoanDataSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1'),
  interestRate: z.number()
    .positive('Interest rate must be positive'),
  term: z.number()
    .positive('Term must be positive')
    .int('Term must be a whole number'),
  yearlyInflation: z.number()
    .positive('Yearly inflation must be positive')
    .optional(),
});

const calculationCreateSchema = z.object({
  type: z.literal('loan'),
  data: z.discriminatedUnion('type', [
    calculationLoanDataSchema.extend({
      type: z.literal('loan')
    })
    // İleride eklenecek diğer tipler için:
    // mortgageDataSchema.extend({
    //   type: z.literal('mortgage')
    // })
  ]),
}).strict();

const calculationUpdateSchema = calculationCreateSchema
  .pick({ data: true })
  .partial() // Allow partial updates
  .strict(); // Disallow additional fields

export { calculationCreateSchema, calculationUpdateSchema, calculationLoanDataSchema };