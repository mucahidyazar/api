import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { queryHelper } from '@/helpers';

import { Transaction } from '@/model/lumara/transaction';
import { Wallet } from '@/model/lumara/wallet';
import { WalletAccessor } from '@/model/lumara/wallet-accessor';
import { WalletBalance } from '@/model/lumara/wallet-balance';
import { User } from '@/model/lumara/user';
import { PushNotificationService } from '@/services/push-notification';
import { ApiError } from '@/services/api-error';
import { WalletType } from '@/model/lumara/wallet-type';

async function walletCreate(req: Request, res: Response) {
  const savedWalletBalances = await WalletBalance.insertMany(req.body.balances);
  const walletBalanceIds = savedWalletBalances.map(balance => balance.id);

  const { accessors = [], ...bodyData } = req.body

  const newWallet = new Wallet({
    ...bodyData,
    walletBalances: walletBalanceIds,
    user: req.user?.id,
  });
  const data = await newWallet.save();

  if (accessors.length) {
    const emails = accessors.map(accessor => accessor.user.email);
    const users = await User.find({ email: { $in: emails } });

    const accessorsToCreate = users.map(user => ({
      wishlist: data.id,
      user: user.id,
    }));

    if (accessorsToCreate.length) {
      await WalletAccessor.insertMany(accessorsToCreate);
    }
  };

  return res.response({
    status: 'success',
    code: 201,
    message: 'Wallet created successfully',
    data
  });
}

async function walletList(req: Request, res: Response) {
  const accessors = await WalletAccessor.find({
    user: req.user?.id,
    status: 'active'
  });

  const accessorWalletIds = accessors.map(accessor => accessor.wallet);

  const totalItems = await Wallet.countDocuments({
    $or: [
      { user: req.user?.id },
      { _id: { $in: accessorWalletIds } }
    ]
  });

  const query = Wallet.find({
    $or: [
      { user: req.user?.id },
      { _id: { $in: accessorWalletIds } }
    ]
  })
    .populate('walletType')
    .populate('walletBalances')
    .populate({
      path: 'user',
      select: 'name email'
    });

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  });

  const wallets = await query.exec();

  const walletsWithAccessorInfo = await Promise.all(wallets.map(async (wallet) => {
    const walletObj = wallet.toObject();

    const accessors = await WalletAccessor.find({
      wallet: wallet._id,
      status: 'active'
    })
      .populate({
        path: 'user',
        select: 'name email'
      });

    return {
      ...walletObj,
      isOwner: wallet.user._id.toString() === req.user?.id,
      accessors
    };
  }));

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet list fetched successfully',
    data: walletsWithAccessorInfo,
    metadata
  });
}

// async function walletGet(req: Request, res: Response) {
//     // Aktif accessor'ları bul
//     const accessors = await WalletAccessor.find({ 
//       user: req.user?.id,
//       status: 'active'
//     });
//     const accessorWalletIds = accessors.map(accessor => accessor.wallet);

//     // Wallet'ı bul ve ilişkili verileri getir
//     const wallet = await Wallet.findOne({
//       _id: req.params.id,
//       $or: [
//         { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
//         { _id: { $in: accessorWalletIds } } // Kullanıcı accessor'u mu?
//       ]
//     })
//     .populate('walletType')
//     .populate('walletBalances')
//     .populate({
//       path: 'user',
//       select: 'name email' // Sadece gerekli user bilgilerini getir
//     });

//     if (!wallet) {
//       return res.response({
//         status: 'error',
//         code: 404,
//         message: 'Wallet not found or access denied',
//       });
//     }

//     // Wallet'ın tüm accessor'larını bul
//     const walletAccessors = await WalletAccessor.find({
//       wallet: wallet._id,
//       status: 'active'
//     })
//     .populate({
//       path: 'user',
//       select: 'name email'
//     });

//     // Response için wallet objesini hazırla
//     const walletResponse = {
//       ...wallet.toObject(),
//       isOwner: wallet.user._id.toString() === req.user?.id,
//       accessors: walletAccessors
//     };

//     // Query helper'ı uygula (gerekirse)
//     queryHelper({
//       queries: { ...req.query },
//       query: wallet
//     });

