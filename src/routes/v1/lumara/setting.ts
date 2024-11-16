import express from 'express'

import { ROUTES } from '@/constants'
import {
  settingGet,
  settingUpdate,
  settingBackup,
  settingRestore,
  settingReset
} from '@/controller/lumara/setting'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.get(ROUTES.v1.lumara.setting.get, asyncHandler(settingGet))
router.put(ROUTES.v1.lumara.setting.update, asyncHandler(settingUpdate))
router.post(ROUTES.v1.lumara.setting.backup, asyncHandler(settingBackup))
router.post(ROUTES.v1.lumara.setting.restore, asyncHandler(settingRestore))
router.post(ROUTES.v1.lumara.setting.reset, asyncHandler(settingReset))

export { router as settingRouter }
