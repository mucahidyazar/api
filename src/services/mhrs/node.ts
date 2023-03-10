import process from 'process'
import dotEnv from 'dotenv'

dotEnv.config({
  path: process.cwd() + '/.env',
})

import './global'
import prompts from 'prompts'

import {logger} from '@/utils'
import {CONFIG} from '@/config'
import {ICity, IDistrict} from '@/types'
import {city, district, policinic} from '@/data'

import {addAppointments, getDoctors, getHours, getLogin} from './helper'

interface IStartAppArgs {
  cityId?: number | string
  districtId?: number | string
  policinicId?: number | string
}
const startApp = async ({cityId, districtId, policinicId}: IStartAppArgs) => {
  logger('App started', {type: 'info'})

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
          choices: Object.values(city),
        })
      }
      if (!districtId) {
        copyOfPrompts.push({
          type: 'select',
          name: 'district',
          message: (prev: ICity) => `Select district of ${prev.text}`,
          choices: Object.values(district),
        })
      }
      if (!policinicId) {
        copyOfPrompts.push({
          type: 'select',
          name: 'policilinics',
          message: (prev: IDistrict) => `Select policilinics of ${prev.text}`,
          choices: Object.values(policinic),
        })
      }

      const doctors = await getDoctors({
        cityId: cityId || (await prompts(copyOfPrompts)).city,
        districtId: districtId || (await prompts(copyOfPrompts)).district,
        policinicId: policinicId || (await prompts(copyOfPrompts)).policilinics,
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
              policinicId: policinicId || values.policilinics.value,
            })

            addAppointments(appointment)
          },
        },
      ])
    }
  } catch (error) {
    logger(JSON.stringify(error), {type: 'error'})
  }
}

// CLI arguments
const args = process.argv.slice(2)
const serializeArgs = args.join(' ')
const myArgs = {
  cityId: serializeArgs.match(/--cityId=(\d+)/)?.[1],
  districtId: serializeArgs.match(/--districtId=(\d+)/)?.[1],
  policinicId: serializeArgs.match(/--policinicId=(\d+)/)?.[1],
}

//! Start App
// startApp({
//   cityId: myArgs.cityId || city['??STANBUL(ANADOLU)'].value,
//   districtId: myArgs.districtId || district.TUZLA.value,
//   policinicId:
//     myArgs.policinicId ||
//     policinic['Deri ve Z??hrevi Hastal??klar?? (Cildiye)'].value,
// })

const run = async () => {
  const options = [
    {
      cityId: city['??STANBUL(ANADOLU)'].value,
      districtId: district.TUZLA.value,
      policinicId: policinic['Deri ve Z??hrevi Hastal??klar?? (Cildiye)'].value,
    },
    {
      cityId: city['??STANBUL(ANADOLU)'].value,
      districtId: district.PEND??K.value,
      policinicId: policinic['Deri ve Z??hrevi Hastal??klar?? (Cildiye)'].value,
    },
    {
      cityId: city['??STANBUL(ANADOLU)'].value,
      districtId: district.KARTAL.value,
      policinicId: policinic['Deri ve Z??hrevi Hastal??klar?? (Cildiye)'].value,
    },
  ]

  const startWithTimeout = async (options: any, timeout: number) => {
    setTimeout(() => {
      startApp(options)
    }, timeout)
  }

  options.forEach(function (item, index) {
    startWithTimeout(
      item,
      Math.abs(
        CONFIG.REPEAT_REQUEST_TIME / options.length -
          ((index + 1) * CONFIG.REPEAT_REQUEST_TIME) / options.length,
      ),
    )
  })
}

run()
