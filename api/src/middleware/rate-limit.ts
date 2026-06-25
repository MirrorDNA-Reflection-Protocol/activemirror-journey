import type { MiddlewareHandler } from 'hono'

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000 // 1 minute
const WRITE_LIMIT = 10   // POST/PUT/PATCH/DELETE
const READ_LIMIT = 30    // GET

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS)
    if (entry.timestamps.length === 0) {
      store.delete(ip)
    }
  }
}, 60_000)

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  // Skip rate limiting for health checks
  if (c.req.path === '/health') {
    return next()
  }

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    || c.req.header('x-real-ip')
    || 'unknown'

  const now = Date.now()
  const isWrite = WRITE_METHODS.has(c.req.method)
  const limit = isWrite ? WRITE_LIMIT : READ_LIMIT

  let entry = store.get(ip)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(ip, entry)
  }

  // Filter to recent timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS)

  if (entry.timestamps.length >= limit) {
    return c.json(
      {
        error: 'Rate limited',
        message: `Too many requests. Limit: ${limit} per minute.`,
        retry_after: Math.ceil((entry.timestamps[0] + WINDOW_MS - now) / 1000)
      },
      429
    )
  }

  entry.timestamps.push(now)

  // Add rate limit headers
  c.header('X-RateLimit-Limit', String(limit))
  c.header('X-RateLimit-Remaining', String(limit - entry.timestamps.length))
  c.header('X-RateLimit-Reset', String(Math.ceil((now + WINDOW_MS) / 1000)))

  await next()
}
