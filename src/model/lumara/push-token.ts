import { Model, model, Schema, Types } from 'mongoose';

// Interface for the document
interface IPushToken {
  user: Types.ObjectId;
  token: string;
  deviceType: 'ios' | 'android';
  isActive: boolean;
  lastUsed: Date;
  deviceInfo?: {
    brand?: string;
    modelName?: string;
    osVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the static methods
interface IPushTokenModel extends Model<IPushToken> {
  findOrCreateToken(
    userId: string,
    tokenData: Partial<IPushToken>
  ): Promise<IPushToken>;
}

const pushTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    brand: String,
    modelName: String,
    osVersion: String
  }
}, {
  timestamps: true,
  index: { user: 1, token: 1 }
});

// Static methods with proper typing
pushTokenSchema.statics.findOrCreateToken = async function (
  userId: string,
  tokenData: Partial<IPushToken>
): Promise<IPushToken> {
  const existingToken = await this.findOne({
    user: userId,
    token: tokenData.token
  });

  if (existingToken) {
    return this.findByIdAndUpdate(
      existingToken._id,
      {
        $set: {
          lastUsed: new Date(),
          isActive: true,
          ...tokenData
        }
      },
      { new: true }
    ).lean();
  }

  return this.create({
    user: userId,
    ...tokenData
  });
};

// Export the model with proper typing
export const PushToken = model<IPushToken, IPushTokenModel>('PushToken', pushTokenSchema);
