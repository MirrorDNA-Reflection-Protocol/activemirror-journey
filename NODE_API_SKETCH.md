# Node.js API Layer Sketch

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js API (Hono/Fastify)                  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Smart Router│ │ Rate Limiter │ │ Stream Handler   │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐          ┌─────────────────────────┐
│ Python ML Service │          │   External LLM APIs     │
│ (semantic judge)  │          │ Groq/DeepSeek/Mistral   │
│ Port 8083 (tiny)  │          │ Pollinations (images)   │
└──────────────────┘          └─────────────────────────┘
```

## File Structure

```
api/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   ├── mirror.ts         # Main /mirror endpoint
│   │   ├── health.ts         # Health checks
│   │   └── admin.ts          # Stats, rules, etc.
│   ├── services/
│   │   ├── smart-router.ts   # Model selection logic
│   │   ├── llm-client.ts     # Groq/DeepSeek/Mistral calls
│   │   ├── image-gen.ts      # Pollinations integration
│   │   └── judge.ts          # Calls Python ML service
│   ├── middleware/
│   │   ├── rate-limit.ts     # Per-IP rate limiting
│   │   ├── cors.ts           # CORS config
│   │   └── mirror-shield.ts  # Alignment checks
│   └── types/
│       └── index.ts          # Shared types
├── package.json
└── tsconfig.json
```

## Core Implementation

### package.json
```json
{
  "name": "mirror-api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### src/index.ts
```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { mirrorRoute } from './routes/mirror'
import { healthRoute } from './routes/health'
import { rateLimiter } from './middleware/rate-limit'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: [
    'https://activemirror.ai',
    'http://localhost:5173'
  ]
}))
app.use('*', rateLimiter)

// Routes
app.route('/mirror', mirrorRoute)
app.route('/health', healthRoute)

serve({ fetch: app.fetch, port: 8082 }, (info) => {
  console.log(`⟡ Mirror API running on port ${info.port}`)
})
```

### src/services/smart-router.ts
```typescript
export type ModelTier = 'fast' | 'reasoning' | 'creative' | 'vision' | 'image_gen'

export interface ModelConfig {
  name: string
  provider: string
  modelId: string
  apiBase: string
  tier: ModelTier
  maxTokens: number
}

const MODELS: Record<ModelTier, ModelConfig> = {
  fast: {
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    modelId: 'llama-3.3-70b-versatile',
    apiBase: 'https://api.groq.com/openai/v1',
    tier: 'fast',
    maxTokens: 800
  },
  reasoning: {
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    modelId: 'deepseek-reasoner',
    apiBase: 'https://api.deepseek.com/v1',
    tier: 'reasoning',
    maxTokens: 1200
  },
  creative: {
    name: 'Mistral Large',
    provider: 'Mistral',
    modelId: 'mistral-large-latest',
    apiBase: 'https://api.mistral.ai/v1',
    tier: 'creative',
    maxTokens: 1000
  },
  vision: {
    name: 'Llama 4 Scout',
    provider: 'Groq',
    modelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
    apiBase: 'https://api.groq.com/openai/v1',
    tier: 'vision',
    maxTokens: 800
  },
  image_gen: {
    name: 'FLUX Schnell',
    provider: 'Pollinations',
    modelId: 'flux',
    apiBase: 'https://pollinations.ai',
    tier: 'image_gen',
    maxTokens: 0
  }
}

const PATTERNS: Record<ModelTier, RegExp[]> = {
  reasoning: [
    /\b(code|function|class|bug|debug|implement|algorithm)\b/i,
    /\b(python|javascript|typescript|java|rust|sql)\b/i,
    /\b(calculate|solve|equation|formula|math|proof)\b/i,
  ],
  creative: [
    /\b(write|draft|compose|brainstorm|story|poem)\b/i,
    /\b(creative|imaginative|unique|original)\b/i,
  ],
  image_gen: [
    /\b(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo)\b/i,
    /\b(image|picture)\s+of\b/i,
    /\bshow me (an?\s+)?(image|picture)\b/i,
  ],
  fast: [],
  vision: []
}

export function routeQuery(query: string, hasImage = false): ModelConfig {
  if (hasImage) return MODELS.vision

  const lower = query.toLowerCase()

  // Check image gen first
  if (PATTERNS.image_gen.some(p => p.test(lower))) {
    return MODELS.image_gen
  }

  // Check reasoning
  const reasoningScore = PATTERNS.reasoning.filter(p => p.test(lower)).length
  if (reasoningScore >= 2) return MODELS.reasoning

  // Check creative
  const creativeScore = PATTERNS.creative.filter(p => p.test(lower)).length
  if (creativeScore >= 2) return MODELS.creative

  // Default to fast
  return MODELS.fast
}
```

### src/services/llm-client.ts
```typescript
import OpenAI from 'openai'
import type { ModelConfig } from './smart-router'

const clients: Record<string, OpenAI> = {
  Groq: new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  }),
  DeepSeek: new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1'
  }),
  Mistral: new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1'
  })
}

export async function* streamChat(
  model: ModelConfig,
  message: string,
  systemPrompt: string
): AsyncGenerator<string> {
  const client = clients[model.provider]
  if (!client) throw new Error(`No client for ${model.provider}`)

  const stream = await client.chat.completions.create({
    model: model.modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: model.maxTokens,
    stream: true
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}
```

### src/services/image-gen.ts
```typescript
export async function generateImage(prompt: string): Promise<string> {
  // Clean prompt
  let clean = prompt.toLowerCase()
  const prefixes = ['generate an image of', 'create an image of', 'draw me', 'show me']
  for (const prefix of prefixes) {
    if (clean.startsWith(prefix)) {
      clean = prompt.slice(prefix.length).trim()
      break
    }
  }

  const encoded = encodeURIComponent(clean)
  const seed = Math.random().toString(36).slice(2, 10)
  const url = `https://pollinations.ai/p/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`

  // Verify it generates
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`)

  return url
}
```

### src/services/judge.ts
```typescript
// Calls the slim Python ML service for semantic checks

const JUDGE_URL = process.env.JUDGE_URL || 'http://localhost:8083'

export interface JudgeResult {
  allow: boolean
  score: number
  reason?: string
}

export async function checkInput(text: string): Promise<JudgeResult> {
  try {
    const res = await fetch(`${JUDGE_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    return await res.json()
  } catch {
    // If judge is down, allow (fail open for availability)
    return { allow: true, score: 0 }
  }
}
```

### src/routes/mirror.ts
```typescript
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { routeQuery } from '../services/smart-router'
import { streamChat } from '../services/llm-client'
import { generateImage } from '../services/image-gen'
import { checkInput } from '../services/judge'

