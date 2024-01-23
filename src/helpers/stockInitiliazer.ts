import { logger } from '../client'
import { MyStock } from '../model'
import { checkAllStocksRetry } from '../services/stock/helpers'

export async function myInit() {
  try {
    const myStock = await MyStock.find()

    if (!myStock.length) {
      return logger.info('There is no myStock')
    }

    myStock.forEach((stock: any) => {
      if (stock.active) {
        checkAllStocksRetry({
          retry: stock.retry,
          stockId: stock._id,
        })
      }
    })

    return logger.info('myStock found')
  } catch (error) {
    return logger.error('error')
  }
}
