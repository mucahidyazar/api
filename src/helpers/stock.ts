import { checkStock } from '../services/stock/helpers'
import { db } from "../client";
import { TBrand } from '../constants'

//? create an unique array of product urls
async function getUniqueProductUrls() {
  const whishlist = await db.wishList.findMany({
    where: { status: "active" }
  })
  const allUrls = whishlist.map((wish) => wish.productUrl).flat();
  return [...new Set(allUrls)];
}

//? check product price
async function checkProduct(url: string) {
  try {
    const urlOrigin = new URL(url).origin; // ex => https://www.amazon.com
    const brandName = urlOrigin.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrand; // ex => amazon

    const stockData = await checkStock({ link: url, brandName })

    return stockData
  } catch (error) {
    console.error('Fiyat kontrolünde hata:', error);
    return null;
  }
}

export { getUniqueProductUrls, checkProduct }