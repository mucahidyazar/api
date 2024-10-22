import { Request, Response } from 'express';

import { WalletBalance } from '../../model/home-hub/wallet-balance';

async function walletBalanceCreate(req: Request, res: Response) {
  try {
    const walletBalance = new WalletBalance(req.body);
    await walletBalance.save();
    return res.status(201).json({ data: walletBalance });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletBalanceList(req: Request, res: Response) {
  try {
    const walletBalances = await WalletBalance.find(req.query);
    return res.json({ data: walletBalances });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletBalanceGet(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findById(req.params.id);
    if (!walletBalance) {
      return res.status(404).json({ message: 'WalletBalance not found' });
    }
    return res.json({ data: walletBalance });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletBalanceUpdate(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!walletBalance) {
      return res.status(404).json({ message: 'WalletBalance not found' });
    }
    return res.json({ data: walletBalance });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletBalanceDelete(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findByIdAndDelete(req.params.id);
    if (!walletBalance) {
      return res.status(404).json({ message: 'WalletBalance not found' });
    }
    return res.json({ message: 'WalletBalance deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export { walletBalanceCreate, walletBalanceDelete, walletBalanceGet, walletBalanceList, walletBalanceUpdate };
