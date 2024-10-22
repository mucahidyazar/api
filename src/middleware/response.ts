import { Request, Response, NextFunction } from 'express';

export type TResponseOptionsSuccess = {
  status: 'success';
  message: string;
  code?: number;
  data: any;
  metadata?: object;
  links?: object;
};

export type TResponseOptionsError = {
  status: 'error';
  message: string;
  code?: number;
  details?: object;
};

export type TResponseOptions = TResponseOptionsSuccess | TResponseOptionsError;

export function middlewareResponse(_req: Request, res: Response, next: NextFunction) {
  res.response = ({ status, code = 200, ...options }: TResponseOptions) => {
    res.status(code).json({
      status: status,
      code,
      ...options
    });
  }

  next();
}
