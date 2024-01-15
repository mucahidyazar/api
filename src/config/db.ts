import mongoose from 'mongoose'

import { CONFIG } from './config'

mongoose.set('strictQuery', false)

const connectDB = async () => {
  try {
    const response = await mongoose.connect(CONFIG.MONGO_URI)

    console.log(`MongoDB Connected: ${response.connection.host}`)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

connectDB()
