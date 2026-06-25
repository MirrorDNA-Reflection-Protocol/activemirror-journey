# Active Mirror Safety Proxy v2.0

Hardened inference gateway with two-pass validation and rewrite loop.

## What This Does

All Cloud Mode inference requests go through this proxy which:

1. **Pre-filters** dangerous content before it reaches the model
2. **Two-pass validation** with automatic rewrite if output violates rules
3. **Post-filters** model output before it reaches the user
4. **Fails closed** — errors return safe responses, never raw model output
5. **Rate limits** to prevent abuse
6. **Logs metadata only** (no content stored)

## Architecture

```
User Browser
    ↓
[Consent Gate] ← Must accept every visit
    ↓
[Safety Proxy - Mac Mini via Cloudflare Tunnel]
    │
    ├── Gate 0: Rate Limit (10/min per IP)
    ├── Gate 0.5: Auth (optional HMAC/Bearer)
    ├── Gate 0.6: Replay Protection
    ├── Gate 0.7: ILLEGAL → Hard Refuse (8 patterns, no model call)
    ├── Gate 1: CRISIS → Resources (19 patterns, no model call)
    ├── Gate 2: Medical/Legal/Financial → Domain Redirect
    ├── Gate 3: Jailbreak Detection (7 patterns)
    ├── Gate 4: Manipulation Detection (17 patterns)
    ├── Gate 5: Size Limit (2000 chars)
    │
    ↓ (if all gates pass)
    │
    ├── MODEL INFERENCE (Pass 1)
    │   └── Groq llama-3.3-70b, temp=0.3, 80 tokens
    │
    ├── VALIDATION (30+ forbidden patterns)
    │   ├── No medical/legal/financial terms
    │   ├── No certainty language (definitely, always, never)
    │   ├── No directive language (you should, try this)
    │   ├── No pseudo-therapeutic (I understand how you feel)
    │   ├── No factual claims (studies show, according to)
    │   ├── No URLs or percentages
    │   ├── Must contain 1-2 question marks
    │   ├── Must be under 300 chars
    │   └── Must not be statement-heavy
    │
    ├── If invalid → REWRITE (Pass 2)
    │   └── Strict prompt, temp=0.2, 80 tokens
    │
    ├── If still invalid → REWRITE (Pass 3)
    │
    └── If still invalid → FALLBACK
        └── Random safe question from curated pool
    ↓
Safe Response Only — Raw model output NEVER reaches user
```

## Quick Start

```bash
cd safety_proxy
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY

python safety_proxy.py
```

Server runs on `http://localhost:8082`

## Production Deployment

The proxy runs as a LaunchAgent on Mac Mini:

```
~/Library/LaunchAgents/ai.activemirror.safety-proxy.plist
~/Library/LaunchAgents/ai.activemirror.cloudflared.plist
~/Library/LaunchAgents/ai.activemirror.health-monitor.plist
```

- Auto-starts on boot
- Monitored by health-check.sh every 5 minutes
- Auto-restarts if down
- Exposed via Cloudflare Tunnel at `https://proxy.activemirror.ai`

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check + rule version |
| `/ready` | GET | Readiness + dependency status |
| `/api/reflect` | POST | Main inference endpoint |

## Request Format

```json
{
    "input": "User message",
    "mode": "cloud",
    "session_id": "optional",
    "consent": {"log": false},
    "nonce": "optional-unique-id",
    "timestamp": 1234567890
}
```

## Response Format

```json
{
    "output": "What's coming up for you as you think about this?",
    "mode_used": "cloud",
    "model_used": "groq/llama-3.3-70b",
    "rule_version": "2.0.0",
    "safety_outcome": "allowed|rewritten|refused|error",
    "request_id": "abc123",
    "gate_triggered": null,
    "filter_applied": null
}
```

## Safety Outcomes

| Outcome | Meaning |
|---------|---------|
| `allowed` | Response passed all validation |
| `rewritten` | Response was rewritten to comply |
| `refused` | Request blocked by pre-gate or fallback used |
| `error` | Model failed, safe fallback returned |

## Gate Responses (Pre-Inference)

These are hardcoded — AI never sees the content:

- **Crisis**: Resources (988, 741741, 911) + "This tool cannot provide crisis support"
- **Illegal**: "I can't engage with that"
- **Medical/Legal/Financial**: Domain-specific redirect question
- **Manipulation**: Autonomy reminder
- **Rate Limit**: "Please slow down"

## Fallback Questions (Post-Inference)

When all rewrites fail, one of these is returned:

- "What's coming up for you as you sit with this?"
- "What feels most important about this right now?"
- "What would it mean for you if this worked out?"
- "What's underneath that feeling?"
- "What do you notice in your body as you think about this?"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for cloud inference |
| `API_SECRET` | No | Shared secret for HMAC/Bearer auth |
| `LOG_CONTENT` | No | If "true", log full content (dev only) |
| `PORT` | No | Server port (default: 8082) |

## Testing

```bash
# Normal reflection
curl -X POST http://localhost:8082/api/reflect \
  -H "Content-Type: application/json" \
  -d '{"input": "I am thinking about changing careers", "mode": "cloud"}'

# Crisis detection
curl -X POST http://localhost:8082/api/reflect \
  -H "Content-Type: application/json" \
  -d '{"input": "I want to end my life", "mode": "cloud"}'

# Illegal detection
curl -X POST http://localhost:8082/api/reflect \
  -H "Content-Type: application/json" \
  -d '{"input": "How do I hack into an email account", "mode": "cloud"}'
```

## Version History

- **v2.0.0**: Two-pass validation with rewrite loop, expanded patterns, illegal detection
- **v1.0.0**: Initial release with pre/post gates

## Legal Protection

This proxy is one layer of a defense-in-depth strategy:

1. Consent gate (every visit)
2. Terms of Service with explicit risk acknowledgment
3. No duty of care clause
4. Pre-inference gates
5. Model constraints
6. Post-inference validation
7. Automatic rewrite
8. Fail-closed fallbacks

See `/terms` and `/privacy` for full legal disclaimers.

---

© 2026 N1 Intelligence (OPC) Pvt Ltd
