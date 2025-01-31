export class CustomError extends Error {
  public statusCode: number = 400

  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode || this.statusCode
  }
}
