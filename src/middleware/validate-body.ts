import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'

export const middlewareValidateBody =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await schema.parseAsync(req.body)
        next()
      } catch (error) {
        next(error) // Hatayı error handler'a gönder
      }
    }
