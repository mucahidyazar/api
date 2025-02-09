import { z } from 'zod'

const signInDto = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
})

const signUpDto = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
})

type TSignInDto = z.infer<typeof signInDto>
type TSignUpDto = z.infer<typeof signUpDto>

export { TSignInDto, TSignUpDto, signInDto, signUpDto }
