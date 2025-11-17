import { Router, type Router as ExpressRouter } from 'express'

import { loginController, registerController } from '@/controllers/auth.controller'

const router: ExpressRouter = Router()

router.post('/register', registerController)
router.post('/login', loginController)

export default router
