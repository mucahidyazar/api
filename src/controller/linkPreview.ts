import {Request, Response} from 'express'

import {getLinkPreviewData} from '../services/link-preview/helpers'

export async function getLinkPreview(req: Request, res: Response) {
  try {
    const url = String(req.query.url)
    const data = await getLinkPreviewData(url)

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
