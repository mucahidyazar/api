import { Appointment } from '@prisma/client'
import { Server } from 'socket.io'

import { db, logger } from '../../client'
import { Response, SocketMessage } from '../../model'

import { addAppointments, getDoctors, getHours, getLogin } from './helpers'

type SearchAppointmentArgs = {
  appointment: Appointment
  io: Server
}
export async function searchAppointment({
  appointment,
  io,
}: SearchAppointmentArgs) {
  logger.info('Appointment search is started')
  let socketMessage = new SocketMessage(appointment.userId, 'Appointment search is started', "", null)
  io.to(appointment.userId).emit('searchAppointment', socketMessage)
  const { cityId, districtId, polyclinicId, anyDoctor } = appointment

  try {
    // increment checkCount
    logger.debug('Appointment -> before -> await db.appointment.update({')
    socketMessage = new SocketMessage(appointment.userId, 'Appointment checkCount is incremented', "", null)
    io.to(appointment.userId).emit('searchAppointment', socketMessage)
    await db.appointment.update({
      where: { id: appointment.id },
      data: { checkCount: { increment: 1 } },
    })

    // remove expired cookies
    logger.debug('Appointment -> before -> await db.cookie.deleteMany({')
    socketMessage = new SocketMessage(appointment.userId, 'Expired cookies are deleted', "", null)
    io.to(appointment.userId).emit('searchAppointment', socketMessage)
    await db.cookie.deleteMany({ where: { expiresAt: { lt: new Date() } } })

    // check not expired unique token
    logger.debug(
      'Appointment -> before -> const tokenData = await db.cookie.findUnique({',
    )
    socketMessage = new SocketMessage(appointment.userId, 'User mhrsToken is checked', "", null)
    io.to(appointment.userId).emit('searchAppointment', socketMessage)
    const userData = await db.user.findUnique({
      where: { id: appointment.userId },
      select: { mhrsToken: true },
    })

    let token = userData?.mhrsToken?.value

    //! Login
    logger.debug('Appointment -> before -> if (!tokenData) {')
    if (!token) {
      logger.debug('Appointment -> before -> const { data } = await getLogin()')
      socketMessage = new SocketMessage(appointment.userId, 'User is logging in', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      const { data } = await getLogin()
      if (data?.token) {
        logger.debug(
          'Appointment -> before -> const response = await db.cookie.create({',
        )
        socketMessage = new SocketMessage(appointment.userId, 'User mhrsToken is created', "", null)
        io.to(appointment.userId).emit('searchAppointment', socketMessage)
        const response = await db.cookie.create({
          data: {
            userId: appointment.userId,
            appoinmentId: appointment.id,
            key: 'token',
            value: data.token,
            expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
          },
        })

        token = response.value
      }
    }

    logger.debug('Appointment -> before -> if (token) {')
    if (token) {
      //! Get cities
      if (!cityId) return new Response(400, null, 'There is no cityId')
      if (!districtId) return new Response(400, null, 'There is no districtId')
      if (!polyclinicId)
        return new Response(400, null, 'There is no polyclinicId')

      logger.debug('Appointment -> before -> const doctors = await getDoctors({')
      socketMessage = new SocketMessage(appointment.userId, 'Doctors are getting', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      const doctors = await getDoctors({
        cityId,
        districtId,
        polyclinicId,
        token,
      })

      if (!appointment.doctorId && !anyDoctor) {
        logger.debug('Appointment -> after -> if (!appointment.doctorId && !anyDoctor) {')
        socketMessage = new SocketMessage(appointment.userId, 'There is no doctor id so you should choose some of these doctors', "", { doctors })
        io.to(appointment.userId).emit('doctors', socketMessage)
        return new Response(200, null, 'There is no doctorId')
      }

      const doctorId = appointment.doctorId || doctors.value

      logger.debug('Appointment -> before -> const appointmentHours = await getHours({')
      socketMessage = new SocketMessage(appointment.userId, 'Appointment hours are getting', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      const appointmentHours = await getHours({
        doctorId,
        cityId,
        polyclinicId,
        token,
      })

      logger.debug('Appointment -> before -> const response = await addAppointments({')
      socketMessage = new SocketMessage(appointment.userId, 'Appointment is creating', "", null)
      io.to(appointment.userId).emit('searchAppointment', socketMessage)
      const response = await addAppointments({
        appointment,
        appointmentHours,
        token,
      })

      if (response.data) {
        logger.debug('Appointment -> inside -> if (response.data) {')
        socketMessage = new SocketMessage(appointment.userId, 'Appointment is created', "", { appointment: response.data })
        io.to(appointment.userId).emit('searchAppointment', socketMessage)
        db.appointment.update({
          where: { id: appointment.id },
          data: {
            reservedAt: (response.data as { data: { randevuId: string } }).data
              .randevuId,
          },
        })
        return new Response(200, null, 'Appointment created')
      }
      logger.debug('Appointment -> after -> if (response.data) {')

      return new Response(400, null, 'Appointment not created')
    }
  } catch (error) {
    logger.error(JSON.stringify(error))
    socketMessage = new SocketMessage(appointment.userId, 'Something went wrong', "", null)
    io.to(appointment.userId).emit('searchAppointment', socketMessage)
    return new Response(400, null, 'Something went wrong')
  }
}
