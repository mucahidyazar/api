export class SocketMessage {
  public user: string
  public message: string
  public type: string
  public data: unknown

  constructor(user: string, message: string, type: string = "custom", data: unknown) {
    this.user = user
    this.message = message
    this.type = type
    this.data = data
  }
}
