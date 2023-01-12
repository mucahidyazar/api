import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import express from 'express'
import {createServer} from 'http'
import {Server} from 'socket.io'

import {CONFIG} from './config'
import {socketRouter, stockRouter} from './routes/v1'

const app = express()

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

//! routes
app.use(socketRouter)
app.use(stockRouter)

httpServer.listen(CONFIG.port)

process.setMaxListeners(0)
