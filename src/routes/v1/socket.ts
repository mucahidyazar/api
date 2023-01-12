import express from 'express'

import {ROUTES} from '../../constants'
import {watchList} from '../../controller'

const router = express.Router()

router.get(ROUTES.v1.socket.simpleSocket, watchList)

export {router as socketRouter}
