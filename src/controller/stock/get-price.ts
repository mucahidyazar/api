import { Request, Response } from 'express'

import { links } from '../../data'
import { checkStock } from '../../services/stock/helpers'

export async function getPrice(req: Request, res: Response) {
  try {
    const result = await checkStock({
      link: links[0],
      brandName: 'amazon',
    })

    return res.response({
      status: 'success',
      code: 200,
      message: 'ok',
      data: result
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'error',
      details: error,
    })
  }
}
