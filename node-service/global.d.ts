/* eslint-disable no-var */
declare global {
  var bot: any
  var token: string
  var apiConfig: any
  var hadAppointment: boolean
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
}

export { GlobalInterface, GlobalType }
