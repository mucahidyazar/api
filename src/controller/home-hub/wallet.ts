import { Request, Response } from 'express';

import { Transaction } from '../../model/home-hub/transaction';
import { Wallet } from '../../model/home-hub/wallet';
import { WalletAccessor } from '../../model/home-hub/wallet-accessor';
import { WalletBalance } from '../../model/home-hub/wallet-balance';
import { User } from '../../model/home-hub/user';
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

    return res.response({
      status: 'success',
      code: 201,
      message: 'Wallet created successfully',
      data: wallet
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

async function walletList(req, res: Response) {
  try {
    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id);
    const totalItems = await Wallet.countDocuments({
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    });
    const query = Wallet.find({
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
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
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function walletGet(req: Request, res: Response) {
  try {
    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id);

    const query = Wallet.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    });
    queryHelper({
      queries: { ...req.query },
      query,
    })
    query.populate({
      path: 'walletAccessors',
      populate: {
        path: 'user',
      }
    })

    const wallet = await query.exec();

    if (!wallet) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wallet fetched successfully',
      data: wallet,
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

async function walletUpdate(req: Request, res: Response) {
  try {
    const { walletBalances = [], ...restBody } = req.body

    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id);

    if (walletBalances.length) {
      const wallet = await Wallet.findOne({
        _id: req.params.id,
        $or: [
          { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
          { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
        ]
      });
      if (!wallet) {
        return res.response({
          status: 'error',
          code: 404,
          message: 'Wallet not found',
        });
      }
      const walletBalanceIds = wallet.walletBalances.map(balance => balance._id);
      await WalletBalance.deleteMany({ _id: { $in: walletBalanceIds } });
      const savedWalletBalances = await WalletBalance.insertMany(walletBalances);
      restBody.walletBalances = savedWalletBalances.map(balance => balance.id);
    }

    const wallet = await Wallet.findOneAndUpdate({
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    }, restBody, { new: true });
    if (!wallet) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wallet updated successfully',
      data: wallet
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

async function walletDelete(req: Request, res: Response) {
  try {
    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id);

    const wallet = await Wallet.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Wallet deleted successfully',
      data: wallet
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

async function walletTransactionList(req: Request, res: Response) {
  try {
    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id);

    const wallet = await Wallet.findById({
      _id: req.params.id,
      $or: [
        { user: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { walletAccessors: { $in: accessorWalletIds } } // Kullanıcı accessors'da mı?
      ]
    }).populate('walletBalances');
    if (!wallet) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet not found',
      });
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
    return res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wallet transactions.",
    });
  }
}

async function walletAccessorsCreate(req: Request, res: Response) {
  try {
    const response = await Wallet.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!response) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet not found.',
      });
    }

    const isAdmin = req.user.role === "admin"
    const isWalletOwner = response.user.toString() === req.user.id
    if (!isAdmin && !isWalletOwner) {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }

    const accessorEmails = req.body.accessors;
    const accessorsUsersResponse = await User.find({ email: { $in: accessorEmails } });

    const accessorsResponse = await WalletAccessor.insertMany(accessorsUsersResponse.map(user => ({
      user: user.id,
    })));
    const allAccessorrs = response.walletAccessors.concat(accessorsResponse.map(accessor => accessor.id));
    const uniqueAccessors = [...new Set(allAccessorrs)];
    response.walletAccessors = uniqueAccessors;
    response.save();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Accessors added successfully',
      data: response,
    });
  } catch (error) {
    return res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wallet transactions.",
    });
  }
}

async function walletAccessorsDelete(req: Request, res: Response) {
  try {
    const accessorId = req.params.accessorId;
    const walletId = req.params.id

    const response = await Wallet.findOne({
      _id: walletId,
      user: req.user?.id,
    });
    if (!response) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Wallet not found.',
      });
    }

    const isAdmin = req.user.role === "admin"
    const isWalletOwner = response.user.toString() === req.user.id
    const isAccessor = accessorId === req.user.id
    if (!isAdmin && !isWalletOwner && !isAccessor) {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden',
      });
    }

    await WalletAccessor.deleteOne({ user: accessorId });
    response.walletAccessors = response.walletAccessors.filter(accessor => accessor._id.toString() !== accessorId);
    response.save();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Accessors deleted successfully',
      data: response,
    });
  } catch (error) {
    return res.response({
      status: 'error',
      code: 500,
      message: "An error occurred while fetching wallet transactions.",
    });
  }
}

export { walletCreate, walletDelete, walletGet, walletList, walletUpdate, walletTransactionList, walletAccessorsCreate, walletAccessorsDelete };
