import express from 'express'

import { ROUTES } from '@/constants'
import { pushTokenCreate } from '@/controller/push-token'
import { asyncWrapper } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.pushToken.create, asyncWrapper(pushTokenCreate))

export { router as pushTokenRouter }
