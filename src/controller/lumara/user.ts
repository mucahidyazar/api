import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { User } from '@/model/lumara/user'
import { Transaction } from '@/model/lumara/transaction'
import { Wallet } from '@/model/lumara/wallet'
import { WalletAccessor } from '@/model/lumara/wallet-accessor'
import { WalletBalance } from '@/model/lumara/wallet-balance'
import { Setting } from '@/model/lumara/setting'
import { Wishlist } from '@/model/lumara/wishlist'
import { WishlistAccessor } from '@/model/lumara/wishlist-accessor'
import { ApiError } from '@/services/api-error'
import { StorageService } from '@/services/supabase'

export const relatedUserModels = [
  Transaction,
  Wallet,
  WalletAccessor,
  WalletBalance,
  Setting,
  Wishlist,
  WishlistAccessor,
] as mongoose.Model<any>[];

async function userMeGet(req: Request & { user?: any }, res: Response) {
  if (!req.user) {
    throw new ApiError('Unauthorized');
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'User fetched successfully',
    data: req.user
  })
}

async function userMeDelete(req: Request, res: Response) {
  const userId = req.user.id;

  const { password } = req.body;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError('ResourceNotFound', 'User not found');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError('InvalidInput', 'Invalid password');
  }

  // Tüm kullanıcı verilerini sil
  await Promise.all(
    relatedUserModels.map(async model => await model.deleteMany({ user: userId }))
  );
  const data = await User.findByIdAndDelete(userId);

  return res.response({
    status: 'success',
    code: 200,
    message: 'Account deleted successfully',
    data
  });
}

async function userMeUpdate(req: Request, res: Response) {
  console.log('updates', req.body)
  const allowedUpdateKeys = [
    'firstName',
    'lastName',
    'email',
    'password',
    'defaultWallet',
    'defaultWalletCurrency',
    'avatar'
  ];
  const updateKeys = Object.keys(req.body);
  const isValidOperation = updateKeys.every(update => allowedUpdateKeys.includes(update));

  if (!isValidOperation) {
    throw new ApiError('InvalidInput');
  }

  const user = await User.findOne(
    { _id: req.user.id }
  );

  if (!user) {
    throw new ApiError('ResourceNotFound', 'User not found');
  }

  const { avatar, ...updates } = req.body
  let avatarUrl = '';

  // Handle avatar upload if provided
  if (avatar?.base64) {
    // Convert base64 to buffer
    const buffer = Buffer.from(avatar.base64, 'base64');

    // Upload to Supabase
    avatarUrl = await StorageService.uploadFile({
      bucket: 'images-profile',
      file: buffer,
      contentType: avatar.type || 'image/jpeg',
      userId: req.user?.id,
      oldFileUrl: user.avatarUrl
    });

    // Add avatar URL to updates
    updates.avatarUrl = avatarUrl;
  }

  user.set({
    ...(avatarUrl ? { avatarUrl } : {}),
    ...updates
  })
  const response = await user.save()

  return res.response({
    status: 'success',
    code: 200,
    message: 'User updated successfully',
    data: response
  })
}

interface UserMePasswordUpdateBody {
  oldPassword: string;
  newPassword: string;
}
async function userMePasswordUpdate(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body as UserMePasswordUpdateBody;

  // Kullanıcıyı bul
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new ApiError('ResourceNotFound', 'User not found');
  }

  // Eski şifreyi kontrol et
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      'InvalidInput',
      'Current password is incorrect'
    );
  }

  // Yeni şifre eskisiyle aynı olmamalı
  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new ApiError(
      'InvalidInput',
      'New password must be different from the current password'
    );
  }

  // Yeni şifreyi hashle
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Şifreyi güncelle
  user.password = hashedPassword;
  user.passwordChangedAt = new Date();
  const data = await user.save();

  return res.response({
    status: 'success',
    code: 200,
    message: 'Password updated successfully',
    data
  });
}

export {
  userMeDelete,
  userMeGet,
  userMePasswordUpdate,
  userMeUpdate,
}
