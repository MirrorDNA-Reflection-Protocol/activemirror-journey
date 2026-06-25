import { Hono } from 'hono'
import { healthCheck as judgeHealthCheck } from '../services/judge.js'

export const healthRoute = new Hono()

const VERSION = '1.0.0'
const CODENAME = 'NODE_MIRROR'

healthRoute.get('/', async (c) => {
  const judgeHealthy = await judgeHealthCheck()

  return c.json({
    status: 'ok',
    version: VERSION,
    codename: CODENAME,
    runtime: 'node',
    services: {
      judge: judgeHealthy ? 'healthy' : 'unavailable'
    },
    timestamp: new Date().toISOString()
  })
})
