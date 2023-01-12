import {sleep} from '../utils'
import {ICheckStockRetry, ICheckStockResult} from '../common'
import {checkStock} from './checkStock'
import {BRAND} from '../constants'

export async function checkStockRetry({
  link,
  brandName,
  retry,
  delay = 1000,
  condition,
}: ICheckStockRetry): Promise<ICheckStockResult> {
  const response = await checkStock({link, brandName})

  if (condition) {
    const {maxPrice, minPrice, hasFound} = condition
    const condition1 = retry && retry > 0
    const condition2 =
      maxPrice && response.price && Number(response.price) > maxPrice
    const condition3 =
      minPrice && response.price && Number(response.price) < minPrice
    const condition4 = hasFound && response.hasProduct

    if (condition1 && (condition2 || condition3 || condition4)) {
      await checkStockRetry({link, brandName, retry: retry - 1})
      await sleep(delay)
    }
  }

  return response
}
