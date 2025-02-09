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

const router = express.Router()

const signInPathObject: ZodOpenApiPathsObject = {
  [ROUTES.v1.auth.signIn]: {
    post: {
      operationId: 'signIn',
      description: 'Authenticate existing user and return JWT token',
      tags: ['auth'],
      summary: 'Sign in',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: signInDto,
            example: {
              email: 'user@example.com',
              password: 'password123',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Successfully authenticated',
          content: {
            'application/json': {
              schema: signInResponseDto,
              example: {
                token: 'eyJhbGciOiJIUzI1NiIs...',
                user: {
                  id: '123',
                  email: 'user@example.com',
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid request body',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
              example: {
                message: 'Invalid email or password format',
              },
            },
          },
        },
        401: {
          description: 'Authentication failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
              example: {
                message: 'Invalid credentials',
              },
            },
          },
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
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
      tags: ['auth'],
      summary: 'Sign up',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: signUpDto,
            example: {
              email: 'user@example.com',
              password: 'password123',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Successfully created user',
          content: {
            'application/json': {
              schema: signUpResponseDto,
              example: {
                token: 'eyJhbGciOiJIUzI1NiIs...',
                user: {
                  id: '123',
                  email: 'user@example.com',
                  name: 'John Doe',
                },
              },
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
