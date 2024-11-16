import { Request, Response } from 'express'

import { ShortUrl } from '../model'
import { ApiError } from '@/services/api-error'

async function createShortUrl(req: Request, res: Response) {
  const url = String(req.body.url)

  const data = await ShortUrl.create({
    full: url,
  })

  return res.response({
    status: 'success',
    code: 200,
    message: 'ok',
    data,
  })
}

async function openShortUrl(req: Request, res: Response) {
  const short = String(req.params.id)

  const data = await ShortUrl.findOne({
    short,
  })

  if (!data) {
    throw new ApiError('ResourceNotFound', 'ShortUrl not found')
  }

  data.clicks++
  await data.save()

  return res.redirect(data.full)
}

async function getShortUrls(req: Request, res: Response) {
  const data = await ShortUrl.find()

  return res.response({
    status: 'success',
    code: 200,
    message: 'ok',
    data,
  })
}

async function getShortUrl(req: Request, res: Response) {
  const short = String(req.params.id)
  const increment = Boolean(req.query.increment)

  let data = await ShortUrl.findOne({
    short,
  })

  if (!data) {
    throw new ApiError('ResourceNotFound', 'ShortUrl not found')
  }

  if (increment) {
    data.clicks++
    data = await data.save()
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'ok',
    data,
  })
}

async function deleteShortUrl(req: Request, res: Response) {
  const id = String(req.query.id)
  const url = String(req.query.url)

  let data
  if (id) {
    data = await ShortUrl.findByIdAndDelete(id)
  } else if (url) {
    data = await ShortUrl.findOneAndDelete({
      short: url,
    })
  }

  if (!data) {
    throw new ApiError('ResourceNotFound', 'ShortUrl not found')
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'ok',
    data,
  })
}

export {
  createShortUrl,
  deleteShortUrl,
  getShortUrl,
  getShortUrls,
  openShortUrl,
}
