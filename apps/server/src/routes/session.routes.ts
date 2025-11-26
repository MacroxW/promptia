import { Router, type Router as ExpressRouter } from 'express'

import {
  createSessionController,
  getSessionController,
  listSessionsController,
  updateSessionController
} from '@/controllers/session.controller'

const router: ExpressRouter = Router()

router.get('/', listSessionsController)
router.post('/', createSessionController)
router.get('/:id', getSessionController)
router.patch('/:id', updateSessionController)

export default router
