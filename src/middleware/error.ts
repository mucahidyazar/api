// src/types/error.ts
export interface ErrorDetail {
  message: string
  field?: string
  value?: unknown
  code?: string | number

  [key: string]: unknown
}

// src/middleware/error.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'

import { logger } from '@/client'
import { ERROR_CODE } from '@/constants'
import { TApiError, ApiResponse, ExtendedApiResponse } from '@/utils'

export const middlewareError: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  logger.error('Error caught in error handler:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
  })

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.response({
      statusCode: 400,
      apiResponse: ApiResponse.failure({
        type: 'InvalidParameters',
        code: ERROR_CODE.InvalidParameters,
        message: 'Validation failed',
        detail: err.errors.map(
          (error): ErrorDetail => ({
            message: error.message,
            field: error.path.join('.'),
            code: error.code,
          }),
        ),
      }),
    })
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.response({
      statusCode: 400,
      apiResponse: ApiResponse.failure({
        type: 'InvalidParameters',
        code: ERROR_CODE.InvalidParameters,
        message: 'Validation failed',
        detail: Object.entries(err.errors).map(
          ([field, error]): ErrorDetail => ({
            message: error.message,
            field,
            value: error.value,
            type: error.kind,
          }),
        ),
      }),
    })
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.response({
      statusCode: 400,
      apiResponse: ApiResponse.failure({
        type: 'InvalidParameters',
        code: ERROR_CODE.InvalidParameters,
        message: `Invalid ${err.path}`,
        detail: err.message,
      }),
    })
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0]

    return res.response({
      statusCode: 409,
      apiResponse: ApiResponse.failure({
        type: 'DuplicateEntry',
        code: ERROR_CODE.DuplicateEntry,
        message: `${field} already exists`,
        detail: err.message,
      }),
    })
  }

  // Default error response
  const defaultError: TApiError = {
    type: 'UnknownError',
    code: ERROR_CODE.UnknownError,
    message: err.message,
    detail: err.stack && isDevelopment ? err.stack : undefined,
  }

  const response: ExtendedApiResponse = {
    statusCode: 500,
    apiResponse: ApiResponse.failure(defaultError),
  }

  return res.response(response)
}
