import express from 'express'

import { ROUTES } from '../../../constants'
import {
  userMe,
  userCreate,
  userDelete,
  userGet,
  userList,
  userUpdate
} from '../../../controller/lumara/user'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.get(ROUTES.v1.homeHub.user.me, tryCatch(userMe))
router.post(ROUTES.v1.homeHub.user.create, tryCatch(userCreate))
router.delete(ROUTES.v1.homeHub.user.delete, tryCatch(userDelete))
router.get(ROUTES.v1.homeHub.user.get, tryCatch(userGet))
router.get(ROUTES.v1.homeHub.user.list, tryCatch(userList))
router.put(ROUTES.v1.homeHub.user.update, tryCatch(userUpdate))

export { router as userRouter }
