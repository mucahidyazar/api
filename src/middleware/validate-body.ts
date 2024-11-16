import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const middlewareValidateBody = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync(req.body);
    next();
  };