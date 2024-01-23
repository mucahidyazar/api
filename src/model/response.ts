export class Response {
  public status: number
  public data: unknown
  public message: string

  constructor(
    status: number,
    data: unknown,
    message: string,
  ) {
    this.status = status
    this.data = data
    this.message = message
  }
}
