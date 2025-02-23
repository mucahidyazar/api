import { Request, Response, NextFunction } from 'express'

export const asyncWrapper =
  <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
  ) =>
  async (req: T, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
