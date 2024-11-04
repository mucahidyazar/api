import { Request, Response } from 'express';

import { PushNotificationService } from '../../services/push-notification';

// controllers/notification.controller.ts
async function pushTokenCreate(req: Request, res: Response) {
  try {
    const { token, deviceType, deviceInfo } = req.body;
    const userId = req.user.id;

    const pushToken = await PushNotificationService.registerToken(userId, {
      token,
      deviceType,
      deviceInfo
    });

    res.response({
      status: 'success',
      code: 200,
      message: 'Device token registered',
      data: pushToken
    });
  } catch (error: any) {
    res.response({
      status: 'error',
      code: 500,
      message: 'Failed to register device token',
      details: error
    })
  }
}

export { pushTokenCreate };