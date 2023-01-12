import TelegramBot from 'node-telegram-bot-api'

import {CONFIG} from '../config'

const telegram = new TelegramBot(CONFIG.telegramBotToken, {
  polling: true,
})

telegram.on('polling_error', msg => console.log(msg))

function sendTelegramMessage(message: string): void {
  telegram.sendMessage(CONFIG.groupChatId, message)
}

async function takeScreenshot(
  screenshot: string | Buffer,
  filename: string,
): Promise<void> {
  await telegram.sendPhoto(
    CONFIG.groupChatId,
    screenshot,
    {},
    {
      filename,
      contentType: 'image/png',
    },
  )
}

export {telegram, sendTelegramMessage, takeScreenshot}
