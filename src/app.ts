import './client/env'
import './config/db'

import { createServer } from 'http'

import cors from 'cors'
import express from 'express'
import kill from 'kill-port'
import { Server, Socket } from 'socket.io'

import { errorHandler, logger } from './client'
import { CONFIG } from './config'
import { middlewareAuth, middlewareResponse } from './middleware'
import {
  userRouter,
  authRouter,
  groupRouter,
  linkPreviewRouter,
  socketRouter,
  stockRouter,
  transactionBrandRouter,
  transactionCategoryRouter,
  transactionRouter,
  urlShortenerRouter,
  walletRouter,
  walletTypeRouter
} from './routes/v1'

logger.debug(`app.ts -> env: ${process.env.NODE_ENV}`)

const app = express()

//!REQUIREMENTS
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const httpServer = createServer(app)

const io = new Server(httpServer)

app.use(function (req, res, next) {
  req.io = io
  next()
})

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

app.post('/kill', async (_req, res) => {
  try {
    res.status(200).json({ message: 'ok' })
    await kill(CONFIG.port)
  } catch (error) {
    res.send('error')
  }
})

//! routes
app.use(middlewareResponse)
app.use(authRouter)
app.use(middlewareAuth, userRouter)
app.use(middlewareAuth, transactionRouter)
app.use(middlewareAuth, transactionBrandRouter)
app.use(middlewareAuth, transactionCategoryRouter)
app.use(middlewareAuth, groupRouter)
app.use(middlewareAuth, walletRouter)
app.use(middlewareAuth, walletTypeRouter)
app.use(linkPreviewRouter)
app.use(socketRouter)
app.use(stockRouter)
app.use(urlShortenerRouter)

//! socket.io
io.on('connection', (socket: Socket) => {
  logger.info('connection')

  // Kullanıcıyı kendi kanalına katılma işlemi
  socket.on('join', userId => {
    socket.join(userId)
    logger.info(`Kullanıcı ${userId} kendi kanalına katıldı.`)
  })
})


httpServer.listen(CONFIG.port)

// get the unhandled rejection and throw it to another fallback handler we already have.
process.on('unhandledRejection', (error: Error, _promise: Promise<any>) => {
  logger.error('unhandledRejection')
  logger.error(error)
  throw error
})

process.on('uncaughtException', (error: Error) => {
  logger.error('uncaughtException')
  logger.error(error)
  errorHandler.handleError(error)
  if (!errorHandler.isTrustedError(error)) {
    process.exit(1)
  }
})
