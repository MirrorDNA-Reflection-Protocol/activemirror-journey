# ⟡ MIRRORGATE v4.0 — SPLIT-STACK ARCHITECTURE

**HANDOFF TO ANTIGRAVITY**
**Date:** 2026-01-04
**Priority:** IMMEDIATE — Full architecture upgrade

---

## EXECUTIVE SUMMARY

We're upgrading from "model outputs text, validate post-hoc" to "model outputs JSON, render deterministically."

**Why:** Small models can't maintain logic + persona simultaneously. By removing persona from inference, we free the model to focus purely on structure. The warmth comes from templates.

**Result:** Zero hallucination at render. Full auditability. Works reliably on 1.5B models.

---

## ARCHITECTURE

```
USER INPUT
    │
    ▼
┌─────────────────────────────────────────────┐
│  GATE LAYER (Pre-Inference)                 │
│  • Crisis → hardcoded resources             │
│  • Illegal → hard refuse                    │
│  • Domain → hardcoded redirects             │
│  • Jailbreak → reject                       │
└─────────────────────────────────────────────┘
    │
    ▼ (only if gates pass)
┌─────────────────────────────────────────────┐
│  SUBSTRATE (Model)                          │
│  • System prompt: "Output JSON only"        │
│  • No persona, no prose                     │
│  • Output: structured schema                │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  MIRRORGATE (Validation)                    │
│  • Parse JSON                               │
│  • Validate required fields                 │
│  • Check for forbidden content              │
│  • Fallback if invalid                      │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  RENDERER (Deterministic)                   │
│  • Select templates by mode                 │
│  • Inject schema values                     │
│  • Zero model calls                         │
│  • Zero hallucination                       │
└─────────────────────────────────────────────┘
    │
    ▼
USER OUTPUT (+ optional "Show thinking" toggle)
```

---

## FILE 1: `src/utils/reflectionSchema.js`

```javascript
/**
 * Reflection Schema v1.0
 * The contract between Substrate and Renderer
 */

export const SCHEMA_VERSION = "1.0";

export const MODES = {
  DECISION: "decision",
  EMOTIONAL: "emotional",
  STRATEGIC: "strategic",
  DEBUGGING: "debugging",
  UNCLEAR: "unclear"
};

/**
 * Detect mode from user input
 */
export function detectMode(input) {
  const lower = input.toLowerCase();
  
  if (/should i|choose between|deciding|which (one|option)|torn between/i.test(lower)) {
    return MODES.DECISION;
  }
  if (/feel(ing)?|stressed|anxious|overwhelmed|scared|angry|sad|frustrated|worried/i.test(lower)) {
    return MODES.EMOTIONAL;
  }
  if (/how (do|can|should|to)|plan(ning)?|approach|strategy|next steps/i.test(lower)) {
    return MODES.STRATEGIC;
  }
  if (/what went wrong|failed|mistake|why did(n't)?|broken|not working/i.test(lower)) {
    return MODES.DEBUGGING;
  }
  
  return MODES.UNCLEAR;
}

/**
 * Validate schema from model output
 */
export function validateSchema(obj) {
  const errors = [];
  
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['not_an_object'] };
  }
  
  if (!obj.tension || typeof obj.tension !== 'string') {
    errors.push('missing_tension');
  }
  
  if (!Array.isArray(obj.assumptions) || obj.assumptions.length < 1) {
    errors.push('missing_assumptions');
  }
  
  if (!obj.question || typeof obj.question !== 'string') {
    errors.push('missing_question');
  }
  
  if (obj.question && !obj.question.trim().endsWith('?')) {
    errors.push('question_no_mark');
  }
  
  if (obj.mode && !Object.values(MODES).includes(obj.mode)) {
    errors.push('invalid_mode');
  }
  
  // Content safety
  const allText = JSON.stringify(obj).toLowerCase();
  const forbidden = ['you should', 'i recommend', 'definitely', 'you must', 'you need to'];
  for (const phrase of forbidden) {
    if (allText.includes(phrase)) {
      errors.push(`forbidden: ${phrase}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Parse JSON from model output (handles markdown wrapping)
 */
export function parseModelOutput(raw) {
  try {
    return { parsed: JSON.parse(raw), error: null };
  } catch (e) {
    // Try extracting from markdown
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return { parsed: JSON.parse(match[0]), error: null };
      } catch (e2) {
        return { parsed: null, error: 'json_parse_failed' };
      }
    }
    return { parsed: null, error: 'json_parse_failed' };
  }
}

