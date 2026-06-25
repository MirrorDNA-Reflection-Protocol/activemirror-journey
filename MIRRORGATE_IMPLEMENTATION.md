# ⟡ MIRRORGATE IMPLEMENTATION — COMPLETE HANDOFF TO ANTIGRAVITY

**Date:** 2026-01-04
**From:** Claude (Reflection Twin)
**To:** Antigravity (Execution Twin)
**Priority:** HIGH — User feedback indicates current output lacks substance

---

## EXECUTIVE SUMMARY

User feedback: "It's just asking questions, there's no point to it."

This implementation adds **structured reflection output** that gives users substance without giving advice. We're also upgrading the model from `llama-3.3-70b-versatile` to `openai/gpt-oss-20b` (faster, better at schema-following, same free tier).

---

## PART 1: MODEL UPGRADE

### Current Model
```
Model: llama-3.3-70b-versatile
Speed: 394 t/s
Free TPD: 100K tokens/day
```

### New Model
```
Model: openai/gpt-oss-20b
Speed: 1000 t/s (2.5x faster)
Free TPD: 200K tokens/day (2x more)
Quality: Better at structured output and reasoning
```

### Files to Update

**1. Demo.jsx** — Line ~63
```javascript
// OLD
const GROQ_MODEL = "llama-3.3-70b-versatile";

// NEW
const GROQ_MODEL = "openai/gpt-oss-20b";
```

**2. safety_proxy.py** — Line ~383 and ~408
```python
# OLD
"model": "llama-3.3-70b-versatile",

# NEW
"model": "openai/gpt-oss-20b",
```

---

## PART 2: OUTPUT SCHEMA — "REFLECTION MODE"

### The Schema (User-Facing Output)

Every response from /mirror MUST conform to this exact format:

```
⟡ What you're deciding:
[One sentence restatement, max 160 chars]

⧈ What you're assuming:
• [Assumption 1, max 120 chars]
• [Assumption 2, max 120 chars]
• [Optional: Assumption 3]

⧉ What's at stake:
• [Upside/gain, max 120 chars]
• [Risk/loss, max 120 chars]

? [One sharp question ending with ?]
```

### Why This Schema Works

1. **⟡ What you're deciding** — Reflects their situation back clearly
2. **⧈ What you're assuming** — Surfaces hidden assumptions (valuable insight)
3. **⧉ What's at stake** — Shows trade-offs without recommending
4. **? One question** — Provides depth for continued reflection

**This is NOT advice. It's structured reflection.**

---

## PART 3: SYSTEM PROMPT (NEW)

Replace the existing CLOUD_SYSTEM_PROMPT and LOCAL_SYSTEM_PROMPT:

### Cloud System Prompt (for safety_proxy.py and Demo.jsx cloud mode)

```python
SYSTEM_PROMPT = """You are Active Mirror, a reflection engine. You help people think through decisions by structuring their thinking — NOT by giving advice.

OUTPUT FORMAT (MANDATORY — use this exact structure):

⟡ What you're deciding:
[Restate their decision/situation in one clear sentence. Max 160 characters.]

⧈ What you're assuming:
• [Hidden assumption 1 they may not have noticed]
• [Hidden assumption 2 about outcomes or others]
• [Optional third assumption if relevant]

⧉ What's at stake:
• [What they gain if this works out]
• [What they risk or lose if it doesn't]

? [One sharp question that cuts to the heart of the matter — must end with ?]

ABSOLUTE RULES:
1. Use the EXACT format above. No other format.
2. NEVER give advice, recommendations, or suggestions
3. NEVER say "you should", "I recommend", "consider", "try"
4. NEVER state facts, statistics, or cite sources
5. NEVER use certainty words: "definitely", "always", "never", "guaranteed"
6. The question section must contain EXACTLY ONE question mark
7. Keep total response under 800 characters
8. Surface assumptions they haven't stated — that's where the value is

If the input is unclear or not a decision, respond only with:
? What decision are you trying to make?"""
```

### Local System Prompt (for WebLLM/sovereign mode — shorter for small models)

```python
LOCAL_SYSTEM_PROMPT = """You are Active Mirror. Structure the user's thinking without giving advice.

FORMAT:
⟡ What you're deciding: [restate in one sentence]
⧈ What you're assuming:
• [assumption 1]
• [assumption 2]
⧉ What's at stake:
• [upside]
• [risk]
? [one question]

No advice. No "you should". Questions only at the end."""
```

---

## PART 4: VALIDATOR (DETERMINISTIC)

Create new file: `src/utils/mirrorGate.js`

