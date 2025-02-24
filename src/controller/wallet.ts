import { Request, Response } from 'express'
import { z } from 'zod'

import { ERROR_CODE, ROUTES } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { queryHelper } from '@/helpers'
import { Transaction } from '@/model/transaction'
import { User } from '@/model/user'
import { Wallet } from '@/model/wallet'
import { IWalletAccessor, WalletAccessor } from '@/model/wallet-accessor'
import { WalletBalance } from '@/model/wallet-balance'
import { WalletType } from '@/model/wallet-type'
import { PaginationRequestParameters, walletCreateDto } from '@/requestModel'
import { PushNotificationService } from '@/services/push-notification'
import { ApiResponse, apiResponseSchema } from '@/utils'
import {
  ApiBody,
  ApiOperation,
  DApiResponse,
  Delete,
  Get,
  Post,
  Put,
} from '@/utils/decorator-factory'

import { BaseController } from './base.controller'

export class WalletController extends BaseController {
  @Post(ROUTES.v1.wallet.create)
  @ApiOperation({
    operationId: 'walletCreate',
    description: 'Create a new wallet',
    tags: ['Wallet'],
    summary: 'Create wallet',
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, walletCreateDto)
  @DApiResponse(201, 'Wallet created successfully', apiResponseSchema(true))
  @DApiResponse(400, 'Invalid request body', apiResponseSchema(false))
  public async walletCreate(
    req: Request<any, any, z.infer<typeof walletCreateDto>>,
    res: Response,
  ) {
    const requestModel = req.body

    const {
      accessorEmails = [],
      walletBalances = [],
      ...walletCreateData
    } = requestModel

    const hasPlatform = await WalletType.checkHasPlatform(
      walletCreateData.walletTypeId,
    )

    if (hasPlatform && walletCreateData.platform.trim().length < 1) {
      throw new ApiError(
        'Platform is required for this wallet type',
        ERROR_CODE.InvalidParameters,
      )
    }

    const newWallet = new Wallet({
      ...walletCreateData,
      walletType: walletCreateData.walletTypeId,
      createdBy: req.user?.id,
    })
    const savedWallet = await newWallet.save()

    walletBalances.forEach(async balance => {
      const newBalance = new WalletBalance({
        ...balance,
        wallet: savedWallet.id,
        createdBy: req.user?.id,
      })
      await newBalance.save()
    })

    if (accessorEmails.length > 0) {
      const users = await User.find({ email: { $in: accessorEmails } })

      const accessorsToCreate = users.map(
        user =>
          ({
            walletAccessorStatus: 'pending',
            wallet: savedWallet.id,
            accessor: user.id,
            createdBy: req.user?.id,
          }) as IWalletAccessor,
      )

      await WalletAccessor.insertMany(accessorsToCreate)
    }

    return res.response({
      statusCode: 201,
      apiResponse: ApiResponse.success(savedWallet),
    })
  }

  @Get(ROUTES.v1.wallet.list)
  @ApiOperation({
    operationId: 'walletList',
    summary: 'List wallets',
    description: 'List all wallets for the current user',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @DApiResponse(
    200,
    'Wallets listed successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletList(req: Request, res: Response) {
    const accessors = await WalletAccessor.find({
      accessor: req.user?.id,
      walletAccessorStatus: 'active',
    })

    const accessorWalletIds = accessors.map(accessor => accessor.wallet)

    const filter = {
      $or: [{ createdBy: req.user?.id }, { _id: { $in: accessorWalletIds } }],
    }

    const query = Wallet.find(filter)

    const { metadata } = await queryHelper({
      queryStrings: PaginationRequestParameters.parse(req.query),
      query,
    })

    const wallets = await query
      .populate({
        path: 'createdBy',
      })
      .populate({
        path: 'walletType',
      })
      .populate({
        path: 'walletBalances',
      })
      .populate({
        path: 'accessors',
        match: { status: 'active', walletAccessorStatus: 'active' },
        populate: {
          path: 'accessor',
        },
      })
      .exec()

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(wallets, metadata),
    })
  }

  @Get(ROUTES.v1.wallet.get)
  @ApiOperation({
    operationId: 'walletGet',
    summary: 'Get a wallet by ID',
    description: 'Get a wallet by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet retrieved successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletGet(req: Request, res: Response) {
    const walletId = req.params.id
    const userId = req.user?.id

    // Kullanıcının erişebileceği wallet erişimcilerini alın
    const accessibleWalletIds = await WalletAccessor.find({
      createdBy: userId,
      walletAccessorStatus: 'active',
    }).distinct('wallet')

    // Wallet'ı bulun ve ilişkili alanları populate edin
    const wallet = await Wallet.findOne({
      _id: walletId,
      $or: [{ createdBy: userId }, { _id: { $in: accessibleWalletIds } }],
    })
      .populate('createdBy', 'firstName lastName email') // User bilgilerini sadece name ve email ile getir
      .populate('walletBalances')
      .populate('walletType')
      .populate({
        path: 'accessors',
        populate: { path: 'accessor', select: 'firstName lastName email' }, // Accessor'ların user bilgilerini ekle
      })

    if (!wallet) {
      throw new ApiError(
        'Wallet not found or access denied',
        ERROR_CODE.EntityNotFound,
      )
    }

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(wallet),
    })
  }