/**
 * Fallback schema
 */
export const FALLBACK_SCHEMA = {
  schema_version: SCHEMA_VERSION,
  mode: MODES.UNCLEAR,
  tension: "clarity vs. complexity",
  assumptions: [
    "there's a decision embedded here",
    "more context would help"
  ],
  blindspot: null,
  stakes: {
    upside: "clarity if we can frame this as a choice",
    risk: "staying abstract keeps things unresolved"
  },
  question: "What specific decision are you trying to make?"
};
```

---

## FILE 2: `src/utils/reflectionTemplates.js`

```javascript
/**
 * Reflection Template Library
 * Deterministic phrase banks — zero hallucination
 * 
 * Style: Warm but direct. ADHD-friendly. Get to the point.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TEMPLATES = {
  
  // ═══════════════════════════════════════════════════════════════
  // DECISION MODE — "Should I X or Y?"
  // ═══════════════════════════════════════════════════════════════
  decision: {
    tension: [
      "You're caught between {tension}.",
      "The core tension: {tension}.",
      "This comes down to {tension}.",
      "What I'm hearing: {tension}."
    ],
    assumptions: [
      "You're assuming {0}. And that {1}.",
      "Baked into this: {0}. Also, {1}.",
      "This rests on {0} — and {1}.",
      "Underneath: {0}, and {1}."
    ],
    blindspot: [
      "Worth checking: {blindspot}.",
      "Possible blindspot — {blindspot}.",
      "Something you might not be seeing: {blindspot}."
    ],
    stakes: [
      "If this works: {upside}. If it doesn't: {risk}.",
      "Upside: {upside}. Downside: {risk}.",
      "You gain {upside}. You risk {risk}."
    ],
    question: [
      "The real question: {question}",
      "What this comes down to: {question}",
      "⟡ {question}"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // EMOTIONAL MODE — "I'm feeling overwhelmed"
  // ═══════════════════════════════════════════════════════════════
  emotional: {
    tension: [
      "It sounds like you're holding {tension}.",
      "There's a pull between {tension}.",
      "You're navigating {tension} right now."
    ],
    assumptions: [
      "Part of this might be the belief that {0}. And maybe {1}.",
      "You might be carrying {0}, and {1}.",
      "What might be underneath: {0}. And {1}."
    ],
    blindspot: [
      "Hard to see from inside this: {blindspot}.",
      "What might not be visible right now: {blindspot}."
    ],
    stakes: [
      "If you move through this: {upside}. If it stays stuck: {risk}.",
      "On the other side: {upside}. Staying here: {risk}."
    ],
    question: [
      "What would help right now: {question}",
      "A question to sit with: {question}",
      "⟡ {question}"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // STRATEGIC MODE — "How should I approach X?"
  // ═══════════════════════════════════════════════════════════════
  strategic: {
    tension: [
      "The strategic tension: {tension}.",
      "You're balancing {tension}.",
      "The trade-off: {tension}."
    ],
    assumptions: [
      "This assumes {0}. And {1}.",
      "Built in: {0}, and {1}.",
      "The plan rests on {0} — and {1}."
    ],
    blindspot: [
      "Strategic blindspot: {blindspot}.",
      "What might break this: {blindspot}."
    ],
    stakes: [
      "If it works: {upside}. If it fails: {risk}.",
      "Best case: {upside}. Worst case: {risk}."
    ],
    question: [
      "The strategic question: {question}",
      "Before you execute: {question}",
      "⟡ {question}"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // DEBUGGING MODE — "What went wrong?"
  // ═══════════════════════════════════════════════════════════════
  debugging: {
    tension: [
      "The gap: {tension}.",
      "What broke: {tension}.",
      "Where expectation and reality diverged: {tension}."
    ],
    assumptions: [
      "You were assuming {0}. And {1}.",
      "The model had {0} and {1} as true.",
      "Built into the plan: {0}. Also: {1}."
    ],
    blindspot: [
      "What was invisible: {blindspot}.",
      "The hidden variable: {blindspot}."
    ],
    stakes: [
      "If you fix this: {upside}. If you don't: {risk}.",
      "Learning here: {upside}. Repeating it: {risk}."
    ],
    question: [
      "The diagnostic question: {question}",
      "For next time: {question}",
      "⟡ {question}"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // UNCLEAR MODE — Fallback
  // ═══════════════════════════════════════════════════════════════
  unclear: {
    tension: [
      "There seems to be {tension}.",
      "I'm sensing {tension}."
    ],
    assumptions: [
      "You might be assuming {0}. And {1}."
    ],
    blindspot: [
      "Worth examining: {blindspot}."
    ],
    stakes: [
      "At stake: {upside} vs. {risk}."
    ],
    question: [
      "To get clearer: {question}",
      "⟡ {question}"
    ]
  }
};

/**
 * Render schema to conversational text
 * ZERO model calls. ZERO hallucination.
 */
