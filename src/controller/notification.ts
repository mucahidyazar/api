// controllers/notification.controller.ts
import { Request, Response } from 'express'

import { ApiError } from '@/errors/api-error'
import { queryHelper } from '@/helpers'
import { Notification } from '@/model/notification'
import { ApiResponse } from '@/utils'
import { ERROR_CODE } from '@/constants'

async function notificationList(req: Request, res: Response) {
  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
    isArchived: false,
  })

  const totalItems = await Notification.countDocuments({
    user: req.user.id,
    ...(!req.query.showAll && { isArchived: false }),
  })

  const query = Notification.find({
    user: req.user.id,
    ...(!req.query.showAll && { isArchived: false }),
  })
    .sort({ createdAt: -1 })
    .populate('invite.resource')

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  })

  const notifications = await query.exec()

  // return res.response({
  //   status: 'success',
  //   code: 200,
  //   message: 'Notifications fetched successfully',
  //   data: notifications,
  //   metadata: {
  //     ...metadata,
  //     unreadCount,
  //   },
  // })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(notifications, {
      ...metadata,
      unreadCount,
    }),
  })
}

async function notificationGet(req: Request, res: Response) {
  const data = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!data) {
    throw new ApiError('Notification not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function notificationMarkAsRead(req: Request, res: Response) {
  const data = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true, readAt: new Date() },
    { new: true },
  )

  if (!data) {
    throw new ApiError('Notification not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function notificationMarkAllAsRead(req: Request, res: Response) {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() },
  )

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

async function notificationArchive(req: Request, res: Response) {
  const data = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isArchived: true },
    { new: true },
  )

  if (!data) {
    throw new ApiError('Notification not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function notificationArchiveAll(req: Request, res: Response) {
  await Notification.updateMany(
    { user: req.user.id, isArchived: false },
    { isArchived: true },
  )

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

async function notificationUnreadCount(req: Request, res: Response) {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
    isArchived: false,
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success({ count }),
  })
}

async function notificationDelete(req: Request, res: Response) {
  const data = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!data) {
    throw new ApiError('Notification not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

// Toplu silme işlemi (örn: arşivlenmiş bildirimleri silme)
async function notificationDeleteBulk(req: Request, res: Response) {
  const { ids } = req.body // Belirli ID'leri silmek için
  const { olderThan, type, isRead, isArchived } = req.query // Filtreleme için

  const query: any = {
    user: req.user.id,
  }

  // Opsiyonel filtreler
  if (ids?.length) {
    query._id = { $in: ids }
  }
  if (olderThan) {
    query.createdAt = { $lt: new Date(olderThan as string) }
  }
  if (type) {
    query.type = type
  }
  if (isRead !== undefined) {
    query.isRead = isRead
  }
  if (isArchived !== undefined) {
    query.isArchived = isArchived
  }

  const data = await Notification.deleteMany(query)

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

export {
  notificationArchive,
  notificationArchiveAll,
  notificationDelete,
  notificationDeleteBulk,
  notificationGet,
  notificationList,
  notificationMarkAllAsRead,
  notificationMarkAsRead,
  notificationUnreadCount,
}
