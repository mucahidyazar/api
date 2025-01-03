import express from 'express'

import { ROUTES } from '@/constants'
import { getLinkPreview } from '@/controller'
import { asyncHandler } from '@/middleware'

const router = express.Router()

router.get(ROUTES.v1.linkPreview.linkPreview, asyncHandler(getLinkPreview))
// patch doesnt change all the fields, it changes only the fields that are sent
// put changes all the fields, it changes all the fields that are sent

export { router as linkPreviewRouter }
