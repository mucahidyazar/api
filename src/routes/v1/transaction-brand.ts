import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionBrandGet,
  transactionBrandList,
  transactionBrandCreate,
  transactionBrandUpdate,
  transactionBrandDelete,
} from '@/controller/transaction-brand'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  transactionBrandSchema,
  transactionBrandUpdateSchema,
} from '@/validation/transaction'

const router = express.Router()

router.post(
  ROUTES.v1.transactionBrand.create,
  asyncWrapper(transactionBrandCreate),
  middlewareValidateBody(transactionBrandSchema),
)
router.delete(
  ROUTES.v1.transactionBrand.delete,
  asyncWrapper(transactionBrandDelete),
)
router.get(ROUTES.v1.transactionBrand.get, asyncWrapper(transactionBrandGet))
router.get(ROUTES.v1.transactionBrand.list, asyncWrapper(transactionBrandList))
router.put(
  ROUTES.v1.transactionBrand.update,
  asyncWrapper(transactionBrandUpdate),
  middlewareValidateBody(transactionBrandUpdateSchema),
)

export { router as transactionBrandRouter }
