import mongoose from 'mongoose'

import { IBaseModel, baseSchema } from './base.model'
import { IUser } from './user'

interface IAccessor extends IBaseModel {
  accessor: mongoose.Types.ObjectId | IUser['_id']
  modelId: mongoose.Types.ObjectId
}

const accessorSchema = new mongoose.Schema({
  accessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    immutable: true,
    required: true,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    required: true,
  },
}).add(baseSchema)

accessorSchema.index({ accessor: 1, modelId: 1 }, { unique: true })

const Accessor = mongoose.model<IAccessor>('Accessor', accessorSchema)

export { Accessor, IAccessor }
