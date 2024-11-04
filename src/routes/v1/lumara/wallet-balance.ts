import express from 'express'

import { ROUTES } from '../../../constants'
import { walletBalanceCreate, walletBalanceDelete, walletBalanceGet, walletBalanceList, walletBalanceUpdate } from '../../../controller/lumara/wallet-balance'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.walletBalance.create, tryCatch(walletBalanceCreate))
router.delete(ROUTES.v1.homeHub.walletBalance.delete, tryCatch(walletBalanceDelete))
router.get(ROUTES.v1.homeHub.walletBalance.get, tryCatch(walletBalanceGet))
router.get(ROUTES.v1.homeHub.walletBalance.list, tryCatch(walletBalanceList))
router.put(ROUTES.v1.homeHub.walletBalance.update, tryCatch(walletBalanceUpdate))

export { router as walletBalanceRouter }
