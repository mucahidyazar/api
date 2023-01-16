import puppeteer, {ElementHandle} from 'puppeteer'

import {IBrand, ICheckStock, ICheckStockResult} from '@/types'
import {sendTelegramMessage} from '../../../client'
import {getPrice, logger} from '../../../utils'
import {BRAND} from '../../../constants'

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

async function getTextContent(element: ElementHandle<Node>[]): Promise<string> {
  if (!element[0]) return ''

  return await element[0].evaluate((node: any) => node.textContent)
}