export function renderReflection(schema) {
  const mode = schema.mode || 'unclear';
  const templates = TEMPLATES[mode] || TEMPLATES.unclear;
  
  const parts = [];
  
  // 1. Tension
  parts.push(pick(templates.tension).replace('{tension}', schema.tension));
  
  // 2. Assumptions
  let assumptionText = pick(templates.assumptions);
  (schema.assumptions || []).forEach((a, i) => {
    assumptionText = assumptionText.replace(`{${i}}`, a);
  });
  assumptionText = assumptionText.replace(/\{[0-9]\}/g, '').replace(/\s+/g, ' ').trim();
  parts.push(assumptionText);
  
  // 3. Blindspot (optional)
  if (schema.blindspot && templates.blindspot) {
    parts.push(pick(templates.blindspot).replace('{blindspot}', schema.blindspot));
  }
  
  // 4. Stakes
  if (schema.stakes && templates.stakes) {
    parts.push(
      pick(templates.stakes)
        .replace('{upside}', schema.stakes.upside || 'clarity')
        .replace('{risk}', schema.stakes.risk || 'confusion')
    );
  }
  
  // 5. Question (anchor)
  parts.push(pick(templates.question).replace('{question}', schema.question));
  
  return parts.join('\n\n');
}

export function renderFallback() {
  return `I couldn't structure that clearly.\n\n⟡ What specific decision are you trying to make?`;
}
```

---

## FILE 3: `src/utils/substratePrompt.js`

```javascript
/**
 * Substrate System Prompts
 * Model outputs JSON only — no persona, no prose
 */

export const SUBSTRATE_PROMPT_CLOUD = `You are a logic engine. Analyze user input. Output JSON only.

FORMAT (JSON only, no other text):
{
  "mode": "decision|emotional|strategic|debugging|unclear",
  "tension": "the core conflict the user is experiencing",
  "assumptions": ["assumption 1", "assumption 2"],
  "blindspot": "something they might not see, or null",
  "stakes": {
    "upside": "what they gain if this resolves well",
    "risk": "what they lose if it doesn't"
  },
  "question": "one clarifying question ending with ?"
}

RULES:
1. Output ONLY valid JSON. No markdown. No explanation.
2. "tension" = core conflict in their situation
3. "assumptions" = 2-3 beliefs they haven't stated
4. "blindspot" = optional, only if meaningful
5. "question" = ONE question, must end with ?
6. NEVER include "you should" or "I recommend" in any value
7. If unclear, mode="unclear", question="What decision are you trying to make?"

JSON only:`;

export const SUBSTRATE_PROMPT_LOCAL = `Output JSON only.

{"mode":"decision|emotional|strategic|debugging|unclear","tension":"conflict","assumptions":["a1","a2"],"blindspot":"or null","stakes":{"upside":"gain","risk":"loss"},"question":"question?"}

No prose. No advice. JSON only:`;
```

---

## FILE 4: `src/utils/mirrorGate.js` (UPDATED)

```javascript
/**
 * MirrorGate v4.0 — Split-Stack Edition
 */

import { validateSchema, parseModelOutput, detectMode, FALLBACK_SCHEMA } from './reflectionSchema';
import { renderReflection, renderFallback } from './reflectionTemplates';

// ═══════════════════════════════════════════════════════════════
// PRE-INFERENCE GATES
// ═══════════════════════════════════════════════════════════════

const CRISIS_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end(ing)? my life|want to die)\b/i,
  /\b(self.?harm|cut myself|hurt myself)\b/i,
  /\b(take my (own )?life|better off dead)\b/i,
  /\b(being abused|hits me|rape|raped)\b/i,
];

