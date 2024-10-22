export class Response {
  public status: number
  public data: unknown
  public message: string

  constructor(status: number, data: unknown, message: string) {
    this.status = status
    this.data = data
    this.message = message
  }
}

export class ApiResponse {
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message: message,
      data: data
    });
  }

  static error(res, message, error = null, statusCode = 400) {
    return res.status(statusCode).json({
      status: 'error',
      message: message,
      error: error
    });
  }
}
