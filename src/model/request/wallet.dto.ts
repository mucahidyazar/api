import 'zod-openapi/extend'
import { z } from 'zod'

const walletCreateDto = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, { message: 'Title must be at least 1 character' })
      .max(100, { message: 'Title must be less than 100 characters' })
      .openapi({
        description: 'The title of the wallet',
        example: 'My wallet',
      }),
    description: z
      .string({ required_error: 'Description is required' })
      .max(500, { message: 'Description must be less than 500 characters' })
      .default('')
      .openapi({
        description: 'The description of the wallet',
        example: 'My wallet',
        default: '',
      }),
    design: z
      .string({ required_error: 'Design is required' })
      .min(1, { message: 'Design must be at least 1 character' })
      .max(100, { message: 'Design must be less than 100 characters' })
      .default('design-0')
      .openapi({
        description: 'The design of the wallet',
        example: 'design-0',
        default: 'design-0',
      }),
    platform: z
      .string({ required_error: 'Platform is required' })
      .max(50, { message: 'Platform must be less than 50 characters' })
      .default('')
      .openapi({
        description:
          'The platform of the wallet(Required based on wallet type)',
        example: 'My wallet',
        default: '',
      }),
    walletTypeId: z
      .string({ required_error: 'Wallet type is required' })
      .openapi({
        description: 'The type of the wallet',
        example: '66c0616b531123616b531123',
      }),

    accessorEmails: z
      .array(z.string().email({ message: 'Invalid email format' }))
      .default([])
      .openapi({
        description: 'The emails of the accessors',
        example: ['accessor1@example.com', 'accessor2@example.com'],
        default: [],
      }),
    walletBalances: z
      .array(
        z.object({
          currency: z
            .string({ required_error: 'Currency is required' })
            .min(1, {
              message: 'Currency must be at least 1 character',
            }),
          amount: z
            .number({ required_error: 'Amount is required' })
            .min(0, { message: 'Amount must be greater than 0' }),
        }),
      )
      .openapi({
        description: 'The balances of the wallet',
        example: [
          { currency: 'USD', amount: 0 },
          { currency: 'EUR', amount: 20000 },
        ],
      }),
  })
  .strict()
  .openapi({
    description: 'Create a new wallet',
    title: 'Create Wallet',
  })

export { walletCreateDto }
