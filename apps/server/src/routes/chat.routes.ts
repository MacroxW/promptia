import { Router, type Router as ExpressRouter } from 'express'

import { chatController } from '@/controllers/chat.controller'

const router: ExpressRouter = Router()

router.post('/:sessionId', chatController)

export default router
