import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import { logger, telegram } from '../../client'

import { checkAllStocksRetry } from './helpers'

const startApp = async () => {
  try {
    logger.info('App started')

    // one by one
    // for (const brand of Object.values(BRAND)) {
    //   await checkStockRetry({brand, retry: 1000})
    // }
    // Parallel
    // await Promise.all(
    //   Object.values(BRAND).map(brand => checkStockRetry({brand, retry: 1000})),
    // )
    // Parallel but with delay between all brands
    await checkAllStocksRetry({ retry: 100 })

    const used = process.memoryUsage().heapUsed / 1024 / 1024
    logger.info(`The script uses approximately ${used} MB`)
  } catch (error) {
    logger.error(JSON.stringify(error))
    telegram.sendTelegramMessage('I am down, please check me!')
  }
}

process.setMaxListeners(0)
//! Start App each 30 seconds delay while global
startApp()
