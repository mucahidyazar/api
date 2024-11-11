// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const middlewareValidatePassword = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
      });
      return next();
    } catch (error: any) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Validation failed',
        details: error.errors,
      });
    }
  };