import { Request, Response } from 'express'

import { signUpUser, signInUser } from '@/services/auth'
import { ApiResponse } from '@/utils'

async function signUp(req: Request, res: Response) {
  const { email, password } = req.body
  const tokens = await signUpUser(email, password)

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success({ accessToken: tokens.accessToken }),
  })
}

async function signIn(req: Request, res: Response) {
  const { email, password } = req.body
  const tokens = await signInUser(email, password)

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success({ accessToken: tokens.accessToken }),
  })
}

export { signIn, signUp }
