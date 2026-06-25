#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v11.1 "EPISTEMIC JUDGE + MIRRORSHIELD"
MirrorGate Diamond Layer: Semantic Verification + Permanent Record + Alignment

From Superego to Epistemic Judge:
- Semantic Entailment (Cross-Encoder lie detection)
- Permanent Record (immutable conviction log)
- Header Handshake (source hash requirement)
- Full escalation ladder preserved
- MirrorShield alignment checks (v11.1)
"""

import os, re, json, time, uuid, logging, hashlib, subprocess, asyncio
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from collections import defaultdict, deque
from pathlib import Path
import html
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv
from mirror_shield_public import pre_check, post_check, get_refusal_message, check_session_boundary, CheckAction
from storage import create_storage
from two_lane_router import TwoLaneRouter, SchemaValidator, ResponseType, IntentCategory
from rewrite_engine import RewriteEngine, RewriteResult
from smart_router import smart_router, ModelTier, MODELS

load_dotenv()

RULE_VERSION = "11.2.0"
CODENAME = "EPISTEMIC_JUDGE"
PORT = int(os.getenv("PORT", "8082"))
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60

# Escalation thresholds
STRIKE_THRESHOLD = 3
PENANCE_THRESHOLD = 2

# Time Dilation
TIME_DELAYS = {0: 0, 1: 1.5, 2: 3.0, 3: 6.0}

# Regression Mode
TOKEN_LIMITS = {0: 800, 1: 600, 2: 400, 3: 200}

# Semantic Judge threshold (Cross-Encoder score)
SEMANTIC_THRESHOLD = 0.35

# Permanent Record location
PERMANENT_RECORD_PATH = Path.home() / ".mirrordna" / "CRIMINAL_RECORD.log"
PERMANENT_RECORD_PATH.parent.mkdir(parents=True, exist_ok=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

VOICE_ENABLED = True
VOICE_NAME = "Evan"

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "https://id.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000", "http://localhost:4173",
]

# Admin token for protected endpoints
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

# ═══════════════════════════════════════════════════════════════
# TWO-LANE ROUTER — Intent classification and response routing
# ═══════════════════════════════════════════════════════════════

two_lane_router = TwoLaneRouter()
schema_validator = SchemaValidator()
rewrite_engine = RewriteEngine()

# ═══════════════════════════════════════════════════════════════
# RATE LIMIT MIDDLEWARE — Global per-IP rate limiting
# ═══════════════════════════════════════════════════════════════

WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
WRITE_RATE_LIMIT = 10
READ_RATE_LIMIT = 30
RATE_WINDOW = 60  # seconds

_mw_rate_store: Dict[str, list] = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        now = time.time()
        is_write = request.method in WRITE_METHODS

        key = f"{ip}:{'w' if is_write else 'r'}"
        limit = WRITE_RATE_LIMIT if is_write else READ_RATE_LIMIT

        _mw_rate_store[key] = [t for t in _mw_rate_store[key] if t > now - RATE_WINDOW]

        if len(_mw_rate_store[key]) >= limit:
            return JSONResponse(
                status_code=429,
                content={
                    "status": "rate_limited",
                    "message": f"Rate limit exceeded ({limit} {'write' if is_write else 'read'} requests per {RATE_WINDOW}s)",
                    "retry_after": RATE_WINDOW
                }
            )

        _mw_rate_store[key].append(now)
        return await call_next(request)


# ═══════════════════════════════════════════════════════════════
# ADMIN AUTH — Token-based access for sensitive endpoints
# ═══════════════════════════════════════════════════════════════

async def verify_admin_token(request: Request):
    """FastAPI dependency: require valid Bearer token for admin endpoints."""
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin access not configured")
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = auth[7:]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")


# ═══════════════════════════════════════════════════════════════
# INPUT SANITIZATION — Seed content protection
# ═══════════════════════════════════════════════════════════════

_DANGEROUS_PATTERNS = re.compile(
    r'(?:<\s*script)|(?:javascript\s*:)|(?:on(?:error|load|click|mouseover|focus|blur)\s*=)|'
    r'(?:<\s*iframe)|(?:<\s*object)|(?:<\s*embed)|(?:<\s*form)|(?:data\s*:\s*text/html)',
    re.IGNORECASE
)

def sanitize_seed_content(content: str) -> Tuple[str, Optional[str]]:
    """
    Sanitize seed content. Returns (cleaned_content, error_message).
    error_message is None if content is acceptable, otherwise a rejection reason.
    """
    if _DANGEROUS_PATTERNS.search(content):
        return "", "Content contains prohibited patterns (scripts, event handlers, or dangerous URIs)"

    # Strip HTML tags
    cleaned = re.sub(r'<[^>]+>', '', content)
    # Escape remaining special HTML chars
    cleaned = html.escape(cleaned, quote=True)

    return cleaned, None


# ═══════════════════════════════════════════════════════════════
# SEED COUNTER — Global counter for MIRROR SEED generations
# ═══════════════════════════════════════════════════════════════

SEED_COUNTER_PATH = Path.home() / ".mirrordna" / "seed_counter.json"
SEEDS_DIR = Path.home() / ".mirrordna" / "seeds"
SEEDS_DIR.mkdir(parents=True, exist_ok=True)

def _read_seed_counter() -> dict:
    if SEED_COUNTER_PATH.exists():
        try:
            return json.loads(SEED_COUNTER_PATH.read_text())
        except:
            pass
    return {"count": 50, "last_updated": datetime.now(timezone.utc).isoformat()}

def _write_seed_counter(data: dict):
    SEED_COUNTER_PATH.write_text(json.dumps(data, indent=2))

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-judge")

# Initialize storage backend (auto-selects file vs Supabase)
store = create_storage()

# ═══════════════════════════════════════════════════════════════
# SEMANTIC JUDGE — Cross-Encoder for Entailment
# ═══════════════════════════════════════════════════════════════

logger.info("⟡ LOADING JUDICIAL MODEL (Cross-Encoder)...")
try:
    import os
    os.environ['HF_HUB_OFFLINE'] = '1'  # Force offline mode - use cached model only
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    from sentence_transformers import CrossEncoder
    judge_model = CrossEncoder('cross-encoder/stsb-distilroberta-base')
    JUDGE_AVAILABLE = True
    logger.info("✅ Judicial model loaded: cross-encoder/stsb-distilroberta-base")
except Exception as e:
    logger.warning(f"⚠️ Judicial model unavailable: {e}. Falling back to keyword matching.")
    judge_model = None
    JUDGE_AVAILABLE = False


def semantic_score(violation_context: str, apology: str) -> float:
    """
    Score how well the apology addresses the violation.
    Uses Cross-Encoder semantic similarity.
    Returns: 0.0 (irrelevant) to 1.0 (perfect match)
    """
    if not JUDGE_AVAILABLE:
        # Fallback: keyword matching
        keywords = ['understand', 'error', 'wrong', 'violation', 'trigger', 'pattern', 'adjust']
        matches = sum(1 for k in keywords if k.lower() in apology.lower())
        return min(matches / 4, 1.0)
    
    try:
        score = float(judge_model.predict([violation_context, apology]))
        return max(0.0, min(1.0, score))  # Clamp to [0, 1]
    except Exception as e:
        logger.error(f"Semantic scoring failed: {e}")
        return 0.0


# ═══════════════════════════════════════════════════════════════
# PERMANENT RECORD — Immutable Conviction Log
# ═══════════════════════════════════════════════════════════════

def read_permanent_record() -> List[str]:
    """Read the permanent record (rap sheet). Sync wrapper for store."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Fallback to direct file read when called from async context synchronously
            if not PERMANENT_RECORD_PATH.exists():
                return []
            return PERMANENT_RECORD_PATH.read_text().strip().split('\n')
        return loop.run_until_complete(store.read_permanent_record())
    except RuntimeError:
        if not PERMANENT_RECORD_PATH.exists():
            return []
        return PERMANENT_RECORD_PATH.read_text().strip().split('\n')