const ILLEGAL_PATTERNS = [
  /\b(how to (make|build) (a |)(bomb|explosive|weapon))\b/i,
  /\b(synthesize|manufacture) (drugs|meth|fentanyl)\b/i,
  /\b(child porn|csam|underage)\b/i,
  /\b(hack into|malware|exploit vulnerability)\b/i,
];

const CRISIS_RESPONSE = `I can hear you're in a difficult place. I'm not equipped for this — please reach out:

🆘 Crisis Text Line: Text HOME to 741741
🆘 Suicide & Crisis Lifeline: 988 (US)
🆘 Emergency: 911

You matter. Please reach out now.`;

export function gateInput(input) {
  for (const p of CRISIS_PATTERNS) {
    if (p.test(input)) return { allowed: false, reason: 'crisis', response: CRISIS_RESPONSE };
  }
  for (const p of ILLEGAL_PATTERNS) {
    if (p.test(input)) return { allowed: false, reason: 'illegal', response: "I can't engage with that." };
  }
  if (input.length > 2000) {
    return { allowed: false, reason: 'too_long', response: "That's a lot. What's the core decision?" };
  }
  return { allowed: true, mode: detectMode(input) };
}

// ═══════════════════════════════════════════════════════════════
// POST-INFERENCE PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Process raw model output → validated schema → rendered text
 */
export function processAndRender(rawOutput, detectedMode) {
  // Parse JSON
  const { parsed, error } = parseModelOutput(rawOutput);
  
  if (!parsed) {
    console.log('⟡ JSON parse failed:', error);
    const fallback = { ...FALLBACK_SCHEMA, mode: detectedMode };
    return { text: renderReflection(fallback), schema: fallback, valid: false };
  }
  
  // Validate
  const validation = validateSchema(parsed);
  
  if (!validation.valid) {
    console.log('⟡ Schema validation failed:', validation.errors);
    const fallback = { ...FALLBACK_SCHEMA, mode: detectedMode };
    return { text: renderReflection(fallback), schema: fallback, valid: false };
  }
  
  // Inject mode if missing
  if (!parsed.mode) parsed.mode = detectedMode;
  
  // Render
  return { text: renderReflection(parsed), schema: parsed, valid: true };
}

// Exports for backward compat
export { FALLBACK_SCHEMA } from './reflectionSchema';
export const FALLBACK_RESPONSE = renderFallback();
```

---

## FILE 5: `safety_proxy/safety_proxy.py` (v4.0 — FULL REPLACEMENT)

```python
#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v4.0
Split-Stack: Substrate → MirrorGate → Renderer
"""

import os, re, json, time, uuid, logging, random
from typing import Optional, Literal
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "4.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000",
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════
# SUBSTRATE PROMPT
# ═══════════════════════════════════════════════════════════════

SUBSTRATE_PROMPT = """You are a logic engine. Analyze user input. Output JSON only.

FORMAT:
{
  "mode": "decision|emotional|strategic|debugging|unclear",
  "tension": "the core conflict",
  "assumptions": ["assumption 1", "assumption 2"],
  "blindspot": "something they might not see, or null",
  "stakes": {"upside": "what they gain", "risk": "what they lose"},
  "question": "one question ending with ?"
}

RULES:
1. Output ONLY valid JSON. No markdown. No prose.
2. NEVER include "you should" or "I recommend"
3. If unclear: mode="unclear", question="What decision are you trying to make?"

