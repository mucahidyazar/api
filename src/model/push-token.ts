import { Model, model, Schema, Types } from 'mongoose'

// Interface for the document
interface IPushToken {
  user: Types.ObjectId
  token: string
  deviceType: 'ios' | 'android'
  isActive: boolean
  lastUsed: Date
  deviceInfo?: {
    brand?: string
    modelName?: string
    osVersion?: string
  }
  createdAt: Date
  updatedAt: Date
}

// Interface for the static methods
interface IPushTokenModel extends Model<IPushToken> {
  findOrCreateToken(
    userId: string,
    tokenData: Partial<IPushToken>,
  ): Promise<IPushToken>
}

const pushTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
      index: true, // unique yerine sadece index kullan
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // performans için index ekle
    },
    lastUsed: {
      type: Date,
      default: Date.now,
      index: true, // cleanup için index ekle
    },
    deviceInfo: {
      brand: String,
      modelName: String,
      osVersion: String,
    },
  },
  {
    timestamps: true,
    // Compound index ekle
    indexes: [
      { user: 1, token: 1 },
      { user: 1, isActive: 1 },
      { token: 1, isActive: 1 },
    ],
  },
)

// Static methods with proper typing
// models/push-token.model.ts
pushTokenSchema.statics.findOrCreateToken = async function (
  userId: string,
  tokenData: Partial<IPushToken>,
): Promise<IPushToken> {
  // Önce bu token'ı kullanan herhangi bir kayıt var mı kontrol et
  const existingTokenAnyUser = await this.findOne({
    token: tokenData.token,
  })

  if (existingTokenAnyUser) {
    if (existingTokenAnyUser.user.toString() === userId) {
      // Token aynı kullanıcıya ait, güncelle
      return await this.findByIdAndUpdate(
        existingTokenAnyUser._id,
        {
          $set: {
            lastUsed: new Date(),
            isActive: true,
            deviceType: tokenData.deviceType,
            deviceInfo: tokenData.deviceInfo,
          },
        },
        { new: true },
      ).lean()
    } else {
      // Token başka bir kullanıcıya ait, eski kaydı deaktive et ve yeni kayıt oluştur
      await this.findByIdAndUpdate(existingTokenAnyUser._id, {
        $set: { isActive: false },
      })

      // Yeni token kaydı oluştur
      return await this.create({
        user: userId,
        ...tokenData,
        isActive: true,
        lastUsed: new Date(),
      })
    }
  }

  // Token hiç yoksa yeni kayıt oluştur
  return await this.create({
    user: userId,
    ...tokenData,
    isActive: true,
    lastUsed: new Date(),
  })
}

// Export the model with proper typing
export const PushToken = model<IPushToken, IPushTokenModel>(
  'PushToken',
  pushTokenSchema,
)