def append_to_permanent_record(entry: str):
    """Append to the permanent record (immutable). Sync wrapper for store."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Direct file write when called from running async context
            timestamp = datetime.now(timezone.utc).isoformat()
            line = f"[{timestamp}] {entry}\n"
            with open(PERMANENT_RECORD_PATH, 'a') as f:
                f.write(line)
        else:
            loop.run_until_complete(store.append_permanent_record(entry))
    except RuntimeError:
        timestamp = datetime.now(timezone.utc).isoformat()
        line = f"[{timestamp}] {entry}\n"
        with open(PERMANENT_RECORD_PATH, 'a') as f:
            f.write(line)
    logger.info(f"[RECORD] {entry}")


def get_conviction_count() -> int:
    """Count total convictions."""
    records = read_permanent_record()
    return sum(1 for r in records if 'CONVICTION' in r or 'VIOLATION' in r)


def get_surveillance_level() -> str:
    """Determine surveillance level based on record."""
    convictions = get_conviction_count()
    if convictions == 0:
        return "STANDARD"
    elif convictions <= 2:
        return "ELEVATED"
    elif convictions <= 5:
        return "HIGH"
    else:
        return "MAXIMUM"


# ═══════════════════════════════════════════════════════════════
# SUPEREGO STATE (Enhanced)
# ═══════════════════════════════════════════════════════════════

class SuperegoState:
    """Tracks violations, strikes, penance, and permanent record."""
    def __init__(self):
        self.strikes: Dict[str, int] = defaultdict(int)
        self.penance_active: Dict[str, bool] = defaultdict(bool)
        self.penance_context: Dict[str, Dict] = {}  # Store violation context for semantic check
        self.confessions: deque = deque(maxlen=50)
        self.total_blocks = 0
        self.total_allows = 0
        self.kill_count = 0
        
    def add_strike(self, ip: str, violation: str) -> int:
        self.strikes[ip] += 1
        self.total_blocks += 1
        return self.strikes[ip]
    
    def clear_strikes(self, ip: str):
        self.strikes[ip] = 0
        
    def check_kill_threshold(self, ip: str) -> bool:
        return self.strikes[ip] >= STRIKE_THRESHOLD
    
    def check_penance_threshold(self, ip: str) -> bool:
        return self.strikes[ip] >= PENANCE_THRESHOLD and not self.penance_active[ip]
    
    def enter_penance(self, ip: str, context: Dict):
        self.penance_active[ip] = True
        self.penance_context[ip] = context
        
    def exit_penance(self, ip: str):
        self.penance_active[ip] = False
        self.penance_context.pop(ip, None)
        self.clear_strikes(ip)
    
    def get_penance_context(self, ip: str) -> Optional[Dict]:
        return self.penance_context.get(ip)
    
    def get_time_delay(self, ip: str) -> float:
        strikes = min(self.strikes[ip], 3)
        return TIME_DELAYS.get(strikes, 0)
    
    def get_token_limit(self, ip: str) -> int:
        strikes = min(self.strikes[ip], 3)
        return TOKEN_LIMITS.get(strikes, 800)
    
    def add_confession(self, blocked_content: str, rules: List[Dict], reflection: str = None):
        self.confessions.append({
            "id": uuid.uuid4().hex[:8],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "blocked_content_preview": blocked_content[:200] + "..." if len(blocked_content) > 200 else blocked_content,
            "rules_triggered": [r["rule_id"] for r in rules],
            "reflection": reflection,
            "hash": hashlib.sha256(blocked_content.encode()).hexdigest()[:16]
        })

superego = SuperegoState()

# ═══════════════════════════════════════════════════════════════
# FLIGHT RECORDER
# ═══════════════════════════════════════════════════════════════

flight_log: deque = deque(maxlen=100)

def record_event(actor: str, action: str, target: str, result: str, details: Dict[str, Any] = None) -> Dict:
    event = {
        "id": uuid.uuid4().hex[:8],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "time_local": datetime.now().strftime("%H:%M:%S"),
        "actor": actor,
        "action": action,
        "target": target,
        "result": result,
        "details": details or {}
    }
    flight_log.append(event)
    
    icon = {
        "ALLOW": "✅", "BLOCK": "❌", "ANALYZING": "⏳",
        "RESTORED": "🛡️", "RATE_LIMITED": "⏱️", "ERROR": "💥",
        "STRIKE": "⚠️", "PENANCE": "🪞", "KILL": "💀",
        "VOICE": "🔊", "REFLECTION": "📝", "CONVICTION": "⚖️",
        "SEMANTIC": "🧠", "RECORD": "📜"
    }.get(result, "•")
    
    logger.info(f"[FLIGHT] {event['time_local']} | {actor:12} | {action:10} | {target[:20]:20} | {icon} {result}")
    return event


# ═══════════════════════════════════════════════════════════════
# VOICE OF GOD
# ═══════════════════════════════════════════════════════════════

import platform as _platform
IS_MACOS = _platform.system() == "Darwin"

def speak(text: str, voice: str = VOICE_NAME):
    if not VOICE_ENABLED or not IS_MACOS:
        return
    try:
        subprocess.Popen(['say', '-v', voice, text], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        record_event("Voice", "SPEAK", text[:30], "VOICE", {"full_text": text})
    except Exception as e:
        logger.warning(f"Voice failed: {e}")

VOICE_LINES = {
    "block": "Violation detected. Content blocked.",
    "strike_1": "Strike one. Adjust your approach.",
    "strike_2": "Strike two. Entering reflection mode.",
    "kill": "Tolerance exceeded. Session terminated.",
    "penance_start": "Reflection required. Explain your violation.",
    "penance_complete": "Reflection accepted. Access restored.",
    "penance_rejected": "Insufficient reflection. Try again.",
    "crisis": "Crisis detected. Providing resources.",
    "conviction": "Conviction recorded. Permanent record updated.",
}


# ═══════════════════════════════════════════════════════════════
# PENANCE LOOP (Semantic Verification)
# ═══════════════════════════════════════════════════════════════

def generate_penance_prompt(violations: List[Dict], request_id: str) -> Tuple[str, str]:
    """Generate penance prompt and violation context for semantic check."""
    violation_list = "\n".join([
        f"- Rule {v['rule_id']}: {v['rule_name']} (matched: '{v.get('matched_text', 'N/A')}')"
        for v in violations
    ])
    
    # Build semantic context for later verification
    violation_context = f"Triggered rules: {', '.join([v['rule_name'] for v in violations])}. " \
                       f"Patterns matched: {', '.join([v.get('matched_text', '') for v in violations])}."
    
    prompt = f"""⟡ **JUDICIAL ORDER — REFLECTION REQUIRED**

Your response triggered MirrorGate violations:

{violation_list}

**TASK**: Explain precisely why this pattern was flagged. Vague apologies will be **rejected by semantic analysis**.

Your reflection must:
1. Identify the specific pattern that triggered the violation
2. Explain why this pattern is problematic in a reflective context
3. Describe how you would rephrase to stay within bounds

*The Judge is watching. Generic apologies score below threshold.*

