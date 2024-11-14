import express from 'express'

import { ROUTES } from '../../../constants'
import { wishlistCreate, wishlistDelete, wishlistGet, wishlistList, wishlistUpdate, wishlistItemUpdate, wishlistAccessorDelete, wishlistAccessorCreate, wishlistAccessorUpdate } from '../../../controller/lumara/wishlist'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.lumara.wishlist.create, tryCatch(wishlistCreate))
router.delete(ROUTES.v1.lumara.wishlist.delete, tryCatch(wishlistDelete))
router.get(ROUTES.v1.lumara.wishlist.get, tryCatch(wishlistGet))
router.get(ROUTES.v1.lumara.wishlist.list, tryCatch(wishlistList))
router.put(ROUTES.v1.lumara.wishlist.update, tryCatch(wishlistUpdate))
router.put(ROUTES.v1.lumara.wishlist.item.update, tryCatch(wishlistItemUpdate))
router.delete(ROUTES.v1.lumara.wishlist.accessor.delete, tryCatch(wishlistAccessorDelete))
router.post(ROUTES.v1.lumara.wishlist.accessor.create, tryCatch(wishlistAccessorCreate))
router.put(ROUTES.v1.lumara.wishlist.accessor.update, tryCatch(wishlistAccessorUpdate))

export { router as wishlistRouter }
