import { Request, Response } from 'express'
import { z } from 'zod'

import { signUpDto } from '@/model/request/auth.dto'
import { signUpUser, signInUser } from '@/services/auth'
import { ApiResponse } from '@/utils'

async function signUp(req: Request, res: Response) {
  const signUpModel: z.infer<typeof signUpDto> = req.body
  const accessToken: string = await signUpUser(signUpModel)

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success({ accessToken }),
  })
}

async function signIn(req: Request, res: Response) {
  const signInModel: z.infer<typeof signUpDto> = req.body
  const accessToken = await signInUser(signInModel)

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success({ accessToken }),
  })
}

export { signIn, signUp }
