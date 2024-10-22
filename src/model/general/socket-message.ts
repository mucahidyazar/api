export class SocketMessage {
  public userId: string
  public message: string
  public type: string
  public data: unknown

  constructor(userId: string, message: string, type: string = "custom", data: unknown) {
    this.userId = userId
    this.message = message
    this.type = type
    this.data = data
  }
}
