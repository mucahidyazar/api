import express from 'express'

import { ROUTES } from '@/constants'
import {
  settingGet,
  settingUpdate,
  settingBackup,
  settingRestore,
  settingReset,
} from '@/controller'
import { asyncWrapper, middlewareValidateBody } from '@/middleware'
import { settingUpdateSchema } from '@/validation/setting'

const router = express.Router()

router.get(ROUTES.v1.setting.get, asyncWrapper(settingGet))

router.put(
  ROUTES.v1.setting.update,
  middlewareValidateBody(settingUpdateSchema),
  asyncWrapper(settingUpdate),
)

router.post(ROUTES.v1.setting.backup, asyncWrapper(settingBackup))

router.post(ROUTES.v1.setting.restore, asyncWrapper(settingRestore))

router.post(ROUTES.v1.setting.reset, asyncWrapper(settingReset))

export { router as settingRouter }
