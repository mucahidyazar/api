import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionBrandCreate,
  transactionBrandDelete,
  transactionBrandGet,
  transactionBrandList,
  transactionBrandUpdate
} from '@/controller/lumara/transaction-brand'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.lumara.transactionBrand.create, asyncHandler(transactionBrandCreate))
router.delete(ROUTES.v1.lumara.transactionBrand.delete, asyncHandler(transactionBrandDelete))
router.get(ROUTES.v1.lumara.transactionBrand.get, asyncHandler(transactionBrandGet))
router.get(ROUTES.v1.lumara.transactionBrand.list, asyncHandler(transactionBrandList))
router.put(ROUTES.v1.lumara.transactionBrand.update, asyncHandler(transactionBrandUpdate))

export { router as transactionBrandRouter }
