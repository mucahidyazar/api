import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { User } from '../../model/lumara/user'
import { Transaction } from '../../model/lumara/transaction'
import { Wallet } from '../../model/lumara/wallet'
import { WalletAccessor } from '../../model/lumara/wallet-accessor'
import { WalletBalance } from '../../model/lumara/wallet-balance'
import { Setting } from '../../model/lumara/setting'
import { Wishlist } from '../../model/lumara/wishlist'
import { WishlistAccessor } from '../../model/lumara/wishlist-accessor'

export const relatedUserModels = [
  Transaction,
  Wallet,
  WalletAccessor,
  WalletBalance,
  Setting,
  Wishlist,
  WishlistAccessor,
] as mongoose.Model<any>[];

async function userGet(req: Request, res: Response) {
  try {
    const user = await User.findOne({
      _id: req.params.id
    })

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      })
    }

    if (user?.id !== req.user?.id && req.user.role !== "admin") {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden'
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'User fetched successfully',
      data: user
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userCreate(req: Request, res: Response) {
  try {
    const validCreationFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'avatarUrl',
    ]

    const isValidOperation = Object.keys(req.body).every(key => validCreationFields.includes(key))
    if (!isValidOperation) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid fields',
      })
    }

    const user = new User(req.body)
    await user.save()
    return res.response({
      status: 'success',
      code: 201,
      message: 'User created successfully',
      data: user
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userList(req: Request, res: Response) {
  try {
    const users = await User.find()
    return res.response({
      status: 'success',
      code: 200,
      message: 'User list fetched successfully',
      data: users
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userMeGet(req: Request & { user?: any }, res: Response) {
  if (!req.user) {
    return res.response({
      status: 'error',
      code: 401,
      message: 'Unauthorized'
    })
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'User fetched successfully',
    data: req.user
  })
}

async function userMeDelete(req: Request, res: Response) {
  try {
    const userId = req.user.id;

    // Kullanıcının şifresini doğrula
    const { password } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid password'
      });
    }

    // Tüm kullanıcı verilerini sil
    await Promise.all(
      relatedUserModels.map(async model => await model.deleteMany({ user: userId }))
    );
    await User.findByIdAndDelete(userId);

    return res.response({
      status: 'success',
      code: 200,
      message: 'Account deleted successfully',
      data: null
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to delete account',
      details: error.message
    });
  }
}

async function userMeUpdate(req: Request, res: Response) {
  try {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'email',
      'password',
      'avatarUrl',
      'defaultWallet',
      'defaultWalletCurrency',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid updates'
      })
    }

    const user = await User.findOne(
      { _id: req.params.id },
    );

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      })
    }

    if (user?.id !== req.user?.id && req.user.role !== "admin") {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden'
      })
    }

    user.set(req.body)
    const response = await user.save()

    return res.response({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
      data: response
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

interface UserMePasswordUpdateBody {
  oldPassword: string;
  newPassword: string;
}
async function userMePasswordUpdate(req: Request, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body as UserMePasswordUpdateBody;

    // Kullanıcıyı bul
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      });
    }

    // Eski şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Current password is incorrect'
      });
    }

    // Yeni şifre eskisiyle aynı olmamalı
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'New password must be different from the current password'
      });
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Password updated successfully',
      data: null
    });

  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Error updating password',
      details: error.message
    });
  }
}

export {
  userCreate,
  userGet,
  userList,
  userMeDelete,
  userMeGet,
  userMePasswordUpdate,
  userMeUpdate,
}
