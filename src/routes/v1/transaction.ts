import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionCreate,
  transactionChartGet,
  transactionDelete,
  transactionGet,
  transactionList,
  transactionStatsGet,
  transactionUpdate,
} from '@/controller/transaction'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  transactionSchema,
  transactionUpdateSchema,
} from '@/validation/transaction'

const router = express.Router()

router.post(
  ROUTES.v1.transaction.create,
  middlewareValidateBody(transactionSchema),
  asyncWrapper(transactionCreate),
)

router.delete(ROUTES.v1.transaction.delete, asyncWrapper(transactionDelete))

router.get(ROUTES.v1.transaction.get, asyncWrapper(transactionGet))

router.get(ROUTES.v1.transaction.list, asyncWrapper(transactionList))

router.put(
  ROUTES.v1.transaction.update,
  middlewareValidateBody(transactionUpdateSchema),
  asyncWrapper(transactionUpdate),
)

router.get(ROUTES.v1.transaction.chart, asyncWrapper(transactionChartGet))

router.get(ROUTES.v1.transaction.stats, asyncWrapper(transactionStatsGet))

export { router as transactionRouter }
