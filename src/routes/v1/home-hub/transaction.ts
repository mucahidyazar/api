import express from 'express'

import { ROUTES } from '../../../constants'
import {
  transactionCreate,
  transactionChartGet,
  transactionDelete,
  transactionGet,
  transactionList,
  transactionUpdate
} from '../../../controller/home-hub/transaction'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.transaction.create, tryCatch(transactionCreate))
router.delete(ROUTES.v1.homeHub.transaction.delete, tryCatch(transactionDelete))
router.get(ROUTES.v1.homeHub.transaction.get, tryCatch(transactionGet))
router.get(ROUTES.v1.homeHub.transaction.list, tryCatch(transactionList))
router.put(ROUTES.v1.homeHub.transaction.update, tryCatch(transactionUpdate))
router.get(ROUTES.v1.homeHub.transaction.chart, tryCatch(transactionChartGet))

export { router as transactionRouter }
