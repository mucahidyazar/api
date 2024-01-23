import mongoose from 'mongoose'

import { logger } from '../client'

import { CONFIG } from './config'

mongoose.set('strictQuery', false)

const connectDB = async () => {
  try {
    const response = await mongoose.connect(CONFIG.MONGO_URI)
    logger.info(`MongoDB Connected: ${response.connection.host}`)
  } catch (error: any) {
    logger.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

connectDB()