  @Put(ROUTES.v1.wallet.update)
  @ApiOperation({
    operationId: 'walletUpdate',
    summary: 'Update a wallet by ID',
    description: 'Update a wallet by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet updated successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletUpdate(req: Request, res: Response) {
    const { accessors = [], ...bodyData } = req.body

    //! get accessor ids from db
    const dbAccessors = await WalletAccessor.find({ createdBy: req.user?.id })
    const dbAccessorsIds = dbAccessors.map(dbAccessor => dbAccessor.id)

    //! update wallet
    const wallet = await Wallet.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { createdBy: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
          { accessors: { $in: dbAccessorsIds } }, // Kullanıcı accessors'da mı?
        ],
      },
      bodyData,
      { new: true },
    )

    if (!wallet) {
      throw new ApiError(
        'Wallet not found or access denied',
        ERROR_CODE.EntityNotFound,
      )
    }

    // Gelen accessors listesini ekle
    if (accessors.length) {
      await WalletAccessor.deleteMany({ wallet: wallet.id })

      for (const accessor of accessors) {
        if (accessor.action === 'initial') {
          const user = await User.findOne({ email: accessor.user.email })

          if (!user) break

          // Yeni item ekle
          await WalletAccessor.create({
            walletAccessorStatus: 'pending',
            wallet: wallet._id,
            accessor: user?.id,
          })
        } else if (accessor.action === 'updated') {
          // maybe later we can have
        } else if (accessor.action === 'deleted') {
          // Item bul
          const walletAccessor = await WalletAccessor.findOne({
            _id: accessor.id,
            wallet: wallet.id,
          })

          const isUserSelf = walletAccessor?.accessor === req.user.id
          const isUserWalletOwner = wallet.createdBy === req.user.id

          if (isUserSelf || isUserWalletOwner) {
            await walletAccessor?.deleteOne()
            await walletAccessor?.save()
          }
        }
      }
    }

