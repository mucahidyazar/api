import {Request, Response} from 'express'

import {checkStock} from '../helper'
import {links} from '../data'

export async function getPrice(req: Request, res: Response) {
  try {
    const result = await checkStock({
      link: links[0],
      brandName: 'amazon',
    })
    res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}
