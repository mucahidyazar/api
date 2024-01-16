import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import kill from 'kill-port'
import cron from 'node-cron'

import './config/db'
import { CONFIG } from './config'
import {
  linkPreviewRouter,
  socketRouter,
  stockRouter,
  urlShortenerRouter,
  wishListRouter,
} from './routes/v1'
import { db, logger, telegram } from './client'
import { checkProduct, getUniqueProductUrls } from './helpers'

const app = express()

//!REQUIREMENTS
app.use(cors({
  origin: 'http://localhost:3000',
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const httpServer = createServer(app)

const io = new Server(httpServer)

app.use(function (req, res, next) {
  req.io = io
  next()
})

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

app.post('/kill', async (_req, res) => {
  try {
    res.status(200).json({ message: 'ok' })
    await kill(CONFIG.port)
  } catch (error) {
    res.send('error')
  }
})

//! routes
app.use(linkPreviewRouter)
app.use(socketRouter)
app.use(stockRouter)
app.use(urlShortenerRouter)
app.use(wishListRouter)

//! socket.io
io.on('connection', (socket: Socket) => {
  logger("connection", { type: "success" })

  // Kullanıcıyı kendi kanalına katılma işlemi
  socket.on('join', (userId) => {
    socket.join(userId);
    logger(`Kullanıcı ${userId} kendi kanalına katıldı.`, { type: "success" })
  });
});

// Enum değerlerine göre cron zamanlamaları
const CRON_SCHEDULES = {
  fiveMinutes: '*/5 * * * *',
  daily: '0 0 * * *',
  hourly: '0 * * * *',
  weekly: '0 0 * * 0'
} as const;

type TCronSchedules = keyof typeof CRON_SCHEDULES;

// Her bir checkFrequency için ayrı bir cron görevi oluştur
const cronSchedules = Object.entries(CRON_SCHEDULES) as [TCronSchedules, string][];
cronSchedules.forEach(([frequency, schedule]) => {
  const jobName = `cronJob-${frequency}`; // Benzersiz cron işi ismi

  cron.schedule(schedule, async () => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('tr-TR');
    const timeStr = date.toLocaleTimeString('tr-TR');
    logger(`${jobName} çalıştı ${dateStr} ${timeStr}.`, { type: "success" })

    const wishList = await db.wishList.findMany({
      where: { checkFrequency: frequency }
    });

    // Her gruptaki benzersiz URL'leri toplama
    const uniqueUrls = new Set<string>();
    wishList.forEach(wish => {
      uniqueUrls.add(wish.productUrl);
    });

    // Sıralı işlem
    for (const url of uniqueUrls) {
      const productData = await checkProduct(url);

      if (productData?.price) {
        for (const wish of wishList) {
          if (wish.productUrl?.includes(url)) {

            const productInfos = {
              ...(productData.productName && { productName: productData.productName }),
              ...(productData.productImage && { productImage: productData.productImage }),
              ...(productData.price && { productPrice: productData.price }),
            }

            const history = await db.history.create({
              data: {
                inStock: !!productData?.price,
                productUrl: url,
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
                `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${url}`,
              )
            } else if (!hasPriceFilter) {
              telegram.sendTelegramMessage(
                `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${url}`,
              )
            }

          }
        }
      }
    }
  });
});

httpServer.listen(CONFIG.port)

// //? cron.schedule('*/2 * * * *', async () => { // for every 2 minutes
// //? cron.schedule('*/5 * * * * *', async () => { // for every 5 seconds
// cron.schedule('*/2 * * * *', async () => {
//   const date = new Date();
//   const dateStr = date.toLocaleDateString('tr-TR');
//   const timeStr = date.toLocaleTimeString('tr-TR');
//   logger(`Cron çalıştı ${dateStr} ${timeStr}`, { type: "success" })

//   const uniqueUrls = await getUniqueProductUrls();
//   const whishlist = await db.wishList.findMany()

//   for (const url of uniqueUrls) {
//     const productData = await checkProduct(url) as any;

//     if (productData?.price) {
//       for (const wish of whishlist) {
//         if (wish.productUrl?.includes(url)) {

//           const productInfos = {
//             ...(productData.productName && { productName: productData.productName }),
//             ...(productData.productImage && { productImage: productData.productImage }),
//             ...(productData.price && { productPrice: productData.price }),
//           }

//           const history = await db.history.create({
//             data: {
//               inStock: productData.inStock || false,
//               wishListId: wish.id,
//               productUrl: url,
//               ...productInfos
//             }
//           })

//           io.to(wish.userId).emit('newHistory', { history });

//           await db.wishList.update({
//             where: { id: wish.id },
//             data: {
//               history: { connect: { id: history.id } },
//               ...productInfos
//             }
//           });

//           const price = Number(productData.price.split(',')[0].replace(/[^0-9]/g, ''));

//           const hasPriceFilter = wish.minPrice || wish.maxPrice;
//           const isMinPriceValid = wish.minPrice ? wish.minPrice <= price : false;
//           const isMaxPriceValid = wish.maxPrice ? wish.maxPrice >= price : false;

//           if ((hasPriceFilter && isMinPriceValid) || (hasPriceFilter && isMaxPriceValid)) {
//             telegram.sendTelegramMessage(
//               `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${url}`,
//             )
//           } else if (!hasPriceFilter) {
//             telegram.sendTelegramMessage(
//               `✅ ${productData.brand.name}: ${productData.brand.name}: ${productData.price} \n${url}`,
//             )
//           }

//         }
//       }
//     }
//   }
// });