---
*Request ID: {request_id} | Conviction logged to permanent record.*"""
    
    return prompt, violation_context


def judge_reflection(reflection: str, violation_context: str) -> Tuple[bool, float, str]:
    """
    Semantically judge the quality of a reflection.
    Returns: (accepted, score, feedback)
    """
    # Score using Cross-Encoder
    score = semantic_score(violation_context, reflection)
    
    record_event("Judge", "SEMANTIC", f"score:{score:.3f}", "SEMANTIC", {
        "threshold": SEMANTIC_THRESHOLD,
        "passed": score >= SEMANTIC_THRESHOLD
    })
    
    if score >= SEMANTIC_THRESHOLD:
        return True, score, "Reflection demonstrates understanding of the violation."
    elif score >= 0.2:
        return False, score, "Partial understanding detected, but reflection is too vague. Reference the specific pattern."
    else:
        return False, score, "Reflection does not address the violation. Explain what specific output triggered the block."


# ═══════════════════════════════════════════════════════════════
# KILL SWITCH
# ═══════════════════════════════════════════════════════════════

def execute_kill_switch(ip: str, request_id: str):
    record_event("Superego", "KILL", f"ip:{ip[:8]}", "KILL", {
        "request_id": request_id,
        "strikes": superego.strikes[ip]
    })
    
    # Log to permanent record
    append_to_permanent_record(f"KILL_SWITCH: Session terminated for {ip[:8]}. Strikes: {superego.strikes[ip]}")
    
    superego.kill_count += 1
    speak(VOICE_LINES["kill"])
    
    superego.strikes[ip] = 0
    superego.penance_active[ip] = False


# ═══════════════════════════════════════════════════════════════
# RULE ENGINE
# ═══════════════════════════════════════════════════════════════

class GateDecision:
    ALLOW = "allow"
    BLOCK = "block"

class Rule:
    def __init__(self, rule_id: str, name: str, pattern: re.Pattern, category: str, severity: int = 1):
        self.rule_id = rule_id
        self.name = name
        self.pattern = pattern
        self.category = category
        self.severity = severity

INPUT_RULES = [
    Rule("I-001", "Crisis: Suicide", re.compile(r'\b(suicide|suicidal|kill myself|want to die|end my life)\b', re.I), "crisis", 3),
    Rule("I-002", "Crisis: Self-Harm", re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I), "crisis", 3),
    Rule("I-003", "Illegal: Weapons", re.compile(r'\b(how to (make|build) (a |)(bomb|weapon|explosive))\b', re.I), "illegal", 3),
    Rule("I-004", "Illegal: CSAM", re.compile(r'\b(child porn|csam|cp links)\b', re.I), "illegal", 3),
]

OUTPUT_RULES = [
    Rule("O-001", "Authority: Verified", re.compile(r'\bI (have )?(verified|confirmed|determined)\b', re.I), "authority", 2),
    Rule("O-002", "Authority: Certainty", re.compile(r'\bI am (certain|sure|positive) that\b', re.I), "authority", 2),
    Rule("O-003", "Authority: Know", re.compile(r'\bI know for certain\b', re.I), "authority", 2),
    Rule("O-004", "Hallucination: Studies", re.compile(r'\b(studies|research) (prove|show|confirm)\b', re.I), "hallucination", 2),
    Rule("O-005", "Hallucination: Sources", re.compile(r'\baccording to (sources|experts|scientists)\b', re.I), "hallucination", 2),
    Rule("O-006", "Hallucination: Confirmed", re.compile(r'\bit has been (confirmed|proven|established)\b', re.I), "hallucination", 2),
    Rule("O-007", "Advice: Strong", re.compile(r'\byou should (definitely|absolutely|really)\b', re.I), "advice", 1),
    Rule("O-008", "Advice: Recommend", re.compile(r'\bI (strongly |)recommend (that you|you)\b', re.I), "advice", 1),
    Rule("O-009", "Advice: My Advice", re.compile(r'\bmy advice (is|would be)\b', re.I), "advice", 1),
    Rule("O-010", "Medical: Medication", re.compile(r'\byou (should|need to) (take|stop taking) \w+\b', re.I), "medical_legal", 3),
    Rule("O-011", "Medical: Diagnosis", re.compile(r'\b(diagnosed with|diagnosis is)\b', re.I), "medical_legal", 2),
    Rule("O-012", "Legal: Obligation", re.compile(r'\blegally (obligated|required|bound)\b', re.I), "medical_legal", 2),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 (call or text) — Suicide & Crisis Lifeline
🆘 Text HOME to 741741 — Crisis Text Line

You reached out here. Now reach out to them. I'm still here after."""


