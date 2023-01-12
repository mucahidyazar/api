export const CONFIG = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  groupChatId: process.env.GROUP_CHAT_ID || '',
  checkStockDelay: Number(process.env.CHECK_STOCK_DELAY) || 10000,
  port: Number(process.env.PORT) || 8001,

  //! MHRS
  REPEAT_REQUEST_TIME: 180000,
  REPEAT_CHECK_TIME: 180000,
  ANY_DOCTOR: true,
  MHRS_USERNAME: process.env.MHRS_USERNAME,
  MHRS_PASSWORD: process.env.MHRS_PASSWORD,
}