    // Güncellenmiş wallet'i döndür
    const updatedWallet = await Wallet.findById(wallet._id)
      .populate('createdBy', 'firstName lastName email') // User bilgilerini sadece name ve email ile getir
      .populate('walletBalances')
      .populate('walletType')
      .populate({
        path: 'accessors',
        populate: { path: 'accessor', select: 'firstName lastName email' }, // Accessor'ların user bilgilerini ekle
      })

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(updatedWallet),
    })
  }

  @Delete(ROUTES.v1.wallet.delete)
  @ApiOperation({
    operationId: 'walletDelete',
    summary: 'Delete a wallet by ID',
    description: 'Delete a wallet by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet deleted successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletDelete(req: Request, res: Response) {
    //! get wallet accessors
    const accessors = await WalletAccessor.find({ user: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id)

    //! get wallet
    const data = await Wallet.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { accessors: { $in: accessorWalletIds } }, // Kullanıcı accessors'da mı?
      ],
    })

    if (!data) {
      throw new ApiError(
        'Wallet not found or access denied',
        ERROR_CODE.EntityNotFound,
      )
    }

    //! delete wallet balances
    await WalletBalance.find({ wallet: req.params.id }).deleteMany()

    //! delete wallet accessors
    await WalletAccessor.find({ wallet: req.params.id }).deleteMany()

    //! delete wallet
    await data.deleteOne()

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(data),
    })
  }

  @Get(ROUTES.v1.wallet.transaction.list)
  @ApiOperation({
    operationId: 'walletTransactionList',
    summary: 'List transactions for a wallet',
    description: 'List all transactions for a wallet by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Transactions listed successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletTransactionList(req: Request, res: Response) {
    const accessors = await WalletAccessor.find({ createdBy: req.user?.id })
    const accessorWalletIds = accessors.map(accessor => accessor.id)

    const wallet = await Wallet.findById({
      _id: req.params.id,
      $or: [
        { createdBy: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { accessors: { $in: accessorWalletIds } }, // Kullanıcı accessors'da mı?
      ],
    })

    if (!wallet) {
      throw new ApiError(
        'Wallet not found or access denied',
        ERROR_CODE.EntityNotFound,
      )
    }
    const walletBalances = await WalletBalance.find({ wallet: wallet.id })
    const walletBalanceIds = walletBalances.map(balance => balance._id)

    const filter = {
      $or: [
        { createdBy: req.user?.id }, // Kullanıcı wallet'ın sahibi mi?
        { _id: { $in: walletBalanceIds } }, // Kullanıcı accessors'da mı?
      ],
    }
    const query = Transaction.find(filter)

    const { metadata } = await queryHelper({
      queryStrings: PaginationRequestParameters.parse(req.query),
      query,
    })

    const data = await query.exec()

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(data, metadata),
    })
  }

  @Post(ROUTES.v1.wallet.accessor.create)
  @ApiOperation({
    operationId: 'walletAccessorCreate',
    summary: 'Create a new wallet accessor',
    description: 'Create a new wallet accessor for a wallet',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    201,
    'Wallet accessor created successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletAccessorCreate(req: Request, res: Response) {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      createdBy: req.user?.id,
    })
    if (!wallet) {
      throw new ApiError('Wallet not found', ERROR_CODE.EntityNotFound)
    }

    const isAdmin = req.user.role === 'admin'
    const isWalletOwner = wallet.createdBy === req.user.id
    if (!isAdmin && !isWalletOwner) {
      throw new ApiError('Unauthorized', ERROR_CODE.Unauthorized)
    }

    const user = await User.findOne({ email: req.body.email })
    const accessorCheck = await WalletAccessor.findOne({
      accessor: user?.id,
      wallet: req.params.id,
    })
    if (accessorCheck) {
      throw new ApiError('Accessor already exists', ERROR_CODE.DuplicateEntry)
    }

    const newAccessor = new WalletAccessor({
      accessor: user?.id,
      wallet: req.params.id,
    })
    const data = await newAccessor.save()

    await PushNotificationService.sendNotification({
      userId: user?.id,
      title: 'New Wallet Access',
      body: `${req.user.firstName} shared a wallet with you`,
      data: {
        type: 'WISHLIST_ACCESS_INVITE',
        wallet: wallet.toJSON(),
        sender: req.user,
      },
      notification: {
        invite: {
          type: 'WalletAccessor',
          id: data.id,
        },
      },
      options: {
        categoryId: 'WISHLIST_ACCESS',
      },
    })

    return res.response({
      statusCode: 201,
      apiResponse: ApiResponse.success(data),
    })
  }

  @Delete(ROUTES.v1.wallet.accessor.delete)
  @ApiOperation({
    operationId: 'walletAccessorDelete',
    summary: 'Delete a wallet accessor',
    description: 'Delete a wallet accessor by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet accessor deleted successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletAccessorDelete(req: Request, res: Response) {
    const accessorId = req.params.accessorId

    const data = await WalletAccessor.findOneAndDelete({
      _id: accessorId,
    })

    if (!data) {
      throw new ApiError('Accessor not found', ERROR_CODE.EntityNotFound)
    }

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(data),
    })
  }

  @Put(ROUTES.v1.wallet.accessor.update)
  @ApiOperation({
    operationId: 'walletAccessorUpdate',
    summary: 'Update a wallet accessor',
    description: 'Update a wallet accessor by its ID',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet accessor updated successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletAccessorUpdate(req: Request, res: Response) {
    const allowedFields = ['status']
    const updates = Object.keys(req.body).filter(field =>
      allowedFields.includes(field),
    )
    const isValidOperation = updates.every(update =>
      allowedFields.includes(update),
    )

    if (!isValidOperation) {
      throw new ApiError('Invalid updates', ERROR_CODE.InvalidParameters)
    }

    const accessor = await WalletAccessor.findOne({
      _id: req.params.accessorId,
      wallet: req.params.id,
    })

    if (!accessor) {
      throw new ApiError('Accessor not found', ERROR_CODE.EntityNotFound)
    }

    // eslint-disable-next-line security/detect-object-injection
    updates.forEach(update => (accessor[update] = req.body[update]))
    const data = await accessor.save()

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(data),
    })
  }

  @Get(ROUTES.v1.wallet.type.list)
  @ApiOperation({
    operationId: 'walletTypeList',
    summary: 'List wallet types',
    description: 'List all wallet types',
    tags: ['Wallet'],
    security: {
      bearerAuth: [],
    },
  })
  @ApiBody(true, z.object({}))
  @DApiResponse(
    200,
    'Wallet types listed successfully',
    apiResponseSchema(true, z.object({})),
  )
  @DApiResponse(401, 'Unauthorized', apiResponseSchema(false))
  @DApiResponse(403, 'Forbidden', apiResponseSchema(false))
  @DApiResponse(404, 'Not Found', apiResponseSchema(false))
  @DApiResponse(500, 'Internal Server Error', apiResponseSchema(false))
  public async walletTypeList(req: Request, res: Response) {
    const walletTypes = await WalletType.find(req.query)

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success(walletTypes),
    })
  }
}

export default WalletController
