import puppeteer, {ElementHandle} from 'puppeteer'

import {
  IBrand,
  ICheckStock,
  ICheckStockRetry,
  ICheckStockResult,
} from '../../types'
import {TBrand, BRAND} from '../../constants'
import {CONFIG} from '../../config'
import {links} from '../../data'
import {getPrice, logger, sleep} from '../../utils'
import {sendTelegramMessage} from '../../client'
import {MyStock} from '../../model'

export async function checkStock({
  link,
  brandName,
}: ICheckStock): Promise<ICheckStockResult> {
  const brand = BRAND[brandName] as IBrand

  const browser = await puppeteer.launch({
    headless: true, // If you want to see the browser, change to false
  })
  try {
    logger(`Checking ${brand.name}'s website`, {type: 'info'})

    const page = await browser.newPage()
    const response = await page.goto(link, {timeout: 0, waitUntil: 'load'})
    const status = response?.status()
    if (status != 200) {
      logger(`Probably HTTP response status code 200 OK.`, {type: 'error'})
      return {brand, link, hasProduct: false}
    }

    const priceElement = await page.$x(brand.xPath.priceElement as string)

    if (brand.xPath.sellerElement) {
      const sellerElement = await page.$x(brand.xPath.sellerElement.path)
      if (sellerElement?.length) {
        const sellerText = await getTextContent(sellerElement)
        const isSellerValid = brand.xPath.sellerElement.condition(sellerText)
        if (!isSellerValid) {
          logger(`❌ ${brand.name}: Seller is not valid`, {type: 'error'})
          return {brand, link, hasProduct: false}
        }
      } else {
        logger(`❌ ${brand.name}: Seller is not valid`, {type: 'error'})
        return {brand, link, hasProduct: false}
      }
    }
    const addCartButtonButton = await page.$x(
      brand.xPath.addCartButton as string,
    )

    const pages = await browser.pages()
    logger(`${pages.length} pages opened`)
    const hasPrice = priceElement.length > 0
    if (hasPrice) {
      const priceText = await priceElement[0].evaluate(
        (node: any) => node.textContent,
      )
      const price = getPrice({price: priceText})

      logger(`💰 ${brand.name}: ${price}`, {type: 'success'})

      // await page.waitForXPath(brand.xPath)
      // logger(`📷 ${brand.name}: Screenshot taken`, {type: 'success'})
      // const screenshot = await page.screenshot({
      //   path: `screenshots/${brand.name}+${Date.now()}.png`,
      //   fullPage: true,
      // })
      // await takeScreenshot(screenshot, `${brand.name}+${Date.now()}.png`)

      sendTelegramMessage(`✅ ${brand.name}: ${brand.name}: ${price} \n${link}`)
      await browser.close()
      return {brand, link, price, hasProduct: true}
    } else {
      logger(`❌ ${brand.name}: Product not found`, {type: 'error'})
      await browser.close()
      return {brand, link, hasProduct: false}
    }
  } catch (error) {
    logger(JSON.stringify(error), {type: 'error'})
    sendTelegramMessage('I am down, please check me!')
    await browser.close()
    return {brand, link, hasProduct: false}
  }
}

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

const stocks = new Map<string, string>()
let retryInterval: NodeJS.Timeout
const checkDB = async (stockId: string) => {
  const stock = await MyStock.findById(stockId)
  if (stock?.active === false) {
    logger('🛑 Stopped by user', {type: 'error'})
    stocks.delete(stockId)
    clearInterval(retryInterval)
    return false
  }

  const isAlreadyRunning = stocks.has(stockId)
  if (isAlreadyRunning) {
    logger('🛑 Already running', {type: 'error'})
    return false
  } else {
    stocks.set(stockId, stockId)
  }

  return true
}
export async function checkAllStocksRetry({
  retry = 1,
  socket,
  shouldReturn,
  stockId,
}: {
  retry?: number
  socket?: any
  shouldReturn?: boolean
  stockId?: string
}) {
  let result: ICheckStockResult[] = []
  const totalLinks = links.length

  let left = retry

  retryInterval = setInterval(async () => {
    if (stockId) {
      const shouldContinue = await checkDB(stockId)
      if (!shouldContinue) return
    }

    for (const link of links) {
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

    left = left - 1
    const stock = await MyStock.findById(stockId)
    if (stock) {
      stock.results = [...stock.results, ...result]
      stock.retry = left
      stock.save()
    }
    result.length = 0
    if (left === 0) {
      clearInterval(retryInterval)
    }
  }, CONFIG.checkStockDelay * (totalLinks + 1))
}

async function getTextContent(element: ElementHandle<Node>[]): Promise<string> {
  if (!element[0]) return ''

  return await element[0].evaluate((node: any) => node.textContent)
}
