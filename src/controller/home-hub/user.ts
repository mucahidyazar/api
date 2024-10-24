import { Request, Response } from 'express'
import { User } from '../../model/home-hub/user'

// userMe
// userCreate
// userDelete
// userGet
// userList
async function userMe(req: Request & { user?: any }, res: Response) {
  if (!req.user) {
    return res.response({
      status: 'error',
      code: 401,
      message: 'Unauthorized'
    })
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'User fetched successfully',
    data: req.user
  })
}

async function userCreate(req: Request, res: Response) {
  try {
    const user = new User(req.body)
    await user.save()
    return res.response({
      status: 'success',
      code: 201,
      message: 'User created successfully',
      data: user
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userDelete(req: Request, res: Response) {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id
    })

    if (user?.id !== req.user?.id && req.user.role !== "admin") {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden'
      })
    }

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'User deleted successfully',
      data: user
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userGet(req: Request, res: Response) {
  try {
    const user = await User.findOne({
      _id: req.params.id
    })

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      })
    }

    if (user?.id !== req.user?.id && req.user.role !== "admin") {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden'
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'User fetched successfully',
      data: user
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userList(req: Request, res: Response) {
  try {
    const users = await User.find()
    return res.response({
      status: 'success',
      code: 200,
      message: 'User list fetched successfully',
      data: users
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

async function userUpdate(req: Request, res: Response) {
  try {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'email',
      'password',
      'avatarUrl',
      'defaultWallet',
      'defaultWalletCurrency',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.response({
        status: 'error',
        code: 400,
        message: 'Invalid updates'
      })
    }

    const user = await User.findOne(
      { _id: req.params.id },
    );

    if (!user) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found'
      })
    }

    if (user?.id !== req.user?.id && req.user.role !== "admin") {
      return res.response({
        status: 'error',
        code: 403,
        message: 'Forbidden'
      })
    }

    user.set(req.body)
    const response = await user.save()

    return res.response({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
      data: response
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    })
  }
}

export {
  userMe,
  userCreate,
  userDelete,
  userGet,
  userList,
  userUpdate
}


