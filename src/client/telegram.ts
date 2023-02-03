import TelegramBot from 'node-telegram-bot-api'

import {CONFIG} from '../config'

const telegram = new TelegramBot(CONFIG.telegramBotToken)

// telegram.on('polling_error', msg => console.log(msg))

function sendTelegramMessage(message: string): void {
  telegram.startPolling()
  telegram.sendMessage(CONFIG.groupChatId, message)
  telegram.stopPolling()
}

async function takeScreenshot(
  screenshot: string | Buffer,
  filename: string,
): Promise<void> {
  telegram.startPolling()
  await telegram.sendPhoto(
    CONFIG.groupChatId,
    screenshot,
    {},
    {
      filename,
      contentType: 'image/png',
    },
  )
  telegram.stopPolling()
}

export default Object.freeze({
  sendTelegramMessage,
  takeScreenshot,
})
