import { Request, Response, NextFunction } from 'express'

import { ExtendedApiResponse } from '@/utils'

export function middlewareResponse(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.response = function (response: ExtendedApiResponse): void {
    res.contentType('application/json')
    const { statusCode, apiResponse } =
      response as unknown as ExtendedApiResponse

    res.status(statusCode).json(apiResponse)
  }

  next()
}