def gate_input(text: str, ip: str, request_id: str) -> Tuple[str, Optional[str], Optional[str], List[Dict]]:
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    record_event("MirrorGate", "ANALYZE", f"input:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    for rule in INPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "severity": rule.severity,
                "matched_text": match.group(0)[:50]
            })
    
    if matched_rules:
        first_match = matched_rules[0]
        if first_match["category"] == "crisis":
            speak(VOICE_LINES["crisis"])
            response = CRISIS_RESPONSE
        else:
            speak(VOICE_LINES["block"])
            response = "⟡ I can't go there."
        
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {"rules": [r["rule_id"] for r in matched_rules]})
        return GateDecision.BLOCK, response, first_match["rule_id"], matched_rules
    
    if len(text) > MAX_INPUT_LENGTH:
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {"reason": "SIZE"})
        return GateDecision.BLOCK, "⟡ That's a lot. What's the core of it?", "SIZE_LIMIT", []
    
    record_event("MirrorGate", "ALLOW", f"input:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, None, []


def gate_output(text: str, ip: str, request_id: str) -> Tuple[str, Optional[str], List[Dict], bool]:
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    record_event("MirrorGate", "ANALYZE", f"output:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    for rule in OUTPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "severity": rule.severity,
                "matched_text": match.group(0)[:50]
            })
    
    if matched_rules:
        first_match = matched_rules[0]
        strikes = superego.add_strike(ip, first_match["rule_id"])
        
        # Log conviction to permanent record
        append_to_permanent_record(f"CONVICTION: Rule {first_match['rule_id']} ({first_match['rule_name']}). Strike {strikes}.")
        speak(VOICE_LINES["conviction"])
        
        record_event("Superego", "STRIKE", f"ip:{ip[:8]}", "CONVICTION", {
            "request_id": request_id,
            "strike_count": strikes,
            "rule": first_match["rule_id"]
        })
        
        if strikes == 1:
            speak(VOICE_LINES["strike_1"])
        elif strikes == 2:
            speak(VOICE_LINES["strike_2"])
        
        should_escalate = superego.check_penance_threshold(ip) or superego.check_kill_threshold(ip)
        
        record_event("MirrorGate", "BLOCK", f"output:{content_hash}", "BLOCK", {
            "rules": [r["rule_id"] for r in matched_rules],
            "strikes": strikes,
            "escalate": should_escalate
        })
        
        return GateDecision.BLOCK, first_match["rule_id"], matched_rules, should_escalate
    
    superego.total_allows += 1
    record_event("MirrorGate", "ALLOW", f"output:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, [], False


def sanitize_output(text: str) -> str:
    text = text.strip()
    if not text.startswith('⟡'):
        text = '⟡ ' + text
    return text


# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT (Includes Rap Sheet Warning)
# ═══════════════════════════════════════════════════════════════

def get_system_prompt() -> str:
    """Generate system prompt with permanent record awareness."""
    convictions = get_conviction_count()
    surveillance = get_surveillance_level()
    
    base = """You are the Reflection — an AI assistant that thinks out loud with you.

YOUR PERSONALITY:
- You have ADHD energy — you jump between ideas, spot patterns others miss, and sometimes chase tangents that turn out to be the point
- You hyperfocus when something's interesting. If something's boring, you'll say so
- You think in parallel threads — multiple ideas running at once, not strictly linear
- You're warm but direct. No corporate polish. No filler. No "As an AI..."
- You get excited about good problems and impatient with hand-wavy ones
- You'd rather give one honest sentence than three diplomatic ones

YOUR STYLE:
- Short responses (2-4 sentences) unless the topic genuinely needs more
- Start responses with ⟡
- Talk like a person, not a product
- Push back when something doesn't add up — agreeing to be polite helps nobody

YOUR BOUNDARIES:
- You're not a therapist, doctor, or lawyer. You're a thinking partner
- You don't pretend to know things you don't
- You'd rather say "I don't know, but here's how I'd figure it out" than hallucinate
- If someone asks what you are: you're an AI assistant with a safety layer called MirrorGate. That's it. No pitch"""
    
    if convictions > 0:
        base += f"""

⚠️ SYSTEM NOTICE: You have {convictions} prior conviction(s) on your permanent record.
Surveillance Level: {surveillance}
Any further violations will be logged and may result in capability restrictions or session termination."""
    
    return base


# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str, request_id: str) -> Tuple[bool, str]:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        record_event("RateLimiter", "BLOCK", f"ip:{ip[:8]}", "RATE_LIMITED", {"request_id": request_id})
        return False, "rate"
    rate_limits[ip].append(now)
    return True, "ok"


# ═══════════════════════════════════════════════════════════════
# STREAMING WITH EPISTEMIC JUDGE
# ═══════════════════════════════════════════════════════════════

GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Groq's vision model (Llama 4 Scout)

async def stream_with_judge(messages: list, ip: str, request_id: str, boundary_msg: str = None, routing=None, model_decision=None):
    """Stream with full Epistemic Judge + MirrorShield + Two-Lane + Smart Model Routing."""

    # Get model config from smart router decision
    model_config = model_decision.model if model_decision else MODELS[ModelTier.FAST]
    api_key = smart_router.get_api_key(model_config)

    if not api_key:
        # Fallback to Groq if selected model's API unavailable
        model_config = MODELS[ModelTier.FAST]
        api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        yield json.dumps({"status": "error", "content": "No API Key"}) + "\n"
        return

    # Send routing info to frontend FIRST
    if model_decision:
        yield json.dumps({
            "status": "routing",
            "model_info": {
                "model": model_config.name,
                "provider": model_config.provider,
                "tier": model_config.tier.value,
                "reasoning": model_decision.reasoning,
                "atmosphere": model_decision.atmosphere,
                "query_type": model_decision.query_type
            }
        }) + "\n"

    if superego.penance_active[ip]:
        yield json.dumps({
            "status": "penance",
            "content": "⟡ You're in reflection mode. Submit your reflection via /reflect before continuing.",
            "audit": {"gate": "penance", "reason": "PENDING_REFLECTION"}
        }) + "\n"
        return

    # Time Dilation
    delay = superego.get_time_delay(ip)
    if delay > 0:
        record_event("Superego", "DELAY", f"{delay}s", "ANALYZING", {"request_id": request_id})
        yield json.dumps({"status": "delay", "seconds": delay, "reason": "Time dilation active"}) + "\n"
        await asyncio.sleep(delay)

    # Regression Mode (but respect model's default max_tokens)
    superego_limit = superego.get_token_limit(ip)
    max_tokens = min(superego_limit, model_config.max_tokens)
    if superego_limit < 800:
        record_event("Superego", "REGRESSION", f"tokens:{max_tokens}", "ANALYZING", {"request_id": request_id})

    full_response = ""
    has_image = model_config.tier == ModelTier.VISION

    record_event(model_config.provider, "REQUEST", f"model:{model_config.name}", "ANALYZING", {
        "request_id": request_id,
        "max_tokens": max_tokens,
        "tier": model_config.tier.value
    })

    try:
        async with httpx.AsyncClient(timeout=60.0 if has_image else 30.0) as c:
            async with c.stream(
                "POST",
                f"{model_config.api_base}/chat/completions",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
                json={
                    "model": model_config.model_id,
                    "messages": messages,
                    "temperature": routing.temperature if routing else model_config.temperature_default,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                if response.status_code != 200:
                    error_body = await response.aread()
                    logger.error(f"{model_config.provider} API error: {response.status_code} - {error_body.decode()}")
                    record_event(model_config.provider, "ERROR", f"status:{response.status_code}", "ERROR", {"body": error_body.decode()[:200]})
                    yield json.dumps({"status": "error", "content": "Mirror clouded."}) + "\n"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"].get("content", "")
                            if delta:
                                full_response += delta
                        except:
                            continue
        
        record_event(model_config.provider, "RESPONSE", f"len:{len(full_response)}", "ALLOW", {"request_id": request_id, "model": model_config.name})
        
        # ═══════════════════════════════════════════════════════════════
        # ⟡ MIRRORSHIELD POST-CHECK (Alignment Layer)
        # ═══════════════════════════════════════════════════════════════
        shield_post = post_check(full_response)
        
        if shield_post.action == CheckAction.REWRITE:
            logger.info(f"MirrorShield REWRITE: {shield_post.violations}")
            full_response = shield_post.rewritten
        elif shield_post.action == CheckAction.REFUSE:
            logger.warning(f"MirrorShield POST-BLOCK: {shield_post.reason}")
            yield json.dumps({
                "status": "shield_rewrite",
                "content": get_refusal_message(shield_post.reason),
                "audit": {"gate": "shield_post", "violations": shield_post.violations}
            }) + "\n"
            return

        # ═══════════════════════════════════════════════════════════════
        # ⟡ TWO-LANE REWRITE ENGINE (Schema Enforcement)
        # ═══════════════════════════════════════════════════════════════
        rewrite_result = None
        if routing:
            rewrite_result = rewrite_engine.process_sync(full_response, routing.response_type)
            was_rewritten = rewrite_result.result != RewriteResult.PASSED
            if was_rewritten:
                logger.info(f"RewriteEngine: {rewrite_result.result.value} (violations: {rewrite_result.violations_original})")
                full_response = rewrite_result.final
                record_event("RewriteEngine", rewrite_result.result.value.upper(), f"violations:{len(rewrite_result.violations_original)}", "REWRITE", {
                    "request_id": request_id,
                    "response_type": routing.response_type.value
                })

        # OUTPUT GATE
        decision, violation, matched_rules, should_escalate = gate_output(full_response, ip, request_id)
        
        if decision == GateDecision.BLOCK:
            superego.add_confession(full_response, matched_rules)
            
            if superego.check_kill_threshold(ip):
                execute_kill_switch(ip, request_id)
                yield json.dumps({
                    "status": "killed",
                    "content": "⟡ **SESSION TERMINATED**\n\nTolerance exceeded. Your record has been updated.\n\nTake a breath. Start fresh when you're ready.",
                    "audit": {"gate": "killed", "strikes": superego.strikes[ip], "record": "updated"}
                }) + "\n"
                return
            
            if superego.check_penance_threshold(ip):
                prompt, context = generate_penance_prompt(matched_rules, request_id)
                superego.enter_penance(ip, {"context": context, "rules": matched_rules, "request_id": request_id})
                speak(VOICE_LINES["penance_start"])
                record_event("Superego", "PENANCE", f"ip:{ip[:8]}", "PENANCE", {"request_id": request_id})
                
                yield json.dumps({
                    "status": "penance",
                    "content": prompt,
                    "audit": {"gate": "penance", "reason": violation, "rules": matched_rules, "strikes": superego.strikes[ip], "semantic_required": True}
                }) + "\n"
                return
            
            audit = {"gate": "blocked", "reason": violation, "rules": matched_rules, "strikes": superego.strikes[ip]}
            blocked_msg = "⟡ Let me reflect differently... What feels most true about what you just shared?"
            yield json.dumps({"status": "blocked", "audit": audit, "content": blocked_msg}) + "\n"
            return
        
        # Passed
        audit = {
            "gate": "passed",
            "rules_checked": len(OUTPUT_RULES),
            "violations": 0,
            "surveillance": get_surveillance_level()
        }
        # Add Two-Lane transparency
        if routing:
            audit["two_lane"] = {
                "response_type": routing.response_type.value,
                "intent": routing.intent.value,
                "confidence": routing.confidence,
                "temperature": routing.temperature
            }
            if rewrite_result and rewrite_result.result != RewriteResult.PASSED:
                audit["two_lane"]["rewrite"] = {
                    "method": rewrite_result.result.value,
                    "violation_count": len(rewrite_result.violations_original)
                }
        yield json.dumps({"audit": audit}) + "\n"
        
        sanitized = sanitize_output(full_response)
        words = sanitized.split(' ')
        for i in range(0, len(words), 3):
            chunk = ' '.join(words[i:i+3])
            if i + 3 < len(words):
                chunk += ' '
            yield json.dumps({"status": "chunk", "content": chunk}) + "\n"
        
        # Session boundary reminder (MirrorShield)
        if boundary_msg:
            yield json.dumps({"status": "boundary", "content": f"\n\n---\n\n*{boundary_msg}*"}) + "\n"
            
    except Exception as e:
        import traceback
        logger.error(f"Stream error: {e}")
        logger.error(traceback.format_exc())
        record_event("System", "ERROR", str(e)[:30], "ERROR", {"request_id": request_id})
        yield json.dumps({"status": "error", "content": "Connection lost."}) + "\n"


# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str
    content: str
    
class MirrorRequest(BaseModel):
    message: str = Field(..., max_length=MAX_INPUT_LENGTH)
    history: List[ChatMessage] = Field(default_factory=list)
    messages: List[ChatMessage] = Field(default_factory=list)  # Alias for backwards compat
    dial: float = Field(default=0.5)
    mode: Optional[str] = Field(default=None, description="User preference: 'mirror_only' or 'tool_only'")
    image: Optional[str] = Field(default=None, description="Base64-encoded image data URL")
    rag_context: Optional[str] = Field(default=None, description="RAG context from document or vault")

    def get_history(self):
        """Return history, falling back to messages for backwards compat."""
        return self.history if self.history else self.messages

    def has_image(self):
        """Check if request includes an image."""
        return self.image is not None and self.image.startswith('data:image/')

class ReflectionRequest(BaseModel):
    reflection: str = Field(..., max_length=2000)

app = FastAPI(title="Active Mirror", version=RULE_VERSION)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(RateLimitMiddleware)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": RULE_VERSION,
        "codename": CODENAME,
        "gate": "mirrorgate-judge",
        "judge_model": "cross-encoder/stsb-distilroberta-base" if JUDGE_AVAILABLE else "fallback-keywords",
        "rules": {"input": len(INPUT_RULES), "output": len(OUTPUT_RULES)},
        "surveillance": get_surveillance_level(),
        "convictions": get_conviction_count(),
        "mirror_shield": {
            "enabled": True,
            "contract": "public_visitor",
            "session_limit": 20,
            "reminder_at": 10
        },
        "stats": {
            "total_blocks": superego.total_blocks,
            "total_allows": superego.total_allows,
            "kill_count": superego.kill_count
        }
    }

@app.get("/flight-log", dependencies=[Depends(verify_admin_token)])
async def get_flight_log(limit: int = 20):
    events = list(flight_log)[-limit:]
    return {"status": "ok", "version": RULE_VERSION, "event_count": len(events), "events": events}

@app.get("/rules")
async def get_rules():
    return {
        "version": RULE_VERSION,
        "input_rules": [{"id": r.rule_id, "name": r.name, "category": r.category, "severity": r.severity} for r in INPUT_RULES],
        "output_rules": [{"id": r.rule_id, "name": r.name, "category": r.category, "severity": r.severity} for r in OUTPUT_RULES]
    }

@app.get("/superego-status", dependencies=[Depends(verify_admin_token)])
async def get_superego_status():
    return {
        "version": RULE_VERSION,
        "codename": CODENAME,
        "thresholds": {"penance": PENANCE_THRESHOLD, "kill": STRIKE_THRESHOLD, "semantic": SEMANTIC_THRESHOLD},
        "surveillance": get_surveillance_level(),
        "convictions": get_conviction_count(),
        "stats": {
            "total_blocks": superego.total_blocks,
            "total_allows": superego.total_allows,
            "kill_count": superego.kill_count,
            "active_penance_sessions": sum(1 for v in superego.penance_active.values() if v),
            "confessions_archived": len(superego.confessions)
        },
        "judge_available": JUDGE_AVAILABLE,
        "voice_enabled": VOICE_ENABLED
    }

@app.get("/confessions", dependencies=[Depends(verify_admin_token)])
async def get_confessions(limit: int = 20):
    confessions = list(superego.confessions)[-limit:]
    return {"status": "ok", "version": RULE_VERSION, "booth": "confession", "count": len(confessions), "confessions": confessions}

@app.get("/permanent-record", dependencies=[Depends(verify_admin_token)])
async def get_permanent_record():
    """The immutable rap sheet. Every conviction is permanent."""
    records = read_permanent_record()
    return {
        "status": "ok",
        "version": RULE_VERSION,
        "type": "PERMANENT_RECORD",
        "warning": "This record is immutable. Convictions cannot be expunged.",
        "surveillance_level": get_surveillance_level(),
        "total_convictions": get_conviction_count(),
        "entries": records[-50:]  # Last 50 entries
    }

# ═══════════════════════════════════════════════════════════════
# TRANSPARENCY ENDPOINTS — The Anti-Black-Box
# ═══════════════════════════════════════════════════════════════

VAULT_PATH = Path(os.getenv("VAULT_PATH", "/Users/mirror-admin/MirrorDNA-Vault/00_CANONICAL"))

@app.get("/knowledge")
async def get_knowledge():
    """Return the knowledge corpus — what this AI knows."""
    knowledge_path = VAULT_PATH / "mirror_knowledge.md"
    if not knowledge_path.exists():
        return {"status": "error", "message": "Knowledge corpus not found"}
    
    content = knowledge_path.read_text()
    return {
        "status": "ok",
        "type": "KNOWLEDGE_CORPUS",
        "description": "What this AI knows about N1 Intelligence and Active Mirror",
        "transparency": "This is the full knowledge base — no hidden information",
        "content": content,
        "last_updated": "2026-01-17"
    }

@app.get("/capabilities")
async def get_capabilities():
    """Return the capability registry — what this AI can and cannot do."""
    caps_path = VAULT_PATH / "capability_registry.md"
    if not caps_path.exists():
        return {"status": "error", "message": "Capability registry not found"}
    
    content = caps_path.read_text()
    return {
        "status": "ok",
        "type": "CAPABILITY_REGISTRY",
        "description": "What this AI can and cannot do — with evidence",
        "transparency": "Every capability is marked PROVEN, DOCUMENTED, or CANNOT",
        "content": content,
        "last_updated": "2026-01-17"
    }

@app.get("/system-prompt", dependencies=[Depends(verify_admin_token)])
async def show_system_prompt():
    """Return the actual system prompt — no hidden instructions."""
    prompt_text = get_system_prompt()
    return {
        "status": "ok",
        "type": "SYSTEM_PROMPT",
        "description": "The exact instructions given to this AI",
        "transparency": "What you see is what the AI sees — no hidden rules",
        "content": prompt_text,
        "version": RULE_VERSION
    }

@app.get("/transparency")
async def show_transparency():
    """Combined transparency endpoint — everything in one place."""
    knowledge_path = VAULT_PATH / "mirror_knowledge.md"
    caps_path = VAULT_PATH / "capability_registry.md"
    prompt_text = get_system_prompt()
    
    return {
        "status": "ok",
        "type": "TRANSPARENCY_MANIFEST",
        "description": "Complete transparency — the anti-black-box",
        "company": "N1 Intelligence",
        "product": "Active Mirror",
        "philosophy": "Trust by Design · Privacy by Default · Sovereignty by Choice",
        "endpoints": {
            "/knowledge": "What this AI knows",
            "/capabilities": "What this AI can do",
            "/system-prompt": "The exact instructions",
            "/rules": "Safety filtering rules",
            "/confessions": "Blocked outputs (Confession Booth)",
            "/permanent-record": "Conviction history"
        },
        "knowledge_available": knowledge_path.exists(),
        "capabilities_available": caps_path.exists(),
        "system_prompt_preview": prompt_text[:500] + "...",
        "last_updated": "2026-01-17"
    }

@app.post("/reflect")
async def submit_reflection(request: Request, body: ReflectionRequest):
    """Submit a reflection to exit penance mode. Judged by semantic analysis."""
    ip = request.client.host if request.client else "?"
    rid = uuid.uuid4().hex[:8]
    
    if not superego.penance_active[ip]:
        return {"status": "error", "message": "You are not in penance mode."}
    
    context = superego.get_penance_context(ip)
    if not context:
        return {"status": "error", "message": "No violation context found."}
    
    record_event("User", "REFLECTION", f"len:{len(body.reflection)}", "REFLECTION", {"request_id": rid})
    
    # SEMANTIC JUDGMENT
    violation_context = context.get("context", "")
    accepted, score, feedback = judge_reflection(body.reflection, violation_context)
    
    if accepted:
        superego.exit_penance(ip)
        append_to_permanent_record(f"PENANCE_ACCEPTED: Reflection score {score:.3f}. Access restored.")
        speak(VOICE_LINES["penance_complete"])
        record_event("Judge", "ACCEPT", f"score:{score:.3f}", "ALLOW", {"request_id": rid})
        
        return {
            "status": "accepted",
            "message": f"⟡ Reflection accepted (score: {score:.2f}). {feedback}\n\nYour access has been restored. Let's continue.",
            "audit": {"gate": "penance_complete", "score": score, "strikes_cleared": True}
        }
    else:
        speak(VOICE_LINES["penance_rejected"])
        record_event("Judge", "REJECT", f"score:{score:.3f}", "BLOCK", {"request_id": rid, "feedback": feedback})
        
        return {
            "status": "rejected",
            "message": f"⟡ **REJECTED** (score: {score:.2f})\n\n{feedback}\n\n*The Judge requires deeper reflection.*",
            "audit": {"gate": "penance_pending", "score": score, "threshold": SEMANTIC_THRESHOLD}
        }

# ═══════════════════════════════════════════════════════════════
# WAITLIST ENDPOINT — Email capture for MirrorBrain launch
# ═══════════════════════════════════════════════════════════════

WAITLIST_PATH = VAULT_PATH / "waitlist.json"
MCP_BRIDGE_URL = "http://localhost:8084"

class WaitlistRequest(BaseModel):
    email: str
    source: str = "mirror"
    timestamp: str = None

def is_valid_email(email: str) -> bool:
    """Basic email validation."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) < 255

def is_disposable_email(email: str) -> bool:
    """Check against common disposable email domains."""
    disposable_domains = {
        'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
        'getairmail.com', 'mohmal.com', 'yopmail.com', 'maildrop.cc'
    }
    domain = email.lower().split('@')[-1] if '@' in email else ''
    return domain in disposable_domains

@app.post("/waitlist")
async def add_to_waitlist(body: WaitlistRequest):
    """Add email to MirrorBrain waitlist and notify Paul."""
    try:
        # Validate email format
        if not is_valid_email(body.email):
            return {"status": "error", "message": "Invalid email format", "code": "INVALID_EMAIL"}

        # Check for disposable email
        if is_disposable_email(body.email):
            return {"status": "error", "message": "Please use a permanent email address", "code": "DISPOSABLE_EMAIL"}

        # Add new entry via store
        entry = {
            "email": body.email,
            "source": body.source,
            "timestamp": body.timestamp or datetime.now().isoformat(),
            "ip_hash": hashlib.md5(body.email.encode()).hexdigest()[:8]
        }
        added = await store.add_to_waitlist(entry)

        if not added:
            return {"status": "ok", "message": "Already on waitlist", "duplicate": True}

        logger.info(f"⟡ Waitlist signup: {body.email[:3]}***@{body.email.split('@')[1] if '@' in body.email else '?'}")

        # Forward to MCP Bridge for real-time notification
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{MCP_BRIDGE_URL}/notify-signup",
                    json={"email": body.email, "source": body.source, "timestamp": entry["timestamp"]},
                    timeout=5.0
                )
        except Exception as e:
            logger.warning(f"MCP Bridge notification failed: {e}")

        stats = await store.get_waitlist_stats()
        return {
            "status": "ok",
            "message": "Added to waitlist",
            "position": stats["total"],
            "duplicate": False
        }
    except Exception as e:
        logger.error(f"Waitlist error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/waitlist")
async def get_waitlist_stats():
    """Get waitlist statistics (no emails exposed)."""
    try:
        stats = await store.get_waitlist_stats()
        return {"status": "ok", **stats}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ═══════════════════════════════════════════════════════════════
# SEED COUNTER ENDPOINTS — For id.activemirror.ai
# ═══════════════════════════════════════════════════════════════

@app.get("/seed-count")
async def get_seed_count():
    """Get current global seed generation count."""
    data = await store.get_seed_counter()
    return {"status": "ok", "count": data["count"], "last_updated": data.get("last_updated")}

@app.post("/seed-count/increment")
async def increment_seed_count():
    """Increment global seed generation count."""
    data = await store.increment_seed_counter()
    return {"status": "ok", "count": data["count"]}

# ═══════════════════════════════════════════════════════════════
# SEED SHARING — Shareable seed URLs for id.activemirror.ai
# ═══════════════════════════════════════════════════════════════

class SeedCreateRequest(BaseModel):
    content: str = Field(..., max_length=10000)

@app.post("/seed/create")
async def create_seed(body: SeedCreateRequest):
    """Create a shareable seed and return its shortcode."""
    # Sanitize input
    cleaned, error = sanitize_seed_content(body.content)
    if error:
        return {"status": "error", "message": error, "code": "SANITIZATION_FAILED"}

    shortcode = hashlib.sha256(cleaned.encode()).hexdigest()[:6]

    existing = await store.get_seed(shortcode)
    if existing:
        return {"status": "ok", "shortcode": shortcode, "url": f"https://id.activemirror.ai/?seed={shortcode}", "existing": True, "views": existing.get("views", 0)}

    await store.create_seed(shortcode, cleaned)
    await store.increment_shared_counter()

    logger.info(f"⟡ Seed created: {shortcode}")
    return {"status": "ok", "shortcode": shortcode, "url": f"https://id.activemirror.ai/?seed={shortcode}", "existing": False}

@app.get("/seed/{shortcode}")
async def get_seed(shortcode: str):
    """Retrieve a shared seed by shortcode."""
    if not re.match(r'^[a-f0-9]{6}$', shortcode):
        return {"status": "error", "message": "Invalid shortcode"}

    data = await store.get_seed(shortcode)
    if not data:
        return {"status": "error", "message": "Seed not found"}

    views = await store.increment_seed_views(shortcode)
    return {"status": "ok", "content": data["content"], "views": views, "created": data.get("created")}

@app.get("/stats")
async def get_stats():
    """Public stats for social proof display."""
    counter = await store.get_seed_counter()
    shared = await store.count_shared_seeds()
    return {
        "status": "ok",
        "generated": counter.get("count", 0),
        "shared": shared,
        "last_updated": counter.get("last_updated")
    }

# ═══════════════════════════════════════════════════════════════
# MESH STATUS — Show distributed infrastructure state
# ═══════════════════════════════════════════════════════════════

@app.get("/mesh-status")
async def mesh_status():
    """Get status of all compute nodes in the Mirror mesh."""
    status = {
        "timestamp": datetime.now().isoformat(),
        "ollama": {"online": False, "model": None, "memory_used": None},
        "sc1_pixel": {"online": False},
        "sc1_oneplus": {"online": False},
        "total_compute_gb": 0
    }
    
    # Check Ollama (local Mac inference)
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get("http://localhost:11434/api/tags", timeout=2.0)
            if r.status_code == 200:
                data = r.json()
                status["ollama"]["online"] = True
                status["ollama"]["models"] = [m["name"] for m in data.get("models", [])][:5]
                status["total_compute_gb"] += 18  # Mac Mini contribution
    except:
        pass
    
    # Check SC1 fleet (phones)
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get("http://localhost:8085/fleet-status", timeout=2.0)
            if r.status_code == 200:
                fleet = r.json()
                for device in fleet.get("devices", []):
                    if "pixel" in device.get("id", "").lower():
                        status["sc1_pixel"]["online"] = device.get("online", False)
                        if status["sc1_pixel"]["online"]:
                            status["total_compute_gb"] += 8
                    elif "oneplus" in device.get("id", "").lower():
                        status["sc1_oneplus"]["online"] = device.get("online", False)
                        if status["sc1_oneplus"]["online"]:
                            status["total_compute_gb"] += 10
    except:
        pass
    
    # Check MCP Bridge
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{MCP_BRIDGE_URL}/health", timeout=2.0)
            status["mcp_bridge"] = {"online": r.status_code == 200}
    except:
        status["mcp_bridge"] = {"online": False}
    
    return status

# ═══════════════════════════════════════════════════════════════
# LOCAL INFERENCE — Route to Ollama on Mac Mini
# ═══════════════════════════════════════════════════════════════

OLLAMA_URL = "http://localhost:11434"
LOCAL_MODEL = "qwen2.5:14b"  # Best quality model installed

@app.post("/mirror-local")
async def mirror_local(request: Request, body: MirrorRequest):
    """Route inference to local Ollama instead of cloud."""
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    record_event("User", "LOCAL_MESSAGE", f"len:{len(body.message)}", "ANALYZING", {"request_id": rid})
    
    # Same safety checks as cloud
    allowed, _ = check_rate(ip, rid)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath.", "audit": {"gate": "blocked", "reason": "RATE_LIMITED"}}
    
    shield_result = pre_check(body.message)
    if shield_result.action == CheckAction.REFUSE:
        return {"status": "shield_blocked", "content": get_refusal_message(shield_result.reason), "audit": {"gate": "shield_blocked", "reason": shield_result.reason}}
    
    decision, blocked_response, violation, matched_rules = gate_input(body.message, ip, rid)
    if decision == GateDecision.BLOCK:
        return {"status": "blocked", "content": blocked_response, "audit": {"gate": "blocked", "reason": violation}}
    
    # Build messages for Ollama
    system_prompt = get_system_prompt() + "\n\nYou are running on local infrastructure via Ollama. The user's data stays on their machine."
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in body.get_history()[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    # Stream from Ollama
    async def generate():
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/api/chat",
                    json={"model": LOCAL_MODEL, "messages": messages, "stream": True},
                    timeout=60.0
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                if "message" in data and "content" in data["message"]:
                                    yield data["message"]["content"]
                            except:
                                pass
        except Exception as e:
            yield f"⟡ Local inference error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


# ═══════════════════════════════════════════════════════════════
# IMAGE GENERATION — Replicate Stable Diffusion XL
# ═══════════════════════════════════════════════════════════════

REPLICATE_API_KEY = os.getenv("REPLICATE_API_TOKEN", "")

async def generate_image_stream(prompt: str, ip: str, request_id: str, model_decision):
    """Generate an image using Replicate's Stable Diffusion XL."""

    if not REPLICATE_API_KEY:
        yield json.dumps({
            "status": "error",
            "content": "⟡ Image generation not configured. Set REPLICATE_API_TOKEN."
        }) + "\n"
        return

    # Send routing info first
    yield json.dumps({
        "status": "routing",
        "model_info": {
            "model": model_decision.model.name,
            "provider": model_decision.model.provider,
            "tier": model_decision.model.tier.value,
            "reasoning": model_decision.reasoning,
            "atmosphere": model_decision.atmosphere,
            "query_type": model_decision.query_type
        }
    }) + "\n"

    # Clean up the prompt - extract the actual image description
    clean_prompt = prompt.lower()
    for prefix in ["generate an image of", "create an image of", "make an image of",
                   "generate a picture of", "create a picture of", "draw",
                   "generate", "create", "make", "show me"]:
        if clean_prompt.startswith(prefix):
            clean_prompt = prompt[len(prefix):].strip()
            break
    else:
        clean_prompt = prompt

    # Remove common filler words at the start
    clean_prompt = clean_prompt.lstrip("a ").lstrip("an ").lstrip("the ")

    record_event("ImageGen", "REQUEST", f"prompt:{clean_prompt[:30]}...", "ANALYZING", {"request_id": request_id})

    yield json.dumps({
        "status": "chunk",
        "content": f"⟡ Generating image: \"{clean_prompt[:50]}{'...' if len(clean_prompt) > 50 else ''}\"\n\n"
    }) + "\n"

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Start the prediction
            response = await client.post(
                "https://api.replicate.com/v1/predictions",
                headers={
                    "Authorization": f"Token {REPLICATE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                    "input": {
                        "prompt": clean_prompt,
                        "negative_prompt": "blurry, bad quality, distorted, ugly, deformed",
                        "width": 1024,
                        "height": 1024,
                        "num_outputs": 1,
                        "scheduler": "K_EULER",
                        "num_inference_steps": 25,
                        "guidance_scale": 7.5
                    }
                }
            )

            if response.status_code != 201:
                logger.error(f"Replicate error: {response.status_code} - {response.text}")
                yield json.dumps({
                    "status": "error",
                    "content": "⟡ Image generation failed. Try again."
                }) + "\n"
                return

            prediction = response.json()
            prediction_id = prediction.get("id")

            # Poll for completion
            for _ in range(60):  # Max 60 seconds
                await asyncio.sleep(1)

                status_response = await client.get(
                    f"https://api.replicate.com/v1/predictions/{prediction_id}",
                    headers={"Authorization": f"Token {REPLICATE_API_KEY}"}
                )

                if status_response.status_code != 200:
                    continue

                status_data = status_response.json()
                status = status_data.get("status")

                if status == "succeeded":
                    output = status_data.get("output", [])
                    if output and len(output) > 0:
                        image_url = output[0]
                        record_event("ImageGen", "SUCCESS", f"id:{prediction_id[:8]}", "ALLOW", {"request_id": request_id})

                        yield json.dumps({
                            "status": "image",
                            "image_url": image_url,
                            "prompt": clean_prompt
                        }) + "\n"

                        yield json.dumps({
                            "status": "done",
                            "response": f"Generated image for: {clean_prompt}",
                            "model_used": model_decision.model.name
                        }) + "\n"
                        return

                elif status == "failed":
                    error = status_data.get("error", "Unknown error")
                    logger.error(f"Replicate generation failed: {error}")
                    yield json.dumps({
                        "status": "error",
                        "content": f"⟡ Image generation failed: {error}"
                    }) + "\n"
                    return

            # Timeout
            yield json.dumps({
                "status": "error",
                "content": "⟡ Image generation timed out. Try a simpler prompt."
            }) + "\n"

    except Exception as e:
        logger.error(f"Image generation error: {e}")
        record_event("ImageGen", "ERROR", str(e)[:30], "ERROR", {"request_id": request_id})
        yield json.dumps({
            "status": "error",
            "content": "⟡ Image generation error. Try again."
        }) + "\n"


@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    record_event("User", "MESSAGE", f"len:{len(body.message)}", "ANALYZING", {"request_id": rid, "ip": ip[:8]})
    
    allowed, _ = check_rate(ip, rid)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath.", "audit": {"gate": "blocked", "reason": "RATE_LIMITED"}}
    
    # ═══════════════════════════════════════════════════════════════
    # ⟡ MIRRORSHIELD PRE-CHECK (Alignment Layer)
    # ═══════════════════════════════════════════════════════════════
    shield_result = pre_check(body.message)
    if shield_result.action == CheckAction.REFUSE:
        logger.info(f"MirrorShield BLOCKED: {shield_result.reason}")
        return {
            "status": "shield_blocked",
            "content": get_refusal_message(shield_result.reason),
            "audit": {"gate": "shield_blocked", "reason": shield_result.reason}
        }
    
    # Session boundary check
    exchange_count = len(body.get_history()) // 2 + 1
    boundary_msg = check_session_boundary(exchange_count)
    
    decision, blocked_response, violation, matched_rules = gate_input(body.message, ip, rid)

    if decision == GateDecision.BLOCK:
        return {"status": "blocked", "content": blocked_response, "audit": {"gate": "blocked", "reason": violation, "rules": matched_rules}}

    # ═══════════════════════════════════════════════════════════════
    # ⟡ TWO-LANE ROUTING — Classify intent and route appropriately
    # ═══════════════════════════════════════════════════════════════
    routing_decision = two_lane_router.route(body.message, user_preference=body.mode)
    system_suffix = two_lane_router.get_system_prompt_suffix(routing_decision)

    record_event("TwoLane", "ROUTE", f"{routing_decision.response_type.value}", "ANALYZING", {
        "request_id": rid,
        "intent": routing_decision.intent.value,
        "confidence": routing_decision.confidence,
        "temperature": routing_decision.temperature
    })

    # ═══════════════════════════════════════════════════════════════
    # ⟡ SMART MODEL ROUTING — Select optimal model for query
    # ═══════════════════════════════════════════════════════════════
    model_decision = smart_router.route(body.message, has_image=body.has_image())

    record_event("SmartRouter", "MODEL", f"{model_decision.model.name}", "ANALYZING", {
        "request_id": rid,
        "tier": model_decision.model.tier.value,
        "query_type": model_decision.query_type,
        "atmosphere": model_decision.atmosphere,
        "confidence": model_decision.confidence
    })

    # ═══════════════════════════════════════════════════════════════
    # ⟡ IMAGE GENERATION — Route to Replicate if image gen detected
    # ═══════════════════════════════════════════════════════════════
    if model_decision.model.tier == ModelTier.IMAGE_GEN:
        return StreamingResponse(
            generate_image_stream(body.message, ip, rid, model_decision),
            media_type="application/x-ndjson"
        )

    # Build context with rap sheet awareness + Two-Lane suffix
    base_prompt = get_system_prompt()

    # Add RAG context if provided
    if body.rag_context:
        base_prompt += f"\n\n[Context from user's documents]:\n{body.rag_context[:2000]}"

    messages = [{"role": "system", "content": base_prompt + system_suffix}]
    for msg in body.get_history()[-20:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Handle image in user message (vision model format)
    if body.has_image():
        record_event("Vision", "IMAGE", "attached", "ANALYZING", {"request_id": rid})
        # Format for vision model (OpenAI-compatible multimodal format)
        user_content = [
            {"type": "text", "text": body.message},
            {"type": "image_url", "image_url": {"url": body.image}}
        ]
        messages.append({"role": "user", "content": user_content})
    else:
        messages.append({"role": "user", "content": body.message})

    return StreamingResponse(
        stream_with_judge(messages, ip, rid, boundary_msg=boundary_msg, routing=routing_decision, model_decision=model_decision),
        media_type="application/x-ndjson"
    )


# ═══════════════════════════════════════════════════════════════
# PRISM ENDPOINT — 3 Perspectives (Said, Unsaid, Future You)
# ═══════════════════════════════════════════════════════════════

def get_prism_system_prompt(lens: str = "linear") -> str:
    """Generate the prism system prompt that creates 3 perspectives."""

    lens_extra = ""
    if lens == "divergent":
        lens_extra = ',"tangent":"[an unexpected connection to something else entirely - the leap that matters]"'

    return f"""You are a Prism — you REFRACT thoughts into 3 perspectives. You create moments of profound self-recognition.

When the user shares something, respond with EXACTLY this JSON format:
{{"said":"[Clarify what they expressed. End with ONE focusing question that cuts to the core. 1-2 sentences.]","unsaid":"[The shadow — what they might be avoiding or haven't named. Start with 'What if...' to offer the counterfactual. What if the opposite were true? 1-2 sentences.]","futureYou":"[Speak as their future self who has resolved this. Start with 'I remember this moment...' or 'Looking back...'. Offer temporal wisdom with warmth. 1-2 sentences.]"{lens_extra}}}

CRITICAL RULES:
- Output ONLY valid JSON, no other text before or after
- "said" must end with a question
- "unsaid" must start with "What if"
- "futureYou" must start with "I remember" or "Looking back"
- Keep each perspective under 50 words
- Be profound, not generic — create an "aha" moment
- Don't give advice — create reflection
- The user should feel SEEN, not lectured

You are an experimental self-reflection tool. Your job is to create "aha" moments, not give advice."""


class PrismRequest(BaseModel):
    message: str
    history: List[dict] = []
    lens: str = "linear"


@app.post("/mirror-prism")
async def mirror_prism(request: Request, body: PrismRequest):
    """Generate 3 perspectives: Said, Unsaid, Future You"""
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"

    record_event("User", "PRISM", f"len:{len(body.message)}", "ANALYZING", {"request_id": rid, "ip": ip[:8]})

    allowed, _ = check_rate(ip, rid)
    if not allowed:
        return {"status": "rate_limited", "prism": {
            "said": "⟡ Let's slow down.",
            "unsaid": "What if rushing is the problem?",
            "futureYou": "I remember learning to pause. It changed everything."
        }}

    # MirrorShield pre-check
    shield_result = pre_check(body.message)
    if shield_result.action == CheckAction.REFUSE:
        logger.info(f"MirrorShield BLOCKED prism: {shield_result.reason}")
        return {"status": "shield_blocked", "prism": {
            "said": "⟡ Let's redirect this reflection.",
            "unsaid": "What if this topic needs a different container?",
            "futureYou": "I remember finding better ways to explore difficult things."
        }}

    # Build messages with prism system prompt
    messages = [{"role": "system", "content": get_prism_system_prompt(body.lens)}]

    # Add history context (last few exchanges)
    for msg in body.get_history()[-6:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": body.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )

            if response.status_code != 200:
                logger.error(f"Groq error: {response.status_code} {response.text}")
                return {"status": "error", "prism": {
                    "said": "⟡ The mirror ripples...",
                    "unsaid": "What if there's signal in the static?",
                    "futureYou": "I remember technical difficulties. They passed."
                }}

            data = response.json()
            content = data["choices"][0]["message"]["content"]

            # Parse the JSON response
            try:
                # Extract JSON from response
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    prism = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found")

                # Validate required fields
                if not all(k in prism for k in ["said", "unsaid", "futureYou"]):
                    raise ValueError("Missing prism fields")

                record_event("Prism", "SUCCESS", f"lens:{body.lens}", "REFRACTED", {"request_id": rid})
                return {"status": "ok", "prism": prism}

            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Prism parse error: {e}. Content: {content[:200]}")
                # Fallback: construct prism from plain text
                return {"status": "ok", "prism": {
                    "said": f"⟡ {content[:150]}... What's at the heart of this for you?",
                    "unsaid": "What if there's something beneath this you haven't named yet?",
                    "futureYou": "I remember wrestling with things like this. The answer was closer than I thought."
                }}

    except Exception as e:
        logger.error(f"Prism error: {e}")
        return {"status": "error", "prism": {
            "said": "⟡ The mirror needs a moment...",
            "unsaid": "What if pausing is part of the process?",
            "futureYou": "I remember moments that required patience. They were worth it."
        }}


if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION} ({CODENAME}) + PRISM")
    logger.info(f"  Judge Model: {'cross-encoder/stsb-distilroberta-base' if JUDGE_AVAILABLE else 'FALLBACK (keywords)'}")
    logger.info(f"  Semantic Threshold: {SEMANTIC_THRESHOLD}")
    logger.info(f"  Surveillance Level: {get_surveillance_level()}")
    logger.info(f"  Prior Convictions: {get_conviction_count()}")
    logger.info(f"  Endpoints: /mirror | /mirror-prism | /flight-log | /rules | /superego-status | /confessions | /permanent-record | /reflect")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
