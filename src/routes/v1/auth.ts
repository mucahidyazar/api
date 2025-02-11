import express from 'express'

import { ROUTES } from '@/constants'
import { AuthController } from '@/controller'
import {
  asyncWrapper,
  middlewareValidateBody,
  signUpRateLimiter,
} from '@/middleware'
import { signInDto, signUpDto } from '@/model/request/auth.dto'

const router = express.Router()
const authController = new AuthController()

router.post(
  ROUTES.v1.auth.signUp,
  signUpRateLimiter,
  middlewareValidateBody(signUpDto),
  asyncWrapper(authController.signUp),
)

router.post(
  ROUTES.v1.auth.signIn,
  middlewareValidateBody(signInDto),
  asyncWrapper(authController.signIn),
)

export const authOpenApiPaths = AuthController.getOpenApiPaths()
export { router as authRouter }
