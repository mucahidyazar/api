import rateLimit from 'express-rate-limit'

// Rate limiter middleware
export const signUpMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hout
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    code: 429,
    message: 'Too many accounts created. Please try again later.',
  },
})