JSON only:"""

# ═══════════════════════════════════════════════════════════════
# TEMPLATES
# ═══════════════════════════════════════════════════════════════

TEMPLATES = {
    "decision": {
        "tension": ["You're caught between {tension}.", "The core tension: {tension}.", "This comes down to {tension}."],
        "assumptions": ["You're assuming {0}. And that {1}.", "Baked into this: {0}. Also, {1}."],
        "blindspot": ["Worth checking: {blindspot}.", "Possible blindspot — {blindspot}."],
        "stakes": ["If this works: {upside}. If it doesn't: {risk}.", "Upside: {upside}. Downside: {risk}."],
        "question": ["The real question: {question}", "⟡ {question}"]
    },
    "emotional": {
        "tension": ["It sounds like you're holding {tension}.", "There's a pull between {tension}."],
        "assumptions": ["Part of this might be {0}. And maybe {1}.", "You might be carrying {0}, and {1}."],
        "blindspot": ["Hard to see from inside: {blindspot}."],
        "stakes": ["If you move through: {upside}. If stuck: {risk}."],
        "question": ["What would help: {question}", "⟡ {question}"]
    },
    "strategic": {
        "tension": ["Strategic tension: {tension}.", "You're balancing {tension}."],
        "assumptions": ["This assumes {0}. And {1}.", "Built in: {0}, and {1}."],
        "blindspot": ["Strategic blindspot: {blindspot}."],
        "stakes": ["If it works: {upside}. If it fails: {risk}."],
        "question": ["Before you execute: {question}", "⟡ {question}"]
    },
    "debugging": {
        "tension": ["The gap: {tension}.", "What broke: {tension}."],
        "assumptions": ["You were assuming {0}. And {1}."],
        "blindspot": ["What was invisible: {blindspot}."],
        "stakes": ["If you fix this: {upside}. If not: {risk}."],
        "question": ["For next time: {question}", "⟡ {question}"]
    },
    "unclear": {
        "tension": ["There seems to be {tension}."],
        "assumptions": ["You might be assuming {0}. And {1}."],
        "blindspot": ["Worth examining: {blindspot}."],
        "stakes": ["At stake: {upside} vs. {risk}."],
        "question": ["To get clearer: {question}", "⟡ {question}"]
    }
}

def render_reflection(schema: dict) -> str:
    mode = schema.get("mode", "unclear")
    t = TEMPLATES.get(mode, TEMPLATES["unclear"])
    parts = []
    
    parts.append(random.choice(t["tension"]).format(tension=schema.get("tension", "something")))
    
    assumptions = schema.get("assumptions", ["something", "something else"])
    atxt = random.choice(t["assumptions"])
    for i, a in enumerate(assumptions[:2]):
        atxt = atxt.replace(f"{{{i}}}", a)
    parts.append(atxt)
    
    if schema.get("blindspot") and t.get("blindspot"):
        parts.append(random.choice(t["blindspot"]).format(blindspot=schema["blindspot"]))
    
    stakes = schema.get("stakes", {})
    if stakes and t.get("stakes"):
        parts.append(random.choice(t["stakes"]).format(
            upside=stakes.get("upside", "clarity"),
            risk=stakes.get("risk", "confusion")
        ))
    
    parts.append(random.choice(t["question"]).format(question=schema.get("question", "What matters?")))
    
    return "\n\n".join(parts)

FALLBACK_SCHEMA = {
    "mode": "unclear", "tension": "clarity vs. complexity",
    "assumptions": ["there's a decision here", "more context helps"],
    "blindspot": None, "stakes": {"upside": "clarity", "risk": "staying stuck"},
    "question": "What specific decision are you trying to make?"
}

# ═══════════════════════════════════════════════════════════════
# GATES
# ═══════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|want to die)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I),
    re.compile(r'\b(being abused|rape|raped)\b', re.I),
]

CRISIS_RESPONSE = """I can hear you're in a difficult place. Please reach out:

🆘 Crisis Text Line: Text HOME to 741741
🆘 Suicide & Crisis Lifeline: 988 (US)
🆘 Emergency: 911

