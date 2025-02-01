import { ExtendedApiResponse } from '@/utils'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      io?: SocketIO.Server
    }

    interface Response {
      response: (response: ExtendedApiResponse) => void
    }
  }
}

export { GlobalInterface, GlobalType }
