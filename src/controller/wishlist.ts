import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { queryHelper } from '@/helpers'
import { User } from '@/model/user'
import { Wishlist } from '@/model/wishlist'
import { WishlistAccessor } from '@/model/wishlist-accessor'
import { WishlistItem } from '@/model/wishlist-item'
import { PushNotificationService } from '@/services/push-notification'
import { ApiResponse } from '@/utils'

async function wishlistCreate(req: Request, res: Response) {
  const { accessors = [], items = [], ...bodyData } = req.body

  const newWishlist = new Wishlist({
    ...bodyData,
    user: req.user?.id,
  })
  const data = await newWishlist.save()

  if (items.length) {
    const itemsData = items.map(item => {
      return {
        ...item,
        wishlist: data.id,
        user: req.user?.id,
      }
    })

    if (itemsData.length) {
      await WishlistItem.insertMany(itemsData)
    }
  }

  if (accessors.length) {
    const emails = accessors.map(accessor => accessor.user.email)
    const users = await User.find({ email: { $in: emails } })

    const accessorsToCreate = users.map(user => ({
      wishlist: data.id,
      user: user.id,
    }))

    if (accessorsToCreate.length) {
      await WishlistAccessor.insertMany(accessorsToCreate)
    }
  }

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success(data),
  })
}

async function wishlistList(req: Request, res: Response) {
  const accessors = await WishlistAccessor.find({
    user: req.user?.id,
    wishlistAccessorStatus: 'active',
  })

  const accessorWishlistIds = accessors.map(accessor => accessor.wishlist)

  const totalItems = await Wishlist.countDocuments({
    $or: [{ user: req.user?.id }, { _id: { $in: accessorWishlistIds } }],
  })

  const query = Wishlist.find({
    $or: [{ user: req.user?.id }, { _id: { $in: accessorWishlistIds } }],
  })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'items',
      populate: {
        path: 'reservedBy',
        select: 'firstName email',
      },
    })

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  })

  const wishlists = await query.exec()

  const wishlistsWithAccessorInfo = await Promise.all(
    wishlists.map(async wishlist => {
      const wishlistObj = wishlist.toObject()

      const accessors = await WishlistAccessor.find({
        wishlist: wishlist._id,
        wishlistAccessorStatus: 'active',
      }).populate({
        path: 'user',
        select: 'name email',
      })

      return {
        ...wishlistObj,
        isOwner: wishlist.createdBy === req.user?.id,
        accessors,
      }
    }),
  )

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(wishlistsWithAccessorInfo, {
      ...metadata,
    }),
  })
}

async function wishlistGet(req: Request, res: Response) {
  const wishlistId = req.params.id
  const userId = req.user?.id

  // Kullanıcının erişebileceği wishlist erişimcilerini alın
  const accessibleWishlistIds = await WishlistAccessor.find({
    user: userId,
    wishlistAccessorStatus: 'active',
  }).distinct('wishlist')

  // Wishlist'ı bulun ve ilişkili alanları populate edin
  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    $or: [{ user: userId }, { _id: { $in: accessibleWishlistIds } }],
  })
    .populate('user', 'name email') // User bilgilerini sadece name ve email ile getir
    .populate({
      path: 'items',
      populate: [
        { path: 'reservedBy', select: 'name email' }, // Item'ların reservedBy bilgisini ekle
        { path: 'user', select: 'name email' }, // Item'ların user bilgisini ekle
      ],
    })
    .populate({
      path: 'accessors',
      populate: { path: 'user', select: 'name email' }, // Accessor'ların user bilgilerini ekle
    })

  if (!wishlist) {
    throw new ApiError('Wishlist not found', ERROR_CODE.EntityNotFound)
  }

  // Accessors düzenleniyor
  // wishlist.accessors = wishlist.accessors.map((accessor: any) => ({
  //   id: accessor._id.toString(),
  //   status: accessor.status,
  //   user: accessor.user
  //     ? {
  //       id: accessor.user._id.toString(),
  //       name: accessor.user.name,
  //       email: accessor.user.email,
  //     }
  //     : null,
  // }));

  // // Items düzenleniyor
  // wishlist.items = wishlist.items.map((item: any) => ({
  //   id: item._id.toString(),
  //   name: item.name,
  //   price: item.price,
  //   link: item.link,
  //   status: item.status,
  //   reservedBy: item.reservedBy
  //     ? {
  //       id: item.reservedBy._id.toString(),
  //       name: item.reservedBy.name,
  //       email: item.reservedBy.email,
  //     }
  //     : null,
  // }));

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(wishlist),
  })
}

