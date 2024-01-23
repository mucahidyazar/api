import express from 'express'

import { ROUTES } from '../../constants'
import { start } from '../../controller'

const router = express.Router()

router.get(ROUTES.v1.socket.start, start)

export { router as socketRouter }
