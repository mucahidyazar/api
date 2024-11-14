// controllers/notification.controller.ts
import { Request, Response } from 'express';

import { Notification } from '../../model/lumara/notification';
import { queryHelper } from '../../helpers/query-helper';

async function notificationList(req: Request, res: Response) {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    const totalItems = await Notification.countDocuments({
      user: req.user.id,
      ...(!req.query.showAll && { isArchived: false })
    });

    const query = Notification.find({
      user: req.user.id,
      ...(!req.query.showAll && { isArchived: false })
    }).sort({ createdAt: -1 })
      .populate('invite.resource')

    const { metadata } = queryHelper({
      queries: { ...req.query, totalItems },
      query,
    });

    const notifications = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notifications fetched successfully',
      data: notifications,
      metadata: {
        ...metadata,
        unreadCount
      }
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to fetch notifications',
      details: error.message
    });
  }
}

async function notificationGet(req: Request, res: Response) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Notification not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notification fetched successfully',
      data: notification
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to fetch notification',
      details: error.message
    });
  }
}

async function notificationMarkAsRead(req: Request, res: Response) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Notification not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to mark notification as read',
      details: error.message
    });
  }
}

async function notificationMarkAllAsRead(req: Request, res: Response) {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return res.response({
      status: 'success',
      code: 200,
      message: 'All notifications marked as read',
      data: null
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to mark all notifications as read',
      details: error.message
    });
  }
}

async function notificationArchive(req: Request, res: Response) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        isArchived: true
      },
      { new: true }
    );

    if (!notification) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Notification not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notification archived',
      data: notification
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to archive notification',
      details: error.message
    });
  }
}

async function notificationArchiveAll(req: Request, res: Response) {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isArchived: false
      },
      {
        isArchived: true
      }
    );

    return res.response({
      status: 'success',
      code: 200,
      message: 'All notifications archived',
      data: null
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to archive all notifications',
      details: error.message
    });
  }
}

async function notificationUnreadCount(req: Request, res: Response) {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Unread count fetched successfully',
      data: { count }
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to fetch unread count',
      details: error.message
    });
  }
}

async function notificationDelete(req: Request, res: Response) {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Notification not found'
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notification deleted successfully',
      data: null
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to delete notification',
      details: error.message
    });
  }
}

// Toplu silme işlemi (örn: arşivlenmiş bildirimleri silme)
async function notificationDeleteBulk(req: Request, res: Response) {
  try {
    const { ids } = req.body; // Belirli ID'leri silmek için
    const { olderThan, type, isRead, isArchived } = req.query; // Filtreleme için

    const query: any = {
      user: req.user.id
    };

    // Opsiyonel filtreler
    if (ids?.length) {
      query._id = { $in: ids };
    }
    if (olderThan) {
      query.createdAt = { $lt: new Date(olderThan as string) };
    }
    if (type) {
      query.type = type;
    }
    if (isRead !== undefined) {
      query.isRead = isRead;
    }
    if (isArchived !== undefined) {
      query.isArchived = isArchived;
    }

    const result = await Notification.deleteMany(query);

    return res.response({
      status: 'success',
      code: 200,
      message: 'Notifications deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to delete notifications',
      details: error.message
    });
  }
}

export {
  notificationList,
  notificationGet,
  notificationMarkAsRead,
  notificationMarkAllAsRead,
  notificationArchive,
  notificationArchiveAll,
  notificationUnreadCount,
  notificationDelete,
  notificationDeleteBulk
};