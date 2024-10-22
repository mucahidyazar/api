import express from 'express'

import { ROUTES } from '../../../constants'
import { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionsList } from '../../../controller/home-hub/wallet'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.wallet.create, tryCatch(walletCreate))
router.delete(ROUTES.v1.homeHub.wallet.delete, tryCatch(walletDelete))
router.get(ROUTES.v1.homeHub.wallet.get, tryCatch(walletGet))
router.get(ROUTES.v1.homeHub.wallet.list, tryCatch(walletList))
router.put(ROUTES.v1.homeHub.wallet.update, tryCatch(walletUpdate))
router.get(ROUTES.v1.homeHub.wallet.transactions.list, tryCatch(walletTransactionsList))

export { router as walletRouter }
