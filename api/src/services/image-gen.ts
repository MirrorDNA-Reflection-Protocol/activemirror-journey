/**
 * Image generation using Pollinations.ai (free FLUX Schnell model)
 */

const PROMPT_PREFIXES = [
  'generate an image of',
  'create an image of',
  'make an image of',
  'generate a picture of',
  'create a picture of',
  'draw me a',
  'draw me an',
  'draw a',
  'draw an',
  'draw me',
  'draw',
  'generate',
  'create',
  'make',
  'show me a picture of',
  'show me an image of',
  'show me'
]

function cleanPrompt(prompt: string): string {
  let clean = prompt.trim()
  const lower = clean.toLowerCase()

  for (const prefix of PROMPT_PREFIXES) {
    if (lower.startsWith(prefix)) {
      clean = clean.slice(prefix.length).trim()
      break
    }
  }

  // Remove common filler words at the start
  clean = clean.replace(/^(a|an|the)\s+/i, '')

  return clean
}

function generateSeed(): string {
  return Math.random().toString(36).slice(2, 10)
}

export interface ImageGenResult {
  imageUrl: string
  prompt: string
  seed: string
}

const MAX_PROMPT_LENGTH = 500

export async function generateImage(prompt: string): Promise<ImageGenResult> {
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt too long (max ${MAX_PROMPT_LENGTH} characters)`)
  }
  const cleanedPrompt = cleanPrompt(prompt)
  const seed = generateSeed()

  const encoded = encodeURIComponent(cleanedPrompt)
  const imageUrl = `https://pollinations.ai/p/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`

  // Verify it generates by making a request
  const response = await fetch(imageUrl, {
    method: 'GET',
    signal: AbortSignal.timeout(60000) // 60 second timeout
  })

  if (!response.ok) {
    throw new Error(`Pollinations error: ${response.status}`)
  }

  return {
    imageUrl,
    prompt: cleanedPrompt,
    seed
  }
}
