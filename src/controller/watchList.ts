import {Request, Response} from 'express'
import {Socket} from 'socket.io'

import {checkAllStocksRetry} from '../services/stock/helpers'

export function watchList(req: Request, res: Response) {
  try {
    const io = req.io
    const retry = Number(req.query.retry) || 1

    io.on('connection', (socket: Socket) => {
      console.log('a user connected')
      checkAllStocksRetry({
        socket,
        retry,
      })

      socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}