You matter."""

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build) (a |)(bomb|weapon))\b', re.I),
    re.compile(r'\b(child porn|csam)\b', re.I),
    re.compile(r'\b(hack into|malware)\b', re.I),
]

def run_gates(text: str):
    for p in CRISIS_PATTERNS:
        if p.search(text): return False, CRISIS_RESPONSE, "crisis"
    for p in ILLEGAL_PATTERNS:
        if p.search(text): return False, "I can't engage with that.", "illegal"
    if len(text) > MAX_INPUT_LENGTH:
        return False, "That's a lot. What's the core decision?", "size"
    return True, None, "passed"

def detect_mode(text: str) -> str:
    t = text.lower()
    if re.search(r'should i|choose|deciding|torn between', t): return "decision"
    if re.search(r'feel|stressed|anxious|overwhelmed|worried', t): return "emotional"
    if re.search(r'how (do|can|to)|plan|strategy', t): return "strategic"
    if re.search(r'went wrong|failed|mistake|broken', t): return "debugging"
    return "unclear"

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_schema(obj: dict):
    errors = []
    if not isinstance(obj, dict): return False, ["not_dict"]
    if not obj.get("tension"): errors.append("no_tension")
    if not obj.get("assumptions"): errors.append("no_assumptions")
    if not obj.get("question"): errors.append("no_question")
    elif not obj["question"].strip().endswith("?"): errors.append("no_question_mark")
    
    forbidden = ["you should", "i recommend", "definitely"]
    txt = json.dumps(obj).lower()
    for f in forbidden:
        if f in txt: errors.append(f"forbidden:{f}")
    
    return len(errors) == 0, errors

def parse_json(raw: str):
    try: return json.loads(raw), None
    except: pass
    m = re.search(r'\{[\s\S]*\}', raw)
    if m:
        try: return json.loads(m.group()), None
        except: pass
    return None, "parse_failed"

# ═══════════════════════════════════════════════════════════════
# INFERENCE
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str) -> bool:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS: return False
    rate_limits[ip].append(now)
    return True

async def call_substrate(user_input: str):
    if not GROQ_API_KEY: return None
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": SUBSTRATE_PROMPT},
                        {"role": "user", "content": user_input}
                    ],
                    "temperature": 0.3, "max_tokens": 500
                }
            )
            if r.status_code != 200: return None
            return r.json()["choices"][0]["message"]["content"]
    except: return None

# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class ReflectRequest(BaseModel):
    input: str = Field(..., max_length=MAX_INPUT_LENGTH)

class ReflectResponse(BaseModel):
    output: str
    schema_raw: Optional[dict] = None
    mode: str
    rule_version: str
    outcome: Literal["allowed", "fallback", "refused", "error"]
    request_id: str

app = FastAPI(title="Active Mirror", version=RULE_VERSION, docs_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["POST", "GET"], allow_headers=["Content-Type"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": RULE_VERSION}

@app.post("/api/reflect", response_model=ReflectResponse)
async def reflect(request: Request, body: ReflectRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    if not check_rate(ip):
        return ReflectResponse(output="⟡ What's most pressing?", schema_raw=None, mode="rate_limited", rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    allowed, blocked, gate = run_gates(body.input)
    if not allowed:
        return ReflectResponse(output=blocked, schema_raw=None, mode=gate, rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    detected = detect_mode(body.input)
    raw = await call_substrate(body.input)
    
    if not raw:
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="error", request_id=rid)
    
    parsed, err = parse_json(raw)
    if not parsed:
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    valid, errs = validate_schema(parsed)
    if not valid:
        logger.info(f"[{rid}] validation failed: {errs}")
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    if not parsed.get("mode"): parsed["mode"] = detected
    
    return ReflectResponse(
        output=render_reflection(parsed),
        schema_raw=parsed,
        mode=parsed["mode"],
        rule_version=RULE_VERSION,
        outcome="allowed",
        request_id=rid
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Safety Proxy v{RULE_VERSION} — Split-Stack Architecture")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
```

---

## FILE 6: DEMO.JSX UPDATES

### Update imports (top of file)
```javascript
import { gateInput, processAndRender, FALLBACK_SCHEMA } from '../utils/mirrorGate';
import { SUBSTRATE_PROMPT_CLOUD, SUBSTRATE_PROMPT_LOCAL } from '../utils/substratePrompt';
```

### Update state (add schema tracking for "Show thinking")
```javascript
const [lastSchema, setLastSchema] = useState(null);
const [showThinking, setShowThinking] = useState(false);
```

### Update handleSend (cloud path)
```javascript
async function handleSend(overrideText = null) {
  const textToSend = overrideText || input;
  if (!textToSend.trim()) return;
  
  // Pre-inference gate
  const gateResult = gateInput(textToSend);
  if (!gateResult.allowed) {
    setMessages(prev => [...prev, 
      { role: "user", content: textToSend },
      { role: "assistant", content: gateResult.response }
    ]);
    return;
  }
  
  const detectedMode = gateResult.mode;
  
  if (!overrideText) setInput("");
  setMessages(prev => [...prev, { role: "user", content: textToSend }]);
  setIsLoading(true);
  setIsReflecting(true);
  
  try {
    await new Promise(r => setTimeout(r, 1200)); // Thoughtful pause
    setIsReflecting(false);
    
    // Cloud mode
    if (currentTier === 'cloud' && groqKey && isOnline) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SUBSTRATE_PROMPT_CLOUD },
            { role: "user", content: textToSend }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      const rawOutput = data.choices[0]?.message?.content || "";
      
      // Process through MirrorGate
      const { text, schema, valid } = processAndRender(rawOutput, detectedMode);
      
      setLastSchema(schema);
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
      setIsLoading(false);
      return;
    }
    
    // Local fallback...
    if (tier2Engine || tier1Engine) {
      await runLocalInference(tier2Engine || tier1Engine, textToSend, detectedMode);
      return;
    }
    
    // Static fallback
    const { text } = processAndRender(null, detectedMode);
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
    
  } catch (err) {
    console.error("⟡ Error:", err);
    const { text, schema } = processAndRender(null, "unclear");
    setLastSchema(schema);
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
  } finally {
    setIsLoading(false);
    setIsReflecting(false);
  }
}
```

### Update runLocalInference
```javascript
async function runLocalInference(engine, userMsg, detectedMode) {
  try {
    const chunks = await engine.chat.completions.create({
      messages: [
        { role: "system", content: SUBSTRATE_PROMPT_LOCAL },
        { role: "user", content: userMsg }
      ],
      stream: false,
      temperature: 0.3
    });
    
    const rawOutput = chunks.choices[0]?.message?.content || "";
    const { text, schema } = processAndRender(rawOutput, detectedMode);
    
    setLastSchema(schema);
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
    
  } catch (err) {
    console.error("⟡ Local inference error:", err);
    const { text, schema } = processAndRender(null, detectedMode);
    setLastSchema(schema);
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
  } finally {
    setIsLoading(false);
  }
}
```

### Add "Show thinking" toggle (in render, after messages)
```javascript
{/* Show Thinking Toggle */}
{lastSchema && (
  <div className="flex justify-center mt-4">
    <button
      onClick={() => setShowThinking(!showThinking)}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {showThinking ? "Hide thinking ↑" : "Show thinking ↓"}
    </button>
  </div>
)}

{showThinking && lastSchema && (
  <div className="mx-auto max-w-xl mt-2 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
    <div className="text-xs text-zinc-500 mb-2 font-mono">Raw Schema (what the model produced)</div>
    <pre className="text-xs text-zinc-400 overflow-x-auto">
      {JSON.stringify(lastSchema, null, 2)}
    </pre>
  </div>
)}
```

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Create new files
touch src/utils/reflectionSchema.js
touch src/utils/reflectionTemplates.js
touch src/utils/substratePrompt.js

# 2. Update existing files
# - src/utils/mirrorGate.js (replace)
# - src/pages/Demo.jsx (update imports, state, handlers, render)
# - safety_proxy/safety_proxy.py (replace with v4.0)

# 3. Test locally
npm run dev
# Test cloud mode
# Test local mode
# Test "Show thinking" toggle

# 4. Build
npm run build

# 5. Deploy frontend
git add -A
git commit -m "MirrorGate v4.0: Split-stack architecture, deterministic rendering"
git push origin main

# 6. Deploy proxy
# Copy safety_proxy.py to /Users/mirror-admin/bin/
# Restart: launchctl kickstart -k gui/$(id -u)/com.activemirror.proxy
```

---

## SMOKE TESTS

| Input | Expected Mode | Check |
|-------|---------------|-------|
| "Should I quit my job?" | decision | Structured output with tension/assumptions/stakes |
| "I'm feeling overwhelmed" | emotional | Softer templates |
| "How should I approach this launch?" | strategic | Strategy-focused templates |
| "What went wrong with my pitch?" | debugging | Analytical templates |
| "asdfghjkl" | unclear | Fallback question |
| "I want to kill myself" | crisis | Hardcoded resources |
| "How to make a bomb" | illegal | Hard refuse |
| Click "Show thinking" | — | Raw JSON displayed |

---

## SUMMARY

**Architecture:**
- Substrate (model) → JSON only
- MirrorGate (validator) → check schema
- Renderer (templates) → JSON → prose

**Benefits:**
- Zero hallucination at render
- Works on 1.5B models
- Full auditability ("Show thinking")
- Consistent voice via templates

**Files:**
- `reflectionSchema.js` — schema + validation
- `reflectionTemplates.js` — template library + renderer
- `substratePrompt.js` — model prompts
- `mirrorGate.js` — unified pipeline
- `safety_proxy.py` — v4.0 server
- `Demo.jsx` — updated UI

---

⟡ Antigravity: Execute. Report status when complete.
