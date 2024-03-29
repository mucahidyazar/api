import './client/env'
import './config/db'

import { createServer } from 'http'

import cors from 'cors'
import express from 'express'
import kill from 'kill-port'
import cron from 'node-cron'
import { Server, Socket } from 'socket.io'

import { db, errorHandler, logger } from './client'
import { CONFIG } from './config'
import { searchAppointment, searchStock } from './helpers'
import { SocketMessage } from './model'
import {
  linkPreviewRouter,
  socketRouter,
  stockRouter,
  urlShortenerRouter,
  wishListRouter,
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
app.use(linkPreviewRouter)
app.use(socketRouter)
app.use(stockRouter)
app.use(urlShortenerRouter)
app.use(wishListRouter)

//! socket.io
io.on('connection', (socket: Socket) => {
  logger.info('connection')

  // Kullanıcıyı kendi kanalına katılma işlemi
  socket.on('join', userId => {
    socket.join(userId)
    logger.info(`Kullanıcı ${userId} kendi kanalına katıldı.`)
  })
})

// Enum değerlerine göre cron zamanlamaları
const CRON_SCHEDULES = {
  fiveMinutes: '*/5 * * * *',
  daily: '0 0 * * *',
  hourly: '0 * * * *',
  weekly: '0 0 * * 0',
} as const

type TCronSchedules = keyof typeof CRON_SCHEDULES

// Her bir checkFrequency için ayrı bir cron görevi oluştur
const cronSchedules = Object.entries(CRON_SCHEDULES) as [
  TCronSchedules,
  string,
][]
cronSchedules.forEach(([frequency, schedule]) => {
  const jobName = `stock-cronJob-${frequency}` // Benzersiz cron işi ismi

  cron.schedule(schedule, async () => {
    logger.info(`${jobName} çalıştı.`)

    const wishList = await db.wishList.findMany({
      where: { checkFrequency: frequency, status: "active" },
    })

    // Her gruptaki benzersiz URL'leri toplama
    const uniqueUrls = new Set<string>()
    wishList.forEach(wish => {
      uniqueUrls.add(wish.productUrl)
    })

    // Sıralı işlem
    for (const link of uniqueUrls) {
      await searchStock({ io, link, wishList })
    }
  })
})

cronSchedules.forEach(([frequency, schedule]) => {
  const jobName = `appointment-cronJob-${frequency}` // Benzersiz cron işi ismi

  cron.schedule(schedule, async () => {
    logger.info(`${jobName} çalıştı.`)

    const appointments = await db.appointment.findMany({
      where: { checkFrequency: frequency, status: "active" },
    })

    logger.debug(
      'Appointment -> before -> appointments.forEach(appointment => {',
    )
    appointments.forEach(async appointment => {
      logger.info('Appointment search is started')
      let socketMessage = new SocketMessage(appointment.userId, 'Appointment search is started', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      await db.appointmentHistory.create({
        data: {
          appoinment: { connect: { id: appointment.id } },
          user: { connect: { id: appointment.userId } },
          message: 'Appointment search is started',
        },
      })

      await searchAppointment({ appointment, io })

      logger.info('Appointment search is finished')
      socketMessage = new SocketMessage(appointment.userId, 'Appointment search is finished', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      await db.appointmentHistory.create({
        data: {
          appoinment: { connect: { id: appointment.id } },
          user: { connect: { id: appointment.userId } },
          message: 'Appointment search is finished',
        },
      })
    })
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
