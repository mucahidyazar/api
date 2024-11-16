import express from 'express'

import { ROUTES } from '@/constants'
import {
  // notificationGet,
  notificationList,
  notificationMarkAsRead,
  notificationMarkAllAsRead,
  // notificationArchive,
  // notificationArchiveAll,
  // notificationUnreadCount,
  notificationDelete,
  // notificationDeleteBulk
} from '@/controller/lumara/notification'
import { asyncHandler } from '@/middleware'

const router = express.Router()

// router.get(ROUTES.v1.lumara.notification.get, asyncHandler(notificationGet))
router.get(ROUTES.v1.lumara.notification.list, asyncHandler(notificationList))
router.put(ROUTES.v1.lumara.notification.markAsRead, asyncHandler(notificationMarkAsRead))
router.put(ROUTES.v1.lumara.notification.markAllAsRead, asyncHandler(notificationMarkAllAsRead))
// router.put(ROUTES.v1.lumara.notification.archive, asyncHandler(notificationArchive))
// router.put(ROUTES.v1.lumara.notification.archiveAll, asyncHandler(notificationArchiveAll))
// router.get(ROUTES.v1.lumara.notification.unreadCount, asyncHandler(notificationUnreadCount))
router.delete(ROUTES.v1.lumara.notification.delete, asyncHandler(notificationDelete))
// router.post(ROUTES.v1.lumara.notification.deleteBulk, asyncHandler(notificationDeleteBulk))

export { router as notificationRouter }
