import express from 'express'

import { ROUTES } from '@/constants'
import {
  userCreate,
  userMeGet,
  userMeDelete,
  userMeUpdate,
  userMePasswordUpdate,
} from '@/controller/lumara/user'
import { middlewareAuth, userCreateLimiterMiddleware, middlewareValidateBody } from '@/middleware'
import { asyncHandler } from '@/middleware'
import { passwordUpdateSchema } from '@/validation'

const router = express.Router()

router.get(ROUTES.v1.lumara.user.me.get, middlewareAuth, asyncHandler(userMeGet))
router.post(ROUTES.v1.lumara.user.me.delete, middlewareAuth, asyncHandler(userMeDelete))
router.put(ROUTES.v1.lumara.user.me.update, middlewareAuth, asyncHandler(userMeUpdate))
router.put(
  ROUTES.v1.lumara.user.me.password.update,
  middlewareAuth,
  middlewareValidateBody(passwordUpdateSchema),
  asyncHandler(userMePasswordUpdate)
)

router.post(ROUTES.v1.lumara.user.create, userCreateLimiterMiddleware, asyncHandler(userCreate))

export { router as userRouter }
