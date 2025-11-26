import { Router, type Router as ExpressRouter } from 'express'
import { sessionController } from '@/controllers/session.controller'

const router: ExpressRouter = Router()

router.get('/', sessionController.listSessions.bind(sessionController))
router.post('/', sessionController.createSession.bind(sessionController))
router.get('/:id', sessionController.getSession.bind(sessionController))
router.patch('/:id', sessionController.updateSession.bind(sessionController))

export default router
