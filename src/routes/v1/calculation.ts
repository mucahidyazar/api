import express from 'express'

import { ROUTES } from '@/constants'
import { calculationCreate, calculationList } from '@/controller/calculation'
import { asyncWrapper } from '@/middleware'
import { middlewareValidateBody } from '@/middleware'
import { calculationCreateSchema } from '@/validation'

const router = express.Router()

router.post(
  ROUTES.v1.calculation.create,
  middlewareValidateBody(calculationCreateSchema),
  asyncWrapper(calculationCreate),
)
router.get(ROUTES.v1.calculation.list, asyncWrapper(calculationList))

export { router as calculationRouter }
