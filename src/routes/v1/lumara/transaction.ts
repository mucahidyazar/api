import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionCreate,
  transactionChartGet,
  transactionDelete,
  transactionGet,
  transactionList,
  transactionStatsGet,
  transactionUpdate
} from '@/controller/lumara/transaction'
import { asyncHandler, middlewareValidateBody } from '@/middleware'
import { transactionSchema, transactionUpdateSchema } from '@/validation/transaction'

const router = express.Router()

router.post(
  ROUTES.v1.lumara.transaction.create,
  middlewareValidateBody(transactionSchema),
  asyncHandler(transactionCreate)
)
router.delete(ROUTES.v1.lumara.transaction.delete, asyncHandler(transactionDelete))
router.get(ROUTES.v1.lumara.transaction.get, asyncHandler(transactionGet))
router.get(ROUTES.v1.lumara.transaction.list, asyncHandler(transactionList))
router.put(
  ROUTES.v1.lumara.transaction.update,
  middlewareValidateBody(transactionUpdateSchema),
  asyncHandler(transactionUpdate)
)
router.get(ROUTES.v1.lumara.transaction.chart, asyncHandler(transactionChartGet))
router.get(ROUTES.v1.lumara.transaction.stats, asyncHandler(transactionStatsGet))

export { router as transactionRouter }
