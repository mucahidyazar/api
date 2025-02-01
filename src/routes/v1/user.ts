import express from 'express'

import { ROUTES } from '@/constants'
import {
  userMeGet,
  userMeDelete,
  userMeUpdate,
  userMePasswordUpdate,
} from '@/controller/user'
import { asyncWrapper } from '@/middleware'
import { middlewareValidateBody } from '@/middleware'
import { passwordUpdateSchema } from '@/validation'

const router = express.Router()

router.get(ROUTES.v1.user.me.get, asyncWrapper(userMeGet))
router.post(ROUTES.v1.user.me.delete, asyncWrapper(userMeDelete))
router.put(ROUTES.v1.user.me.update, asyncWrapper(userMeUpdate))
router.put(
  ROUTES.v1.user.me.password.update,
  middlewareValidateBody(passwordUpdateSchema),
  asyncWrapper(userMePasswordUpdate),
)

export { router as userRouter }