async function wishlistUpdate(req: Request, res: Response) {
  const { items = [], accessors = [], ...bodyData } = req.body

  // Wishlist güncellemesi
  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    bodyData,
    { new: true },
  )

  if (!wishlist) {
    throw new ApiError('Wishlist not found', ERROR_CODE.EntityNotFound)
  }

  // Items güncelleme işlemleri
  if (items.length) {
    for (const item of items) {
      if (item.action === 'initial') {
        // Yeni item ekle
        await WishlistItem.create({
          ...item,
          wishlist: wishlist._id,
          user: req.user?.id,
        })
      } else if (item.action === 'updated') {
        // Mevcut item güncelle
        await WishlistItem.findOneAndUpdate(
          { _id: item.id, wishlist: wishlist.id },
          item,
          { new: true, runValidators: true },
        )
      } else if (item.action === 'deleted') {
        // Item sil
        await WishlistItem.findOneAndDelete({
          _id: item.id,
          wishlist: wishlist.id,
        })
      }
    }
  }

  // Accessors güncelleme işlemleri
  if (accessors.length) {
    // Önce mevcut tüm accessorları sil
    await WishlistAccessor.deleteMany({ wishlist: wishlist._id })

    for (const accessor of accessors) {
      if (accessor.action === 'initial') {
        const user = await User.findOne({ email: accessor.user.email })

        if (!user) break

        // Yeni item ekle
        await WishlistAccessor.create({
          wishlistAccessorStatus: 'pending',
          wishlist: wishlist._id,
          user: user?.id,
        })
      } else if (accessor.action === 'updated') {
        // maybe later we can have
      } else if (accessor.action === 'deleted') {
        // Item bul
        const wishlistAccessor = await WishlistAccessor.findOne({
          _id: accessor.id,
          wishlist: wishlist.id,
        })

        const isUserSelf = wishlistAccessor?.accessor === req.user.id
        const isUserWishlistOwner = wishlist.createdBy === req.user.id

        if (isUserSelf || isUserWishlistOwner) {
          await wishlistAccessor?.deleteOne()
          await wishlistAccessor?.save()
        }
      }
    }
  }

  // Güncellenmiş wishlist'i döndür
  const updatedWishlist = await Wishlist.findById(wishlist._id)
    .populate({
      path: 'items',
    })
    .populate({
      path: 'accessors',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(updatedWishlist),
  })
}

// Delete a wishlist by ID
async function wishlistDelete(req: Request, res: Response) {
  //! get wishlist accessors
  const accessors = await WishlistAccessor.find({ user: req.user?.id })
  const accessorWishlistIds = accessors.map(accessor => accessor.id)

  //! delete wishlist
  const data = await Wishlist.findOne({
    _id: req.params.id,
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWishlistIds } }, // Kullanıcı accessors'da mı?
    ],
  })

  if (!data) {
    throw new ApiError('Wishlist not found', ERROR_CODE.EntityNotFound)
  }

  //! delete wishlsit accessors
  await WishlistAccessor.find({ wishlist: req.params.id }).deleteMany()

  //! delete wishlist items
  await WishlistItem.find({ wishlist: req.params.id }).deleteMany()

  //! delete wallet
  await data.deleteOne()

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

