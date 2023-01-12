import axios, {AxiosError} from 'axios'

import {logger} from '../utils'
import {CONFIG} from '../config'
import {City, District, Policinic} from '../data'

export const mhrsApi = axios.create({
  baseURL: 'https://prd.mhrs.gov.tr/api',
})

mhrsApi.interceptors.response.use(undefined, async (error: AxiosError) => {
  const originalRequestConfig = error.config

  logger('Retrying...', {type: 'info'})
  logger(`Error: ${error.message}`, {type: 'error', date: true})
  logger(`URL: ${error.config?.url}`, {type: 'error', date: true})

  const requestData: any = JSON.parse(originalRequestConfig?.data)
  console.table({
    City: Object.values(City).find(
      (item: any) => item.value === requestData.mhrsIlId,
    ),
    District: Object.values(District).find(
      (item: any) => item.value === requestData.mhrsIlceId,
    ),
    Policinic: Object.values(Policinic).find(
      (item: any) => item.value === requestData.mhrsKlinikId,
    ),
  })

  setTimeout(() => {
    mhrsApi.request(originalRequestConfig as any)
  }, CONFIG.REPEAT_REQUEST_TIME)
})
