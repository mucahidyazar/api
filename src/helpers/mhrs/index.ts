import { Appointment } from '@prisma/client'
import { Server } from 'socket.io'

import { db, logger } from '../../client'
import { Response } from '../../model'

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
  const { cityId, districtId, polyclinicId, anyDoctor } = appointment

  try {
    // remove expired cookies
    logger.debug('Appointment -> before -> await db.cookie.deleteMany({')
    await db.cookie.deleteMany({ where: { expiresAt: { lt: new Date() } } })

    // check not expired unique token
    logger.debug(
      'Appointment -> before -> const tokenData = await db.cookie.findUnique({',
    )
    const tokenData = await db.cookie.findUnique({
      where: {
        userId: appointment.userId,
        appoinmentId: appointment.id,
        expiresAt: { gt: new Date() },
      },
    })

    let token = tokenData?.value

    //! Login
    logger.debug('Appointment -> before -> if (!tokenData) {')
    if (!tokenData) {
      logger.debug('Appointment -> before -> const { data } = await getLogin()')
      const { data } = await getLogin()
      if (data?.token) {
        logger.debug(
          'Appointment -> before -> const response = await db.cookie.create({',
        )
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

      logger.debug(
        'Appointment -> before -> const doctors = await getDoctors({ cityId, districtId, polyclinicId, token })',
      )
      const doctors = await getDoctors({
        cityId,
        districtId,
        polyclinicId,
        token,
      })

      logger.debug(
        'Appointment -> before -> if (!appointment.doctorId && !anyDoctor) {',
      )
      if (!appointment.doctorId && !anyDoctor) {
        io.to(appointment.userId).emit('doctors', {
          appointmentId: appointment.id,
          doctors,
        })
        return new Response(200, null, 'There is no doctorId')
      }

      const doctorId = appointment.doctorId || doctors.value

      logger.debug(
        'Appointment -> before -> const appointmentHours = await getHours({',
      )
      const appointmentHours = await getHours({
        doctorId,
        cityId,
        polyclinicId,
        token,
      })

      logger.debug(
        'Appointment -> before -> const response = await addAppointments({',
      )
      const response = await addAppointments({
        appointment,
        appointmentHours,
        token,
      })

      if (response.data) {
        logger.debug('Appointment -> inside -> if (response.data) {')
        io.to(appointment.userId).emit('appointment', { data: response.data })
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
    return new Response(400, null, 'Something went wrong')
  }
}
