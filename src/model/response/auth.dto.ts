import 'zod-openapi/extend'
import { z } from 'zod'

const signInResponseDto = z
  .object({
    token: z.string().openapi({
      description: 'Access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6....',
      format: 'jwt',
    }),
  })
  .openapi({
    description: 'Successful sign in response',
    title: 'Sign In Response',
  })

const signUpResponseDto = z
  .object({
    token: z.string().openapi({
      description: 'Access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6....',
      format: 'jwt',
    }),
  })
  .openapi({
    description: 'Successful sign up response',
    title: 'Sign Up Response',
  })

export { signInResponseDto, signUpResponseDto }
