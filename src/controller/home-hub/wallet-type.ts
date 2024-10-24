import { Request, Response } from 'express';

import { WalletType } from '../../model/home-hub/wallet-type';

async function walletTypeCreate(req: Request, res: Response) {
  try {
    const walletType = new WalletType(req.body);
    await walletType.save();

    return res.response({
      status: 'success',
      code: 201,
      message: 'WalletType created successfully',
      data: walletType,
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

async function walletTypeList(req: Request, res: Response) {
  try {
    const walletTypes = await WalletType.find(req.query);

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletType list fetched successfully',
      data: walletTypes,
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

async function walletTypeGet(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findById(req.params.id);
    if (!walletType) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletType not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletType fetched successfully',
      data: walletType,
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

async function walletTypeUpdate(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!walletType) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletType not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletType updated successfully',
      data: walletType,
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

async function walletTypeDelete(req: Request, res: Response) {
  try {
    const walletType = await WalletType.findByIdAndDelete(req.params.id);
    if (!walletType) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'WalletType not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'WalletType deleted successfully',
      data: walletType,
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

export { walletTypeCreate, walletTypeDelete, walletTypeGet, walletTypeList, walletTypeUpdate };
