import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { Setting } from '@/model/setting'
import { Transaction } from '@/model/transaction'
import { User } from '@/model/user'
import { Wallet } from '@/model/wallet'
import { WalletAccessor } from '@/model/wallet-accessor'
import { WalletBalance } from '@/model/wallet-balance'
import { Wishlist } from '@/model/wishlist'
import { WishlistAccessor } from '@/model/wishlist-accessor'
import { ApiResponse } from '@/utils'

export const relatedUserModels = [
  Transaction,
  Wallet,
  WalletAccessor,
  WalletBalance,
  Setting,
  Wishlist,
  WishlistAccessor,
] as mongoose.Model<any>[]

async function userMeGet(req: Request & { user?: any }, res: Response) {
  if (!req.user) {
    throw new ApiError('Unauthorized', ERROR_CODE.Unauthorized)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(req.user),
  })
}

async function userMeDelete(req: Request, res: Response) {
  const userId = req.user.id

  const { password } = req.body

  const user = await User.findById(userId).select('+password')
  if (!user) {
    throw new ApiError('User not found', ERROR_CODE.EntityNotFound)
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new ApiError('Password is incorrect', ERROR_CODE.BadRequest)
  }

  // Tüm kullanıcı verilerini sil
  await Promise.all(
    relatedUserModels.map(
      async model => await model.deleteMany({ user: userId }),
    ),
  )
  const data = await User.findByIdAndDelete(userId)

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function userMeUpdate(req: Request, res: Response) {

  const allowedUpdateKeys = [
    'firstName',
    'lastName',
    'email',
    'password',
    'defaultWallet',
    'defaultWalletCurrency',
    'avatar',
  ]
  const updateKeys = Object.keys(req.body)
  const isValidOperation = updateKeys.every(update =>
    allowedUpdateKeys.includes(update),
  )

  if (!isValidOperation) {
    throw new ApiError('Invalid updates', ERROR_CODE.InvalidParameters)
  }

  const user = await User.findOne({ _id: req.user.id })

  if (!user) {
    throw new ApiError('User not found', ERROR_CODE.EntityNotFound)
  }

  const { ...updates } = req.body

  user.set({
    ...updates,
  })
  const response = await user.save()

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(response),
  })
}

interface UserMePasswordUpdateBody {
  oldPassword: string
  newPassword: string
}

async function userMePasswordUpdate(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body as UserMePasswordUpdateBody

  // Kullanıcıyı bul
  const user = await User.findById(req.user.id).select('+password')

  if (!user) {
    throw new ApiError('User not found', ERROR_CODE.EntityNotFound)
  }

  // Eski şifreyi kontrol et
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password)

  if (!isPasswordValid) {
    throw new ApiError('Old password is incorrect', ERROR_CODE.BadRequest)
  }

  // Yeni şifre eskisiyle aynı olmamalı
  const isSamePassword = await bcrypt.compare(newPassword, user.password)

  if (isSamePassword) {
    throw new ApiError(
      'New password cannot be the same as the old password',
      ERROR_CODE.BadRequest,
    )
  }

  // Yeni şifreyi hashle
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  // Şifreyi güncelle
  user.password = hashedPassword
  user.passwordChangedAt = new Date()
  const data = await user.save()

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

export { userMeDelete, userMeGet, userMePasswordUpdate, userMeUpdate }