async function wishlistItemUpdate(req: Request, res: Response) {
  const { id: wishlistId, itemId } = req.params
  const userId = req.user?.id
  const updates = { ...req.body }

  // Handle empty reservedBy
  if (Object.prototype.hasOwnProperty.call(updates, 'reservedBy')) {
    if (!updates.reservedBy || updates.reservedBy === '') {
      updates.reservedBy = null // Set to null for $unset operation
      updates.reservedAt = null // Also reset reservedAt
    }
  }

  // Permission check using aggregation
  const [accessCheck] = await Wishlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(wishlistId),
      },
    },
    {
      $lookup: {
        from: 'wishlistaccessors',
        let: { wishlistId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$wishlist', '$$wishlistId'] },
                  { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$wishlistAccessorStatus', 'active'] },
                ],
              },
            },
          },
        ],
        as: 'accessors',
      },
    },
    {
      $addFields: {
        isOwner: { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
        isAccessor: { $gt: [{ $size: '$accessors' }, 0] },
        isAdmin: { $eq: [req.user?.role, 'admin'] },
      },
    },
    {
      $project: {
        hasAccess: {
          $or: ['$isOwner', '$isAccessor', '$isAdmin'],
        },
        items: 1,
      },
    },
  ])

  if (!accessCheck) {
    throw new ApiError('Wishlist not found', ERROR_CODE.EntityNotFound)
  }

  if (!accessCheck.hasAccess) {
    throw new ApiError('Unauthorized', ERROR_CODE.Unauthorized)
  }

  // Validate update data
  const validUpdateFields = [
    'name',
    'link',
    'price',
    'image',
    'reservedBy',
    'reservedAt',
  ]
  const invalidFields = Object.keys(updates).filter(
    field => !validUpdateFields.includes(field),
  )

  if (invalidFields.length > 0) {
    throw new ApiError(
      `Invalid fields: ${invalidFields.join(', ')}`,
      ERROR_CODE.InvalidParameters,
    )
  }

  // Prepare update operations
  const updateOperations: any = {}
  const unsetOperations: any = {}

  Object.keys(updates).forEach(key => {
    // eslint-disable-next-line security/detect-object-injection
    if (updates[key] === null) {
      unsetOperations[`items.$.${key}`] = ''
    } else {
      // eslint-disable-next-line security/detect-object-injection
      updateOperations[`items.$.${key}`] = updates[key]
    }
  })

  // Combine $set and $unset operations
  const updateQuery: any = {}
  if (Object.keys(updateOperations).length > 0) {
    updateQuery.$set = updateOperations
  }
  if (Object.keys(unsetOperations).length > 0) {
    updateQuery.$unset = unsetOperations
  }

  // İki aşamalı güncelleme yaklaşımı
  const updateResult = await Wishlist.updateOne(
    {
      _id: wishlistId,
      'items._id': new mongoose.Types.ObjectId(itemId),
    },
    updateQuery,
    { runValidators: true },
  )

  if (!updateResult.matchedCount) {
    throw new ApiError('Item not found', ERROR_CODE.EntityNotFound)
  }

  if (!updateResult.modifiedCount) {
    throw new ApiError('No changes applied', ERROR_CODE.NoChanges)
  }

  // Güncellenmiş item'ı ayrı bir sorgu ile al
  const updatedWishlist = await Wishlist.findOne(
    { _id: wishlistId },
    {
      items: {
        $elemMatch: { _id: new mongoose.Types.ObjectId(itemId) },
      },
    },
  )

  // if (!updatedWishlist || !updatedWishlist.items?.[0]) {
  //   throw new ApiError(
  //     'ResourceNotFound',
  //     'Updated item not found',
  //   )
  // }

  // const updatedItem = updatedWishlist.items[0];
  // const formattedItem = {
  //   id: updatedItem._id?.toString(),
  //   name: updatedItem.name,
  //   link: updatedItem.link,
  //   price: updatedItem.price,
  //   image: updatedItem.image,
  //   reservedBy: updatedItem.reservedBy ? {
  //     id: updatedItem.reservedBy.toString()
  //   } : null,
  //   reservedAt: updatedItem.reservedAt || null
  // };

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(updatedWishlist),
  })
}

async function wishlistAccessorCreate(req: Request, res: Response) {
  const wishlist = await Wishlist.findOne({
    _id: req.params.id,
    user: req.user?.id,
  })
  if (!wishlist) {
    throw new ApiError('Wishlist not found', ERROR_CODE.EntityNotFound)
  }

  const isAdmin = req.user.role === 'admin'
  const isWishlistOwner = wishlist.createdBy === req.user.id
  if (!isAdmin && !isWishlistOwner) {
    throw new ApiError('Unauthorized', ERROR_CODE.Unauthorized)
  }

  const user = await User.findOne({ email: req.body.email })
  const accessorCheck = await WishlistAccessor.findOne({
    user: user?.id,
    wishlist: req.params.id,
  })
  if (accessorCheck) {
    throw new ApiError('Accessor already exists', ERROR_CODE.DuplicateEntry)
  }

  const newAccessor = new WishlistAccessor({
    user: user?.id,
    wishlist: req.params.id,
  })
  const data = await newAccessor.save()

  await PushNotificationService.sendNotification({
    userId: user?.id,
    title: 'New Wishlist Access',
    body: `${req.user.firstName} shared a wishlist with you`,
    data: {
      type: 'invite',
      wishlist: wishlist.toJSON(),
      sender: req.user,
    },
    notification: {
      invite: {
        type: 'WishlistAccessor',
        resource: data.id,
      },
    },
    options: {
      channelId: 'WISHLIST_ACCESS',
      categoryId: 'WISHLIST_ACCESS',
    },
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function wishlistAccessorDelete(req: Request, res: Response) {
  const accessorId = req.params.accessorId

  const data = await WishlistAccessor.findOneAndDelete({ _id: accessorId })

  if (!data) {
    throw new ApiError('Accessor not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function wishlistAccessorUpdate(req: Request, res: Response) {
  const allowedFields = ['status']

  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update =>
    allowedFields.includes(update),
  )

  if (!isValidOperation) {
    throw new ApiError('Invalid updates', ERROR_CODE.InvalidParameters)
  }

  const accessor = await WishlistAccessor.findOne({
    _id: req.params.id,
    wishlist: req.params.wishlistId,
  })

  if (!accessor) {
    throw new ApiError('Accessor not found', ERROR_CODE.EntityNotFound)
  }

  // eslint-disable-next-line security/detect-object-injection
  updates.forEach(update => (accessor[update] = req.body[update]))
  const response = await accessor.save()

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(response),
  })
}

export {
  wishlistAccessorCreate,
  wishlistAccessorDelete,
  wishlistAccessorUpdate,
  wishlistCreate,
  wishlistDelete,
  wishlistGet,
  wishlistItemUpdate,
  wishlistList,
  wishlistUpdate,
}
