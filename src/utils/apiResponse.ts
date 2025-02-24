import 'zod-openapi/extend'
import { z } from 'zod'

import { ERROR_CODE } from '@/constants'

type TApiError = {
  type: keyof typeof ERROR_CODE
  code?: (typeof ERROR_CODE)[keyof typeof ERROR_CODE]
  message: string
  detail: unknown
}

type TMetadata = {
  page?: number
  limit?: number
  totalItems?: number
  totalPages?: number
  currentPage?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  nextPage?: number | null
  prevPage?: number | null
  [key: string]: any // This allows for additional properties
}

class ApiResponse<T = unknown> {
  public success: boolean = false
  public data?: T | undefined
  public metadata?: TMetadata | undefined
  public error?: TApiError | undefined

  constructor(init?: Partial<ApiResponse<T>>) {
    Object.assign(this, init)
  }

  public static success<T>(data: T, metadata?: TMetadata): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
      metadata,
    })
  }

  public static failure(error: TApiError): ApiResponse<never> {
    return new ApiResponse({ error })
  }
}

type ExtendedApiResponse = {
  statusCode: number

  apiResponse: ApiResponse
}

export { ApiResponse, ExtendedApiResponse, TApiError }

// we need to create same structure with zod objects

const apiErrorSchema = z.object({
  type: z.string().openapi({
    description: 'The type of the error',
    example: 'validation_error',
  }),
  code: z.string().openapi({
    description: 'The code of the error',
    example: 'validation_error',
  }),
  message: z.string().openapi({
    description: 'The message of the error',
    example: 'Validation error',
  }),
  detail: z.any().openapi({
    description: 'The detail of the error',
    example: {},
  }),
})

const apiResponseSchema = <T, M>(
  isSuccess: boolean,
  dataSchema?: z.ZodSchema<T>,
  metadataSchema?: z.ZodSchema<M>,
) =>
  z
    .object({
      success: z.boolean().openapi({
        description: 'The success of the response',
        example: isSuccess,
      }),
      data: dataSchema || z.undefined(),
      metadata: metadataSchema || z.undefined(),
      error: isSuccess ? z.undefined() : apiErrorSchema,
    })
    .strict()
    .openapi({
      description: 'The response of the API',
    })

export { apiResponseSchema }
