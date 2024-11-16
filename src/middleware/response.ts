import { TResponseOptions } from '@/common';
import { Request, Response, NextFunction } from 'express';

export function middlewareResponse(_req: Request, res: Response, next: NextFunction) {
  res.response = function ({ status, code = status === 'success' ? 200 : 500, ...options }: TResponseOptions) {
    const baseResponse = {
      status,
      code,
      timestamp: new Date().toISOString(),
      ...options
    };
    res.contentType('application/json');
    return res.status(code).json(baseResponse);
  };

  next();
}