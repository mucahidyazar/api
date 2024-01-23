declare global {
  namespace Express {
    interface Request {
      io?: SocketIO.Server
    }
  }
}

export { GlobalInterface, GlobalType }
