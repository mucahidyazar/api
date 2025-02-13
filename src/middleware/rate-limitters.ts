import rateLimit from 'express-rate-limit'

import { ERROR_CODE } from '@/constants'
import { ApiResponse } from '@/utils'

/**
 * Rate limiter middleware for sign-up requests
 * @description Limits the number of sign-up attempts from a single IP address
 * @middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds (1 hour)
 * @param {number} options.max - Maximum number of requests per IP within the time window
 * @returns {Function} Express middleware function
 * @example
 * app.post('/sign-up', signUpRateLimiter, signUpController)
 */
export const signUpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: ApiResponse.failure({
    type: 'RateLimitExceeded',
    code: ERROR_CODE.RateLimitExceeded,
    message: 'Too many requests. Please try again later.',
    detail: undefined,
  }),
})
