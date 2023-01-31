import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import express from 'express'
import cors from 'cors'
import {createServer} from 'http'
import {Server} from 'socket.io'
import kill from 'kill-port'

import './config/db'
import {CONFIG} from './config'
import {linkPreviewRouter, socketRouter, stockRouter} from './routes/v1'
import {myInit} from './helpers'

const app = express()

//!REQUIREMENTS
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const httpServer = createServer(app)

const io = new Server(httpServer, {
  path: '/api/v1/socket',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(function (req, res, next) {
  req.io = io
  next()
})

app.get('/health', (req, res) => {
  res.status(200).json({message: 'ok'})
})

app.post('/kill', async (_req, res) => {
  try {
    res.status(200).json({message: 'ok'})
    await kill(CONFIG.port)
  } catch (error) {
    res.send('error')
  }
})

//! routes
app.use(linkPreviewRouter)
app.use(socketRouter)
app.use(stockRouter)

httpServer.listen(CONFIG.port)

// myInit()

process.setMaxListeners(0)
