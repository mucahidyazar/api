import express from 'express'

import { ROUTES } from '../../../constants'
import {
  settingGet,
  settingUpdate,
  settingBackup,
  settingRestore,
  settingReset
} from '../../../controller/lumara/setting'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.get(ROUTES.v1.lumara.setting.get, tryCatch(settingGet))
router.put(ROUTES.v1.lumara.setting.update, tryCatch(settingUpdate))
router.post(ROUTES.v1.lumara.setting.backup, tryCatch(settingBackup))
router.post(ROUTES.v1.lumara.setting.restore, tryCatch(settingRestore))
router.post(ROUTES.v1.lumara.setting.reset, tryCatch(settingReset))

export { router as settingRouter }
