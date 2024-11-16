import express from 'express'

import { ROUTES } from '@/constants'
import {
  check,
  detail,
  start,
  stop,
  myCheck,
  myCreate,
  myClear,
  myClearResults,
  myDetail,
  myInit,
  myList,
  myStart,
  myStop,
} from '@/controller'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.get(ROUTES.v1.stock.check, asyncHandler(check))
router.get(ROUTES.v1.stock.detail, asyncHandler(detail))
router.post(ROUTES.v1.stock.start, asyncHandler(start))
router.post(ROUTES.v1.stock.stop, asyncHandler(stop))

router.get(ROUTES.v1.stock.myCheck, asyncHandler(myCheck))
router.get(ROUTES.v1.stock.myDetail, asyncHandler(myDetail))
router.get(ROUTES.v1.stock.myInit, asyncHandler(myInit))
router.get(ROUTES.v1.stock.myList, asyncHandler(myList))
router.delete(ROUTES.v1.stock.myClear, asyncHandler(myClear))
router.delete(ROUTES.v1.stock.myClearResults, asyncHandler(myClearResults))
router.post(ROUTES.v1.stock.myCreate, asyncHandler(myCreate))
router.post(ROUTES.v1.stock.myStart, asyncHandler(myStart))
router.post(ROUTES.v1.stock.myStop, asyncHandler(myStop))

export { router as stockRouter }
