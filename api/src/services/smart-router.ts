import type { ModelTier, ModelConfig, RouterDecision } from '../types/index.js'

export const MODELS: Record<ModelTier, ModelConfig> = {
  fast: {
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    modelId: 'llama-3.3-70b-versatile',
    apiBase: 'https://api.groq.com/openai/v1',
    tier: 'fast',
    maxTokens: 800,
    temperature: 0.3
  },
  reasoning: {
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    modelId: 'deepseek-reasoner',
    apiBase: 'https://api.deepseek.com/v1',
    tier: 'reasoning',
    maxTokens: 1200,
    temperature: 0.1
  },
  creative: {
    name: 'Mistral Large',
    provider: 'Mistral',
    modelId: 'mistral-large-latest',
    apiBase: 'https://api.mistral.ai/v1',
    tier: 'creative',
    maxTokens: 1000,
    temperature: 0.7
  },
  vision: {
    name: 'Llama 4 Scout',
    provider: 'Groq',
    modelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
    apiBase: 'https://api.groq.com/openai/v1',
    tier: 'vision',
    maxTokens: 800,
    temperature: 0.3
  },
  image_gen: {
    name: 'FLUX Schnell',
    provider: 'Pollinations',
    modelId: 'flux',
    apiBase: 'https://pollinations.ai',
    tier: 'image_gen',
    maxTokens: 0,
    temperature: 0
  }
}

const PATTERNS: Partial<Record<ModelTier, RegExp[]>> = {
  image_gen: [
    /\b(generate|create|make|draw|paint|render|design)\s+(an?\s+)?(image|picture|photo|artwork|illustration|portrait|scene)\b/i,
    /\b(image|picture|photo|artwork|illustration)\s+of\b/i,
    /\bshow me (an?\s+)?(image|picture|visual)\b/i,
    /\b(visualize|depict|illustrate)\b/i,
    /\bcreate\s+(a\s+)?visual\b/i,
    /\bdraw\s+(me\s+)?(a|an)\b/i,
  ],
  reasoning: [
    /\b(code|function|class|method|bug|error|debug|implement|algorithm)\b/i,
    /\b(python|javascript|typescript|java|rust|go|sql|html|css)\b/i,
    /\b(api|endpoint|database|query|regex|parse)\b/i,
    /\b(calculate|solve|equation|formula|math|proof|derive)\b/i,
    /\b(analyze|compare|evaluate|optimize|efficiency)\b/i,
    /\b(step by step|explain how|walk me through)\b/i,
  ],
  creative: [
    /\b(write|draft|compose|brainstorm|ideas)\b/i,
    /\b(story|poem|essay|article|blog|script|dialogue)\b/i,
    /\b(creative|imaginative|unique|original)\b/i,
    /\b(what if|imagine|suppose|possibilities|alternatives)\b/i,
    /\b(inspire|motivation|perspective|viewpoint)\b/i,
  ]
}

const ATMOSPHERE_SIGNALS: Record<string, string[]> = {
  focus: ['concentrate', 'focus', 'attention', 'deep work', 'clarity'],
  flow: ['creative', 'inspired', 'ideas flowing', 'momentum', 'zone'],
  relief: ['finally', 'resolved', 'figured out', 'breakthrough', 'solved'],
  surge: ['excited', 'energized', 'pumped', 'ready', "let's go"],
  calm: ['peaceful', 'relaxed', 'reflecting', 'contemplating'],
  curiosity: ['wondering', 'curious', 'what if', 'how does', 'why']
}

function detectAtmosphere(text: string): string {
  const lower = text.toLowerCase()
  const scores: Record<string, number> = {}

  for (const [atmosphere, signals] of Object.entries(ATMOSPHERE_SIGNALS)) {
    const score = signals.filter(s => lower.includes(s)).length
    if (score > 0) scores[atmosphere] = score
  }

  if (Object.keys(scores).length === 0) return 'neutral'
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

function classifyQuery(text: string, hasImage: boolean): { tier: ModelTier; queryType: string; confidence: number } {
  if (hasImage) {
    return { tier: 'vision', queryType: 'image_analysis', confidence: 1.0 }
  }

  const lower = text.toLowerCase()

  // Check image generation first (highest priority)
  const imageGenPatterns = PATTERNS.image_gen || []
  const imageGenScore = imageGenPatterns.filter(p => p.test(lower)).length
  if (imageGenScore >= 1) {
    return { tier: 'image_gen', queryType: 'image_generation', confidence: Math.min(0.7 + imageGenScore * 0.1, 0.95) }
  }

  // Check reasoning
  const reasoningPatterns = PATTERNS.reasoning || []
  const reasoningScore = reasoningPatterns.filter(p => p.test(lower)).length

  // Check creative
  const creativePatterns = PATTERNS.creative || []
  const creativeScore = creativePatterns.filter(p => p.test(lower)).length

  if (reasoningScore >= 2) {
    return { tier: 'reasoning', queryType: 'code_or_reasoning', confidence: Math.min(0.5 + reasoningScore * 0.15, 0.95) }
  }
  if (creativeScore >= 2) {
    return { tier: 'creative', queryType: 'creative_writing', confidence: Math.min(0.5 + creativeScore * 0.15, 0.95) }
  }
  if (reasoningScore === 1) {
    return { tier: 'reasoning', queryType: 'technical_question', confidence: 0.6 }
  }
  if (creativeScore === 1) {
    return { tier: 'creative', queryType: 'light_creative', confidence: 0.5 }
  }

  return { tier: 'fast', queryType: 'general_query', confidence: 0.7 }
}

export function routeQuery(query: string, hasImage = false): RouterDecision {
  const { tier, queryType, confidence } = classifyQuery(query, hasImage)
  const atmosphere = detectAtmosphere(query)
  const model = MODELS[tier]

  const reasoningParts: string[] = []
  if (hasImage) {
    reasoningParts.push('Image detected')
  } else if (tier === 'image_gen') {
    reasoningParts.push('Image generation request')
  } else if (tier === 'reasoning') {
    reasoningParts.push('Technical/reasoning patterns found')
  } else if (tier === 'creative') {
    reasoningParts.push('Creative intent detected')
  } else {
    reasoningParts.push('General query')
  }
  reasoningParts.push(model.name)

  return {
    model,
    reasoning: reasoningParts.join(' → '),
    confidence,
    atmosphere,
    queryType
  }
}
