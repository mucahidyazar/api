import 'zod-openapi/extend'
import { z } from 'zod'

import { ERROR_MESSAGE, VALIDATION_RULES } from '@/constants'

const signInDto = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email format' })
      .openapi({
        description: 'User email',
        example: 'user@example.com',
        format: 'email',
      }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .openapi({
        description: 'User password - must be at least 8 characters',
        minLength: 8,
      }),
  })
  .strict()
  .openapi({
    description: 'User sign in data',
    title: 'Sign In',
  })

const signUpDto = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email format' })
      .openapi({
        description: 'User email',
        example: 'user@example.com',
        format: 'email',
      }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(VALIDATION_RULES.regex.uppercase, {
        message: ERROR_MESSAGE.upperCase('Password'),
      })
      .regex(VALIDATION_RULES.regex.lowercase, {
        message: ERROR_MESSAGE.lowerCase('Password'),
      })
      .regex(VALIDATION_RULES.regex.number, {
        message: ERROR_MESSAGE.numberCase('Password'),
      })
      .regex(VALIDATION_RULES.regex.special, {
        message: ERROR_MESSAGE.specialCase('Password'),
      })
      .openapi({
        description: 'User password',
        format: 'password',
        minLength: 8,
      }),
  })
  .strict()
  .openapi({
    description: 'User sign up data',
    title: 'Sign Up',
  })

export { signInDto, signUpDto }
