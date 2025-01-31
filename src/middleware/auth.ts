import jwt, { JwtPayload } from 'jsonwebtoken'

import { ERROR_CODE } from '@/constants'
import { User } from '@/model/user'
import { ApiResponse } from '@/utils'

export const middlewareAuth = async (req, res, next) => {
  const accessToken = req.header('x-access-token')
  if (!accessToken) {
    return res.response({
      statusCode: 401,
      apiResponse: ApiResponse.failure({
        message: 'No token provided',
        detail: null,
      }),
    })
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      'your_access_token_secret',
    ) as JwtPayload
    req.user = await User.findById(decoded.id)
    next()
  } catch (error) {
    res.response({
      statusCode: 401,
      apiResponse: ApiResponse.failure({
        code: ERROR_CODE.Unauthorized,
        message: 'Unauthorized',
        detail: error,
      }),
    })
  }
}
