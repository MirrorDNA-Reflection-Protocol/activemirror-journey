export type ModelTier = 'fast' | 'reasoning' | 'creative' | 'vision' | 'image_gen'

export interface ModelConfig {
  name: string
  provider: 'Groq' | 'DeepSeek' | 'Mistral' | 'Pollinations'
  modelId: string
  apiBase: string
  tier: ModelTier
  maxTokens: number
  temperature: number
}

export interface RouterDecision {
  model: ModelConfig
  reasoning: string
  confidence: number
  atmosphere: string
  queryType: string
}

export interface JudgeResult {
  allow: boolean
  score: number
  reason?: string
}

export interface MirrorRequest {
  message: string
  image?: string // base64 data URL
  conversation_id?: string
}

export interface StreamChunk {
  status: 'routing' | 'chunk' | 'image' | 'done' | 'error'
  content?: string
  model_info?: {
    model: string
    provider: string
    tier: string
    reasoning: string
  }
  image_url?: string
  prompt?: string
  model_used?: string
  error?: string
}
