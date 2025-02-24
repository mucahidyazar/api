import express from 'express'

import { ROUTES } from '@/constants'
import { WalletController } from '@/controller'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  walletAccessorCreateSchema,
  walletAccessorUpdateSchema,
  walletUpdateSchema,
} from '@/validation/wallet'
import { walletCreateDto } from '@/model/request/wallet.dto'

const router = express.Router()
const walletController = new WalletController()

router.post(
  ROUTES.v1.wallet.create,
  middlewareValidateBody(walletCreateDto),
  asyncWrapper(walletController.walletCreate),
)

router.delete(
  ROUTES.v1.wallet.delete,
  asyncWrapper(walletController.walletDelete),
)

router.get(ROUTES.v1.wallet.get, asyncWrapper(walletController.walletGet))

router.get(ROUTES.v1.wallet.list, asyncWrapper(walletController.walletList))

router.put(
  ROUTES.v1.wallet.update,
  middlewareValidateBody(walletUpdateSchema),
  asyncWrapper(walletController.walletUpdate),
)

router.get(
  ROUTES.v1.wallet.transaction.list,
  asyncWrapper(walletController.walletTransactionList),
)

router.delete(
  ROUTES.v1.wallet.accessor.delete,
  asyncWrapper(walletController.walletAccessorDelete),
)

router.post(
  ROUTES.v1.wallet.accessor.create,
  middlewareValidateBody(walletAccessorCreateSchema),
  asyncWrapper(walletController.walletAccessorCreate),
)

router.put(
  ROUTES.v1.wallet.accessor.update,
  middlewareValidateBody(walletAccessorUpdateSchema),
  asyncWrapper(walletController.walletAccessorUpdate),
)

router.get(
  ROUTES.v1.wallet.type.list,
  asyncWrapper(walletController.walletTypeList),
)

export const walletOpenApiPaths = WalletController.getOpenApiPaths()
export { router as walletRouter }
