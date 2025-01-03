import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionBrandCreate,
  transactionBrandDelete,
  transactionBrandGet,
  transactionBrandList,
  transactionBrandUpdate
} from '@/controller/lumara/transaction-brand'
import { asyncHandler, middlewareValidateBody } from '@/middleware'
import { transactionBrandSchema, transactionBrandUpdateSchema } from '@/validation/transaction'

const router = express.Router()

router.post(
  ROUTES.v1.lumara.transactionBrand.create,
  asyncHandler(transactionBrandCreate),
  middlewareValidateBody(transactionBrandSchema)
)
router.delete(ROUTES.v1.lumara.transactionBrand.delete, asyncHandler(transactionBrandDelete))
router.get(ROUTES.v1.lumara.transactionBrand.get, asyncHandler(transactionBrandGet))
router.get(ROUTES.v1.lumara.transactionBrand.list, asyncHandler(transactionBrandList))
router.put(
  ROUTES.v1.lumara.transactionBrand.update,
  asyncHandler(transactionBrandUpdate),
  middlewareValidateBody(transactionBrandUpdateSchema)
)

export { router as transactionBrandRouter }
