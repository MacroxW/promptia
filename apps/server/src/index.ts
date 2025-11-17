import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { env } from '@/config/env'
import { errorHandler } from '@/middleware/error-handler'
import authRoutes from '@/routes/auth.routes'

const app: Express = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/auth', authRoutes)
app.use(errorHandler)

const PORT = env.port

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export { app }
