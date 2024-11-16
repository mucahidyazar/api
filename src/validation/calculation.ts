import { z } from 'zod';

const calculationLoanDataSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1'),
  interestRate: z.number()
    .positive('Interest rate must be positive')
    .max(100, 'Interest rate cannot be more than 100%'),
  term: z.number()
    .positive('Term must be positive')
    .int('Term must be a whole number'),
  yearlyInflation: z.number()
    .positive('Yearly inflation must be positive')
    .max(100, 'Yearly inflation cannot be more than 100%')
    .optional(),
});

const calculationUpdateSchema = z.object({
  data: z.discriminatedUnion('type', [
    calculationLoanDataSchema.extend({
      type: z.literal('loan')
    })
  ])
});

const calculationSchema = z.object({
  type: z.literal('loan'),
  data: z.discriminatedUnion('type', [
    calculationLoanDataSchema.extend({
      type: z.literal('loan')
    })
    // İleride eklenecek diğer tipler için:
    // mortgageDataSchema.extend({
    //   type: z.literal('mortgage')
    // })
  ])
});

export { calculationSchema, calculationUpdateSchema, calculationLoanDataSchema };