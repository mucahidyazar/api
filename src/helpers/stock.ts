import { checkStock } from '../services/stock/helpers'
import { db, telegram } from "../client";
import { TBrand } from '../constants'
import { WishList } from '@prisma/client';
import { Server } from 'socket.io';
import { Response } from 'model/response';

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
    const brandName = urlOrigin.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrand; // ex => amazon

    const stockData = await checkStock({ link, brandName })

    return stockData
  } catch (error) {
    console.error('Fiyat kontrolünde hata:', error);
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

  if (productData?.price) {
    for (const wish of wishList) {
      if (wish.productUrl?.includes(link)) {

        const productInfos = {
          ...(productData.productName && { productName: productData.productName }),
          ...(productData.productImage && { productImage: productData.productImage }),
          ...(productData.price && { productPrice: productData.price }),
        }

        const history = await db.history.create({
          data: {
            inStock: !!productData?.price,
            productUrl: link,
            wishListId: wish.id,
            userId: wish.userId,
            ...productInfos
          }
        })

        io.to(wish.userId).emit('newHistory', { history });

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
          telegram.sendTelegramMessage(
            `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${link}`,
          )
        } else if (!hasPriceFilter) {
          telegram.sendTelegramMessage(
            `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${link}`,
          )
        }

      }
    }
  }
}
export { getUniqueProductUrls, checkProduct, searchStock }