import { z } from 'zod'

export const createObjectIdSchema = (field: string) =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${field} ID`)
