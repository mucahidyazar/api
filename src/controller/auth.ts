import { Request, Response } from 'express'
import { z } from 'zod'

import { ROUTES } from '@/constants'
import { signInDto, signUpDto } from '@/model/request/auth.dto'
import { signInResponseDto, signUpResponseDto } from '@/model/response/auth.dto'
import { signUpUser, signInUser } from '@/services/auth'
import { ApiResponse, apiResponseSchema } from '@/utils'
import {
  ApiBody,
  ApiOperation,
  DApiResponse,
  Post,
} from '@/utils/decorator-factory'

import { BaseController } from './base.controller'

export class AuthController extends BaseController {
  @Post(ROUTES.v1.auth.signUp)
  @ApiOperation({
    operationId: 'signUp',
    description:
      'Create a new user account with email and password authentication. Returns a JWT access token that can be used to authenticate future requests.',
    tags: ['Authentication'],
    summary: 'Sign up',
    security: undefined,
  })
  @ApiBody(true, signUpDto)
  @DApiResponse(
    201,
    'Successfully signed up',
    apiResponseSchema(true, signUpResponseDto),
  )
  @DApiResponse(400, 'Invalid request body', apiResponseSchema(false))
  @DApiResponse(409, 'User already exists', apiResponseSchema(false))
  @DApiResponse(429, 'Too many requests', apiResponseSchema(false))
  public async signUp(req: Request, res: Response) {
    const signUpModel: z.infer<typeof signUpDto> = req.body
    const accessToken: string = await signUpUser(signUpModel)

    return res.response({
      statusCode: 201,
      apiResponse: ApiResponse.success({ accessToken }),
    })
  }

  @Post(ROUTES.v1.auth.signIn)
  @ApiOperation({
    operationId: 'signIn',
    description: 'Authenticate existing user and return JWT token',
    tags: ['Authentication'],
    summary: 'Sign in',
    security: undefined,
  })
  @ApiBody(true, signInDto)
  @DApiResponse(
    200,
    'Successfully signed in',
    apiResponseSchema(true, signInResponseDto),
  )
  @DApiResponse(400, 'Invalid request body', apiResponseSchema(false))
  @DApiResponse(401, 'Invalid credentials', apiResponseSchema(false))
  @DApiResponse(429, 'Too many requests', apiResponseSchema(false))
  public async signIn(req: Request, res: Response) {
    const signInModel: z.infer<typeof signUpDto> = req.body
    const accessToken = await signInUser(signInModel)

    return res.response({
      statusCode: 200,
      apiResponse: ApiResponse.success({ accessToken }),
    })
  }
}

export default AuthController
