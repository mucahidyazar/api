import express from 'express'

import { ROUTES } from '../../constants'
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
} from '../../controller'
import { tryCatch } from '../../utils'

const router = express.Router()

router.get(ROUTES.v1.stock.check, tryCatch(check))
router.get(ROUTES.v1.stock.detail, tryCatch(detail))
router.post(ROUTES.v1.stock.start, tryCatch(start))
router.post(ROUTES.v1.stock.stop, tryCatch(stop))

router.get(ROUTES.v1.stock.myCheck, tryCatch(myCheck))
router.get(ROUTES.v1.stock.myDetail, tryCatch(myDetail))
router.get(ROUTES.v1.stock.myInit, tryCatch(myInit))
router.get(ROUTES.v1.stock.myList, tryCatch(myList))
router.delete(ROUTES.v1.stock.myClear, tryCatch(myClear))
router.delete(ROUTES.v1.stock.myClearResults, tryCatch(myClearResults))
router.post(ROUTES.v1.stock.myCreate, tryCatch(myCreate))
router.post(ROUTES.v1.stock.myStart, tryCatch(myStart))
router.post(ROUTES.v1.stock.myStop, tryCatch(myStop))

export { router as stockRouter }
