import express from 'express'

import { ROUTES } from '../../../constants'
import {
  transactionCreate,
  transactionChartGet,
  transactionDelete,
  transactionGet,
  transactionList,
  transactionStatsGet,
  transactionUpdate
} from '../../../controller/lumara/transaction'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.lumara.transaction.create, tryCatch(transactionCreate))
router.delete(ROUTES.v1.lumara.transaction.delete, tryCatch(transactionDelete))
router.get(ROUTES.v1.lumara.transaction.get, tryCatch(transactionGet))
router.get(ROUTES.v1.lumara.transaction.list, tryCatch(transactionList))
router.put(ROUTES.v1.lumara.transaction.update, tryCatch(transactionUpdate))
router.get(ROUTES.v1.lumara.transaction.chart, tryCatch(transactionChartGet))
router.get(ROUTES.v1.lumara.transaction.stats, tryCatch(transactionStatsGet))

export { router as transactionRouter }
