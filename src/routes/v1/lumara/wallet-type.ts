import express from 'express'

import { ROUTES } from '../../../constants'
import { walletTypeCreate, walletTypeDelete, walletTypeGet, walletTypeList, walletTypeUpdate } from '../../../controller/lumara/wallet-type'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.walletType.create, tryCatch(walletTypeCreate))
router.delete(ROUTES.v1.homeHub.walletType.delete, tryCatch(walletTypeDelete))
router.get(ROUTES.v1.homeHub.walletType.get, tryCatch(walletTypeGet))
router.get(ROUTES.v1.homeHub.walletType.list, tryCatch(walletTypeList))
router.put(ROUTES.v1.homeHub.walletType.update, tryCatch(walletTypeUpdate))

export { router as walletTypeRouter }
