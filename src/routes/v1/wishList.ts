import express from 'express'

import { ROUTES } from '../../constants'
import { connectWishList, createWishList, listWishList } from '../../controller'
import { tryCatch } from '../../utils'

const router = express.Router()

router.get(ROUTES.v1.wishList.connect, tryCatch(connectWishList))
router.post(ROUTES.v1.wishList.create, tryCatch(createWishList))
router.get(ROUTES.v1.wishList.list, tryCatch(listWishList))

export { router as wishListRouter }
