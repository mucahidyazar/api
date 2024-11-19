import express from 'express'

import { ROUTES } from '@/constants'
import { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionList, walletAccessorCreate, walletAccessorDelete, walletAccessorUpdate, walletTypeList } from '@/controller/lumara/wallet'
import { asyncHandler, middlewareValidateBody } from '@/middleware'
import { walletAccessorCreateSchema, walletAccessorUpdateSchema, walletSchema, walletUpdateSchema } from '@/validation/wallet'

const router = express.Router()

router.post(
  ROUTES.v1.lumara.wallet.create,
  middlewareValidateBody(walletSchema),
  asyncHandler(walletCreate)
)
router.delete(ROUTES.v1.lumara.wallet.delete, asyncHandler(walletDelete))
router.get(ROUTES.v1.lumara.wallet.get, asyncHandler(walletGet))
router.get(ROUTES.v1.lumara.wallet.list, asyncHandler(walletList))
router.put(
  ROUTES.v1.lumara.wallet.update,
  middlewareValidateBody(walletUpdateSchema),
  asyncHandler(walletUpdate)
)

router.get(ROUTES.v1.lumara.wallet.transaction.list, asyncHandler(walletTransactionList))

router.delete(ROUTES.v1.lumara.wallet.accessor.delete, asyncHandler(walletAccessorDelete))
router.post(
  ROUTES.v1.lumara.wallet.accessor.create,
  middlewareValidateBody(walletAccessorCreateSchema),
  asyncHandler(walletAccessorCreate)
)
router.put(
  ROUTES.v1.lumara.wallet.accessor.update,
  middlewareValidateBody(walletAccessorUpdateSchema),
  asyncHandler(walletAccessorUpdate)
)
router.get(ROUTES.v1.lumara.wallet.type.list, asyncHandler(walletTypeList))


export { router as walletRouter }
