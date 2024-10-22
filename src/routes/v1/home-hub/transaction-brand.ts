import express from 'express'

import { ROUTES } from '../../../constants'
import {
  transactionBrandCreate,
  transactionBrandDelete,
  transactionBrandGet,
  transactionBrandList,
  transactionBrandUpdate
} from '../../../controller/home-hub/transaction-brand'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.transactionBrand.create, tryCatch(transactionBrandCreate))
router.delete(ROUTES.v1.homeHub.transactionBrand.delete, tryCatch(transactionBrandDelete))
router.get(ROUTES.v1.homeHub.transactionBrand.get, tryCatch(transactionBrandGet))
router.get(ROUTES.v1.homeHub.transactionBrand.list, tryCatch(transactionBrandList))
router.put(ROUTES.v1.homeHub.transactionBrand.update, tryCatch(transactionBrandUpdate))

export { router as transactionBrandRouter }
