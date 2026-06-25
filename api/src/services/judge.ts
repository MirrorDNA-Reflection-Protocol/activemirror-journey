/**
 * Calls the Python ML microservice for semantic safety checks.
 * Falls back to allowing if the service is unavailable (fail-open for availability).
 */

import type { JudgeResult } from '../types/index.js'

const JUDGE_URL = process.env.JUDGE_URL || 'http://localhost:8083'
const TIMEOUT_MS = 5000

export async function checkInput(text: string): Promise<JudgeResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(`${JUDGE_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`Judge service returned ${response.status}, failing open`)
      return { allow: true, score: 0 }
    }

    return await response.json()
  } catch (error) {
    // If judge is down or times out, allow (fail open for availability)
    console.warn('Judge service unavailable, failing open:', error)
    return { allow: true, score: 0 }
  }
}

export async function checkOutput(input: string, output: string): Promise<JudgeResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(`${JUDGE_URL}/check-output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, output }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return { allow: true, score: 0 }
    }

    return await response.json()
  } catch {
    return { allow: true, score: 0 }
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${JUDGE_URL}/health`, {
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch {
    return false
  }
}
