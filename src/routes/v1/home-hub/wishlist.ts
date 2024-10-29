import express from 'express'

import { ROUTES } from '../../../constants'
import { wishlistCreate, wishlistDelete, wishlistGet, wishlistList, wishlistUpdate, wishlistItemUpdate, wishlistAccessorDelete, wishlistAccessorCreate } from '../../../controller/home-hub/wishlist'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.wishlist.create, tryCatch(wishlistCreate))
router.delete(ROUTES.v1.homeHub.wishlist.delete, tryCatch(wishlistDelete))
router.get(ROUTES.v1.homeHub.wishlist.get, tryCatch(wishlistGet))
router.get(ROUTES.v1.homeHub.wishlist.list, tryCatch(wishlistList))
router.put(ROUTES.v1.homeHub.wishlist.update, tryCatch(wishlistUpdate))
router.put(ROUTES.v1.homeHub.wishlist.item.update, tryCatch(wishlistItemUpdate))
router.delete(ROUTES.v1.homeHub.wishlist.accessor.delete, tryCatch(wishlistAccessorDelete))
router.post(ROUTES.v1.homeHub.wishlist.accessor.create, tryCatch(wishlistAccessorCreate))

export { router as wishlistRouter }
