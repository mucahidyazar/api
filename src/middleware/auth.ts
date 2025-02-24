import jwt, { JwtPayload } from 'jsonwebtoken'
import 'dotenv/config'

import { ERROR_CODE } from '@/constants'
import { User } from '@/model/user'
import { ApiResponse } from '@/utils'

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null
  }

  return parts[1]
}

export const middlewareAuth = async (req, res, next) => {
  const accessToken = extractBearerToken(req.header('authorization'))
  if (!accessToken || !jwt.verify(accessToken, process.env.JWT_SECRET)) {
    return res.response({
      statusCode: 401,
      apiResponse: ApiResponse.failure({
        type: 'Unauthorized',
        code: ERROR_CODE.Unauthorized,
        message: 'No token provided',
        detail: null,
      }),
    })
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
    ) as JwtPayload
    req.user = await User.findById(decoded.id)
    next()
  } catch (error) {
    res.response({
      statusCode: 401,
      apiResponse: ApiResponse.failure({
        type: 'Unauthorized',
        code: ERROR_CODE.Unauthorized,
        message: 'Unauthorized',
        detail: error,
      }),
    })
  }
}
