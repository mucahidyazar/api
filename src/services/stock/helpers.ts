import puppeteer, { ElementHandle } from 'puppeteer'
import { Server } from 'socket.io'

import { logger, telegram } from '@/client'
import {
  ICheckStock,
  ICheckStockResult,
  ICheckStockRetry,
  TBrandName,
} from '@/common'
import { CONFIG } from '@/config'
import { BRAND } from '@/constants'
import { links } from '@/data'
import { MyStock } from '@/model'
import { getPrice, sleep } from '@/utils'

export async function checkAllStocksRetry({
  retry = 1,
  socket,
  shouldReturn,
  stockId,
}: {
  retry?: number
  socket?: Server
  shouldReturn?: boolean
  stockId?: string
}) {
  const result: ICheckStockResult[] = []
  const totalLinks = links.length

  let left = retry

  retryInterval = setInterval(
    async () => {
      if (stockId) {
        const shouldContinue = await checkDB(stockId)
        if (!shouldContinue) return
      }

      for (const link of links) {
        const brand = link.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrandName
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
    },
    CONFIG.checkStockDelay * (totalLinks + 1),
  )
}

export async function checkStock({
  link,
  brandName,
}: ICheckStock): Promise<ICheckStockResult> {
  const brand = BRAND[brandName as TBrandName]

  const browser = await puppeteer.launch({
    headless: 'shell',
  })
  try {
    logger.info(`Checking ${brand.name}'s website`)
    const page = await browser.newPage()

    logger.info(`Puppeter is going to ${link}`)
    const response = await page.goto(link, { timeout: 0, waitUntil: 'load' })

    logger.debug('STOCK -> before -> const status = response?.status()')
    const status = response?.status()
    if (status != 200) {
      logger.error(`Probably HTTP response status code 200 OK.`)
      await browser.close()

      //! RETURN
      return { brand, link, hasProduct: false }
    }

    logger.debug(
      'STOCK -> before -> const priceElement = await page.$x(brand.xPath.priceElement as string)',
    )
    const priceElement = await page.$$(brand.xPath.priceElement as string)

    let productName = ''
    let productImage = ''

    logger.debug('STOCK -> before -> if (brand.xPath.productName) {')
    if (brand.xPath.productName) {
      const productNameElement = await page.$$(brand.xPath.productName)
      productName = await getTextContent(productNameElement)
    }

    logger.debug('STOCK -> before -> if (brand.xPath.productImage) {')
    if (brand.xPath.productImage) {
      const productImageElement = await page.$$(brand.xPath.productImage)
      // it is an image element
      // so get its src
      const src = await productImageElement[0].evaluate((node: any) =>
        node.getAttribute('src'),
      )
      productImage = src.includes('http') ? src : `https:${src}`
    }

    logger.debug('STOCK -> before -> if (brand.xPath.sellerElement) {')
    if (brand.xPath.sellerElement) {
      const sellerElement = await page.$$(brand.xPath.sellerElement.path)
      if (sellerElement?.length) {
        const sellerText = await getTextContent(sellerElement)

        const isSellerValid = brand.xPath.sellerElement.condition(sellerText)
        if (!isSellerValid) {
          logger.error(`❌ ${brand.name}: Seller is not valid`)
          await browser.close()

          //! RETURN
          return { productName, productImage, brand, link, hasProduct: false }
        }
      } else {
        logger.error(`❌ ${brand.name}: Seller is not valid`)
        await browser.close()

        //! RETURN
        return { productName, productImage, brand, link, hasProduct: false }
      }
    }

    // const addCartButtonButton = await page.$x(
    //   brand.xPath.addCartButton as string,
    // )

    logger.debug('STOCK -> before -> const pages = await browser.pages()')
    const pages = await browser.pages()
    logger.debug(`${pages.length} pages opened`)

    logger.debug('STOCK -> before -> const hasPrice = priceElement.length > 0')
    const hasPrice = priceElement.length > 0
    if (hasPrice) {
      const priceText = await priceElement[0].evaluate(
        (node: any) => node.textContent,
      )
      const price = getPrice({ price: priceText })
      logger.debug(`STOCK -> 💰 ${brand.name}: ${price}`)

      // await page.waitForXPath(brand.xPath)
      // logger.info(`📷 ${brand.name}: Screenshot taken`)
      // const screenshot = await page.screenshot({
      //   path: `screenshots/${brand.name}+${Date.now()}.png`,
      //   fullPage: true,
      // })
      // await takeScreenshot(screenshot, `${brand.name}+${Date.now()}.png`)

      await browser.close()

      //! RETURN
      return { productName, productImage, brand, link, price, hasProduct: true }
    } else {
      logger.error(`❌ ${brand.name}: Product not found`)
      await browser.close()

      //! RETURN
      return { productName, productImage, brand, link, hasProduct: false }
    }
  } catch (error) {
    logger.error(JSON.stringify(error))
    telegram.sendTelegramMessage('I am down, please check me!')
    await browser.close()
    return { brand, link, hasProduct: false }
  }
}

const stocks = new Map<string, string>()
let retryInterval: NodeJS.Timeout
const checkDB = async (stockId: string) => {
  const stock = await MyStock.findById(stockId)
  if (stock?.active === false) {
    logger.error('🛑 Stopped by user')
    stocks.delete(stockId)
    clearInterval(retryInterval)
    return false
  }

  const isAlreadyRunning = stocks.has(stockId)
  if (isAlreadyRunning) {
    logger.error('🛑 Already running')
    return false
  } else {
    stocks.set(stockId, stockId)
  }

  return true
}
export async function checkStockRetry({
  link,
  brandName,
  retry,
  delay = 1000,
  condition,
}: ICheckStockRetry): Promise<ICheckStockResult> {
  const response = await checkStock({ link, brandName })

  if (condition) {
    const { maxPrice, minPrice, hasFound } = condition
    const condition1 = retry && retry > 0
    const condition2 =
      maxPrice && response.price && Number(response.price) > maxPrice
    const condition3 =
      minPrice && response.price && Number(response.price) < minPrice
    const condition4 = hasFound && response.hasProduct

    if (condition1 && (condition2 || condition3 || condition4)) {
      await checkStockRetry({ link, brandName, retry: retry - 1 })
      await sleep(delay)
    }
  }

  return response
}

async function getTextContent(element: ElementHandle<Node>[]): Promise<string> {
  if (!element[0]) return ''

  return await element[0].evaluate((node: any) => node.textContent)
}
