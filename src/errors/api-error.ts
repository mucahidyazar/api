import { ERROR_CODE } from '@/constants'

export class ApiError extends Error {
  public errorCode: (typeof ERROR_CODE)[keyof typeof ERROR_CODE] =
    ERROR_CODE.UnknownError

  constructor(
    message: string,
    errorCode?: (typeof ERROR_CODE)[keyof typeof ERROR_CODE],
  ) {
    super(message)
    this.errorCode = errorCode || this.errorCode
  }
}
