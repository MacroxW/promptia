import { Router, type Router as ExpressRouter } from 'express'

import {
  createSessionController,
  getSessionController,
  listSessionsController
} from '@/controllers/session.controller'

const router: ExpressRouter = Router()

router.get('/', listSessionsController)
router.post('/', createSessionController)
router.get('/:id', getSessionController)

export default router
