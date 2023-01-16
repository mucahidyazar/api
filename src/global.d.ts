declare global {
  var bot: any
  var token: string
  var apiConfig: any
  var hadAppointment = false
  var myAppointments: any

  interface GlobalInterface {
    bot: any
    token: string
    apiConfig: any
    hadAppointment: boolean
    myAppointments: any
  }

  type GlobalType = {
    bot: any
    token: string
    apiConfig: any
    hadAppointment: boolean
    myAppointments: any
  }

  namespace Express {
    interface Request {
      io?: SocketIO.Server
    }
  }
}

export {GlobalInterface, GlobalType}
