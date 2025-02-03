import express from 'express'

import { ROUTES } from '@/constants'
import { signIn, signUp } from '@/controller/auth'
import {
  asyncWrapper,
  middlewareValidateBody,
  signUpRateLimiter,
} from '@/middleware'
import { signInDto, signUpDto } from '@/model/request/auth.dto'

/**
 * Express router for authentication routes
 * @module routes/auth
 */
const router = express.Router()

/**
 * Route for user sign-in
 * @name POST /api/v1/auth/sign-in
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {string} path - Express path
 * @param {Function} middlewareValidateBody - Validates request body against signInDto schema
 * @param {Function} asyncWrapper - Wraps async route handler
 * @param {Function} signIn - Sign-in controller function
 * @see {@link signInDto}
 * @see {@link signIn}
 */
router.post(
  ROUTES.v1.auth.signIn,
  middlewareValidateBody(signInDto),
  asyncWrapper(signIn),
)

/**
 * Route for user registration
 * @name POST /api/v1/auth/sign-up
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {string} path - Express path
 * @param {Function} signUpRateLimiter - Rate limits sign-up requests
 * @param {Function} middlewareValidateBody - Validates request body against signUpDto schema
 * @param {Function} asyncWrapper - Wraps async route handler
 * @param {Function} signUp - Sign-up controller function
 * @see {@link signUpDto}
 * @see {@link signUp}
 * @see {@link signUpRateLimiter}
 */
router.post(
  ROUTES.v1.auth.signUp,
  signUpRateLimiter,
  middlewareValidateBody(signUpDto),
  asyncWrapper(signUp),
)

export { router as authRouter }
