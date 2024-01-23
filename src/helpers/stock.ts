import { WishList } from '@prisma/client';
import { TBrandName } from 'common';
import { Server } from 'socket.io';

import { db, logger, telegram } from "../client";
import { checkStock } from '../services/stock/helpers'

//? create an unique array of product urls
async function getUniqueProductUrls() {
  const whishlist = await db.wishList.findMany({
    where: { status: "active" }
  })
  const allUrls = whishlist.map((wish) => wish.productUrl).flat();
  return [...new Set(allUrls)];
}

//? check product price
async function checkProduct({ link }: { link: string }) {
  try {
    const urlOrigin = new URL(link).origin; // ex => https://www.amazon.com
    const brandName = urlOrigin.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrandName; // ex => amazon

    const stockData = await checkStock({ link, brandName })

    return stockData
  } catch (error) {
    logger.error(`Fiyat kontrolünde hata: ${error}`);
    return null;
  }
}

type SearchStockArgs = {
  link: string
  wishList: WishList[]
  io: Server
}
async function searchStock({ io, link, wishList }: SearchStockArgs) {
  const productData = await checkProduct({ link });

  logger.debug('STOCK -> before -> if (productData?.price) {')
  if (productData?.price) {
    for (const wish of wishList) {
      logger.debug('STOCK -> before -> for (const wish of wishList) {')
      if (wish.productUrl?.includes(link)) {

        const productInfos = {
          ...(productData.productName && { productName: productData.productName }),
          ...(productData.productImage && { productImage: productData.productImage }),
          ...(productData.price && { productPrice: productData.price }),
        }

        logger.debug('STOCK -> before -> await db.history.create({')
        const history = await db.history.create({
          data: {
            inStock: !!productData?.price,
            productUrl: link,
            wishListId: wish.id,
            userId: wish.userId,
            ...productInfos
          }
        })

        logger.debug('STOCK -> before -> io.to(wish.userId).emit(newHistory, { history })')
        io.to(wish.userId).emit('newHistory', { history });

        logger.debug('STOCK -> before -> await db.wishList.update({')
        await db.wishList.update({
          where: { id: wish.id },
          data: {
            history: { connect: { id: history.id } },
            ...productInfos
          }
        });

        const price = Number(productData.price.split(',')[0].replace(/[^0-9]/g, ''));

        const hasPriceFilter = wish.minPrice || wish.maxPrice;
        const isMinPriceValid = wish.minPrice ? wish.minPrice <= price : false;
        const isMaxPriceValid = wish.maxPrice ? wish.maxPrice >= price : false;

        if ((hasPriceFilter && isMinPriceValid) || (hasPriceFilter && isMaxPriceValid)) {
          logger.debug('STOCK -> inside -> (hasPriceFilter && isMinPriceValid) || (hasPriceFilter && isMaxPriceValid)')
          telegram.sendTelegramMessage(
            `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${link}`,
          )
        } else if (!hasPriceFilter) {
          logger.debug('STOCK -> inside -> } else if (!hasPriceFilter) {')
          telegram.sendTelegramMessage(
            `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${link}`,
          )
        }

      }
    }
  }
}
export { checkProduct, getUniqueProductUrls, searchStock }