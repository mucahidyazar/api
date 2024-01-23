export class SocketMessage {
  public userId: string
  public message: string
  public data: unknown

  constructor(userId: string, message: string, data: unknown) {
    this.userId = userId
    this.message = message
    this.data = data
  }
}
