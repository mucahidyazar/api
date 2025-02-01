import { Request, Response } from 'express'

import { PushNotificationService } from '@/services/push-notification'
import { ApiResponse } from '@/utils'

// controllers/notification.controller.ts
async function pushTokenCreate(req: Request, res: Response) {
  const { token, deviceType, deviceInfo } = req.body
  const userId = req.user.id

  const data = await PushNotificationService.registerToken(userId, {
    token,
    deviceType,
    deviceInfo,
  })

  res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

export { pushTokenCreate }
