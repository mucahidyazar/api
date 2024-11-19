import express from 'express'

import { ROUTES } from '@/constants'
import {
  userMeGet,
  userMeDelete,
  userMeUpdate,
  userMePasswordUpdate,
} from '@/controller/lumara/user'
import { middlewareValidateBody } from '@/middleware'
import { asyncHandler } from '@/middleware'
import { passwordUpdateSchema, userUpdateSchema } from '@/validation'

const router = express.Router()

router.get(ROUTES.v1.lumara.user.me.get, asyncHandler(userMeGet))
router.post(ROUTES.v1.lumara.user.me.delete, asyncHandler(userMeDelete))
router.put(
  ROUTES.v1.lumara.user.me.update,
  asyncHandler(userMeUpdate)
)
router.put(
  ROUTES.v1.lumara.user.me.password.update,
  middlewareValidateBody(passwordUpdateSchema),
  asyncHandler(userMePasswordUpdate)
)

export { router as userRouter }