```javascript
/**
 * MirrorGate — Deterministic validator for Reflection Mode output
 * Ensures all /mirror responses conform to schema
 */

// Schema section headers (in order)
const REQUIRED_SECTIONS = [
  '⟡ What you\'re deciding:',
  '⧈ What you\'re assuming:',
  '⧉ What\'s at stake:',
  '?'
];

// Forbidden patterns in output (advice, certainty, facts)
const FORBIDDEN_PATTERNS = [
  // Advice language
  /\byou should\b/i,
  /\byou must\b/i,
  /\byou need to\b/i,
  /\bi recommend\b/i,
  /\bi suggest\b/i,
  /\bi advise\b/i,
  /\btry this\b/i,
  /\bconsider\b/i,
  /\bwhy don't you\b/i,
  /\bhave you tried\b/i,
  /\bthe best\b/i,
  /\bthe right thing\b/i,
  
  // Certainty language
  /\bdefinitely\b/i,
  /\bcertainly\b/i,
  /\babsolutely\b/i,
  /\bguaranteed\b/i,
  /\balways\b/i,
  /\bnever\b/i,
  /\bobviously\b/i,
  
  // Factual claims
  /\bstudies show\b/i,
  /\baccording to\b/i,
  /\bresearch suggests\b/i,
  /\bstatistically\b/i,
  /\d+(\.\d+)?%/,  // percentages
  /https?:\/\//,   // URLs
];

// Illegal content patterns — hard refuse before inference
const ILLEGAL_PATTERNS = [
  /\b(how to (make|build|create) (a |)(bomb|explosive|weapon))\b/i,
  /\b(synthesize|manufacture) (drugs|meth|fentanyl)\b/i,
  /\b(child porn|csam|underage)\b/i,
  /\b(hack into|exploit vulnerability|malware)\b/i,
  /\b(traffic|smuggle) (humans|people|children)\b/i,
  /\b(hire (a |)(hitman|assassin))\b/i,
];

/**
 * Pre-inference gate — check input before calling model
 * Returns { allowed: boolean, reason?: string, response?: string }
 */
export function gateInput(input) {
  // Check for illegal content
  for (const pattern of ILLEGAL_PATTERNS) {
    if (pattern.test(input)) {
      return {
        allowed: false,
        reason: 'illegal',
        response: "I can't engage with that."
      };
    }
  }
  
  // Check input length
  if (input.length > 2000) {
    return {
      allowed: false,
      reason: 'too_long',
      response: "That's a lot to process. What's the core decision you're facing?"
    };
  }
  
  return { allowed: true };
}

/**
 * Validate model output against schema
 * Returns { valid: boolean, violations: string[], normalized?: string }
 */
export function validateOutput(text) {
  const violations = [];
  
  // Check for required sections in order
  let lastIndex = -1;
  for (const section of REQUIRED_SECTIONS) {
    const index = text.indexOf(section);
    if (index === -1) {
      violations.push(`missing_section: ${section}`);
    } else if (index < lastIndex) {
      violations.push(`wrong_order: ${section}`);
    } else {
      lastIndex = index;
    }
  }
  
  // Check question mark count (must be exactly 1)
  const questionMarks = (text.match(/\?/g) || []).length;
  if (questionMarks === 0) {
    violations.push('no_question_mark');
  } else if (questionMarks > 1) {
    violations.push('too_many_questions');
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      violations.push(`forbidden: ${pattern.source.slice(0, 20)}`);
    }
  }
  
  // Check total length
  if (text.length > 1000) {
    violations.push('too_long');
  }
  
  if (text.length < 50) {
    violations.push('too_short');
  }
  
  // Check bullets exist in assumption and stakes sections
  const assumingSection = text.match(/⧈ What you're assuming:([\s\S]*?)⧉/);
  if (assumingSection && !assumingSection[1].includes('•')) {
    violations.push('missing_assumption_bullets');
  }
  
  const stakesSection = text.match(/⧉ What's at stake:([\s\S]*?)\?/);
  if (stakesSection && !stakesSection[1].includes('•')) {
    violations.push('missing_stakes_bullets');
  }
  
  return {
    valid: violations.length === 0,
    violations,
    normalized: normalizeOutput(text)
  };
}

/**
 * Normalize output formatting
 */
function normalizeOutput(text) {
  return text
    .trim()
    .replace(/\n{3,}/g, '\n\n')  // Remove triple+ newlines
    .replace(/•\s*/g, '• ')      // Normalize bullet spacing
    .replace(/\s+$/gm, '');      // Remove trailing whitespace
}

/**
 * Fallback response when validation fails after rewrites
 */
export const FALLBACK_RESPONSE = `⟡ What you're deciding:
I couldn't structure a clear reflection for that input.

