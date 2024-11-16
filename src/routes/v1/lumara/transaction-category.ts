import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionCategoryCreate,
  transactionCategoryDelete,
  transactionCategoryGet,
  transactionCategoryList,
  transactionCategoryUpdate
} from '@/controller/lumara/transaction-category'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.lumara.transactionCategory.create, asyncHandler(transactionCategoryCreate))
router.delete(ROUTES.v1.lumara.transactionCategory.delete, asyncHandler(transactionCategoryDelete))
router.get(ROUTES.v1.lumara.transactionCategory.get, asyncHandler(transactionCategoryGet))
router.get(ROUTES.v1.lumara.transactionCategory.list, asyncHandler(transactionCategoryList))
router.put(ROUTES.v1.lumara.transactionCategory.update, asyncHandler(transactionCategoryUpdate))

export { router as transactionCategoryRouter }
