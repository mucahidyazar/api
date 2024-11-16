import express from 'express'

import { ROUTES } from '@/constants'
import {
  createShortUrl,
  openShortUrl,
  getShortUrls,
  getShortUrl,
  deleteShortUrl,
} from '@/controller'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.urlShortener.create, asyncHandler(createShortUrl))
router.get(ROUTES.v1.urlShortener.open, asyncHandler(openShortUrl))
router.get(ROUTES.v1.urlShortener.list, asyncHandler(getShortUrls))
router.get(ROUTES.v1.urlShortener.get, asyncHandler(getShortUrl))
router.delete(ROUTES.v1.urlShortener.delete, asyncHandler(deleteShortUrl))

export { router as urlShortenerRouter }
