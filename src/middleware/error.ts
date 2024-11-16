// src/types/error.ts
export interface ErrorDetail {
  message: string;
  field?: string;
  value?: unknown;
  code?: string | number;
  [key: string]: unknown;
}

// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { logger } from '@/client';
import { API_ERROR } from '@/constants';
import { ApiError } from '@/services/api-error';

export const middlewareError = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  logger.error('Error caught in error handler:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined
  });

  // ApiError handling
  if (err instanceof ApiError) {
    return res.response({
      status: 'error',
      code: err.statusCode,
      message: err.message,
      errorCode: err.code,
      details: Array.isArray(err.details) ? err.details : [err.details]
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.response({
      status: 'error',
      code: 400,
      message: 'Validation failed',
      errorCode: API_ERROR.InvalidInput.code,
      details: err.errors.map((error): ErrorDetail => ({
        message: error.message,
        field: error.path.join('.'),
        code: error.code,
      }))
    });
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.response({
      status: 'error',
      code: 400,
      message: 'Validation failed',
      errorCode: API_ERROR.InvalidInput.code,
      details: Object.entries(err.errors).map(([field, error]): ErrorDetail => ({
        message: error.message,
        field,
        value: error.value,
        type: error.kind
      }))
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.response({
      status: 'error',
      code: 400,
      message: `Invalid ${err.path}`,
      errorCode: API_ERROR.InvalidFormat.code,
      details: [{
        message: err.message,
        field: err.path,
        value: err.value,
        type: err.kind
      }]
    });
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return res.response({
      status: 'error',
      code: 409,
      message: 'Duplicate field value',
      errorCode: API_ERROR.ResourceAlreadyExists.code,
      details: [{
        message: `${field} already exists`,
        field,
        code: (err as any).code
      }]
    });
  }

  // Default error response
  const defaultError: ErrorDetail = {
    message: err.message,
    ...(err.stack && isDevelopment && { stack: err.stack })
  };

  return res.response({
    status: 'error',
    code: 500,
    message: !isDevelopment ? 'Internal server error' : err.message,
    errorCode: API_ERROR.InternalServerError.code,
    details: [defaultError]
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};