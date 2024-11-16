import { Request, Response } from 'express';

import { PushNotificationService } from '@/services/push-notification';

// controllers/notification.controller.ts
async function pushTokenCreate(req: Request, res: Response) {
  const { token, deviceType, deviceInfo } = req.body;
  const userId = req.user.id;

  const data = await PushNotificationService.registerToken(userId, {
    token,
    deviceType,
    deviceInfo
  });

  res.response({
    status: 'success',
    code: 200,
    message: 'Device token registered',
    data
  });

}

export { pushTokenCreate };