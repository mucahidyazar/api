import express from 'express'

import { ROUTES } from '../../../constants'
import { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionList, walletAccessorCreate, walletAccessorDelete, walletAccessorUpdate } from '../../../controller/lumara/wallet'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.lumara.wallet.create, tryCatch(walletCreate))
router.delete(ROUTES.v1.lumara.wallet.delete, tryCatch(walletDelete))
router.get(ROUTES.v1.lumara.wallet.get, tryCatch(walletGet))
router.get(ROUTES.v1.lumara.wallet.list, tryCatch(walletList))
router.put(ROUTES.v1.lumara.wallet.update, tryCatch(walletUpdate))
router.get(ROUTES.v1.lumara.wallet.transaction.list, tryCatch(walletTransactionList))
router.delete(ROUTES.v1.lumara.wallet.accessor.delete, tryCatch(walletAccessorDelete))
router.post(ROUTES.v1.lumara.wallet.accessor.create, tryCatch(walletAccessorCreate))
router.put(ROUTES.v1.lumara.wallet.accessor.update, tryCatch(walletAccessorUpdate))


export { router as walletRouter }
