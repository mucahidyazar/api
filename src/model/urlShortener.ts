import mongoose from 'mongoose'
import nanoid from 'nanoid'

const shortUrlSchema = new mongoose.Schema(
  {
    full: {
      type: String,
      required: true,
    },
    short: {
      type: String,
      required: true,
      default: () => nanoid.nanoid(10),
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema)

export {ShortUrl}
