import express from 'express'

import { ROUTES } from '../../../constants'
import { groupCreate, groupDelete, groupGet, groupList, groupUpdate, groupInviteAnswer, groupInviteSend, groupInviteList } from '../../../controller/home-hub/group'
import { tryCatch } from '../../../utils'

const router = express.Router()

router.post(ROUTES.v1.homeHub.group.create, tryCatch(groupCreate))
router.delete(ROUTES.v1.homeHub.group.delete, tryCatch(groupDelete))
router.get(ROUTES.v1.homeHub.group.get, tryCatch(groupGet))
router.get(ROUTES.v1.homeHub.group.list, tryCatch(groupList))
router.put(ROUTES.v1.homeHub.group.update, tryCatch(groupUpdate))

router.post(ROUTES.v1.homeHub.group.invite.send, tryCatch(groupInviteSend))
router.post(ROUTES.v1.homeHub.group.invite.answer, tryCatch(groupInviteAnswer))
router.get(ROUTES.v1.homeHub.group.invite.list, tryCatch(groupInviteList))

export { router as groupRouter }
