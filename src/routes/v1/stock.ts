import express from 'express'

import {watchList} from '../../controller'
import {tryCatch} from '../../utils'
import {ROUTES} from '../../constants'

const router = express.Router()

router.get(ROUTES.v1.stock.simpleStock, tryCatch(watchList))

export {router as stockRouter}
