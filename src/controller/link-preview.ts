import { Request, Response } from 'express'

import { getLinkPreviewData } from '../services/link-preview/helpers'

export async function getLinkPreview(req: Request, res: Response) {
  try {
    const url = String(req.query.url)
    const data = await getLinkPreviewData(url)

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
      message: "There was an error while fetching the link preview",
      details: error,
    })
  }
}
