import { Request, Response } from 'express'
import { Socket } from 'socket.io'

import { db } from '../client'

function connectWishList(req: Request, res: Response) {
  try {
    const io = req.io

    io.on('connection', (socket: Socket) => {
      socket.on('join', userId => {
        socket.join(userId)
      })
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function createWishList(req: Request, res: Response) {
  try {
    const { productUrl, userId } = req.body

    const response = await db.wishList.create({
      data: {
        productUrl,
        userId,
      },
    })

    return res.status(200).json({
      message: 'wishList added',
      data: {
        wishList: response,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function listWishList(req: Request, res: Response) {
  try {
    const userId = req.query.userId

    const wishList = await db.wishList.findMany({
      where: {
        userId: userId as string,
      },
    })

    return res.status(200).json({
      message: 'wish list found',
      data: {
        wishList,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

export { connectWishList, createWishList, listWishList }
