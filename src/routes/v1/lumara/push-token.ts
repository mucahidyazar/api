import express from 'express'

import { ROUTES } from '@/constants'
import {
  pushTokenCreate
} from '@/controller/lumara/push-token'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.lumara.pushToken.create, asyncHandler(pushTokenCreate))

export { router as pushTokenRouter }
