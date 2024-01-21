import process from 'process'
import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import './global'
import prompts from 'prompts'

import { logger } from '@/client'
import { CONFIG } from '@/config'
import { ICity, IDistrict } from '@/types'
import { CITY, DISTRICT, POLYCLINIC } from '@/constants'

import { addAppointments, getDoctors, getHours, getLogin } from './helper'

interface IStartAppArgs {
  cityId?: number | string
  districtId?: number | string
  polyclinicId?: number | string
}
const startApp = async ({ cityId, districtId, polyclinicId }: IStartAppArgs) => {
  logger.info('App started')

  try {
    //! Login
    if (!token) {
      await getLogin()
    }

    if (token) {
      //? Prompt data
      let copyOfPrompts: any = []

      //! Get cities
      if (!cityId) {
        copyOfPrompts.push({
          type: 'select',
          name: 'city',
          message: 'Select city',
          choices: Object.entries(CITY).map(([value, title]) => ({ title, value })),
        })
      }
      if (!districtId) {
        copyOfPrompts.push({
          type: 'select',
          name: 'district',
          message: (prev: ICity) => `Select district of ${prev.text}`,
          choices: Object.entries(DISTRICT).map(([value, title]) => ({ title, value })),
        })
      }
      if (!polyclinicId) {
        copyOfPrompts.push({
          type: 'select',
          name: 'policilinics',
          message: (prev: IDistrict) => `Select policilinics of ${prev.text}`,
          choices: Object.entries(POLYCLINIC).map(([value, title]) => ({ title, value })),
        })
      }

      const doctors = await getDoctors({
        cityId: cityId || (await prompts(copyOfPrompts)).city,
        districtId: districtId || (await prompts(copyOfPrompts)).district,
        polyclinicId: polyclinicId || (await prompts(copyOfPrompts)).policilinics,
      })

      if (!CONFIG.ANY_DOCTOR) {
        copyOfPrompts.push({
          type: 'select',
          name: 'doctors',
          message: 'Select doctor',
          choices: doctors,
        })
      }

      //! prompts
      await prompts([
        ...copyOfPrompts,
        {
          type: 'select',
          name: 'appointments',
          message: (prev: any) => `Select appointments.`,
          choices: async (prev: any, values) => {
            const appointment = await getHours({
              doctorId: values?.doctors?.value || doctors,
              cityId: cityId || values.city.value,
              polyclinicId: polyclinicId || values.policilinics.value,
            })

            addAppointments(appointment)
          },
        },
      ])
    }
  } catch (error) {
    logger.error(JSON.stringify(error))
  }
}

// CLI arguments
const args = process.argv.slice(2)
const serializeArgs = args.join(' ')
const myArgs = {
  cityId: serializeArgs.match(/--cityId=(\d+)/)?.[1],
  districtId: serializeArgs.match(/--districtId=(\d+)/)?.[1],
  polyclinicId: serializeArgs.match(/--polyclinicId=(\d+)/)?.[1],
}

//! Start App
// startApp({
//   cityId: myArgs.cityId || city['İSTANBUL(ANADOLU)'].value,
//   districtId: myArgs.districtId || district.TUZLA.value,
//   polyclinicId:
//     myArgs.polyclinicId ||
//     policinic['Deri ve Zührevi Hastalıkları (Cildiye)'].value,
// })

// const run = async () => {
//   const options = [
//     {
//       cityId: city['İSTANBUL(ANADOLU)'].value,
//       districtId: district.TUZLA.value,
//       polyclinicId: policinic['Deri ve Zührevi Hastalıkları (Cildiye)'].value,
//     },
//     {
//       cityId: city['İSTANBUL(ANADOLU)'].value,
//       districtId: district.PENDİK.value,
//       polyclinicId: policinic['Deri ve Zührevi Hastalıkları (Cildiye)'].value,
//     },
//     {
//       cityId: city['İSTANBUL(ANADOLU)'].value,
//       districtId: district.KARTAL.value,
//       polyclinicId: policinic['Deri ve Zührevi Hastalıkları (Cildiye)'].value,
//     },
//   ]

//   const startWithTimeout = async (options: any, timeout: number) => {
//     setTimeout(() => {
//       startApp(options)
//     }, timeout)
//   }

//   options.forEach(function (item, index) {
//     startWithTimeout(
//       item,
//       Math.abs(
//         CONFIG.REPEAT_REQUEST_TIME / options.length -
//         ((index + 1) * CONFIG.REPEAT_REQUEST_TIME) / options.length,
//       ),
//     )
//   })
// }

// run()
