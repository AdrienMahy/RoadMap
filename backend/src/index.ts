import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectsRouter from '@/routes/projects'
import modulesRouter from '@/routes/modules'
import stagesRouter from '@/routes/stages'
import pointsRouter from '@/routes/points'
import authRouter from '@/routes/auth'
import commentsRouter from '@/routes/comments'
import notificationsRouter from '@/routes/notifications'
import { db, runMigrations } from '@/db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3101

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/projects', projectsRouter)
app.use('/api/modules', modulesRouter)
app.use('/api/stages', stagesRouter)
app.use('/api/points', pointsRouter)
app.use('/api/auth', authRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/notifications', notificationsRouter)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  })
})

// Start server
async function startServer() {
  try {
    // Run migrations
    await runMigrations()
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📊 API: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
