import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { queryHelper } from '@/helpers';
import { PushNotificationService } from '@/services/push-notification';

import { Wishlist } from '@/model/lumara/wishlist';
import { WishlistAccessor } from '@/model/lumara/wishlist-accessor';
import { User } from '@/model/lumara/user';
import { ApiError } from '@/services/api-error';

async function wishlistCreate(req: Request, res: Response) {
  const { accessors = [], ...bodyData } = req.body

  const newWishlist = new Wishlist({
    ...bodyData,
    user: req.user?.id,
  });
  const data = await newWishlist.save();

  if (accessors.length) {
    const emails = accessors.map(accessor => accessor.user.email);
    const users = await User.find({ email: { $in: emails } });

    const accessorsToCreate = users.map(user => ({
      wishlist: data.id,
      user: user.id,
    }));

    if (accessorsToCreate.length) {
      await WishlistAccessor.insertMany(accessorsToCreate);
    }
  };

  return res.response({
    status: 'success',
    code: 201,
    message: 'Wishlist created successfully',
    data
  });
}

async function wishlistList(req: Request, res: Response) {
  const accessors = await WishlistAccessor.find({
    user: req.user?.id,
    status: 'active'
  });

  const accessorWishlistIds = accessors.map(accessor => accessor.wishlist);

  const totalItems = await Wishlist.countDocuments({
    $or: [
      { user: req.user?.id },
      { _id: { $in: accessorWishlistIds } }
    ]
  });

  const query = Wishlist.find({
    $or: [
      { user: req.user?.id },
      { _id: { $in: accessorWishlistIds } }
    ]
  })
    .populate({
      path: 'user',
      select: 'name email'
    })
    // populate user in the items
    .populate({
      path: 'items.reservedBy',
      select: 'firstName email'
    });

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  });

  const wishlists = await query.exec();

  const wishlistsWithAccessorInfo = await Promise.all(wishlists.map(async (wishlist) => {
    const wishlistObj = wishlist.toObject();

    const accessors = await WishlistAccessor.find({
      wishlist: wishlist._id,
      status: 'active'
    })
      .populate({
        path: 'user',
        select: 'name email'
      });

    return {
      ...wishlistObj,
      isOwner: wishlist.user._id.toString() === req.user?.id,
      accessors
    };
  }));

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wishlist list fetched successfully',
    data: wishlistsWithAccessorInfo,
    metadata
  });
}

// async function wishlistGet(req: Request, res: Response) {
//     const query = Wishlist.findOne({ _id: req.params.id, user: req.user?.id });

//     queryHelper({
//       queries: req.query,
//       query,
//     });

//     const wishlist = await query.exec();

//     if (!wishlist) {
//       return res.response({
//         status: 'error',
//         code: 404,
//         message: 'Wishlist not found',
//       });
//     }

//     const accessors = await WishlistAccessor.find({ wishlist: req.params.id }).populate('user');

//     const data = {
//       ...wishlist.toObject(),
//       accessors,
//     };

