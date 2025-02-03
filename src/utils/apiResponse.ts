import { ERROR_CODE } from '@/constants'

type TApiError = {
  type: keyof typeof ERROR_CODE
  code?: (typeof ERROR_CODE)[keyof typeof ERROR_CODE]
  message: string
  detail: unknown
}

class ApiResponse<T = unknown> {
  public success: boolean = false
  public data?: T | unknown = null
  public metadata?: TMetadata | null = null
  public error?: TApiError | null = null

  constructor(init?: Partial<ApiResponse<T>>) {
    Object.assign(this, init)
  }

  public static success<T>(data: T, metadata?: TMetadata): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
      ...(metadata ? metadata : {}),
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

type TMetadata = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export { TApiError, ApiResponse, ExtendedApiResponse }
