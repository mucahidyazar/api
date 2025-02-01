import express from 'express'

import { ROUTES } from '@/constants'
import { signIn, signUp } from '@/controller/auth'
import {
  asyncWrapper,
  middlewareValidateBody,
  signUpMiddleware,
} from '@/middleware'
import { userSchema } from '@/validation'

const router = express.Router()

router.post(ROUTES.v1.auth.signIn, asyncWrapper(signIn))
router.post(
  ROUTES.v1.auth.signUp,
  signUpMiddleware,
  middlewareValidateBody(userSchema),
  asyncWrapper(signUp),
)

export { router as authRouter }
