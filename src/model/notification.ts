import mongoose from 'mongoose'

import { MODEL_OPTIONS, VALIDATION_RULES } from '@/constants'

export enum NotificationType {
  SIMPLE = 'simple',
  INVITE = 'invite',
  ACTION = 'action',
  ADVERTISEMENT = 'advertisement',
  SYSTEM = 'system',
  UPDATE = 'update',
  ALERT = 'alert',
}

export enum InviteType {
  WISHLIST = 'Wishlist',
  WALLET = 'Wallet',
}

export enum ActionType {
  REDIRECT = 'redirect',
  EXTERNAL = 'external',
  FUNCTION = 'function',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: VALIDATION_RULES.input.min,
      maxlength: VALIDATION_RULES.input.mid,
    },
    body: {
      type: String,
      required: true,
      minlength: VALIDATION_RULES.input.min,
      maxlength: VALIDATION_RULES.input.max,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    invite: {
      type: {
        type: String,
        enum: Object.values(['WishlistAccessor', 'WalletAccessor']),
      },
      resource: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'invite.type',
      },
    },

    action: {
      type: {
        type: String,
        enum: Object.values(ActionType),
      },
      url: String,
      functionName: String,
      data: mongoose.Schema.Types.Mixed,
    },

    image: {
      url: String,
      alt: String,
      dimensions: {
        width: Number,
        height: Number,
      },
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    stats: {
      clickCount: {
        type: Number,
        default: 0,
      },
      impressionCount: {
        type: Number,
        default: 0,
      },
    },
  },
  MODEL_OPTIONS,
)

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Virtuals
notificationSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false
  return new Date() > this.expiresAt
})

// Methods
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true
  this.readAt = new Date()
  return this.save()
}

notificationSchema.methods.archive = async function () {
  this.isArchived = true
  return this.save()
}

notificationSchema.methods.incrementStats = async function (
  type: 'click' | 'impression',
) {
  if (type === 'click') {
    this.stats.clickCount += 1
  } else {
    this.stats.impressionCount += 1
  }
  return this.save()
}

// Static methods
notificationSchema.statics.getUserUnreadCount = async function (
  userId: string,
) {
  return this.countDocuments({
    user: userId,
    isRead: false,
    isArchived: false,
  })
}

export const Notification = mongoose.model('Notification', notificationSchema)
