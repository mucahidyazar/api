import { Request, Response } from 'express'

import { ShortUrl } from '../model'

async function createShortUrl(req: Request, res: Response) {
  try {
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
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    });
  }
}

async function openShortUrl(req: Request, res: Response) {
  try {
    const short = String(req.params.id)

    const data = await ShortUrl.findOne({
      short,
    })

    if (!data) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'not found',
      })
    }

    data.clicks++
    await data.save()

    return res.redirect(data.full)
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    });
  }
}

async function getShortUrls(req: Request, res: Response) {
  try {
    const data = await ShortUrl.find()

    return res.response({
      status: 'success',
      code: 200,
      message: 'ok',
      data,
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    });
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
      return res.response({
        status: 'error',
        code: 404,
        message: 'not found',
      })
    }

    if (increment) {
      data.clicks++
      await data.save()
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'ok',
      data,
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    });
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
      return res.response({
        status: 'error',
        code: 404,
        message: 'not found',
      })
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'ok',
      data,
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error
    });
  }
}

export {
  createShortUrl,
  deleteShortUrl,
  getShortUrl,
  getShortUrls,
  openShortUrl,
}
