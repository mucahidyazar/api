import {Request, Response, NextFunction} from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(500).json(err)
}
