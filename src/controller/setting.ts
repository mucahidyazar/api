import { Request, Response } from 'express'

import { DEFAULTS, ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { Calculation } from '@/model/calculation'
import { Setting } from '@/model/setting'
import { Transaction } from '@/model/transaction'
import { User } from '@/model/user'
import { Wallet } from '@/model/wallet'
import { WalletAccessor } from '@/model/wallet-accessor'
import { Wishlist } from '@/model/wishlist'
import { WishlistAccessor } from '@/model/wishlist-accessor'
import { ApiResponse } from '@/utils'

async function settingGet(req: Request, res: Response) {
  const data = await Setting.findOne({
    user: req.user._id,
  })

  if (!data) {
    throw new ApiError('Setting not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function settingUpdate(req: Request, res: Response) {
  const data = await Setting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  if (!data) {
    throw new ApiError('Setting not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function settingBackup(req: Request, res: Response) {
  const userId = req.user.id

  const [
    calculations,
    settings,
    transactions,
    user,
    wallets,
    walletAccessors,
    wishlists,
    wishlistAccessors,
  ] = (await Promise.all([
    Calculation.find({ user: userId }).lean(),
    Setting.findOne({ user: userId }).lean(),
    Transaction.find({ user: userId })
      .populate('wallet')
      .populate('transactionCategory')
      .populate('transactionBrand')
      .lean(),
    User.findById(userId).lean(),
    Wallet.find({ user: userId }).populate('walletType').lean(),
    WalletAccessor.find({ user: userId }).lean(),
    Wishlist.find({ user: userId }).lean(),
    WishlistAccessor.find({ user: userId }).lean(),
  ])) as any[]

  // Hassas bilgileri temizle
  delete user.password
  delete user.passwordChangedAt

  const data = {
    calculations,
    settings,
    transactions,
    user,
    wallets,
    walletAccessors,
    wishlists,
    wishlistAccessors,
  }

  // JSON dosyası olarak gönder
  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=backup-${Date.now()}.json`,
  )

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

// Restore from backup
async function settingRestore(req: Request, res: Response) {
  const userId = req.user.id
  const backupData = req.body

  // Backup verisini doğrula
  if (!backupData || typeof backupData !== 'object') {
    throw new ApiError('Invalid backup data', ERROR_CODE.InvalidParameters)
  }

  // Mevcut kullanıcının verilerini temizle
  await Promise.all([
    Calculation.deleteMany({ user: userId }),
    Setting.deleteMany({ user: userId }),
    Transaction.deleteMany({ user: userId }),
    Wallet.deleteMany({ user: userId }),
    WalletAccessor.deleteMany({ user: userId }),
    Wishlist.deleteMany({ user: userId }),
    WishlistAccessor.deleteMany({ user: userId }),
  ])

  // Backup verilerini geri yükle
  await Promise.all(
    [
      backupData.calculations?.length > 0 &&
        Calculation.insertMany(
          backupData.calculations.map((item: any) => ({
            ...item,
            user: userId,
          })),
        ),
      backupData.settings &&
        Setting.create({ ...backupData.settings, user: userId }),
      backupData.transactions?.length > 0 &&
        Transaction.insertMany(
          backupData.transactions.map((item: any) => ({
            ...item,
            user: userId,
          })),
        ),
      backupData.wallets?.length > 0 &&
        Wallet.insertMany(
          backupData.wallets.map((item: any) => ({ ...item, user: userId })),
        ),
      backupData.walletAccessors?.length > 0 &&
        WalletAccessor.insertMany(
          backupData.walletAccessors.map((item: any) => ({
            ...item,
            user: userId,
          })),
        ),
      backupData.wishlists?.length > 0 &&
        Wishlist.insertMany(
          backupData.wishlists.map((item: any) => ({ ...item, user: userId })),
        ),
      backupData.wishlistAccessors?.length > 0 &&
        WishlistAccessor.insertMany(
          backupData.wishlistAccessors.map((item: any) => ({
            ...item,
            user: userId,
          })),
        ),
    ].filter(Boolean),
  ) // undefined olanları filtrele

  // User bilgilerini güncelle (password ve hassas bilgiler hariç)
  if (backupData.user) {
    const { ...userData } = backupData.user
    await User.findByIdAndUpdate(userId, { ...userData, id: userId })
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

// Factory Reset
async function settingReset(req: Request, res: Response) {
  const userId = req.user.id

  // Tüm kullanıcı verilerini temizle
  await Promise.all([
    Calculation.deleteMany({ user: userId }),
    Setting.deleteMany({ user: userId }),
    Transaction.deleteMany({ user: userId }),
    Wallet.deleteMany({ user: userId }),
    WalletAccessor.deleteMany({ user: userId }),
    Wishlist.deleteMany({ user: userId }),
    WishlistAccessor.deleteMany({ user: userId }),
  ])

  // User'ı varsayılan ayarlara döndür
  await User.findByIdAndUpdate(userId, {
    $set: {
      avatarUrl:
        'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
    },
    $unset: {
      defaultWallet: 1,
      defaultWalletCurrency: 1,
    },
  })

  // Yeni settings oluştur
  await Setting.create({
    user: userId,
    // Varsayılan ayarlar
    theme: 'light',
    language: 'en',
    currency: DEFAULTS.currency,
    // ... diğer varsayılan ayarlar
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

export {
  settingBackup,
  settingGet,
  settingReset,
  settingRestore,
  settingUpdate,
}
