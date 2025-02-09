import express from 'express'
import { ZodOpenApiPathsObject } from 'zod-openapi'

import { ROUTES } from '@/constants'
import { signIn, signUp } from '@/controller/auth'
import {
  asyncWrapper,
  middlewareValidateBody,
  signUpRateLimiter,
} from '@/middleware'
import { signInDto, signUpDto } from '@/model/request/auth.dto'
import { signInResponseDto, signUpResponseDto } from '@/model/response/auth.dto'
import { apiResponseSchema } from '@/utils/apiResponse'

const router = express.Router()

const signInPathObject: ZodOpenApiPathsObject = {
  [ROUTES.v1.auth.signIn]: {
    post: {
      operationId: 'signIn',
      description: 'Authenticate existing user and return JWT token',
      tags: ['Auth'],
      summary: 'Sign in',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: signInDto,
          },
        },
      },
      responses: {
        200: {
          description: 'Successfully authenticated',
          content: {
            'application/json': {
              schema: apiResponseSchema(true, signInResponseDto),
            },
          },
        },
        400: {
          description: 'Invalid request body',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
        401: {
          description: 'Authentication failed',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
      },
    },
  },
}
router.post(
  ROUTES.v1.auth.signIn,
  middlewareValidateBody(signInDto),
  asyncWrapper(signIn),
)

const signUpPathObject: ZodOpenApiPathsObject = {
  [ROUTES.v1.auth.signUp]: {
    post: {
      operationId: 'signUp',
      description: 'Create a new user',
      tags: ['Auth'],
      summary: 'Sign up',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: signUpDto,
          },
        },
      },
      responses: {
        200: {
          description: 'Successfully created user',
          content: {
            'application/json': {
              schema: apiResponseSchema(true, signUpResponseDto),
            },
          },
        },
        400: {
          description: 'Invalid request body',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
        409: {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: apiResponseSchema(false),
            },
          },
        },
      },
    },
  },
}
router.post(
  ROUTES.v1.auth.signUp,
  signUpRateLimiter,
  middlewareValidateBody(signUpDto),
  asyncWrapper(signUp),
)

const authOpenApiPaths: ZodOpenApiPathsObject = {
  ...signInPathObject,
  ...signUpPathObject,
}

export { authOpenApiPaths, router as authRouter }
