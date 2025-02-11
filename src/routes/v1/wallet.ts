import express from 'express'

import { ROUTES } from '@/constants'
import {
  walletCreate,
  walletDelete,
  walletGet,
  walletList,
  walletUpdate,
  walletTransactionList,
  walletAccessorCreate,
  walletAccessorDelete,
  walletAccessorUpdate,
  walletTypeList,
} from '@/controller'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  walletAccessorCreateSchema,
  walletAccessorUpdateSchema,
  walletSchema,
  walletUpdateSchema,
} from '@/validation/wallet'

const router = express.Router()

router.post(
  ROUTES.v1.wallet.create,
  middlewareValidateBody(walletSchema),
  asyncWrapper(walletCreate),
)

router.delete(ROUTES.v1.wallet.delete, asyncWrapper(walletDelete))

router.get(ROUTES.v1.wallet.get, asyncWrapper(walletGet))

router.get(ROUTES.v1.wallet.list, asyncWrapper(walletList))

router.put(
  ROUTES.v1.wallet.update,
  middlewareValidateBody(walletUpdateSchema),
  asyncWrapper(walletUpdate),
)

router.get(
  ROUTES.v1.wallet.transaction.list,
  asyncWrapper(walletTransactionList),
)

router.delete(
  ROUTES.v1.wallet.accessor.delete,
  asyncWrapper(walletAccessorDelete),
)

router.post(
  ROUTES.v1.wallet.accessor.create,
  middlewareValidateBody(walletAccessorCreateSchema),
  asyncWrapper(walletAccessorCreate),
)

router.put(
  ROUTES.v1.wallet.accessor.update,
  middlewareValidateBody(walletAccessorUpdateSchema),
  asyncWrapper(walletAccessorUpdate),
)

router.get(ROUTES.v1.wallet.type.list, asyncWrapper(walletTypeList))

export { router as walletRouter }
