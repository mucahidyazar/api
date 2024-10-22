import mongoose from 'mongoose'

import { MODEL_OPTIONS } from '../../constants';

const accessorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
  },
  MODEL_OPTIONS
)

accessorSchema.index({ user: 1, modelId: 1 }, { unique: true });

export const Accessor = mongoose.model('Accessor', accessorSchema)

