import {ICheckStockResult} from '../common'
import {BRAND, TBrand} from '../constants'
import {checkStockRetry} from './checkStockRetry'
import {CONFIG} from '../config'
import {myLinks} from '../mock/myLinks'

export async function checkAllStocksRetry({
  retry = 1,
  socket,
  shouldReturn,
}: {
  retry?: number
  socket?: any
  shouldReturn?: boolean
}) {
  const result: ICheckStockResult[] = []
  const totalLinks = myLinks.length

  let left = retry
  const interval = setInterval(async () => {
    for (const link of myLinks) {
      const brand = link.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrand
      const response = await checkStockRetry({
        link,
        brandName: brand,
        delay: CONFIG.checkStockDelay,
      })
      result.push(response)
    }

    if (socket) socket.emit('results', result)
    if (shouldReturn) return result

    result.length = 0
    left = left - 1
    if (left === 0) {
      clearInterval(interval)
    }
  }, CONFIG.checkStockDelay * (totalLinks + 1))
}
