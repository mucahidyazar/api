import express from 'express'

import { ROUTES } from '../../../constants'
import {
  pushTokenCreate
} from '../../../controller/lumara/push-token'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.lumara.pushToken.create, tryCatch(pushTokenCreate))

export { router as pushTokenRouter }
