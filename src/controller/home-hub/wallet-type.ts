import { Request, Response } from 'express';

import { WalletType } from '../../model/home-hub/wallet-type';

async function walletTypeCreate(req: Request, res: Response) {
  try {
    const walletType = new WalletType(req.body);
    await walletType.save();
    return res.status(201).json({ data: walletType });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletTypeList(req: Request, res: Response) {
  try {
    const walletTypes = await WalletType.find(req.query);
    return res.json({ data: walletTypes });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletTypeGet(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findById(req.params.id);
    if (!walletType) {
      return res.status(404).json({ message: 'WalletType not found' });
    }
    return res.json({ data: walletType });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletTypeUpdate(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!walletType) {
      return res.status(404).json({ message: 'WalletType not found' });
    }
    return res.json({ data: walletType });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function walletTypeDelete(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findByIdAndDelete(req.params.id);
    if (!walletType) {
      return res.status(404).json({ message: 'WalletType not found' });
    }
    return res.json({ message: 'WalletType deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export { walletTypeCreate, walletTypeDelete, walletTypeGet, walletTypeList, walletTypeUpdate };
