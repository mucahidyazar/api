export class Response {
  public status: number
  public data: any
  public message: string
  public error?: any

  constructor(
    status: number,
    data: any,
    message: string,
    error?: any,
  ) {
    this.status = status
    this.data = data
    this.message = message
    this.error = error
  }
}
