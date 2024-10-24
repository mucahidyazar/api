import { Request, Response } from 'express';

import { WalletBalance } from '../../model/home-hub/wallet-balance';

async function walletBalanceCreate(req: Request, res: Response) {
  try {
    const walletBalance = new WalletBalance(req.body);
    await walletBalance.save();
    return res.response({
      status: 'success',
      code: 201,
      message: 'WalletBalance created successfully',
      data: walletBalance,
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

async function walletBalanceList(req: Request, res: Response) {
  try {
    const walletBalances = await WalletBalance.find(req.query);

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletBalance list fetched successfully',
      data: walletBalances,
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

async function walletBalanceGet(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findById(req.params.id);
    if (!walletBalance) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletBalance not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletBalance fetched successfully',
      data: walletBalance,
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

async function walletBalanceUpdate(req: Request, res: Response) {
  try {
    const walletBalance = await WalletBalance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!walletBalance) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletBalance not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletBalance updated successfully',
      data: walletBalance
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

async function walletBalanceDelete(req: Request, res: Response) {
  try {
    const response = await WalletBalance.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletBalance not found',
      });
    }
    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletBalance deleted successfully',
      data: response,
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

export { walletBalanceCreate, walletBalanceDelete, walletBalanceGet, walletBalanceList, walletBalanceUpdate };
