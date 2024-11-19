import express from 'express'

import { ROUTES } from '@/constants'
import { wishlistCreate, wishlistDelete, wishlistGet, wishlistList, wishlistUpdate, wishlistItemUpdate, wishlistAccessorDelete, wishlistAccessorCreate, wishlistAccessorUpdate } from '@/controller/lumara/wishlist'
import { asyncHandler, middlewareValidateBody } from '@/middleware'
import { wishlistAccessorCreateSchema, wishlistAccessorUpdateSchema, wishlistCreateSchema, wishlistItemUpdateSchema, wishlistUpdateSchema } from '@/validation/wishlist'

const router = express.Router()

router.post(
  ROUTES.v1.lumara.wishlist.create,
  middlewareValidateBody(wishlistCreateSchema),
  asyncHandler(wishlistCreate)
)
router.delete(ROUTES.v1.lumara.wishlist.delete, asyncHandler(wishlistDelete))
router.get(ROUTES.v1.lumara.wishlist.get, asyncHandler(wishlistGet))
router.get(ROUTES.v1.lumara.wishlist.list, asyncHandler(wishlistList))
router.put(
  ROUTES.v1.lumara.wishlist.update,
  middlewareValidateBody(wishlistUpdateSchema),
  asyncHandler(wishlistUpdate)
)

router.put(
  ROUTES.v1.lumara.wishlist.item.update,
  middlewareValidateBody(wishlistItemUpdateSchema),
  asyncHandler(wishlistItemUpdate)
)
router.delete(ROUTES.v1.lumara.wishlist.accessor.delete, asyncHandler(wishlistAccessorDelete))
router.post(
  ROUTES.v1.lumara.wishlist.accessor.create,
  middlewareValidateBody(wishlistAccessorCreateSchema),
  asyncHandler(wishlistAccessorCreate)
)
router.put(
  ROUTES.v1.lumara.wishlist.accessor.update,
  middlewareValidateBody(wishlistAccessorUpdateSchema),
  asyncHandler(wishlistAccessorUpdate)
)

export { router as wishlistRouter }
