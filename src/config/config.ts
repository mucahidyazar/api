const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/api'

export const CONFIG = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  groupChatId: process.env.GROUP_CHAT_ID || '',
  checkStockDelay: Number(process.env.CHECK_STOCK_DELAY) || 10000,
  port: Number(process.env.PORT) || 8001,

  //! DATABASE
  MONGO_URI: process.env.MONGO_URI || DEFAULT_MONGO_URI,
}