//     return res.response({
//       status: 'success',
//       code: 200,
//       message: 'Wishlist fetched successfully',
//       data
//     });
// }
async function wishlistGet(req: Request, res: Response) {
  const [data] = await Wishlist.aggregate([
    // Initial match
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
        $or: [
          { user: new mongoose.Types.ObjectId(req.user?.id) },
          {
            _id: {
              $in: await WishlistAccessor.distinct('wishlist', {
                user: new mongoose.Types.ObjectId(req.user?.id),
                status: 'active'
              })
            }
          }
        ]
      }
    },

    // User Lookup
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userArray'
      }
    },
    {
      $unwind: {
        path: '$userArray',
        preserveNullAndEmptyArrays: true
      }
    },
    // User objesini yapılandır
    {
      $addFields: {
        user: {
          id: { $toString: '$userArray._id' },
          name: '$userArray.name',
          email: '$userArray.email'
        }
      }
    },

    // Items içindeki reservedBy userları getir
    {
      $addFields: {
        'items': {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  id: { $toString: '$$item._id' },
                  // Buradaki reservedBy dönüşümünü değiştiriyoruz
                  reservedBy: {
                    $cond: {
                      if: { $ne: ['$$item.reservedBy', null] },
                      then: {
                        id: { $toString: '$$item.reservedBy' }
                      },
                      else: null
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },

    // Accessors Lookup
    {
      $lookup: {
        from: 'wishlistaccessors',
        let: { wishlistId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$wishlist', '$$wishlistId'] }
            }
          },
          // Accessor'ların user bilgilerini getir
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userArray'
            }
          },
          {
            $unwind: {
              path: '$userArray',
              preserveNullAndEmptyArrays: true
            }
          },
          // Her bir accessor için user objesini yapılandır
          {
            $addFields: {
              id: { $toString: '$_id' },
              user: {
                id: { $toString: '$userArray._id' },
                name: '$userArray.name',
                email: '$userArray.email'
              }
            }
          },
          // Gereksiz fieldları kaldır
          {
            $project: {
              _id: 0,
              userArray: 0,
              __v: 0,
            }
          }
        ],
        as: 'accessors'
      }
    },

    // Genel Transform ve Cleanup
    {
      $addFields: {
        id: { $toString: '$_id' },
        isOwner: {
          $eq: ['$userArray._id', new mongoose.Types.ObjectId(req.user?.id)]
        }
      }
    },

    // Final cleanup
    {
      $project: {
        _id: 0,
        __v: 0,
        userArray: 0,
        'items._id': 0,
        'items.__v': 0
      }
    }
  ]);

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist not found or access denied',
    )
  }

  // Items içindeki reservedBy userları populate et
  if (data.items?.length) {
    const userIds = data.items
      .filter(item => item.reservedBy)
      .map(item => new mongoose.Types.ObjectId(item.reservedBy.id));

    if (userIds.length) {
      const users = await mongoose.model('User').find(
        { _id: { $in: userIds } },
        { name: 1, email: 1 }
      );

      const userMap = new Map(users.map(user => [user._id.toString(), user]));

      data.items = data.items.map(item => {
        if (item.reservedBy) {
          const user = userMap.get(item.reservedBy.id);
          if (user) {
            item.reservedBy = {
              id: user._id.toString(),
              name: user.name,
              email: user.email
            };
          }
        }
        return item;
      });
    }
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wishlist fetched successfully',
    data,
  });
}

async function wishlistUpdate(req: Request, res: Response) {
  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: req.params.id, user: req.user?.id },
    req.body,
    { new: true }
  );

  if (!wishlist) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wishlist updated successfully',
    data: wishlist
  });
}

// Delete a wishlist by ID
async function wishlistDelete(req: Request, res: Response) {
  const data = await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user?.id });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wishlist deleted successfully',
    data
  });
}

