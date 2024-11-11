import { z } from 'zod';

export const passwordSchema = z.string({
  required_error: "New password is required",
}).min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%-^&*]/, "Password must contain at least one special character (!@#$%^&*)")

export const passwordUpdateSchema = z.object({
  oldPassword: z.string({
    required_error: "Old password is required",
  }).min(1, "Old password is required"),
  newPassword: passwordSchema
});

export const userCreateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: passwordSchema,
  avatarUrl: z.string().url().optional()
});