import express from 'express'

import { ROUTES } from '@/constants'
import {
  notificationList,
  notificationDelete,
  notificationMarkAsRead,
  notificationMarkAllAsRead,
} from '@/controller/notification'
import { asyncWrapper } from '@/middleware'

const router = express.Router()

router.get(ROUTES.v1.notification.list, asyncWrapper(notificationList))

router.put(
  ROUTES.v1.notification.markAsRead,
  asyncWrapper(notificationMarkAsRead),
)

router.put(
  ROUTES.v1.notification.markAllAsRead,
  asyncWrapper(notificationMarkAllAsRead),
)

router.delete(ROUTES.v1.notification.delete, asyncWrapper(notificationDelete))

export { router as notificationRouter }
