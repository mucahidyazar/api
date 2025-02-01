import '@/client/env'
import '@/config/db'

import { createServer } from 'http'

import cors from 'cors'
import express from 'express'
// import kill from 'kill-port'
import { Server, Socket } from 'socket.io'

import { logger } from '@/client'
import { CONFIG } from '@/config'
import {
  middlewareError,
  middlewareAuth,
  middlewareResponse,
} from '@/middleware'
import {
  authRouter,
  userRouter,
  walletRouter,
  settingRouter,
  wishlistRouter,
  pushTokenRouter,
  transactionRouter,
  calculationRouter,
  notificationRouter,
  transactionBrandRouter,
  transactionCategoryRouter,
} from '@/routes/v1'

logger.debug(`app.ts -> env: ${process.env.NODE_ENV}`)

const app = express()

//!REQUIREMENTS
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.json({ limit: '1mb' }))

const httpServer = createServer(app)

const io = new Server(httpServer)

app.use(function (req, res, next) {
  req.io = io
  next()
})

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'ok' })
})

// app.post('/kill', async (_req, res) => {
//   try {
//     res.status(200).json({ message: 'ok' })
//     await kill(CONFIG.port)
//   } catch (error) {
//     res.status(500).json({ message: 'error' })
//   }
// })

//! routes
app.use(middlewareResponse)
app.use(authRouter)
app.use(middlewareAuth, userRouter)
app.use(middlewareAuth, calculationRouter)
app.use(middlewareAuth, notificationRouter)
app.use(middlewareAuth, pushTokenRouter)
app.use(middlewareAuth, settingRouter)
app.use(middlewareAuth, transactionRouter)
app.use(middlewareAuth, transactionBrandRouter)
app.use(middlewareAuth, transactionCategoryRouter)
app.use(middlewareAuth, walletRouter)
app.use(middlewareAuth, wishlistRouter)

app.use(middlewareError)

//! socket.io
io.on('connection', (socket: Socket) => {
  logger.info('connection')

  // Kullanıcıyı kendi kanalına katılma işlemi
  socket.on('join', user => {
    socket.join(user)
    logger.info(`Kullanıcı ${user} kendi kanalına katıldı.`)
  })
})

httpServer.listen(CONFIG.port)

// get the unhandled rejection and throw it to another fallback handler we already have.
process.on('unhandledRejection', (error: Error, _promise: Promise<any>) => {
  console.error('unhandledRejection', error)
  throw error
})

process.on('uncaughtException', (error: Error) => {
  console.error('uncaughtException', error)
})
