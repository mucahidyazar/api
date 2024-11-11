import express from 'express'

import { ROUTES } from '../../../constants'
import {
  userCreate,
  // userGet,
  // userList,
  userMeGet,
  userMeDelete,
  userMeUpdate,
  userMePasswordUpdate,
} from '../../../controller/lumara/user'
import { middlewareValidatePassword } from '../../../middleware/validate-password'
import { tryCatch } from '../../../utils'
import { passwordUpdateSchema } from '../../../validation/user'
import { middlewareAuth } from '../../../middleware/auth'
import { userCreateLimiterMiddleware } from '../../../middleware/rate-limitters'

const router = express.Router()

router.get(ROUTES.v1.lumara.user.me.get, middlewareAuth, tryCatch(userMeGet))
router.post(ROUTES.v1.lumara.user.me.delete, middlewareAuth, tryCatch(userMeDelete))
router.put(ROUTES.v1.lumara.user.me.update, middlewareAuth, tryCatch(userMeUpdate))
router.put(
  ROUTES.v1.lumara.user.me.password.update,
  middlewareValidatePassword(passwordUpdateSchema),
  tryCatch(userMePasswordUpdate)
)

router.post(ROUTES.v1.lumara.user.create, userCreateLimiterMiddleware, tryCatch(userCreate))
// router.get(ROUTES.v1.lumara.user.get, tryCatch(userGet))
// router.get(ROUTES.v1.lumara.user.list, tryCatch(userList))

export { router as userRouter }
