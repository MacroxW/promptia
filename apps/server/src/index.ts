import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { env } from '@/config/env'
import { authenticate } from '@/middleware/auth.middleware'
import { errorHandler } from '@/middleware/error-handler'
import authRoutes from '@/routes/auth.routes'
import chatRoutes from '@/routes/chat.routes'
import sessionRoutes from '@/routes/session.routes'

const app: Express = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/sessions', authenticate, sessionRoutes)
app.use('/api/chat', authenticate, chatRoutes)
app.use(errorHandler)

const PORT = env.port

// Solo iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

export { app }
