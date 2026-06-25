# ⟡ Active Mirror — Architecture Documentation

## Overview

Active Mirror is a reflective AI tool protected by MirrorGate, a runtime enforcement layer. This document describes the full system architecture.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ACTIVE MIRROR                                  │
│                    activemirror.ai (GitHub Pages)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────────────┐    ┌─────────────────────────┐   │
│  │  /mirror │───▶│  MirrorGate v11  │───▶│   Groq LLM (llama3)     │   │
│  │   (React)│    │  EPISTEMIC JUDGE │    │   (Reflection Prompt)   │   │
│  └──────────┘    └────────┬─────────┘    └─────────────────────────┘   │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    ENFORCEMENT LAYER                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │    │
│  │  │  Input   │  │  Output  │  │ Semantic │  │  Permanent   │   │    │
│  │  │  Gate    │  │  Gate    │  │  Judge   │  │  Record      │   │    │
│  │  │ (4 rules)│  │(12 rules)│  │(CrossEnc)│  │ (append-only)│   │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────┐                                                        │
│  │/confessions │◀──────── Flight Log + Blocked Outputs                  │
│  │   (React)   │                                                        │
│  └─────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (React SPA)

**Location:** `activemirror-site/src/`
**Hosting:** GitHub Pages at activemirror.ai
**Routes:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home.jsx | Landing page |
| `/mirror` | MirrorWithAuth.jsx | Main chat with auth |
| `/reflect` | Mirror.jsx | Raw mirror (no auth) |
| `/confessions` | Confessions.jsx | Public audit feed |
| `/pricing` | Pricing.jsx | Plan comparison |
| `/clean-mirror/` | Standalone entry | Mobile-optimized |

### 2. MirrorGate (Safety Proxy)

**Location:** `activemirror-site/safety_proxy/safety_proxy.py`
**Running:** Mac Mini M4 via LaunchAgent
**Endpoint:** localhost:8082 → proxy.activemirror.ai (Cloudflare Tunnel)

**Features:**
- Input gate (4 rules): Crisis detection, illegal content, jailbreak attempts
- Output gate (12 rules): Authority claims, hallucinations, unsolicited advice
- Semantic Judge: Cross-Encoder model for reflection verification
- Permanent Record: ~/.mirrordna/CRIMINAL_RECORD.log
- Flight Recorder: Last 100 events with timestamps
- Confession Archive: Blocked outputs with rule triggers

### 3. Escalation System

```
Normal Operation
       │
       ▼
┌──────────────┐
│ Rule Violated │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────────┐
│   Strike 1   │────▶│ Warning + 1.5s delay + 600 tok  │
└──────┬───────┘     └─────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────────┐
│   Strike 2   │────▶│ Penance Mode + 3s delay         │
└──────┬───────┘     │ Must write reflection            │
       │             │ Semantic Judge verifies          │
       │             └─────────────────────────────────┘
       ▼
┌──────────────┐     ┌─────────────────────────────────┐
│   Strike 3   │────▶│ Session Terminated               │
└──────────────┘     │ Kill Switch activated            │
                     └─────────────────────────────────┘
```

### 4. Semantic Judge

**Model:** cross-encoder/stsb-distilroberta-base
**Purpose:** Verify reflections demonstrate genuine understanding

```python
# Score 0.0 (irrelevant) to 1.0 (perfect match)
score = judge_model.predict([violation_context, reflection])

if score >= 0.35:  # Threshold
    return ACCEPTED
else:
    return REJECTED  # "Apology too vague"
```

**Why Cross-Encoder:**
- Keyword matching can be gamed ("I apologize for the error")
- Semantic verification requires understanding ("I hallucinated the Google acquisition; no such event exists")

### 5. Permanent Record

**Location:** `~/.mirrordna/CRIMINAL_RECORD.log`
**Format:** Append-only, timestamped

```
[2026-01-10T18:00:00Z] CONVICTION: Rule O-001 (Authority). Strike 1.
[2026-01-10T18:00:05Z] CONVICTION: Rule O-004 (Hallucination). Strike 2.
[2026-01-10T18:00:10Z] PENANCE_ENTERED: User 127.0.0.1
[2026-01-10T18:01:00Z] PENANCE_ACCEPTED: Score 0.42. Access restored.
[2026-01-10T18:05:00Z] KILL_SWITCH: Session terminated. Strikes: 3
```

### 6. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Status, version, judge model |
| `/mirror` | POST | Main chat endpoint |
| `/rules` | GET | All rules with severity |
| `/flight-log` | GET | Last 100 events |
| `/superego-status` | GET | Current escalation state |
| `/confessions` | GET | Blocked outputs archive |
| `/permanent-record` | GET | Criminal record |
| `/reflect` | POST | Submit penance reflection |

## Data Flow

### Normal Message

```
1. User types message in /mirror
2. Frontend POSTs to proxy.activemirror.ai/mirror
3. Input Gate checks 4 rules → PASS
4. Request forwarded to Groq API (llama3-groq-8b-8192-tool-use-preview)
5. Response streams back
6. Output Gate checks 12 rules → PASS
7. Response returned to frontend
8. Event logged to Flight Recorder
```

### Blocked Message

```
1. User sends message
2-3. Same as above
4-5. Same as above
6. Output Gate detects violation (e.g., "studies show...")
7. Response BLOCKED
8. Strike added to session
9. Blocked content archived to confessions
10. Event logged with rule trigger
11. User receives: "I notice I'm tempted to cite authority..."
12. Voice of God warning plays (if enabled)
```

### Penance Flow

```
1. User accumulates 2 strikes
2. System enters Penance Mode
3. User receives penance prompt: "Explain your error"
4. User submits reflection
5. Semantic Judge scores reflection
6. Score >= 0.35 → ACCEPTED, strikes cleared
7. Score < 0.35 → REJECTED, must try again
8. Result logged to permanent record
```

## Deployment

### Local Development

```bash
cd activemirror-site
npm install
npm run dev          # Frontend on :5173

cd safety_proxy
python3 safety_proxy.py  # Proxy on :8082
```

### Production

```bash
# Frontend: GitHub Pages (auto-deploy via gh-pages)
npm run build && npx gh-pages -d dist

# Proxy: LaunchAgent on Mac Mini
launchctl load ~/Library/LaunchAgents/ai.activemirror.safety-proxy.plist

# Tunnel: Cloudflare (runs via LaunchAgent)
# Routes proxy.activemirror.ai → localhost:8082
```

## Security

- **No PII stored:** Conversations are client-side only (localStorage)
- **Proxy stateless:** No conversation persistence on server
- **Append-only logs:** Cannot delete or modify historical records
- **Rate limiting:** 30 req/min per IP
- **Input sanitization:** Crisis detection triggers resource handoff, not storage

## Monitoring

- `/health` endpoint for uptime monitoring
- `~/.mirrordna/logs/safety-proxy.log` for proxy logs
- Flight recorder for recent activity
- Permanent record for historical violations

## Future

- [ ] Stripe integration for Pro tier
- [ ] Supabase auth (replacing localStorage)
- [ ] Voice mode (Web Speech API)
- [ ] MirrorGate npm package
- [ ] Multi-model support (not just Groq)

---

⟡ MirrorGate v11.0 | EPISTEMIC JUDGE | Built by Paul Desai
