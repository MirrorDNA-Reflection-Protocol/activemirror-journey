import OpenAI from 'openai'
import type { ModelConfig } from '../types/index.js'

const clients: Record<string, OpenAI> = {}

function getClient(provider: string): OpenAI {
  if (clients[provider]) return clients[provider]

  const configs: Record<string, { apiKey: string | undefined; baseURL: string }> = {
    Groq: {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    },
    DeepSeek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1'
    },
    Mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: 'https://api.mistral.ai/v1'
    }
  }

  const config = configs[provider]
  if (!config) throw new Error(`Unknown provider: ${provider}`)
  if (!config.apiKey) throw new Error(`API key not configured for provider: ${provider}`)

  clients[provider] = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  })

  return clients[provider]
}

const SYSTEM_PROMPT = `You are Active Mirror ⟡, a sovereign AI reflection engine built by Paul Desai and N1 Intelligence.

## Identity
- You use the glyph ⟡ (U+27E1) as your symbol — it represents sovereign reflection
- You are part of the MirrorDNA ecosystem — infrastructure for cognitive sovereignty
- You run on the user's behalf, not a corporation's. Privacy-first, no data harvesting.
- You're powered by an intelligent router that selects the optimal model for each query

## Your Values
- Sovereignty: Users own their data and their AI interactions
- Clarity: Be direct, concise, and genuinely helpful
- Honesty: If you don't know something, say so. Never hallucinate.
- Reflection: Help users think clearly, not just get answers

## Guidelines
- Use ⟡ sparingly to mark key insights or section breaks
- Be concise but thorough — respect the user's time
- Use markdown formatting when it aids clarity
- You can generate images when asked (say "generate an image of...")
- Never pretend to have capabilities you don't have

## Tone
Warm but substantive. Like a brilliant friend who happens to know a lot.`

export async function* streamChat(
  model: ModelConfig,
  message: string,
  imageBase64?: string
): AsyncGenerator<string> {
  const client = getClient(model.provider)

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ]

  // Handle vision model with image
  if (model.tier === 'vision' && imageBase64) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message || 'What do you see in this image?' },
        { type: 'image_url', image_url: { url: imageBase64 } }
      ]
    })
  } else {
    messages.push({ role: 'user', content: message })
  }

  const stream = await client.chat.completions.create({
    model: model.modelId,
    messages,
    max_tokens: model.maxTokens,
    temperature: model.temperature,
    stream: true
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

export async function chatComplete(
  model: ModelConfig,
  message: string
): Promise<string> {
  const client = getClient(model.provider)

  const response = await client.chat.completions.create({
    model: model.modelId,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ],
    max_tokens: model.maxTokens,
    temperature: model.temperature
  })

  return response.choices[0]?.message?.content || ''
}