//     return res.response({
//       status: 'success',
//       code: 200,
//       message: 'Wallet fetched successfully',
//       data: walletResponse,
//     });
//  }
// Performans odaklı alternatif versiyon
async function walletGet(req: Request, res: Response) {
  const [data] = await Wallet.aggregate([
    // Initial match
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
        $or: [
          { user: new mongoose.Types.ObjectId(req.user?.id) },
          {
            _id: {
              $in: await WalletAccessor.distinct('wallet', {
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

    // WalletType Lookup
    {
      $lookup: {
        from: 'wallettypes',
        localField: 'walletType',
        foreignField: '_id',
        as: 'walletType'
      }
    },
    {
      $unwind: {
        path: '$walletType',
        preserveNullAndEmptyArrays: true
      }
    },

    // WalletBalances Lookup
    {
      $lookup: {
        from: 'walletbalances',
        localField: 'walletBalances',
        foreignField: '_id',
        as: 'walletBalances'
      }
    },

    // Accessors Lookup
    {
      $lookup: {
        from: 'walletaccessors',
        let: { walletId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$wallet', '$$walletId'] }
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
              __v: 0
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
        'walletType.id': { $toString: '$walletType._id' },
        isOwner: {
          $eq: ['$userArray._id', new mongoose.Types.ObjectId(req.user?.id)]
        },
        'walletBalances': {
          $map: {
            input: '$walletBalances',
            as: 'balance',
            in: {
              id: { $toString: '$$balance._id' },
              amount: '$$balance.amount',
              currency: '$$balance.currency',
              createdAt: '$$balance.createdAt',
              updatedAt: '$$balance.updatedAt'
            }
          }
        }
      }
    },

    // Final cleanup
    {
      $project: {
        _id: 0,
        __v: 0,
        userArray: 0,
        'walletType._id': 0,
        'walletType.__v': 0,
        'walletBalances._id': 0,
        'walletBalances.__v': 0
      }
    }
  ]);

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found or access denied',
    )
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet fetched successfully',
    data,
  });
}

async function walletUpdate(req: Request, res: Response) {
  const { walletBalances = [], ...restBody } = req.body

  const accessors = await WalletAccessor.find({ user: req.user?.id })
  const accessorWalletIds = accessors.map(accessor => accessor.id);

  if (walletBalances.length) {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    });

    if (!wallet) {
      throw new ApiError(
        'ResourceNotFound',
        'Wallet not found',
      );
    }

    const walletBalanceIds = wallet.walletBalances.map(balance => balance._id);
    await WalletBalance.deleteMany({ _id: { $in: walletBalanceIds } });
    const savedWalletBalances = await WalletBalance.insertMany(walletBalances);
    restBody.walletBalances = savedWalletBalances.map(balance => balance.id);
  }

  const data = await Wallet.findOneAndUpdate({
    _id: req.params.id,
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
    ]
  }, restBody, { new: true });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet updated successfully',
    data
  });
}

async function walletDelete(req: Request, res: Response) {
  const accessors = await WalletAccessor.find({ user: req.user?.id })
  const accessorWalletIds = accessors.map(accessor => accessor.id);

  const data = await Wallet.findOneAndDelete({
    _id: req.params.id,
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
    ]
  });

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet deleted successfully',
    data
  });
}

async function walletTransactionList(req: Request, res: Response) {
  const accessors = await WalletAccessor.find({ user: req.user?.id })
  const accessorWalletIds = accessors.map(accessor => accessor.id);

  const wallet = await Wallet.findById({
    _id: req.params.id,
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
    ]
  }).populate('walletBalances');
  if (!wallet) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }
  const walletBalanceIds = wallet.walletBalances.map(balance => balance._id);

  const totalItems = await Transaction.countDocuments({
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { _id: { $in: walletBalanceIds } } // Kullanıcı accessors'da mı?
    ]
  });
  const query = Transaction.find({
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { _id: { $in: walletBalanceIds } } // Kullanıcı accessors'da mı?
    ]
  })

  const { metadata } = queryHelper({
    queries: { ...req.query, totalItems },
    query,
  });

  const data = await query.exec();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet list fetched successfully',
    data,
    metadata
  });
}



async function walletAccessorCreate(req: Request, res: Response) {
  const wallet = await Wallet.findOne({
    _id: req.params.id,
    user: req.user?.id,
  });
  if (!wallet) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }

  const isAdmin = req.user.role === "admin"
  const isWalletOwner = wallet.user.toString() === req.user.id
  if (!isAdmin && !isWalletOwner) {
    throw new ApiError('Unauthorized')
  }

  const user = await User.findOne({ email: req.body.email });
  const accessorCheck = await WalletAccessor.findOne({ user: user?.id, wallet: req.params.id });
  if (accessorCheck) {
    throw new ApiError(
      'ResourceAlreadyExists',
      'Accessor already exists',
    )
  }

  const newAccessor = new WalletAccessor({
    user: user?.id,
    wallet: req.params.id,
  });
  const data = await newAccessor.save();

  await PushNotificationService.sendNotification({
    userId: user?.id,
    title: 'New Wallet Access',
    body: `${req.user.firstName} shared a wallet with you`,
    data: {
      type: 'WISHLIST_ACCESS_INVITE',
      wallet: wallet.toJSON(),
      sender: req.user,
    },
    notification: {
      invite: {
        type: 'WalletAccessor',
        id: data.id,
      }
    },
    options: {
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

async function walletAccessorDelete(req: Request, res: Response) {
  const accessorId = req.params.accessorId;

  const data = await WalletAccessor.findOneAndDelete({
    _id: accessorId,
  })

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Accessor not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Accessor deleted successfully',
    data
  });
}

async function walletAccessorUpdate(req: Request, res: Response) {
  const allowedFields = ['status'];
  const updates = Object.keys(req.body).filter(field => allowedFields.includes(field));
  const isValidOperation = updates.every(update => allowedFields.includes(update));

  if (!isValidOperation) {
    throw new ApiError('InvalidInput')
  }

  const accessor = await WalletAccessor.findOne({
    _id: req.params.accessorId,
    wallet: req.params.id,
  });

  if (!accessor) {
    throw new ApiError(
      'ResourceNotFound',
      'Accessor not found',
    );
  }

  updates.forEach(update => accessor[update] = req.body[update]);
  const data = await accessor.save();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Accessor updated successfully',
    data,
  });
}


async function walletTypeList(req: Request, res: Response) {
  const walletTypes = await WalletType.find(req.query);

  return res.response({
    status: 'success',
    code: 200,
    message: 'WalletType list fetched successfully',
    data: walletTypes,
  });

}

export { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionList, walletAccessorCreate, walletAccessorDelete, walletAccessorUpdate, walletTypeList };
