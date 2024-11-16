import { Request, Response } from 'express'

import { getLinkPreviewData } from '../services/link-preview/helpers'
import { ApiError } from '@/services/api-error'

export async function getLinkPreview(req: Request, res: Response) {
  const url = String(req.query.url)
  const data = await getLinkPreviewData(url)

  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Link preview not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'ok',
    data,
  })

}
