import { Notification } from '@/model/notification'
import { PushToken } from '@/model/push-token'

type TSendNotificationArgs = {
  userId: string
  title: string
  body: string
  data?: any
  options?: any
  notification?: any
}

export class PushNotificationService {
  static async registerToken(
    userId: string,
    tokenData: {
      token: string
      deviceType: 'ios' | 'android'
      deviceInfo?: any
    },
  ) {
    // Kullanıcının diğer tüm tokenlarını deaktive et
    await PushToken.updateMany(
      {
        user: userId,
        token: { $ne: tokenData.token },
      },
      {
        $set: { isActive: false },
      },
    )

    // Yeni token'ı kaydet/güncelle
    const token = await PushToken.findOrCreateToken(userId, tokenData)
    return token
  }

  static async sendNotification({
    userId,
    title,
    body,
    data,
    notification,
    options,
  }: TSendNotificationArgs) {
    // Push notification gönder
    const tokens = await PushToken.find({
      user: userId,
      isActive: true,
    })

    const notifications = tokens.map(token => ({
      to: token.token,
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
      ...options,
    }))

    // DB'de notification kaydı oluştur
    await Notification.create({
      type: data?.type || 'simple',
      title,
      body,
      user: userId,
      ...notification,
      metadata: {
        ...data,
        options,
      },
    })

    // Push bildirimleri gönder
    return Promise.all(
      notifications.map(async notification => {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification),
        })
      }),
    )
  }

  static async removeInactiveTokens(daysInactive = 30) {
    const date = new Date()
    date.setDate(date.getDate() - daysInactive)
  }
}
