import { createServer } from 'http'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.route'

// remplacements de console
const print = console.log
const printError = console.error

// Create Express app
export const app = express()

// Middlewares
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    credentials: true,
  }),
)

app.use(express.json())

// Use auth routes
app.use('/api/auth', authRouter)

// Serve static files (Socket.io test client)
app.use(express.static('public'))

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TCG Backend Server is running' })
})

// Start server only if this file is run directly (not imported for tests)
if (require.main === module) {
  // Create HTTP server
  const httpServer = createServer(app)

  // Start server
  try {
    httpServer.listen(env.PORT, () => {
      print(`\n🚀 Server is running on http://localhost:${env.PORT}`)
      print(
        `🧪 Socket.io Test Client available at http://localhost:${env.PORT}`,
      )
    })
  } catch (error) {
    printError('Failed to start server:', error)
    process.exit(1)
  }
}
