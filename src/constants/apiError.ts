export const API_ERROR = {
  // Auth errors | 1000-1999 | 401
  InvalidCredentials: {
    code: 1000,
    message: 'Invalid credentials',
    key: 'InvalidCredentials',
  },
  TokenExpired: {
    code: 1001,
    message: 'Token has expired',
    key: 'TokenExpired',
  },
  InvalidToken: {
    code: 1002,
    message: 'Invalid token',
    key: 'InvalidToken',
  },
  Unauthorized: {
    code: 1003,
    message: 'Unauthorized access',
    key: 'Unauthorized',
  },

  // Validation errors | 2000-2999 | 400
  InvalidInput: {
    code: 2000,
    message: 'Validation failed',
    key: 'InvalidInput',
  },
  MissingRequiredField: {
    code: 2001,
    message: 'Missing required field',
    key: 'MissingRequiredField',
  },
  InvalidFormat: {
    code: 2002,
    message: 'Invalid format',
    key: 'InvalidFormat',
  },

  // Resource errors | 3000-3999 | 404
  ResourceNotFound: {
    code: 3000,
    message: 'Resource not found',
    key: 'ResourceNotFound',
  },
  ResourceAlreadyExists: {
    code: 3001,
    message: 'Resource already exists',
    key: 'ResourceAlreadyExists',
  },
  ResourceConflict: {
    code: 3002,
    message: 'Resource conflict',
    key: 'ResourceConflict',
  },

  // Business Logic errors | 4000-4999 | 400
  InsufficientFunds: {
    code: 4000,
    message: 'Insufficient funds',
    key: 'InsufficientFunds',
  },
  LimitExceeded: {
    code: 4001,
    message: 'Limit exceeded',
    key: 'LimitExceeded',
  },
  InvalidStatusTransition: {
    code: 4002,
    message: 'Invalid status transition',
    key: 'InvalidStatusTransition',
  },

  // External Service errors | 5000-5999 | 502
  ExternalServiceError: {
    code: 5000,
    message: 'External service error',
    key: 'ExternalServiceError',
  },
  NetworkError: {
    code: 5001,
    message: 'Network error',
    key: 'NetworkError',
  },

  // System errors | 6000-6999 | 500
  InternalServerError: {
    code: 9000,
    message: 'Internal server error',
    key: 'InternalServerError',
  },
  DatabaseError: {
    code: 9001,
    message: 'Database error',
    key: 'DatabaseError',
  },
} as const

export type TApiError = keyof typeof API_ERROR
