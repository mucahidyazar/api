import mongoose from 'mongoose'

import { IUser } from './user'

export interface IBaseModel extends mongoose.Document {
  id: string
  _id: mongoose.Types.ObjectId

  status: 'active' | 'inactive' | 'deleted'

  createdBy: mongoose.Types.ObjectId | IUser
  updatedBy: mongoose.Types.ObjectId | IUser

  createdAt: Date
  updatedAt: Date
}

export const baseSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)
