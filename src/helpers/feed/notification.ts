import '../../config/db'

import { Notification, NotificationType, InviteType, ActionType } from "../../model/lumara/notification";

const userId = '672db729e528e8154e8e660a';
const inviterUserId = '673055bbe528e8154e8e66bb';
const wishListId = '67305694e528e8154e8e6770';

export async function feed() {
  try {

    await Notification.insertMany([
      // Basit notification
      {
        type: NotificationType.SIMPLE,
        title: 'Welcome!',
        body: 'Welcome to our app',
        user: userId
      },
      // Davet notification'ı
      {
        type: NotificationType.INVITE,
        title: 'Wallet Invite',
        body: 'John invited you to their wallet',
        user: userId,
        invite: {
          type: InviteType.WISHLIST,
          from: inviterUserId,
          resourceId: wishListId
        }
      },
      // Action notification'ı
      {
        type: NotificationType.ACTION,
        title: 'Complete Your Profile',
        body: 'Please complete your profile to unlock all features',
        user: userId,
        action: {
          type: ActionType.REDIRECT,
          url: '/settings/profile'
        }
      },
      // Reklam notification'ı
      {
        type: NotificationType.ADVERTISEMENT,
        title: 'Special Offer',
        body: 'Check out our premium features',
        user: userId,
        image: {
          url: 'https://picsum.photos/800/400',
          alt: 'Premium features',
          dimensions: { width: 800, height: 400 }
        },
        action: {
          type: ActionType.REDIRECT,
          url: '/premium'
        }
      }
    ]);
  } catch (error: any) {
    console.error('Failed to create notifications', error.message);
  }
}

feed();