async function wishlistItemUpdate(req: Request, res: Response) {
  const { id: wishlistId, itemId } = req.params;
  const userId = req.user?.id;
  const updates = { ...req.body }; // Create a copy to modify

  // Handle empty reservedBy
  if (updates.hasOwnProperty('reservedBy')) {
    if (!updates.reservedBy || updates.reservedBy === '') {
      updates.reservedBy = null; // Set to null for $unset operation
      updates.reservedAt = null; // Also reset reservedAt
    }
  }

  // Permission check using aggregation
  const [accessCheck] = await Wishlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(wishlistId)
      }
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
                  { $eq: ['$status', 'active'] }
                ]
              }
            }
          }
        ],
        as: 'accessors'
      }
    },
    {
      $addFields: {
        isOwner: { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
        isAccessor: { $gt: [{ $size: '$accessors' }, 0] },
        isAdmin: { $eq: [req.user?.role, 'admin'] }
      }
    },
    {
      $project: {
        hasAccess: {
          $or: [
            '$isOwner',
            '$isAccessor',
            '$isAdmin'
          ]
        },
        items: 1
      }
    }
  ]);

  if (!accessCheck) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist not found',
    )
  }

  if (!accessCheck.hasAccess) {
    throw new ApiError('Unauthorized');
  }

  // Validate update data
  const validUpdateFields = ['name', 'link', 'price', 'image', 'reservedBy', 'reservedAt'];
  const invalidFields = Object.keys(updates).filter(field => !validUpdateFields.includes(field));

  if (invalidFields.length > 0) {
    throw new ApiError(
      'InvalidInput',
      `Invalid update fields: ${invalidFields.join(', ')}`,
    )
  }

  // Prepare update operations
  const updateOperations: any = {};
  const unsetOperations: any = {};

  Object.keys(updates).forEach(key => {
    if (updates[key] === null) {
      unsetOperations[`items.$.${key}`] = "";
    } else {
      updateOperations[`items.$.${key}`] = updates[key];
    }
  });

  // Combine $set and $unset operations
  const updateQuery: any = {};
  if (Object.keys(updateOperations).length > 0) {
    updateQuery.$set = updateOperations;
  }
  if (Object.keys(unsetOperations).length > 0) {
    updateQuery.$unset = unsetOperations;
  }

  // İki aşamalı güncelleme yaklaşımı
  const updateResult = await Wishlist.updateOne(
    {
      _id: wishlistId,
      'items._id': new mongoose.Types.ObjectId(itemId)
    },
    updateQuery,
    { runValidators: true }
  );

  if (!updateResult.matchedCount) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist or item not found',
    )
  }

  if (!updateResult.modifiedCount) {
    throw new ApiError(
      'ResourceConflict',
      'No changes were made to the item',
    )
  }

  // Güncellenmiş item'ı ayrı bir sorgu ile al
  const updatedWishlist = await Wishlist.findOne(
    { _id: wishlistId },
    {
      items: {
        $elemMatch: { _id: new mongoose.Types.ObjectId(itemId) }
      }
    }
  );

  if (!updatedWishlist || !updatedWishlist.items?.[0]) {
    throw new ApiError(
      'ResourceNotFound',
      'Updated item not found',
    )
  }

  const updatedItem = updatedWishlist.items[0];
  const formattedItem = {
    id: updatedItem._id?.toString(),
    name: updatedItem.name,
    link: updatedItem.link,
    price: updatedItem.price,
    image: updatedItem.image,
    reservedBy: updatedItem.reservedBy ? {
      id: updatedItem.reservedBy.toString()
    } : null,
    reservedAt: updatedItem.reservedAt || null
  };

  return res.response({
    status: 'success',
    code: 200,
    message: 'Item updated successfully',
    data: formattedItem
  });
}

async function wishlistAccessorCreate(req: Request, res: Response) {
  const wishlist = await Wishlist.findOne({
    _id: req.params.id,
    user: req.user?.id,
  });
  if (!wishlist) {
    throw new ApiError(
      'ResourceNotFound',
      'Wishlist not found',
    )
  }

  const isAdmin = req.user.role === "admin"
  const isWishlistOwner = wishlist.user.toString() === req.user.id
  if (!isAdmin && !isWishlistOwner) {
    throw new ApiError('Unauthorized')
  }

  const user = await User.findOne({ email: req.body.email });
  const accessorCheck = await WishlistAccessor.findOne({ user: user?.id, wishlist: req.params.id });
  if (accessorCheck) {
    throw new ApiError(
      'ResourceAlreadyExists',
      'Accessor already exists',
    )
  }

  const newAccessor = new WishlistAccessor({
    user: user?.id,
    wishlist: req.params.id,
  });
  const data = await newAccessor.save();

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
      }
    },
    options: {
      channelId: 'WISHLIST_ACCESS',
      categoryId: 'WISHLIST_ACCESS',
    }
  });

  return res.response({
    status: 'success',
    code: 200,
    message: 'Accessors added successfully',
    data,
  });
}

async function wishlistAccessorDelete(req: Request, res: Response) {
  const accessorId = req.params.accessorId;

  const data = await WishlistAccessor.findOneAndDelete({ _id: accessorId });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Accessor not found',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Accessor deleted successfully',
    data
  });
}

async function wishlistAccessorUpdate(req: Request, res: Response) {
  const allowedFields = ['status'];

  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedFields.includes(update));

  if (!isValidOperation) {
    throw new ApiError('InvalidInput')
  }

  const accessor = await WishlistAccessor.findOne({
    _id: req.params.id,
    wishlist: req.params.wishlistId,
  });

  if (!accessor) {
    throw new ApiError(
      'ResourceNotFound',
      'Accessor not found',
    )
  }

  updates.forEach(update => accessor[update] = req.body[update]);
  const response = await accessor.save();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Accessor updated successfully',
    data: response
  });
}

export { wishlistCreate, wishlistList, wishlistGet, wishlistUpdate, wishlistDelete, wishlistItemUpdate, wishlistAccessorCreate, wishlistAccessorUpdate, wishlistAccessorDelete };