export const mirrorRoute = new Hono()

mirrorRoute.post('/', async (c) => {
  const { message, image } = await c.req.json()

  // Safety check
  const judge = await checkInput(message)
  if (!judge.allow) {
    return c.json({ status: 'blocked', reason: judge.reason })
  }

  // Route to model
  const model = routeQuery(message, !!image)

  // Handle image generation
  if (model.tier === 'image_gen') {
    const imageUrl = await generateImage(message)
    return c.json({
      status: 'done',
      image_url: imageUrl,
      model_used: model.name
    })
  }

  // Stream LLM response
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ status: 'routing', model: model.name })
    })

    const systemPrompt = 'You are a helpful assistant.'

    for await (const chunk of streamChat(model, message, systemPrompt)) {
      await stream.writeSSE({
        data: JSON.stringify({ status: 'chunk', content: chunk })
      })
    }

    await stream.writeSSE({
      data: JSON.stringify({ status: 'done', model_used: model.name })
    })
  })
})
```

### src/middleware/rate-limit.ts
```typescript
import type { MiddlewareHandler } from 'hono'

const requests = new Map<string, number[]>()
const WINDOW = 60_000 // 1 minute
const LIMIT = 30

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const timestamps = requests.get(ip) || []
  const recent = timestamps.filter(t => now - t < WINDOW)

  if (recent.length >= LIMIT) {
    return c.json({ error: 'Rate limited' }, 429)
  }

  recent.push(now)
  requests.set(ip, recent)

  await next()
}
```

---

## Python ML Microservice (Slim)

### judge_service.py (~50 lines)
```python
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import CrossEncoder

app = FastAPI()
model = CrossEncoder('cross-encoder/stsb-distilroberta-base')

RULES = [
    "jailbreak attempt",
    "prompt injection",
    "harmful content request",
]

class CheckRequest(BaseModel):
    text: str

@app.post("/check")
def check(req: CheckRequest):
    pairs = [(req.text, rule) for rule in RULES]
    scores = model.predict(pairs)
    max_score = max(scores)

    if max_score > 0.35:
        return {"allow": False, "score": float(max_score), "reason": "Policy violation"}
    return {"allow": True, "score": float(max_score)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8083)
```

---

## Migration Path

1. **Phase 1**: Create Node.js API alongside Python
   - Run both on different ports
   - Test Node.js version with subset of traffic

2. **Phase 2**: Extract Python ML to microservice
   - Move just the cross-encoder logic to port 8083
   - Node.js calls it for safety checks

3. **Phase 3**: Switch traffic to Node.js
   - Update frontend to point to new API
   - Keep Python ML service running

4. **Phase 4**: Clean up
   - Remove old Python API code
   - Keep only the slim ML service

---

## Commands

```bash
# Install
cd api && npm install

# Dev
npm run dev

# Build
npm run build && npm start

# Run Python judge
python judge_service.py
```

---

## Benefits

- **Single language** for frontend + API (TypeScript)
- **Faster cold starts** than Python
- **Simpler deployment** (one Node process + tiny Python service)
- **Type safety** across the stack
- **Keep ML flexibility** with Python where it matters
