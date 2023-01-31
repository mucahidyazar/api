import express from 'express'

import {getLinkPreview} from '../../controller'
import {tryCatch} from '../../utils'
import {ROUTES} from '../../constants'

const router = express.Router()

router.get(ROUTES.v1.linkPreview.linkPreview, tryCatch(getLinkPreview))
// patch doesnt change all the fields, it changes only the fields that are sent
// put changes all the fields, it changes all the fields that are sent

export {router as linkPreviewRouter}
