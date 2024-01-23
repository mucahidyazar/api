import { Request, Response } from 'express'

import { ShortUrl } from '../model'

async function createShortUrl(req: Request, res: Response) {
  try {
    const url = String(req.body.url)

    const data = await ShortUrl.create({
      full: url,
    })

    return res.status(200).json({
      message: 'ok',
      data,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function openShortUrl(req: Request, res: Response) {
  try {
    const short = String(req.params.id)

    const data = await ShortUrl.findOne({
      short,
    })

    if (!data) {
      return res.status(404).json({
        message: 'not found',
      })
    }

    data.clicks++
    await data.save()

    return res.redirect(data.full)
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function getShortUrls(req: Request, res: Response) {
  try {
    const data = await ShortUrl.find()

    return res.status(200).json({
      message: 'ok',
      data,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function getShortUrl(req: Request, res: Response) {
  try {
    const short = String(req.params.id)
    const increment = Boolean(req.query.increment)

    const data = await ShortUrl.findOne({
      short,
    })

    if (!data) {
      return res.status(404).json({
        message: 'not found',
      })
    }

    if (increment) {
      data.clicks++
      await data.save()
    }

    return res.status(200).json({
      message: 'ok',
      data: data,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function deleteShortUrl(req: Request, res: Response) {
  try {
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
      return res.status(404).json({
        message: 'not found',
      })
    }

    return res.status(200).json({
      message: 'ok',
      data,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

export {
  createShortUrl,
  deleteShortUrl,
  getShortUrl,
  getShortUrls,
  openShortUrl,
}
