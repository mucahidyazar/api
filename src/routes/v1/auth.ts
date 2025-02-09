import express from 'express'

import { ROUTES } from '@/constants'
import { signIn, signUp } from '@/controller/auth'
import {
  asyncWrapper,
  middlewareValidateBody,
  signUpRateLimiter,
} from '@/middleware'
import { signInDto, signUpDto } from '@/model/request/auth.dto'

const router = express.Router()

router.post(
  ROUTES.v1.auth.signIn,
  middlewareValidateBody(signInDto),
  asyncWrapper(signIn),
)

router.post(
  ROUTES.v1.auth.signUp,
  signUpRateLimiter,
  middlewareValidateBody(signUpDto),
  asyncWrapper(signUp),
)

export { router as authRouter }
