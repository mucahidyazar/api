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
  const { accessors = [], ...bodyData } = req.body

  const newWallet = new Wallet({
    ...bodyData,
    user: req.user?.id,
  });
  const data = await newWallet.save();

  await WalletBalance.insertMany(req.body.walletBalances.map(b => ({ ...b, wallet: data.id })));

  if (accessors.length) {
    const emails = accessors.map(accessor => accessor.user.email);
    const users = await User.find({ email: { $in: emails } });

    const accessorsToCreate = users.map(user => ({
      wallet: data.id,
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
    .populate({
      path: 'walletBalances', // Virtual alan adı
      options: { sort: { createdAt: -1 } } // Gerekirse ek seçenekler
    })
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

async function walletGet(req: Request, res: Response) {
  const walletId = req.params.id;
  const userId = req.user?.id;

  // Kullanıcının erişebileceği wallet erişimcilerini alın
  const accessibleWalletIds = await WalletAccessor.find({
    user: userId,
    status: 'active',
  }).distinct('wallet');

  // Wallet'ı bulun ve ilişkili alanları populate edin
  const wallet = await Wallet.findOne({
    _id: walletId,
    $or: [{ user: userId }, { _id: { $in: accessibleWalletIds } }],
  })
    .populate('user', 'name email') // User bilgilerini sadece name ve email ile getir
    .populate('walletBalances')
    .populate('walletType')
    .populate({
      path: 'accessors',
      populate: { path: 'user', select: 'name email' }, // Accessor'ların user bilgilerini ekle
    })

  if (!wallet) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found or access denied'
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet fetched successfully',
    data: wallet,
  });
}

async function walletUpdate(req: Request, res: Response) {
  const { walletBalances = [], accessors = [], ...bodyData } = req.body

  //! get accessor ids from db
  const dbAccessors = await WalletAccessor.find({ user: req.user?.id })
  const dbAccessorsIds = dbAccessors.map(dbAccessor => dbAccessor.id);

  //! update wallet
  const wallet = await Wallet.findOneAndUpdate(
    {
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { accessors: { $in: dbAccessorsIds } } // Kullanıcı accessors'da mı?
      ]
    },
    bodyData,
    { new: true }
  );

  if (!wallet) {
    throw new ApiError('ResourceNotFound', 'Walllet not found');
  }

  if (walletBalances.length) {
    for (const item of walletBalances) {
      if (item.action === 'initial') {
        // Yeni item ekle
        await WalletBalance.create({
          ...item,
          wallet: wallet.id,
          user: req.user?.id,
        });
      } else if (item.action === 'updated') {
        // Mevcut item güncelle
        await WalletBalance.findOneAndUpdate(
          { _id: item.id, wallet: wallet.id },
          item,
          { new: true, runValidators: true }
        );
      } else if (item.action === 'deleted') {
        // Item sil
        await WalletBalance.findOneAndDelete({
          _id: item.id,
          wallet: wallet.id,
        });
      }
    }
  }

  // Gelen accessors listesini ekle
  if (accessors.length) {
    await WalletAccessor.deleteMany({ wallet: wallet.id });

    for (const accessor of accessors) {
      if (accessor.action === 'initial') {
        const user = await User.findOne({ email: accessor.user.email });

        if (!user) break;

        // Yeni item ekle
        await WalletAccessor.create({
          status: 'pending',
          wallet: wallet._id,
          user: user?.id,
        });

      } else if (accessor.action === 'updated') {
        // maybe later we can have
      } else if (accessor.action === 'deleted') {
        // Item bul
        const walletAccessor = await WalletAccessor.findOne({
          _id: accessor.id,
          wallet: wallet.id,
        });

        const isUserSelf = walletAccessor?.user === req.user.id;
        const isUserWalletOwner = wallet.user === req.user.id;

        if (isUserSelf || isUserWalletOwner) {
          await walletAccessor?.deleteOne()
          await walletAccessor?.save();
        }
      }
    }
  }

  // Güncellenmiş wallet'i döndür
  const updatedWallet = await Wallet.findById(wallet._id)
    .populate('user', 'name email') // User bilgilerini sadece name ve email ile getir
    .populate('walletBalances')
    .populate('walletType')
    .populate({
      path: 'accessors',
      populate: { path: 'user', select: 'name email' }, // Accessor'ların user bilgilerini ekle
    })

  return res.response({
    status: 'success',
    code: 200,
    message: 'Wallet updated successfully',
    data: updatedWallet,
  });

}

async function walletDelete(req: Request, res: Response) {
  //! get wallet accessors
  const accessors = await WalletAccessor.find({ user: req.user?.id })
  const accessorWalletIds = accessors.map(accessor => accessor.id);

  //! get wallet
  const data = await Wallet.findOne({
    _id: req.params.id,
    $or: [
      { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
      { accessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
    ]
  })

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }

  //! delete wallet balances
  await WalletBalance.find({ wallet: req.params.id }).deleteMany();

  //! delete wallet accessors
  await WalletAccessor.find({ wallet: req.params.id }).deleteMany();

  //! delete wallet
  await data.deleteOne();

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
  })

  if (!wallet) {
    throw new ApiError(
      'ResourceNotFound',
      'Wallet not found',
    );
  }
  const walletBalances = await WalletBalance.find({ wallet: wallet.id });
  const walletBalanceIds = walletBalances.map(balance => balance._id);

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
