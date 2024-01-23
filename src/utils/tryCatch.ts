import { NextFunction, Request, Response } from 'express'

export const tryCatch =
  (controller: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next)
    } catch (error) {
      next(error)
    }
  }