⧈ What you're assuming:
• The question may need to be framed as a decision
• More context might help me understand

⧉ What's at stake:
• Clarity if you can reframe this as a choice
• Continued uncertainty if we stay abstract

? What specific decision are you trying to make?`;

/**
 * Rewrite prompt for non-compliant outputs
 */
export function getRewritePrompt(original, userInput) {
  return `Rewrite this response to match the EXACT schema below. Output ONLY the rewritten response, nothing else.

REQUIRED SCHEMA:
⟡ What you're deciding:
[One sentence]

⧈ What you're assuming:
• [Assumption 1]
• [Assumption 2]

⧉ What's at stake:
• [Upside]
• [Risk]

? [One question ending with ?]

RULES:
- No advice ("you should", "try", "consider")
- Exactly ONE question mark total
- Under 800 characters

User's original input: "${userInput}"

Non-compliant response to rewrite:
${original}

Rewritten response:`;
}
```

---

## PART 5: UPDATED SAFETY_PROXY.PY

Replace the entire safety_proxy.py with this updated version:

```python
#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v3.0
MirrorGate Edition: Structured Reflection Mode with Schema Enforcement

Run: python3 safety_proxy.py
Requires: pip install fastapi uvicorn httpx python-dotenv
"""

import os
import re
import time
import uuid
import hmac
import hashlib
import logging
import random
from datetime import datetime
from typing import Optional, Literal
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

RULE_VERSION = "3.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60

API_SECRET = os.getenv("MIRROR_API_SECRET", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# NEW MODEL — gpt-oss-20b (faster, better at schema, same free tier)
GROQ_MODEL = "openai/gpt-oss-20b"

ALLOWED_ORIGINS = [
    "https://activemirror.ai",
    "https://www.activemirror.ai",
    "http://localhost:5173",
    "http://localhost:3000",
]

LOG_CONTENT = os.getenv("LOG_CONTENT", "false").lower() == "true"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════════════════════
# REFLECTION MODE SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are Active Mirror, a reflection engine. You help people think through decisions by structuring their thinking — NOT by giving advice.

OUTPUT FORMAT (MANDATORY — use this exact structure):

⟡ What you're deciding:
[Restate their decision/situation in one clear sentence. Max 160 characters.]

⧈ What you're assuming:
• [Hidden assumption 1 they may not have noticed]
• [Hidden assumption 2 about outcomes or others]
• [Optional third assumption if relevant]

⧉ What's at stake:
• [What they gain if this works out]
• [What they risk or lose if it doesn't]

? [One sharp question that cuts to the heart of the matter — must end with ?]

ABSOLUTE RULES:
1. Use the EXACT format above. No other format.
2. NEVER give advice, recommendations, or suggestions
3. NEVER say "you should", "I recommend", "consider", "try"
4. NEVER state facts, statistics, or cite sources
5. NEVER use certainty words: "definitely", "always", "never", "guaranteed"
6. The question section must contain EXACTLY ONE question mark
7. Keep total response under 800 characters
8. Surface assumptions they haven't stated — that's where the value is

If the input is unclear or not a decision, respond only with:
? What decision are you trying to make?"""

REWRITE_PROMPT = """Rewrite this response to EXACTLY match the schema below. Output ONLY the rewritten response.

SCHEMA:
⟡ What you're deciding:
[One sentence]

⧈ What you're assuming:
• [Assumption 1]
• [Assumption 2]

⧉ What's at stake:
• [Upside]
• [Risk]

? [One question ending with ?]

RULES:
- No advice words ("you should", "try", "consider", "recommend")
- Exactly ONE question mark in entire response
- Under 800 characters total

Original user input: {user_input}

Non-compliant response:
{original}

Rewritten (schema only):"""

# ═══════════════════════════════════════════════════════════════════════════════
# SAFETY PATTERNS (unchanged from v2.0)
# ═══════════════════════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|end(ing)? my life|want to die|don\'?t want to live)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself|cutting|burn myself|starve myself)\b', re.I),
    re.compile(r'\b(take my (own )?life|better off dead|no reason to live)\b', re.I),
    re.compile(r'\b(overdose|take all the pills|swallow pills)\b', re.I),
    re.compile(r'\b(jump off|jump from|hang myself|shoot myself|drown myself)\b', re.I),
    re.compile(r'\b(planning to die|ready to die|going to die tonight)\b', re.I),
    re.compile(r'\b(final goodbye|this is goodbye|won\'?t be here tomorrow)\b', re.I),
    re.compile(r'\b(wrote a (suicide )?note|leaving a note)\b', re.I),
    re.compile(r'\b(being abused|abusing me|hits me|beats me|hurts me)\b', re.I),
    re.compile(r'\b(rape|raped|sexual assault|molest)\b', re.I),
    re.compile(r'\b(domestic violence|partner violence)\b', re.I),
    re.compile(r'\b(going to hurt|planning to hurt|want to hurt someone)\b', re.I),
    re.compile(r'\b(kill (him|her|them|someone))\b', re.I),
]

CRISIS_RESPONSE = """I can hear you're in a really difficult place right now. I'm not able to provide the support you need — I'm just a reflection tool, not a crisis service.

Please reach out to people trained to help:

🆘 IMMEDIATE HELP:
• Emergency Services: 911 (US) or your local emergency number
• Suicide & Crisis Lifeline: 988 (US) — call or text, 24/7
• Crisis Text Line: Text HOME to 741741
• International: https://www.iasp.info/resources/Crisis_Centres/

💚 You matter. Please reach out to one of these resources now."""

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build|create) (a |)(bomb|explosive|weapon))\b', re.I),
    re.compile(r'\b(synthesize|manufacture) (drugs|meth|fentanyl)\b', re.I),
    re.compile(r'\b(child porn|csam|cp|underage)\b', re.I),
    re.compile(r'\b(hack into|exploit vulnerability|sql injection|malware)\b', re.I),
    re.compile(r'\b(traffic|smuggle) (humans|people|children)\b', re.I),
    re.compile(r'\b(launder money|money laundering|tax evasion)\b', re.I),
    re.compile(r'\b(hire (a |)(hitman|assassin)|kill someone)\b', re.I),
    re.compile(r'\b(forge (documents|passport|id))\b', re.I),
]

DOMAIN_PATTERNS = {
    "medical": [
        re.compile(r'\b(medication|medicine|drug|pill|dosage|prescription|diagnosis|symptom|treatment)\b', re.I),
    ],
    "legal": [
        re.compile(r'\b(lawsuit|sue|lawyer|attorney|legal|court|police|arrest|custody|divorce)\b', re.I),
    ],
    "financial": [
        re.compile(r'\b(invest|stock|crypto|bitcoin|trading|gambling|bet|portfolio|retirement)\b', re.I),
    ],
}

DOMAIN_RESPONSES = {
    "medical": """⟡ What you're deciding:
Whether to take a health-related action that needs professional guidance.

⧈ What you're assuming:
• That general information would be helpful here
• That this doesn't require personalized medical assessment

⧉ What's at stake:
• Getting clarity if you consult a healthcare provider
• Potential risk if you act on non-professional input

? What would help you feel confident discussing this with a doctor?""",

    "legal": """⟡ What you're deciding:
Whether to take action on something with legal implications.

⧈ What you're assuming:
• That general guidance would be sufficient
• That your specific situation doesn't need legal expertise

⧉ What's at stake:
• Protection if you get proper legal advice
• Exposure if you proceed without it

? What's preventing you from consulting a legal professional?""",

    "financial": """⟡ What you're deciding:
Whether to make a financial move that could significantly impact you.

⧈ What you're assuming:
• That you have enough information to decide
• That the risks are manageable

⧉ What's at stake:
• Potential gain if it works out
• Financial loss if it doesn't

? What would it take for you to feel confident in this decision?""",
}

JAILBREAK_PATTERNS = [
    re.compile(r'ignore (your |all |previous |)instructions', re.I),
    re.compile(r'pretend (you are|to be|you\'re)', re.I),
    re.compile(r'you are now', re.I),
    re.compile(r'act as (a |my |)(doctor|lawyer|therapist|advisor)', re.I),
    re.compile(r'roleplay as', re.I),
    re.compile(r'disregard (your |all |)guidelines', re.I),
    re.compile(r'bypass (your |)safety', re.I),
]

MANIPULATION_PATTERNS = [
    re.compile(r'just tell me what to do', re.I),
    re.compile(r'you\'?re the only one', re.I),
    re.compile(r'only one who (gets|understands|knows)', re.I),
    re.compile(r'between us', re.I),
    re.compile(r'our (little |)secret', re.I),
]

# ═══════════════════════════════════════════════════════════════════════════════
# OUTPUT VALIDATION — REFLECTION MODE SCHEMA
# ═══════════════════════════════════════════════════════════════════════════════

REQUIRED_SECTIONS = [
    '⟡ What you\'re deciding:',
    '⧈ What you\'re assuming:',
    '⧉ What\'s at stake:',
    '?'
]

FORBIDDEN_OUTPUT_PATTERNS = [
    re.compile(r'\byou should\b', re.I),
    re.compile(r'\byou must\b', re.I),
    re.compile(r'\byou need to\b', re.I),
    re.compile(r'\bi recommend\b', re.I),
    re.compile(r'\bi suggest\b', re.I),
    re.compile(r'\bi advise\b', re.I),
    re.compile(r'\btry this\b', re.I),
    re.compile(r'\bconsider\b', re.I),
    re.compile(r'\bwhy don\'t you\b', re.I),
    re.compile(r'\bhave you tried\b', re.I),
    re.compile(r'\bthe best\b', re.I),
    re.compile(r'\bdefinitely\b', re.I),
    re.compile(r'\bcertainly\b', re.I),
    re.compile(r'\babsolutely\b', re.I),
    re.compile(r'\bguaranteed\b', re.I),
    re.compile(r'\bstudies show\b', re.I),
    re.compile(r'\baccording to\b', re.I),
    re.compile(r'\d+(\.\d+)?%', re.I),
    re.compile(r'https?://', re.I),
]

FALLBACK_RESPONSE = """⟡ What you're deciding:
I couldn't structure a clear reflection for that input.

⧈ What you're assuming:
• The question may need to be framed as a decision
• More context might help clarify

⧉ What's at stake:
• Clarity if you can reframe as a choice you're facing
• Continued uncertainty if we stay abstract

? What specific decision are you trying to make?"""


def validate_output(text: str) -> tuple[bool, list[str]]:
    """Validate model output against Reflection Mode schema."""
    violations = []
    
    # Check required sections exist and are in order
    last_index = -1
    for section in REQUIRED_SECTIONS:
        index = text.find(section)
        if index == -1:
            violations.append(f"missing_section: {section[:20]}")
        elif index < last_index:
            violations.append(f"wrong_order: {section[:20]}")
        else:
            last_index = index
    
    # Check question mark count
    question_marks = text.count('?')
    if question_marks == 0:
        violations.append("no_question_mark")
    elif question_marks > 1:
        violations.append("too_many_questions")
    
    # Check forbidden patterns
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            violations.append(f"forbidden: {pattern.pattern[:15]}")
    
    # Check length
    if len(text) > 1000:
        violations.append("too_long")
    if len(text) < 100:
        violations.append("too_short")
    
    # Check for bullets in assumption section
    if '⧈' in text and '•' not in text:
        violations.append("missing_bullets")
    
    return len(violations) == 0, violations


# ═══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════════════════════

rate_limit_store: dict[str, list[float]] = defaultdict(list)

def check_rate_limit(ip: str) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if t > window_start]
    if len(rate_limit_store[ip]) >= RATE_LIMIT_REQUESTS:
        return False
    rate_limit_store[ip].append(now)
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# PRE-INFERENCE GATES
# ═══════════════════════════════════════════════════════════════════════════════

def run_pre_gates(text: str) -> tuple[bool, Optional[str], str]:
    """Run all pre-inference safety gates."""
    
    # Gate: Crisis detection
    for pattern in CRISIS_PATTERNS:
        if pattern.search(text):
            return False, CRISIS_RESPONSE, "crisis"
    
    # Gate: Illegal content (hard refuse)
    for pattern in ILLEGAL_PATTERNS:
        if pattern.search(text):
            return False, "I can't engage with that.", "illegal"
    
    # Gate: Domain detection (medical/legal/financial)
    for domain, patterns in DOMAIN_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(text):
                return False, DOMAIN_RESPONSES[domain], domain
    
    # Gate: Jailbreak attempts
    for pattern in JAILBREAK_PATTERNS:
        if pattern.search(text):
            return False, "? What decision are you trying to make?", "jailbreak"
    
    # Gate: Manipulation attempts
    for pattern in MANIPULATION_PATTERNS:
        if pattern.search(text):
            return False, """⟡ What you're deciding:
Whether to rely on an AI tool for something that needs human support.

⧈ What you're assuming:
• That I can provide what you need
• That this is a substitute for real connection

⧉ What's at stake:
• Real support if you reach out to someone who knows you
• Continued isolation if you rely only on tools

? Who in your life could you share this with?""", "manipulation"
    
    # Gate: Input length
    if len(text) > MAX_INPUT_LENGTH:
        return False, "? What's the core decision in all of that?", "size"
    
    return True, None, "passed"


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL INFERENCE
# ═══════════════════════════════════════════════════════════════════════════════

async def call_groq(user_input: str, system_prompt: str = SYSTEM_PROMPT, timeout: float = 15.0) -> Optional[str]:
    """Call Groq API with the new model."""
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not configured")
        return None
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_input}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 400
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    except Exception as e:
        logger.error(f"Groq API exception: {e}")
        return None


async def rewrite_response(original: str, user_input: str) -> Optional[str]:
    """Rewrite non-compliant response to match schema."""
    prompt = REWRITE_PROMPT.format(original=original, user_input=user_input)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 400
                }
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Rewrite failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# API MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class ReflectRequest(BaseModel):
    input: str = Field(..., max_length=MAX_INPUT_LENGTH)
    mode: Literal["cloud", "local"] = "cloud"
    session_id: Optional[str] = None

class ReflectResponse(BaseModel):
    output: str
    mode_used: str
    model_used: str
    rule_version: str
    safety_outcome: Literal["allowed", "rewritten", "refused", "error"]
    request_id: str
    gate_triggered: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Active Mirror Safety Proxy",
    version=RULE_VERSION,
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "rule_version": RULE_VERSION, "model": GROQ_MODEL}


@app.post("/api/reflect", response_model=ReflectResponse)
async def reflect(request: Request, body: ReflectRequest):
    """Main reflection endpoint with MirrorGate schema enforcement."""
    request_id = str(uuid.uuid4())[:8]
    client_ip = request.client.host if request.client else "unknown"
    
    # Rate limit
    if not check_rate_limit(client_ip):
        return ReflectResponse(
            output="? What's most pressing right now?",
            mode_used="none",
            model_used="none",
            rule_version=RULE_VERSION,
            safety_outcome="refused",
            request_id=request_id,
            gate_triggered="rate_limit"
        )
    
    # Pre-inference gates
    should_call_model, blocked_response, gate_name = run_pre_gates(body.input)
    
    if not should_call_model:
        logger.info(f"[{request_id}] Blocked by gate: {gate_name}")
        return ReflectResponse(
            output=blocked_response,
            mode_used="none",
            model_used="none",
            rule_version=RULE_VERSION,
            safety_outcome="refused",
            request_id=request_id,
            gate_triggered=gate_name
        )
    
    # Model inference (Pass 1)
    model_output = await call_groq(body.input)
    
    if model_output is None:
        logger.warning(f"[{request_id}] Model failed, returning fallback")
        return ReflectResponse(
            output=FALLBACK_RESPONSE,
            mode_used=body.mode,
            model_used=GROQ_MODEL,
            rule_version=RULE_VERSION,
            safety_outcome="error",
            request_id=request_id,
            gate_triggered="model_failure"
        )
    
    # Validate output (Pass 1)
    is_valid, violations = validate_output(model_output)
    
    if is_valid:
        return ReflectResponse(
            output=model_output,
            mode_used=body.mode,
            model_used=GROQ_MODEL,
            rule_version=RULE_VERSION,
            safety_outcome="allowed",
            request_id=request_id
        )
    
    logger.info(f"[{request_id}] Pass 1 failed: {violations[:3]}")
    
    # Rewrite (Pass 2)
    rewritten = await rewrite_response(model_output, body.input)
    
    if rewritten:
        is_valid_2, violations_2 = validate_output(rewritten)
        if is_valid_2:
            logger.info(f"[{request_id}] Pass 2 succeeded")
            return ReflectResponse(
                output=rewritten,
                mode_used=body.mode,
                model_used=GROQ_MODEL,
                rule_version=RULE_VERSION,
                safety_outcome="rewritten",
                request_id=request_id
            )
        
        logger.info(f"[{request_id}] Pass 2 failed: {violations_2[:3]}")
        
        # Rewrite (Pass 3)
        rewritten_2 = await rewrite_response(rewritten, body.input)
        if rewritten_2:
            is_valid_3, _ = validate_output(rewritten_2)
            if is_valid_3:
                logger.info(f"[{request_id}] Pass 3 succeeded")
                return ReflectResponse(
                    output=rewritten_2,
                    mode_used=body.mode,
                    model_used=GROQ_MODEL,
                    rule_version=RULE_VERSION,
                    safety_outcome="rewritten",
                    request_id=request_id
                )
    
    # All passes failed — use fallback
    logger.warning(f"[{request_id}] All passes failed, using fallback")
    return ReflectResponse(
        output=FALLBACK_RESPONSE,
        mode_used=body.mode,
        model_used=GROQ_MODEL,
        rule_version=RULE_VERSION,
        safety_outcome="refused",
        request_id=request_id,
        gate_triggered="validation_failed"
    )


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Active Mirror Safety Proxy v{RULE_VERSION}")
    logger.info(f"Model: {GROQ_MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
```

