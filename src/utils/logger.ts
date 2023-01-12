import chalk from 'chalk'
import {format} from 'date-fns'

const LOG_TYPE = {
  info: chalk.blue,
  success: chalk.green,
  error: chalk.red,
} as const

type TLogType = keyof typeof LOG_TYPE

interface ILoggerOptions {
  type?: TLogType
  date?: boolean
}
export function logger(message: string, options?: ILoggerOptions): void {
  const {type = 'info', date = false} = options || {}
  const color = LOG_TYPE[type]
  let messageText = message

  // const time = new Date().toLocaleTimeString('tr-TR', {
  //   timeZone: 'Europe/Istanbul',
  // })
  if (date) {
    messageText = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} ${messageText}`
  }
  console.log(color(messageText))
}
