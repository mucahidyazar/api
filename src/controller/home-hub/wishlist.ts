import { Request, Response } from 'express';
import { Wishlist } from '../../model/home-hub/wishlist';
import { WishlistAccessor } from '../../model/home-hub/wishlist-accessor';
import { User } from '../../model/home-hub/user';
import { queryHelper } from '../../helpers/query-helper';
import mongoose from 'mongoose';

async function wishlistCreate(req: Request, res: Response) {
  try {
    const { accessors = [], ...bodyData } = req.body

    const wishlist = new Wishlist({
      ...bodyData,
      user: req.user?.id,
    });
    const response = await wishlist.save();

    if (accessors.length) {
      const emails = accessors.map(accessor => accessor.user.email);
      const users = await User.find({ email: { $in: emails } });

      const accessorsToCreate = users.map(user => ({
        wishlist: response.id,
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
      data: response
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function wishlistList(req: Request, res: Response) {
  try {
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

  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'An error occurred while fetching wishlist list',
      details: error,
    });
  }
}

// async function wishlistGet(req: Request, res: Response) {
//   try {
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
//   } catch (error: any) {
//     return res.response({
//       status: 'error',
//       code: 500,
//       message: error.message,
//       details: error,
//     });
//   }
// }
async function wishlistGet(req: Request, res: Response) {
  try {
    const [wishlist] = await Wishlist.aggregate([
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
                    reservedBy: {
                      $cond: {
                        if: '$$item.reservedBy',
                        then: {
                          $let: {
                            vars: {
                              user: { $arrayElemAt: [{ $objectToArray: '$$item.reservedBy' }, 0] }
                            },
                            in: {
                              id: { $toString: '$$item.reservedBy' }
                            }
                          }
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

    if (!wishlist) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wishlist not found or access denied',
      });
    }

    // Items içindeki reservedBy userları populate et
    if (wishlist.items?.length) {
      const userIds = wishlist.items
        .filter(item => item.reservedBy)
        .map(item => new mongoose.Types.ObjectId(item.reservedBy.id));

      if (userIds.length) {
        const users = await mongoose.model('User').find(
          { _id: { $in: userIds } },
          { name: 1, email: 1 }
        );

        const userMap = new Map(users.map(user => [user._id.toString(), user]));

        wishlist.items = wishlist.items.map(item => {
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
      data: wishlist,
    });

  } catch (error: any) {
    console.error('Wishlist get error:', error);
    return res.response({
      status: 'error',
      code: 500,
      message: 'An error occurred while fetching the wishlist',
      details: error
    });
  }
}

async function wishlistUpdate(req: Request, res: Response) {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    );

    if (!wishlist) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wishlist not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wishlist updated successfully',
      data: wishlist
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

// Delete a wishlist by ID
async function wishlistDelete(req: Request, res: Response) {
  try {
    await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user?.id });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wishlist deleted successfully',
      data: null
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function wishlistItemUpdate(req: Request, res: Response) {
  try {
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
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wishlist not found',
      });
    }

    if (!accessCheck.hasAccess) {
      return res.response({
        status: 'error',
        code: 403,
        message: 'You do not have permission to update this wishlist',
      });
    }

    // Validate update data
    const validUpdateFields = ['name', 'link', 'price', 'image', 'reservedBy', 'reservedAt'];
    const invalidFields = Object.keys(updates).filter(field => !validUpdateFields.includes(field));

    if (invalidFields.length > 0) {
      return res.response({
        status: 'error',
        code: 400,
        message: `Invalid update fields: ${invalidFields.join(', ')}`,
      });
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
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wishlist or item not found',
      });
    }

    if (!updateResult.modifiedCount) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'No changes were made to the item',
      });
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
      return res.response({
        status: 'error',
        code: 404,
        message: 'Updated item not found',
      });
    }

    // Format the response
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

  } catch (error: any) {
    console.error('Wishlist item update error:', error);

    if (error.name === 'ValidationError') {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Validation failed',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    return res.response({
      status: 'error',
      code: 500,
      message: 'An error occurred while updating the wishlist item',
      details: error
    });
  }
}

async function wishlistAccessorCreate(req: Request, res: Response) {
  try {
    const wishlist = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!wishlist) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wishlist not found.',
      });
    }

    const isAdmin = req.user.role === "admin"
    const isWishlistOwner = wishlist.user.toString() === req.user.id
    if (!isAdmin && !isWishlistOwner) {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }

    const user = await User.findOne({ email: req.body.email });
    const accessorCheck = await WishlistAccessor.findOne({ user: user?.id, wishlist: req.params.id });
    if (accessorCheck) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Accessor already exists',
      });
    }

    const accessor = new WishlistAccessor({
      user: user?.id,
      wishlist: req.params.id,
    });
    await accessor.save();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Accessors added successfully',
      data: accessor,
    });
  } catch (error) {
    return res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wishlist transactions.",
    });
  }
}

async function wishlistAccessorDelete(req: Request, res: Response) {
  try {
    const accessorId = req.params.accessorId;

    await WishlistAccessor.deleteOne({ _id: accessorId });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Accessor deleted successfully',
      data: {},
    });
  } catch (error) {
    return res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wishlist transactions.",
    });
  }
}

export { wishlistCreate, wishlistList, wishlistGet, wishlistUpdate, wishlistDelete, wishlistItemUpdate, wishlistAccessorCreate, wishlistAccessorDelete };
