import { Router, type Router as ExpressRouter } from 'express'
import { sessionController } from '@/controllers/session.controller'

const router: ExpressRouter = Router()

router.get('/', sessionController.listSessions)
router.post('/', sessionController.createSession)
router.get('/:id', sessionController.getSession)
router.patch('/:id', sessionController.updateSession)

export default router
