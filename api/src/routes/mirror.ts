import { Hono } from 'hono'
import { stream } from 'hono/streaming'
import { routeQuery } from '../services/smart-router.js'
import { streamChat } from '../services/llm-client.js'
import { generateImage } from '../services/image-gen.js'
import { checkInput } from '../services/judge.js'
import type { MirrorRequest, StreamChunk } from '../types/index.js'

export const mirrorRoute = new Hono()

function jsonLine(chunk: StreamChunk): string {
  return JSON.stringify(chunk) + '\n'
}

const encoder = new TextEncoder()

mirrorRoute.post('/', async (c) => {
  const body = await c.req.json<MirrorRequest>()
  const { message, image } = body

  if (!message && !image) {
    return c.json({ error: 'Message or image required' }, 400)
  }

  if (message && message.length > 2000) {
    return c.json({ error: 'Message too long (max 2000 characters)' }, 400)
  }

  // Safety check via Python judge service
  if (message) {
    const judge = await checkInput(message)
    if (!judge.allow) {
      return c.json({
        status: 'blocked',
        reason: judge.reason || 'Content policy violation'
      }, 403)
    }
  }

  // Route to optimal model
  const decision = routeQuery(message || '', !!image)

  // Handle image generation
  if (decision.model.tier === 'image_gen') {
    c.header('Content-Type', 'application/x-ndjson')
    return stream(c, async (s) => {
      // Send routing info
      await s.write(encoder.encode(jsonLine({
        status: 'routing',
        model_info: {
          model: decision.model.name,
          provider: decision.model.provider,
          tier: decision.model.tier,
          reasoning: decision.reasoning
        }
      })))

      try {
        await s.write(encoder.encode(jsonLine({
          status: 'chunk',
          content: `⟡ Generating: "${message?.slice(0, 60)}${(message?.length || 0) > 60 ? '...' : ''}"\n\n`
        })))

        const result = await generateImage(message || '')

        await s.write(encoder.encode(jsonLine({
          status: 'image',
          image_url: result.imageUrl,
          prompt: result.prompt
        })))

        await s.write(encoder.encode(jsonLine({
          status: 'done',
          model_used: decision.model.name
        })))
      } catch {
        await s.write(encoder.encode(jsonLine({
          status: 'error',
          error: 'Image generation failed. Try a different prompt.'
        })))
      }
    })
  }

  // Stream LLM response
  c.header('Content-Type', 'application/x-ndjson')
  return stream(c, async (s) => {
    // Send routing info first
    await s.write(encoder.encode(jsonLine({
      status: 'routing',
      model_info: {
        model: decision.model.name,
        provider: decision.model.provider,
        tier: decision.model.tier,
        reasoning: decision.reasoning
      }
    })))

    try {
      for await (const chunk of streamChat(decision.model, message || '', image)) {
        await s.write(encoder.encode(jsonLine({
          status: 'chunk',
          content: chunk
        })))
      }

      await s.write(encoder.encode(jsonLine({
        status: 'done',
        model_used: decision.model.name
      })))
    } catch (error) {
      console.error('LLM error:', error)
      await s.write(encoder.encode(jsonLine({
        status: 'error',
        error: 'Failed to get response. Please try again.'
      })))
    }
  })
})

// Non-streaming endpoint for simple requests
mirrorRoute.post('/simple', async (c) => {
  const body = await c.req.json<MirrorRequest>()
  const { message } = body

  if (!message) {
    return c.json({ error: 'Message required' }, 400)
  }

  const judge = await checkInput(message)
  if (!judge.allow) {
    return c.json({ status: 'blocked', reason: judge.reason }, 403)
  }

  const decision = routeQuery(message)

  if (decision.model.tier === 'image_gen') {
    const result = await generateImage(message)
    return c.json({
      status: 'done',
      image_url: result.imageUrl,
      prompt: result.prompt,
      model_used: decision.model.name
    })
  }

  // For non-streaming, collect all chunks
  let response = ''
  for await (const chunk of streamChat(decision.model, message)) {
    response += chunk
  }

  return c.json({
    status: 'done',
    response,
    model_used: decision.model.name
  })
})
