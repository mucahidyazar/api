import { ERROR_CODE } from '@/constants'

type TApiError = {
  type: keyof typeof ERROR_CODE
  code?: (typeof ERROR_CODE)[keyof typeof ERROR_CODE]
  message: string
  detail: unknown
}

class ApiResponse {
  public success: boolean = false
  public data?: unknown = null
  public metadata?: TMetadata | null = null
  public error?: TApiError | null = null

  constructor(init?: Partial<ApiResponse>) {
    Object.assign(this, init)
  }

  public static success(data: unknown, metadata?: TMetadata): ApiResponse {
    return new ApiResponse({
      success: true,
      data,
      ...(metadata ? metadata : {}),
    })
  }

  public static failure(error: TApiError): ApiResponse {
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
