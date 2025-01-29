import { ERROR_MESSAGE, VALIDATION_RULES } from '@/constants';
import { z } from 'zod';

const passwordSchema = z
  .string({
    message: ERROR_MESSAGE.string('Password'),
    required_error: ERROR_MESSAGE.required('Password'),
  })
  .min(
    VALIDATION_RULES.password.min,
    ERROR_MESSAGE.stringMin('Password', VALIDATION_RULES.password.min)
  )
  .regex(
    VALIDATION_RULES.password.uppercase,
    ERROR_MESSAGE.upperCase('Password')
  )
  .regex(
    VALIDATION_RULES.password.lowercase,
    ERROR_MESSAGE.lowerCase('Password')
  )
  .regex(
    VALIDATION_RULES.password.number,
    ERROR_MESSAGE.numberCase('Password')
  )
  .regex(
    VALIDATION_RULES.password.special,
    ERROR_MESSAGE.specialCase('Password')
  );

const passwordUpdateSchema = z.object({
  oldPassword: z
    .string({
      required_error: ERROR_MESSAGE.string('Old password'),
      message: ERROR_MESSAGE.string('Old password')
    })
    .min(
      VALIDATION_RULES.password.min,
      ERROR_MESSAGE.stringMin('Old password', VALIDATION_RULES.password.min)
    ),
  newPassword: passwordSchema
});

const userSchema = z.object({
  firstName: z
    .string({
      message: ERROR_MESSAGE.string('First name'),
      required_error: ERROR_MESSAGE.required('First name'),
    })
    .min(
      VALIDATION_RULES.input.min,
      ERROR_MESSAGE.stringMin('First name', VALIDATION_RULES.input.min)
    )
    .max(
      VALIDATION_RULES.input.mid,
      ERROR_MESSAGE.stringMax('First name', VALIDATION_RULES.input.mid)
    ).optional(),
  lastName: z
    .string({
      message: ERROR_MESSAGE.string('Last name'),
      required_error: ERROR_MESSAGE.required('Last name'),
    })
    .min(
      VALIDATION_RULES.input.min,
      ERROR_MESSAGE.stringMin('Last name', VALIDATION_RULES.input.min)
    )
    .max(
      VALIDATION_RULES.input.mid,
      ERROR_MESSAGE.stringMax('Last name', VALIDATION_RULES.input.mid)
    ).optional(),
  email: z
    .string({
      message: ERROR_MESSAGE.string('Email'),
      required_error: ERROR_MESSAGE.required('Email'),
    })
    .email({
      message: ERROR_MESSAGE.invalid('Email'),
    }),
  password: passwordSchema,
  avatar: z.any(),
});

const userUpdateSchema = userSchema.partial();

export {
  passwordSchema,
  passwordUpdateSchema,
  userSchema,
  userUpdateSchema,
}