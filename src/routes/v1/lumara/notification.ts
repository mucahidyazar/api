import express from 'express'

import { ROUTES } from '../../../constants'
import {
  notificationGet,
  notificationList,
  notificationMarkAsRead,
  notificationMarkAllAsRead,
  notificationArchive,
  notificationArchiveAll,
  notificationUnreadCount,
  notificationDelete,
  notificationDeleteBulk
} from '../../../controller/lumara/notification'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.get(ROUTES.v1.lumara.notification.get, tryCatch(notificationGet))
router.get(ROUTES.v1.lumara.notification.list, tryCatch(notificationList))
router.put(ROUTES.v1.lumara.notification.markAsRead, tryCatch(notificationMarkAsRead))
router.put(ROUTES.v1.lumara.notification.markAllAsRead, tryCatch(notificationMarkAllAsRead))
router.put(ROUTES.v1.lumara.notification.archive, tryCatch(notificationArchive))
router.put(ROUTES.v1.lumara.notification.archiveAll, tryCatch(notificationArchiveAll))
router.get(ROUTES.v1.lumara.notification.unreadCount, tryCatch(notificationUnreadCount))
router.delete(ROUTES.v1.lumara.notification.delete, tryCatch(notificationDelete))
router.post(ROUTES.v1.lumara.notification.deleteBulk, tryCatch(notificationDeleteBulk))

export { router as notificationRouter }
