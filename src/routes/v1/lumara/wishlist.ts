import express from 'express'

import { ROUTES } from '@/constants'
import { wishlistCreate, wishlistDelete, wishlistGet, wishlistList, wishlistUpdate, wishlistItemUpdate, wishlistAccessorDelete, wishlistAccessorCreate, wishlistAccessorUpdate } from '@/controller/lumara/wishlist'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.post(ROUTES.v1.lumara.wishlist.create, asyncHandler(wishlistCreate))
router.delete(ROUTES.v1.lumara.wishlist.delete, asyncHandler(wishlistDelete))
router.get(ROUTES.v1.lumara.wishlist.get, asyncHandler(wishlistGet))
router.get(ROUTES.v1.lumara.wishlist.list, asyncHandler(wishlistList))
router.put(ROUTES.v1.lumara.wishlist.update, asyncHandler(wishlistUpdate))
router.put(ROUTES.v1.lumara.wishlist.item.update, asyncHandler(wishlistItemUpdate))
router.delete(ROUTES.v1.lumara.wishlist.accessor.delete, asyncHandler(wishlistAccessorDelete))
router.post(ROUTES.v1.lumara.wishlist.accessor.create, asyncHandler(wishlistAccessorCreate))
router.put(ROUTES.v1.lumara.wishlist.accessor.update, asyncHandler(wishlistAccessorUpdate))

export { router as wishlistRouter }
