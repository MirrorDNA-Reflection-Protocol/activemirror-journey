import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { corsMiddleware } from './middleware/cors.js'
import { rateLimiter } from './middleware/rate-limit.js'
import { mirrorRoute } from './routes/mirror.js'
import { healthRoute } from './routes/health.js'

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', corsMiddleware)
app.use('*', rateLimiter)

// Routes
app.route('/mirror', mirrorRoute)
app.route('/health', healthRoute)

// Root redirect
app.get('/', (c) => c.redirect('/health'))

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

const PORT = parseInt(process.env.PORT || '8082', 10)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`
⟡ ═══════════════════════════════════════════════════════════
⟡  MIRROR API v1.0.0 (NODE)
⟡ ═══════════════════════════════════════════════════════════
⟡  Port: ${info.port}
⟡  Endpoints: /mirror | /health
⟡  Judge: ${process.env.JUDGE_URL || 'http://localhost:8083'}
⟡ ═══════════════════════════════════════════════════════════
`)
})

export default app
