import express from 'express'

import { ROUTES } from '@/constants'
import {
  transactionCategoryCreate,
  transactionCategoryDelete,
  transactionCategoryGet,
  transactionCategoryList,
  transactionCategoryUpdate,
} from '@/controller'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  transactionCategorySchema,
  transactionCategoryUpdateSchema,
} from '@/validation/transaction'

const router = express.Router()

router.post(
  ROUTES.v1.transactionCategory.create,
  middlewareValidateBody(transactionCategorySchema),
  asyncWrapper(transactionCategoryCreate),
)

router.delete(
  ROUTES.v1.transactionCategory.delete,
  asyncWrapper(transactionCategoryDelete),
)

router.get(
  ROUTES.v1.transactionCategory.get,
  asyncWrapper(transactionCategoryGet),
)

router.get(
  ROUTES.v1.transactionCategory.list,
  asyncWrapper(transactionCategoryList),
)

router.put(
  ROUTES.v1.transactionCategory.update,
  middlewareValidateBody(transactionCategoryUpdateSchema),
  asyncWrapper(transactionCategoryUpdate),
)

export { router as transactionCategoryRouter }
