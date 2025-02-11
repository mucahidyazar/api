import express from 'express'

import { ROUTES } from '@/constants'
import {
  wishlistCreate,
  wishlistDelete,
  wishlistGet,
  wishlistList,
  wishlistUpdate,
  wishlistItemUpdate,
  wishlistAccessorDelete,
  wishlistAccessorCreate,
  wishlistAccessorUpdate,
} from '@/controller'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import {
  wishlistAccessorCreateSchema,
  wishlistAccessorUpdateSchema,
  wishlistCreateSchema,
  wishlistItemUpdateSchema,
  wishlistUpdateSchema,
} from '@/validation/wishlist'

const router = express.Router()

router.post(
  ROUTES.v1.wishlist.create,
  middlewareValidateBody(wishlistCreateSchema),
  asyncWrapper(wishlistCreate),
)

router.delete(ROUTES.v1.wishlist.delete, asyncWrapper(wishlistDelete))

router.get(ROUTES.v1.wishlist.get, asyncWrapper(wishlistGet))

router.get(ROUTES.v1.wishlist.list, asyncWrapper(wishlistList))

router.put(
  ROUTES.v1.wishlist.update,
  middlewareValidateBody(wishlistUpdateSchema),
  asyncWrapper(wishlistUpdate),
)

router.put(
  ROUTES.v1.wishlist.item.update,
  middlewareValidateBody(wishlistItemUpdateSchema),
  asyncWrapper(wishlistItemUpdate),
)

router.delete(
  ROUTES.v1.wishlist.accessor.delete,
  asyncWrapper(wishlistAccessorDelete),
)

router.post(
  ROUTES.v1.wishlist.accessor.create,
  middlewareValidateBody(wishlistAccessorCreateSchema),
  asyncWrapper(wishlistAccessorCreate),
)

router.put(
  ROUTES.v1.wishlist.accessor.update,
  middlewareValidateBody(wishlistAccessorUpdateSchema),
  asyncWrapper(wishlistAccessorUpdate),
)

export { router as wishlistRouter }
