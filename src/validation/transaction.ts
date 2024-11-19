import { z } from 'zod'

import { DEFAULTS, ERROR_MESSAGE, VALIDATION_RULES } from '@/constants'
import { createObjectIdSchema } from './general'

const transactionBrandSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Name'))
    .max(VALIDATION_RULES.input.mid, ERROR_MESSAGE.stringMax('Name')),
  icon: z.string().optional(),
  color: z.string().optional(),
  usageCount: z.number().min(0).optional(),
})

const transactionBrandUpdateSchema = transactionBrandSchema.partial()

const transactionCategorySchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Name'))
    .max(VALIDATION_RULES.input.mid, ERROR_MESSAGE.stringMax('Name')),
  icon: z.string().optional(),
  color: z.string().optional(),
  usageCount: z.number().min(0).optional(),
})

const transactionCategoryUpdateSchema = transactionCategorySchema.partial()


const transactionBalanceSchema = z.object({
  amount: z.number().default(0),
  currency: z.string().default(DEFAULTS.currency),
  rate: z.number().min(0).default(1)
})

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z
    .string({ message: ERROR_MESSAGE.string('Description') })
    .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Description'))
    .max(VALIDATION_RULES.input.max, ERROR_MESSAGE.stringMax('Description', VALIDATION_RULES.input.max))
    .optional(),
  link: z.string({ message: ERROR_MESSAGE.string('Link') })
    .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Link'))
    .max(VALIDATION_RULES.input.max, ERROR_MESSAGE.stringMax('Link', VALIDATION_RULES.input.max))
    .optional(),
  installments: z.number().min(1).default(1),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  date: z.string().or(z.date()),

  primaryBalance: transactionBalanceSchema.optional(),
  secondaryBalance: transactionBalanceSchema.optional(),

  wallet: createObjectIdSchema('Wallet'),
  walletBalance: createObjectIdSchema('WalletBalance'),
  transactionValue: createObjectIdSchema('TransactionValue'),
  transactionCategory: createObjectIdSchema('TransactionCategory'),
  transactionBrand: createObjectIdSchema('TransactionBrand')
})

const transactionUpdateSchema = transactionSchema.partial()

export {
  transactionBrandSchema,
  transactionBrandUpdateSchema,
  transactionCategorySchema,
  transactionCategoryUpdateSchema,
  transactionSchema,
  transactionUpdateSchema
}