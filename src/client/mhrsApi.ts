import axios, { AxiosError } from 'axios'

import { logger } from '../client'
import { CONFIG } from '../config'
import { CITY, DISTRICT, POLYCLINIC } from '../constants'

export const mhrsApi = axios.create({
  baseURL: 'https://prd.mhrs.gov.tr/api',
})

mhrsApi.interceptors.response.use(undefined, async (error: AxiosError) => {
  const originalRequestConfig = error.config

  logger.info('\n\nAXIOS -> inside interceptors -> Retrying...')
  logger.error(`AXIOS -> inside interceptors -> Error: ${error.message}`)
  logger.debug(`AXIOS -> inside interceptors -> URL: ${error.config?.url}`)

  const requestData = JSON.parse(originalRequestConfig?.data)

  const city = CITY[requestData.mhrsIlId]
  const district = DISTRICT[requestData.mhrsIlceId]
  const polyclinic = POLYCLINIC[requestData.mhrsKlinikId]
  logger.debug(`AXIOS -> inside interceptors -> ${polyclinic} / ${city} / ${district}\n\n`)

  setTimeout(() => {
    mhrsApi.request(originalRequestConfig as any)
  }, CONFIG.REPEAT_REQUEST_TIME)
})
