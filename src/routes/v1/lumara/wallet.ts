import express from 'express'

import { ROUTES } from '@/constants'
import { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionList, walletAccessorCreate, walletAccessorDelete, walletAccessorUpdate } from '@/controller/lumara/wallet'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.lumara.wallet.create, asyncHandler(walletCreate))
router.delete(ROUTES.v1.lumara.wallet.delete, asyncHandler(walletDelete))
router.get(ROUTES.v1.lumara.wallet.get, asyncHandler(walletGet))
router.get(ROUTES.v1.lumara.wallet.list, asyncHandler(walletList))
router.put(ROUTES.v1.lumara.wallet.update, asyncHandler(walletUpdate))
router.get(ROUTES.v1.lumara.wallet.transaction.list, asyncHandler(walletTransactionList))
router.delete(ROUTES.v1.lumara.wallet.accessor.delete, asyncHandler(walletAccessorDelete))
router.post(ROUTES.v1.lumara.wallet.accessor.create, asyncHandler(walletAccessorCreate))
router.put(ROUTES.v1.lumara.wallet.accessor.update, asyncHandler(walletAccessorUpdate))


export { router as walletRouter }
