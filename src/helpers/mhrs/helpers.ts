import { Appointment } from '@prisma/client'

import { logger, mhrsApi } from '../../client'
import { IGetDoctors, IGetHours } from '../../common'
import { CONFIG } from '../../config'
import { Response } from '../../model'

import { ENDPOINTS } from './endpoints'

const getLogin = async () => {
  logger.info('Logining...')

  const { data: loginResponse } = await mhrsApi.post(ENDPOINTS.login(), {
    kullaniciAdi: CONFIG.MHRS_USERNAME,
    parola: CONFIG.MHRS_PASSWORD,
    islemKanali: 'VATANDAS_WEB',
    girisTipi: 'PAROLA',
  })

  if (!loginResponse.data) return { message: 'Login failed' }

  logger.info('Login success')
  logger.info(`Welcome ${loginResponse.data.kullaniciAdi}`)

  return { data: { token: loginResponse.data.jwt } }
}

const getDoctors = async ({
  cityId,
  districtId,
  polyclinicId,
  token,
}: IGetDoctors & { token: string }) => {
  logger.info('Selecting doctor...')

  try {
    const { data: doctorsResponse } = await mhrsApi.post(
      ENDPOINTS.doctors(),
      {
        aksiyonId: 200,
        cinsiyet: 'F',
        ekRandevu: true,
        mhrsHekimId: -1,
        mhrsIlId: cityId,
        mhrsIlceId: districtId,
        mhrsKlinikId: polyclinicId,
        mhrsKurumId: 177339,
        muayeneYeriId: -1,
        randevuZamaniList: [],
        tumRandevular: false,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (CONFIG.ANY_DOCTOR) {
      return doctorsResponse.data.hastane[0].hekim.mhrsHekimId
    }

    return doctorsResponse.data.hastane.map((item: any) => ({
      title: `${item.hekim.ad} ${item.hekim.soyad} / ${item.kurum.kurumKisaAdi}`,
      value: item.hekim.mhrsHekimId,
    }))
  } catch (error) {
    logger.error('Doctor not found')
    return error
  }
}

const getHours = async ({
  doctorId,
  cityId,
  polyclinicId,
  token,
}: IGetHours & { token: string }) => {
  logger.info('Getting hours...')

  const { data: hoursResponse } = await mhrsApi.post(
    ENDPOINTS.hours(),
    {
      aksiyonId: 200,
      cinsiyet: 'F',
      ekRandevu: true,
      mhrsHekimId: doctorId,
      mhrsIlId: cityId,
      mhrsKlinikId: polyclinicId,
      mhrsKurumId: 177339,
      muayeneYeriId: -1,
      randevuZamaniList: [],
      tumRandevular: false,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  )

  const treeOne = hoursResponse.data.find((item: any) => item.bos === true)
  const treeTwo = treeOne.hekimSlotList.find((item: any) => item.bos === true)
  const treeThree = treeTwo.muayeneYeriSlotList.find(
    (item: any) => item.bos === true,
  )
  const treeFour = treeThree.saatSlotList.find((item: any) => item.bos === true)
  const treeFive = treeFour.slotList.find((item: any) => item.bos === true)

  return treeFive
}

type AppointmentHours = {
  mhrsKlinikId: number
  baslangicZamani: string
  bitisZamani: string
  fkCetvelId: number
  id?: number
  slot?: { id: number }
}
type AddAppointmentsArgs = {
  appointmentHours: AppointmentHours
  appointment: Appointment
  token: string
}
const addAppointments = async ({
  appointmentHours,
  appointment,
  token,
}: AddAppointmentsArgs) => {
  logger.info('Creating appointment...')

  const oldRandevuTimeStamp = appointment.reservedAt
    ? new Date(appointment.reservedAt).getTime()
    : 0
  const newRandevuTimeStamp = new Date(
    appointmentHours.baslangicZamani,
  ).getTime()

  if (newRandevuTimeStamp > oldRandevuTimeStamp) {
    logger.error('New appointment is in the future')
    return new Response(400, null, 'New appointment is in the future')
  }

  const { data: appointmentResponse } = await mhrsApi.post(
    ENDPOINTS.appointment(),
    {
      baslangicZamani: appointmentHours.baslangicZamani,
      bitisZamani: appointmentHours.bitisZamani,
      fkCetvelId: appointmentHours.fkCetvelId,
      fkSlotId: appointmentHours.id || appointmentHours.slot?.id,
      randevuNotu: '',
      yenidogan: false,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (appointmentResponse.success) {
    logger.info('Appointment created')
    // appointmentId: appointmentResponse.data.randevuId,
    return new Response(200, appointmentResponse, 'Appointment created')
  } else {
    logger.error('Appointment not created')
    return new Response(400, null, 'Appointment not created')
  }
}

export { addAppointments, getDoctors, getHours, getLogin }
