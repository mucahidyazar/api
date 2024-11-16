import express from 'express'

import { ROUTES } from '@/constants'
import {
  calculationCreate,
  // calculationDelete,
  // calculationGet,
  calculationList,
  calculationUpdate
} from '@/controller/lumara/calculation'
import { asyncHandler } from '@/middleware'
import { middlewareValidateBody } from '@/middleware'
import { calculationSchema, calculationUpdateSchema } from '@/validation'

const router = express.Router()

router.post(
  ROUTES.v1.lumara.calculation.create,
  middlewareValidateBody(calculationSchema),
  asyncHandler(calculationCreate)
)
// router.delete(ROUTES.v1.lumara.calculation.delete, asyncHandler(calculationDelete))
// router.get(ROUTES.v1.lumara.calculation.get, asyncHandler(calculationGet))
router.get(ROUTES.v1.lumara.calculation.list, asyncHandler(calculationList))
router.put(
  ROUTES.v1.lumara.calculation.update,
  middlewareValidateBody(calculationUpdateSchema),
  asyncHandler(calculationUpdate)
)

export { router as calculationRouter }
