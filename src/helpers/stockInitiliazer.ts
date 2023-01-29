import {MyStock} from '../model'
import {checkAllStocksRetry} from '../services/stock/helpers'
import {logger} from '../utils'

export async function myInit() {
  try {
    const myStock = await MyStock.find()

    if (!myStock.length) {
      return logger('There is no myStock', {type: 'info'})
    }

    myStock.forEach((stock: any) => {
      console.log({active: stock.active})
      if (stock.active) {
        checkAllStocksRetry({
          retry: stock.retry,
          stockId: stock._id,
        })
      }
    })

    return logger('myStock found', {type: 'info'})
  } catch (error) {
    return logger('error', {type: 'error'})
  }
}
