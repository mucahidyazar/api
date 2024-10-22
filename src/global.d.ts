// res.success = (data, metadata = {}, links = {}) => {
// res.error = (message, code = 400, details = {}) => {

import { TResponseOptions } from "./common"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      io?: SocketIO.Server
    }
    interface Response {
      response: (options: TResponseOptions) => void
    }
  }
}

export { GlobalInterface, GlobalType }
