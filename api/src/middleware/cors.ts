import { cors } from 'hono/cors'

const ALLOWED_ORIGINS = [
  'https://activemirror.ai',
  'https://www.activemirror.ai',
  'https://id.activemirror.ai',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
]

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return ALLOWED_ORIGINS[0]
    if (ALLOWED_ORIGINS.includes(origin)) return origin
    // Allow any localhost port for development only
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
      return origin
    }
    return ALLOWED_ORIGINS[0]
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Mirror-Source', 'X-Request-ID'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
  credentials: true
})
