import { z } from 'zod'

import { ERROR_MESSAGE, VALIDATION_RULES } from '@/constants'
import { createObjectIdSchema } from '@/validation/general'

// Önce wishlist item için bir sub-schema oluşturalım
const wishlistItemSchema = z.object({
  id: z.string().optional(),

  name: z
    .string({
      required_error: ERROR_MESSAGE.required('Name'),
      message: ERROR_MESSAGE.string('Name'),
    })
    .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Name'))
    .max(VALIDATION_RULES.input.mid, ERROR_MESSAGE.stringMax('Name'))
    .optional(),

  link: z
    .string({
      message: ERROR_MESSAGE.string('Link'),
    })
    .url(ERROR_MESSAGE.invalid('Link'))
    .max(VALIDATION_RULES.input.max, ERROR_MESSAGE.stringMax('Link'))
    .optional(),

  price: z
    .number({
      message: ERROR_MESSAGE.number('Price'),
    })
    .min(0, 'Price cannot be negative')
    .optional(),

  image: z
    .string({
      message: ERROR_MESSAGE.string('Image'),
    })
    .url(ERROR_MESSAGE.invalid('Image URL'))
    .optional(),

  reservedBy: createObjectIdSchema('User').optional().nullable(),
  reservedAt: z.date().optional().nullable(),

  action: z.enum(['initial', 'updated', 'deleted']).optional(),
})

// Accessor işlemleri için
export const wishlistAccessorCreateSchema = z.object({
  user: z.object({
    email: z
      .string({
        required_error: ERROR_MESSAGE.required('Email'),
        message: ERROR_MESSAGE.string('Email'),
      })
      .email(ERROR_MESSAGE.invalid('Email')),
  }),
  action: z.enum(['initial', 'updated', 'deleted']).optional(),
})

export const wishlistAccessorUpdateSchema = z
  .object({
    status: z.enum(['active', 'pending']),
    action: z.enum(['initial', 'updated', 'deleted']).optional(),
  })
  .strict()

// Create schema
export const wishlistCreateSchema = z
  .object({
    name: z
      .string({
        required_error: ERROR_MESSAGE.required('Title'),
        message: ERROR_MESSAGE.string('Title'),
      })
      .min(VALIDATION_RULES.input.min, ERROR_MESSAGE.stringMin('Title'))
      .max(VALIDATION_RULES.input.mid, ERROR_MESSAGE.stringMax('Title')),

    description: z
      .string({
        message: ERROR_MESSAGE.string('Description'),
      })
      .max(VALIDATION_RULES.input.max, ERROR_MESSAGE.stringMax('Description'))
      .optional(),

    isPublic: z.boolean().default(false),
    isReservable: z.boolean().default(false),

    accessors: z.array(wishlistAccessorCreateSchema).optional().default([]),
    items: z.array(wishlistItemSchema).optional().default([]),
  })
  .strict()

// Item update schema (ayrı bir endpoint için)
export const wishlistItemUpdateSchema = z
  .object({
    name: wishlistItemSchema.shape.name.optional(),
    link: wishlistItemSchema.shape.link.optional(),
    price: wishlistItemSchema.shape.price.optional(),
    image: wishlistItemSchema.shape.image.optional(),
    reservedBy: wishlistItemSchema.shape.reservedBy.optional(),
    reservedAt: wishlistItemSchema.shape.reservedAt.optional(),
  })
  .strict()

// Update schema
export const wishlistUpdateSchema = wishlistCreateSchema.partial()
