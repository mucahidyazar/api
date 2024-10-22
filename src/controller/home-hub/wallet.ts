import { Request, Response } from 'express';

import { Wallet } from '../../model/home-hub/wallet';
import { WalletBalance } from '../../model/home-hub/wallet-balance';
import { Transaction } from '../../model/home-hub/transaction';
import { Accessor } from '../../model/home-hub/accessor';
import { queryHelper } from '../../helpers/query-helper';

async function walletCreate(req: Request, res: Response) {
  try {
    const savedWalletBalances = await WalletBalance.insertMany(req.body.balances);
    const walletBalanceIds = savedWalletBalances.map(balance => balance.id);

    const wallet = new Wallet({
      ...req.body,
      walletBalances: walletBalanceIds,
      user: req.user?.id,
    });
    await wallet.save();
    return res.status(201).json({ data: wallet });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletList(req, res: Response) {
  try {
    const accessors = await Accessor.find({ user: req.user?.id }).select('modelId');
    const accessorWalletIds = accessors.map(accessor => accessor.modelId);
    const totalItems = await Wallet.countDocuments({
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { _id: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    });
    const query = Wallet.find({
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { _id: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    })
    const { metadata } = queryHelper({
      queries: { ...req.query, totalItems },
      query,
    });

    const response = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wallet list fetched successfully',
      data: response,
      metadata
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletGet(req: Request, res: Response) {
  try {
    const query = Wallet.findById(req.params.id);
    queryHelper({
      queries: { ...req.query },
      query,
    });

    const wallet = await query.exec();

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.json({ data: wallet });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletUpdate(req: Request, res: Response) {
  try {
    const { walletBalances = [], ...restBody } = req.body
    if (walletBalances.length) {
      const wallet = await Wallet.findById(req.params.id);
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      const walletBalanceIds = wallet.walletBalances.map(balance => balance._id);
      await WalletBalance.deleteMany({ _id: { $in: walletBalanceIds } });
      const savedWalletBalances = await WalletBalance.insertMany(walletBalances);
      restBody.walletBalances = savedWalletBalances.map(balance => balance.id);
    }

    const wallet = await Wallet.findByIdAndUpdate(req.params.id, restBody, { new: true });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    return res.json({ data: wallet });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletDelete(req: Request, res: Response) {
  try {
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.json({ message: 'Wallet deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletTransactionsList(req: Request, res: Response) {
  try {
    const wallet = await Wallet.findById(req.params.id).populate('walletBalances');
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
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

    const response = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wallet list fetched successfully',
      data: response,
      metadata
    });
  } catch (error) {
    console.error(error);
    res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wallet transactions.",
    });
  }
}

export { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionsList };
