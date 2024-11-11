import { Request, Response } from 'express';

import { Setting } from '../../model/lumara/setting';
import { User } from '../../model/lumara/user';
import { Wallet } from '../../model/lumara/wallet';
import { Transaction } from '../../model/lumara/transaction';
import { Calculation } from '../../model/lumara/calculation';
import { WalletAccessor } from '../../model/lumara/wallet-accessor';
import { Wishlist } from '../../model/lumara/wishlist';
import { WishlistAccessor } from '../../model/lumara/wishlist-accessor';
import mongoose from 'mongoose';

async function settingGet(req: Request, res: Response) {
  try {
    const setting = await Setting.findOne({
      user: req.user._id,
    });

    if (!setting) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Setting not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Setting fetched successfully',
      data: setting,
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

async function settingUpdate(req: Request, res: Response) {
  try {
    const setting = await Setting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!setting) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Setting not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Setting updated successfully',
      data: setting
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

async function settingBackup(req: Request, res: Response) {
  try {
    const userId = req.user.id;

    const [
      calculations,
      settings,
      transactions,
      user,
      wallets,
      walletAccessors,
      wishlists,
      wishlistAccessors
    ] = await Promise.all([
      Calculation.find({ user: userId }).lean(),
      Setting.findOne({ user: userId }).lean(),
      Transaction.find({ user: userId })
        .populate('wallet')
        .populate('transactionCategory')
        .populate('transactionBrand')
        .lean(),
      User.findById(userId).lean(),
      Wallet.find({ user: userId })
        .populate('walletType')
        .lean(),
      WalletAccessor.find({ user: userId }).lean(),
      Wishlist.find({ user: userId }).lean(),
      WishlistAccessor.find({ user: userId }).lean()
    ]) as any[];

    // Hassas bilgileri temizle
    delete user.password;
    delete user.passwordChangedAt;

    const backupData = {
      calculations,
      settings,
      transactions,
      user,
      wallets,
      walletAccessors,
      wishlists,
      wishlistAccessors
    };

    // JSON dosyası olarak gönder
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    return res.response({
      status: 'success',
      code: 200,
      message: 'Backup created successfully',
      data: backupData
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to create backup',
      details: error.message
    });
  }
}

// Restore from backup
async function settingRestore(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const backupData = req.body;

    // Backup verisini doğrula
    if (!backupData || typeof backupData !== 'object') {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid backup data'
      });
    }

    // Mevcut kullanıcının verilerini temizle
    await Promise.all([
      Calculation.deleteMany({ user: userId }),
      Setting.deleteMany({ user: userId }),
      Transaction.deleteMany({ user: userId }),
      Wallet.deleteMany({ user: userId }),
      WalletAccessor.deleteMany({ user: userId }),
      Wishlist.deleteMany({ user: userId }),
      WishlistAccessor.deleteMany({ user: userId })
    ]);

    // Backup verilerini geri yükle
    await Promise.all([
      backupData.calculations?.length > 0 &&
      Calculation.insertMany(
        backupData.calculations.map((item: any) => ({ ...item, user: userId }))
      ),
      backupData.settings &&
      Setting.create({ ...backupData.settings, user: userId }),
      backupData.transactions?.length > 0 &&
      Transaction.insertMany(
        backupData.transactions.map((item: any) => ({ ...item, user: userId }))
      ),
      backupData.wallets?.length > 0 &&
      Wallet.insertMany(
        backupData.wallets.map((item: any) => ({ ...item, user: userId }))
      ),
      backupData.walletAccessors?.length > 0 &&
      WalletAccessor.insertMany(
        backupData.walletAccessors.map((item: any) => ({ ...item, user: userId }))
      ),
      backupData.wishlists?.length > 0 &&
      Wishlist.insertMany(
        backupData.wishlists.map((item: any) => ({ ...item, user: userId }))
      ),
      backupData.wishlistAccessors?.length > 0 &&
      WishlistAccessor.insertMany(
        backupData.wishlistAccessors.map((item: any) => ({ ...item, user: userId }))
      )
    ].filter(Boolean)); // undefined olanları filtrele

    // User bilgilerini güncelle (password ve hassas bilgiler hariç)
    if (backupData.user) {
      const { password, passwordChangedAt, role, ...userData } = backupData.user;
      await User.findByIdAndUpdate(
        userId,
        { ...userData, id: userId }
      );
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Backup restored successfully',
      data: null
    });

  } catch (error: any) {
    console.error('Restore error:', error);
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to restore backup',
      details: error.message
    });
  }
}

// Factory Reset
async function settingReset(req: Request, res: Response) {
  try {
    const userId = req.user.id;

    // Tüm kullanıcı verilerini temizle
    await Promise.all([
      Calculation.deleteMany({ user: userId }),
      Setting.deleteMany({ user: userId }),
      Transaction.deleteMany({ user: userId }),
      Wallet.deleteMany({ user: userId }),
      WalletAccessor.deleteMany({ user: userId }),
      Wishlist.deleteMany({ user: userId }),
      WishlistAccessor.deleteMany({ user: userId })
    ]);

    // User'ı varsayılan ayarlara döndür
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatarUrl: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
        },
        $unset: {
          defaultWallet: 1,
          defaultWalletCurrency: 1
        }
      }
    );

    // Yeni settings oluştur
    await Setting.create({
      user: userId,
      // Varsayılan ayarlar
      theme: 'light',
      language: 'en',
      currency: 'USD',
      // ... diğer varsayılan ayarlar
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Factory reset completed successfully',
      data: null
    });

  } catch (error: any) {
    console.error('Factory reset error:', error);
    return res.response({
      status: 'error',
      code: 500,
      message: 'Failed to complete factory reset',
      details: error.message
    });
  }
}

export { settingGet, settingUpdate, settingBackup, settingRestore, settingReset };
