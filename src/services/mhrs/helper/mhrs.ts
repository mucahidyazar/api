import {mhrsApi} from '@/client'
import {IGetDoctors, IGetHours} from '@/types'
import {CONFIG} from '@/config'
import {logger} from '@/utils'

import {ENDPOINTS} from '../endpoints'

const getLogin = async () => {
  logger('Logining...', {type: 'info'})

  const {data: loginResponse} = await mhrsApi.post(ENDPOINTS.login(), {
    kullaniciAdi: CONFIG.MHRS_USERNAME,
    parola: CONFIG.MHRS_PASSWORD,
    islemKanali: 'VATANDAS_WEB',
    girisTipi: 'PAROLA',
  })
  if (loginResponse.data) {
    token = loginResponse.data.jwt
    apiConfig = {
      headers: {
        Authorization: `Bearer ${loginResponse.data.jwt}`,
      },
    }
    logger('Login success', {type: 'success'})
    logger(`Welcome ${loginResponse.data.kullaniciAdi}`, {type: 'info'})
  }
}

const getDoctors = async ({cityId, districtId, policinicId}: IGetDoctors) => {
  logger('Selecting doctor...', {type: 'info'})

  const {data: doctorsResponse} = await mhrsApi.post(
    ENDPOINTS.doctors(),
    {
      aksiyonId: 200,
      cinsiyet: 'F',
      ekRandevu: true,
      mhrsHekimId: -1,
      mhrsIlId: cityId,
      mhrsIlceId: districtId,
      mhrsKlinikId: policinicId,
      mhrsKurumId: 177339,
      muayeneYeriId: -1,
      randevuZamaniList: [],
      tumRandevular: false,
    },
    apiConfig,
  )

  if (CONFIG.ANY_DOCTOR) {
    return doctorsResponse.data.hastane[0].hekim.mhrsHekimId
  }

  return doctorsResponse.data.hastane.map((item: any) => ({
    title: `${item.hekim.ad} ${item.hekim.soyad} / ${item.kurum.kurumKisaAdi}`,
    value: item.hekim.mhrsHekimId,
  }))
}

const getHours = async ({doctorId, cityId, policinicId}: IGetHours) => {
  logger('Getting hours...', {type: 'info'})

  const {data: hoursResponse} = await mhrsApi.post(
    ENDPOINTS.hours(),
    {
      aksiyonId: 200,
      cinsiyet: 'F',
      ekRandevu: true,
      mhrsHekimId: doctorId,
      mhrsIlId: cityId,
      mhrsKlinikId: policinicId,
      mhrsKurumId: 177339,
      muayeneYeriId: -1,
      randevuZamaniList: [],
      tumRandevular: false,
    },
    apiConfig,
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

const addAppointments = async (appointment: any) => {
  logger('Creating appointment...', {type: 'info'})

  const oldRandevuTimeStamp = new Date(
    global.myAppointments[appointment.mhrsKlinikId],
  ).getTime()
  const newRandevuTimeStamp = new Date(appointment.baslangicZamani).getTime()

  if (newRandevuTimeStamp > oldRandevuTimeStamp) {
    logger('New appointment is in the future', {type: 'error'})
    return
  }

  const {data: appointmentResponse} = await mhrsApi.post(
    ENDPOINTS.appointment(),
    {
      baslangicZamani: appointment.baslangicZamani,
      bitisZamani: appointment.bitisZamani,
      fkCetvelId: appointment.fkCetvelId,
      fkSlotId: appointment.id || appointment.slot.id,
      randevuNotu: '',
      yenidogan: false,
    },
    apiConfig,
  )

  if (appointmentResponse.success) {
    logger('Appointment created', {type: 'success'})
    global.hadAppointment = true
    global.myAppointments = {
      [appointmentResponse.data.klinik.mhrsKlinikId]: newRandevuTimeStamp,
    }
  } else {
    logger('Appointment not created', {type: 'error'})

    if (!global.hadAppointment) {
      setTimeout(() => {
        addAppointments(appointment)
      }, CONFIG.REPEAT_CHECK_TIME)
    }
  }
}

export {getLogin, getDoctors, getHours, addAppointments}
