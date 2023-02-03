import express from 'express'

import {
  createShortUrl,
  openShortUrl,
  getShortUrls,
  getShortUrl,
  deleteShortUrl,
} from '../../controller'
import {tryCatch} from '../../utils'
import {ROUTES} from '../../constants'

const router = express.Router()

router.post(ROUTES.v1.urlShortener.create, tryCatch(createShortUrl))
router.get(ROUTES.v1.urlShortener.open, tryCatch(openShortUrl))
router.get(ROUTES.v1.urlShortener.list, tryCatch(getShortUrls))
router.get(ROUTES.v1.urlShortener.get, tryCatch(getShortUrl))
router.delete(ROUTES.v1.urlShortener.delete, tryCatch(deleteShortUrl))

export {router as urlShortenerRouter}
