import { PushToken } from '../model/lumara/push-token'

export class PushNotificationService {
  static async registerToken(userId: string, tokenData: {
    token: string;
    deviceType: 'ios' | 'android';
    deviceInfo?: any;
  }) {
    try {
      const token = await PushToken.findOrCreateToken(userId, tokenData);

      // Aynı kullanıcının eski tokenlarını deaktive et
      await PushToken.updateMany(
        {
          user: userId,
          token: { $ne: tokenData.token },
          deviceType: tokenData.deviceType
        },
        {
          $set: { isActive: false }
        }
      );

      return token;
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  static async sendNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: any;
    options?: any;
  }) {
    const tokens = await PushToken.find({
      user: userId,
      isActive: true
    })

    const notifications = tokens.map(token => ({
      to: token.token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      badge: 1,
      ...notification.options
    }));

    return Promise.all(
      notifications.map(async (notification) => {
        try {
          const res = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(notification)
          });
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      })
    );
  }

  static async removeInactiveTokens(daysInactive = 30) {
    const date = new Date();
    date.setDate(date.getDate() - daysInactive);

    return PushToken.deleteMany({
      lastUsed: { $lt: date }
    });
  }
}