import { API_ERROR, TApiError } from '@/constants';

interface ErrorDetail {
  message?: string;
  field?: string;
  value?: unknown;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly code: number;
  public readonly statusCode: number;
  public readonly key: string;
  public readonly details?: ErrorDetail[];

  constructor(
    errorType: TApiError,
    message?: string,
    details?: ErrorDetail | ErrorDetail[],
    statusCode?: number,
  ) {
    // Use provided message or default message from API_ERROR map
    super(message || API_ERROR[errorType].message);

    this.name = 'ApiError';
    this.code = API_ERROR[errorType].code;
    this.key = API_ERROR[errorType].key;
    this.statusCode = statusCode || this.getDefaultStatusCode(this.code);
    this.details = Array.isArray(details) ? details : details ? [details] : undefined;
  }

  private getDefaultStatusCode(errorCode: number): number {
    // Auth errors | 1000-1999 | 401
    if (errorCode >= 1000 && errorCode < 2000) return 401;
    // Validation errors | 2000-2999 | 400
    if (errorCode >= 2000 && errorCode < 3000) return 400;
    // Resource errors | 3000-3999 | 404
    if (errorCode >= 3000 && errorCode < 4000) return 404;
    // Business Logic errors | 4000-4999 | 400
    if (errorCode >= 4000 && errorCode < 5000) return 400;
    // External Service errors | 5000-5999 | 502
    if (errorCode >= 5000 && errorCode < 6000) return 502;
    // System errors | 6000-6999 | 500
    return 500;
  }
}