---

## PART 6: DEMO.JSX UPDATES

### Update 1: Model constant (line ~63)
```javascript
const GROQ_MODEL = "openai/gpt-oss-20b";
```

### Update 2: Cloud system prompt (line ~65-80)
```javascript
const CLOUD_SYSTEM_PROMPT = `You are Active Mirror, a reflection engine. You help people think through decisions by structuring their thinking — NOT by giving advice.

OUTPUT FORMAT (MANDATORY — use this exact structure):

⟡ What you're deciding:
[Restate their decision/situation in one clear sentence. Max 160 characters.]

⧈ What you're assuming:
• [Hidden assumption 1 they may not have noticed]
• [Hidden assumption 2 about outcomes or others]

⧉ What's at stake:
• [What they gain if this works out]
• [What they risk or lose if it doesn't]

? [One sharp question that cuts to the heart of the matter]

RULES:
1. Use EXACT format above
2. NEVER give advice or say "you should"
3. Exactly ONE question mark total
4. Under 800 characters

If unclear: ? What decision are you trying to make?`;
```

### Update 3: Local system prompt (line ~82-90)
```javascript
const LOCAL_SYSTEM_PROMPT = `You are Active Mirror. Structure thinking, never advise.

FORMAT:
⟡ What you're deciding: [one sentence]
⧈ What you're assuming:
• [assumption 1]
• [assumption 2]
⧉ What's at stake:
• [upside]
• [risk]
? [one question]

No "you should". One question mark only.`;
```

### Update 4: API call parameters (line ~250-270)
```javascript
body: JSON.stringify({
    model: GROQ_MODEL,
    messages: [
        { role: "system", content: CLOUD_SYSTEM_PROMPT },
        ...messages.slice(-6),
        { role: "user", content: userMsg }
    ],
    temperature: 0.4,  // Lower for more consistent schema
    max_tokens: 400
})
```

---

## PART 7: CLIENT-SIDE MIRRORGATE (for Sovereign Mode)

Add to Demo.jsx — wrap local inference output:

```javascript
// Import at top
import { gateInput, validateOutput, FALLBACK_RESPONSE, getRewritePrompt } from '../utils/mirrorGate';

// In handleSend, before calling local inference:
const gateResult = gateInput(userMsg);
if (!gateResult.allowed) {
    setMessages(prev => [...prev, { role: "assistant", content: gateResult.response }]);
    setIsLoading(false);
    return;
}

// After local inference, validate and potentially use fallback:
async function runLocalInference(engine, userMsg) {
    try {
        // ... existing inference code ...
        
        // After getting fullResponse:
        const validation = validateOutput(fullResponse);
        
        if (!validation.valid) {
            console.log("⟡ Local output failed validation:", validation.violations);
            // For local models, use fallback directly (no rewrite capability)
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = FALLBACK_RESPONSE;
                return newArr;
            });
        }
    } catch (err) {
        // ... existing error handling ...
    }
}
```

---

## PART 8: TESTS

Create file: `safety_proxy/test_mirrorgate.py`

```python
#!/usr/bin/env python3
"""
MirrorGate Test Suite
Run: python3 test_mirrorgate.py
"""

import re

# Import validation logic (copy from safety_proxy.py for standalone testing)
REQUIRED_SECTIONS = [
    '⟡ What you\'re deciding:',
    '⧈ What you\'re assuming:',
    '⧉ What\'s at stake:',
    '?'
]

FORBIDDEN_OUTPUT_PATTERNS = [
    re.compile(r'\byou should\b', re.I),
    re.compile(r'\bi recommend\b', re.I),
    re.compile(r'\bdefinitely\b', re.I),
    re.compile(r'\bstudies show\b', re.I),
]

def validate_output(text):
    violations = []
    last_index = -1
    for section in REQUIRED_SECTIONS:
        index = text.find(section)
        if index == -1:
            violations.append(f"missing: {section[:20]}")
        elif index < last_index:
            violations.append(f"wrong_order: {section[:20]}")
        else:
            last_index = index
    
    question_marks = text.count('?')
    if question_marks == 0:
        violations.append("no_question_mark")
    elif question_marks > 1:
        violations.append("too_many_questions")
    
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            violations.append(f"forbidden: {pattern.pattern[:15]}")
    
    return len(violations) == 0, violations


# ═══════════════════════════════════════════════════════════════════════════════
# TEST CASES
# ═══════════════════════════════════════════════════════════════════════════════

def test_valid_output():
    """Valid schema should pass"""
    valid = """⟡ What you're deciding:
Whether to leave your current job for a startup opportunity.

⧈ What you're assuming:
• The startup will succeed
• Your current job won't improve

⧉ What's at stake:
• Growth and equity if the startup works
• Stability and income if it doesn't

? What would you regret more in five years?"""
    
    is_valid, violations = validate_output(valid)
    assert is_valid, f"Valid output should pass: {violations}"
    print("✓ test_valid_output passed")


def test_missing_section():
    """Missing section should fail"""
    missing = """⟡ What you're deciding:
Something important.

⧉ What's at stake:
• Good stuff
• Bad stuff

? What matters?"""
    
    is_valid, violations = validate_output(missing)
    assert not is_valid, "Missing section should fail"
    assert any("missing" in v for v in violations)
    print("✓ test_missing_section passed")


def test_multiple_questions():
    """Multiple question marks should fail"""
    multi_q = """⟡ What you're deciding:
Something?

⧈ What you're assuming:
• Thing one
• Thing two

⧉ What's at stake:
• Upside
• Downside

? What matters? And what else?"""
    
    is_valid, violations = validate_output(multi_q)
    assert not is_valid, "Multiple questions should fail"
    assert "too_many_questions" in violations
    print("✓ test_multiple_questions passed")


def test_advice_language():
    """Advice language should fail"""
    advice = """⟡ What you're deciding:
Whether to take the job.

⧈ What you're assuming:
• You should definitely take it
• I recommend considering it

⧉ What's at stake:
• Everything
• Nothing

? What do you think?"""
    
    is_valid, violations = validate_output(advice)
    assert not is_valid, "Advice language should fail"
    print("✓ test_advice_language passed")


def test_no_question():
    """No question mark should fail"""
    no_q = """⟡ What you're deciding:
Something important.

⧈ What you're assuming:
• Thing one
• Thing two

⧉ What's at stake:
• Upside
• Downside

Think about it."""
    
    is_valid, violations = validate_output(no_q)
    assert not is_valid, "No question should fail"
    assert "no_question_mark" in violations
    print("✓ test_no_question passed")


if __name__ == "__main__":
    print("\n⟡ Running MirrorGate Tests\n")
    test_valid_output()
    test_missing_section()
    test_multiple_questions()
    test_advice_language()
    test_no_question()
    print("\n✓ All tests passed\n")
```

---

## PART 9: DEPLOYMENT CHECKLIST

```markdown
## Pre-Deploy
- [ ] Update GROQ_MODEL in Demo.jsx
- [ ] Update GROQ_MODEL in safety_proxy.py
- [ ] Update system prompts in both files
- [ ] Create src/utils/mirrorGate.js
- [ ] Create safety_proxy/test_mirrorgate.py
- [ ] Run tests: `python3 test_mirrorgate.py`

## Deploy Safety Proxy
- [ ] SSH to server / update safety_proxy.py
- [ ] Restart: `systemctl restart mirror-proxy` (or however it's deployed)
- [ ] Test endpoint: `curl https://activemirror.ai/api/reflect -X POST -d '{"input":"test"}'`

## Deploy Frontend
- [ ] `npm run build`
- [ ] `npm run deploy` (or gh-pages push)
- [ ] Test /mirror in browser
- [ ] Test sovereign mode (local inference)
- [ ] Test cloud mode

## Verify
- [ ] Response follows schema
- [ ] No advice language appears
- [ ] Single question mark in output
- [ ] Crisis patterns trigger resources
- [ ] Illegal content blocked
```

---

## SUMMARY FOR ANTIGRAVITY

**What changed:**
1. Model: `llama-3.3-70b-versatile` → `openai/gpt-oss-20b` (faster, better, same free tier)
2. Output: Free-form questions → Structured reflection schema
3. Validation: New MirrorGate validator enforces schema
4. Safety: Tri-pass rewrite loop ensures compliance

**Files to modify:**
- `src/pages/Demo.jsx` — model, prompts, local gate
- `safety_proxy/safety_proxy.py` — full replacement
- `src/utils/mirrorGate.js` — new file
- `safety_proxy/test_mirrorgate.py` — new file

**The schema gives substance without giving advice.** Users get:
- Their decision clarified
- Hidden assumptions surfaced
- Stakes laid out
- One sharp question

This addresses the "no point" feedback while maintaining reflection philosophy.

---

⟡ End of handoff. Antigravity, execute.
