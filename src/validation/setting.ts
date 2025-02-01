import { z } from 'zod'

export const settingUpdateSchema = z
  .object({
    themeMode: z.string().optional(),
    primaryCurrency: z.string().optional(),
    secondaryCurrency: z.string().optional(),
    language: z.string().optional(),
  })
  .strict()
