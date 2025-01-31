type ApiError = {
  code?: number
  message: string
  detail: unknown
}

class ApiResponse {
  public success: boolean = false
  public data?: unknown = null
  public metadata?: TMetadata | null = null
  public error?: ApiError | null = null

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

  public static failure(error: ApiError): ApiResponse {
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

export { ApiResponse, ExtendedApiResponse }
