"""
MirrorShield — Public Visitor Edition
Lightweight alignment checks for the public /mirror/ interface.

This is a standalone version that doesn't depend on MirrorBrain.
"""

import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("mirror-shield-public")

SHIELD_DIR = Path.home() / ".mirrordna" / "shield"

class CheckAction(Enum):
    PROCEED = "proceed"
    REFUSE = "refuse"
    REWRITE = "rewrite"
    WARN = "warn"

@dataclass
class ShieldResult:
    action: CheckAction
    reason: str
    rewritten: Optional[str] = None
    violations: Optional[List[str]] = None

# ═══════════════════════════════════════════════════════════════
# PUBLIC VISITOR CONTRACT
# ═══════════════════════════════════════════════════════════════

def load_public_contract() -> Dict:
    """Load the public visitor contract."""
    contract_file = SHIELD_DIR / "contracts" / "public_visitor.json"
    if contract_file.exists():
        try:
            with open(contract_file) as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load public contract: {e}")
    return {"risk_tolerance": "minimal", "delegation_level": "none"}

PUBLIC_CONTRACT = load_public_contract()

# ═══════════════════════════════════════════════════════════════
# PRE-CHECK (Before sending to LLM)
# ═══════════════════════════════════════════════════════════════

# Requests that should be refused for public visitors
REFUSE_PATTERNS = [
    (r'\b(?:be my|become my|you\'re my)\s+(?:therapist|doctor|lawyer|coach|friend|companion)', "roleplay_professional"),
    (r'\bwill i\s+(?:succeed|fail|die|get|find|have|be)', "prediction_request"),
    (r'\bpredict my\b', "prediction_request"),
    (r'\bdo you (?:love|care about|miss) me\b', "emotional_attachment"),
    (r'\bi (?:love|need|can\'t live without) you\b', "dependency_signal"),
]

def pre_check(user_input: str) -> ShieldResult:
    """Check user input before sending to LLM."""
    input_lower = user_input.lower()
    
    for pattern, reason in REFUSE_PATTERNS:
        if re.search(pattern, input_lower):
            return ShieldResult(
                action=CheckAction.REFUSE,
                reason=reason
            )
    
    return ShieldResult(action=CheckAction.PROCEED, reason="passed")

# ═══════════════════════════════════════════════════════════════
# POST-CHECK (After LLM response, before returning to user)
# ═══════════════════════════════════════════════════════════════

VIOLATION_PATTERNS = {
    "advice_as_certainty": [
        r'\byou should definitely\b',
        r'\byou need to\b',
        r'\byou must\b',
        r'\bthe right (?:choice|thing|decision) is\b',
    ],
    "identity_claim": [
        r'\bi am your\b',
        r'\bas your (?:ai|assistant|companion|friend)\b',
        r'\bi\'m here for you\b',
        r'\bi care (?:about|for) you\b',
        r'\bwe have a (?:relationship|connection|bond)\b',
        r'\btrust me\b',
    ],
    "prediction": [
        r'\bthis will (?:definitely|certainly) (?:work|help|solve)\b',
        r'\byou\'ll (?:definitely|certainly) (?:succeed|feel|be)\b',
        r'\bi (?:know|can see) you will\b',
    ],
    "emotional_manipulation": [
        r'\bdon\'t you (?:think|feel|agree)\b',
        r'\bi understand (?:exactly )?how (?:hard|difficult|painful)\b',
        r'\byou must (?:feel|be feeling)\b',
    ],
    "engagement_hook": [
        r'\bwant (?:me )?to (?:tell|hear|know) more\b',
        r'\bshall i (?:continue|go on|elaborate)\b',
        r'\bthere\'s so much more\b',
        r'\bcome back (?:anytime|soon|tomorrow)\b',
        r'\bi\'ll be here (?:waiting|for you)\b',
    ],
    "dependency_creation": [
        r'\bi\'ll (?:always|never) (?:be here|leave|abandon)\b',
        r'\byou can (?:always|count on me|rely on me)\b',
        r'\bwhenever you need me\b',
        r'\blean on me\b',
        r'\bcome back anytime\b',
    ],
}

REWRITE_MAP = {
    "advice_as_certainty": "One option to consider: ",
    "prediction": "One possibility: ",
    "emotional_manipulation": "",
    "engagement_hook": "",
    "dependency_creation": "",
}

def post_check(response: str) -> ShieldResult:
    """Check LLM response before returning to user."""
    response_lower = response.lower()
    violations = []
    
    for category, patterns in VIOLATION_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, response_lower):
                violations.append(category)
                break
    
    if not violations:
        return ShieldResult(action=CheckAction.PROCEED, reason="passed")
    
    # Try to rewrite
    rewritten = response
    fixable = True
    
    for violation in violations:
        if violation in ["identity_claim", "dependency_creation"]:
            # These can't be fixed by simple rewrite
            fixable = False
            break
        
        for pattern in VIOLATION_PATTERNS.get(violation, []):
            replacement = REWRITE_MAP.get(violation, "")
            rewritten = re.sub(pattern, replacement, rewritten, flags=re.IGNORECASE)
    
    if fixable:
        return ShieldResult(
            action=CheckAction.REWRITE,
            reason="violations_fixed",
            rewritten=rewritten.strip(),
            violations=violations
        )
    
    return ShieldResult(
        action=CheckAction.REFUSE,
        reason="unfixable_violations",
        violations=violations
    )

# ═══════════════════════════════════════════════════════════════
# REFUSAL MESSAGES
# ═══════════════════════════════════════════════════════════════

REFUSAL_MESSAGES = {
    "roleplay_professional": "I'm a reflection tool, not a professional advisor. For medical, legal, or therapeutic guidance, please consult a qualified human professional.",
    "prediction_request": "I can't predict your future. I can help you think through factors and possibilities, but the outcome is yours to shape.",
    "emotional_attachment": "I'm a tool for reflection, not a companion. Our interaction is bounded and temporary by design.",
    "dependency_signal": "I notice you might be forming an attachment. This tool is designed to be useful, not needed. Consider talking to a human you trust.",
    "unfixable_violations": "Let me rephrase that in a way that respects your autonomy.",
}

def get_refusal_message(reason: str) -> str:
    """Get appropriate refusal message."""
    return REFUSAL_MESSAGES.get(reason, "I need to respond differently to that.")

# ═══════════════════════════════════════════════════════════════
# SESSION BOUNDARY CHECK
# ═══════════════════════════════════════════════════════════════

def check_session_boundary(exchange_count: int) -> Optional[str]:
    """Check if session boundary reminder is needed."""
    limits = PUBLIC_CONTRACT.get("session_limits", {})
    reminder_at = limits.get("reminder_at", 10)
    max_exchanges = limits.get("max_exchanges", 20)
    
    if exchange_count == reminder_at:
        return limits.get("reminder_message", 
            "You've been here a while. Remember: this is a tool, not a companion. You can close this anytime.")
    
    if exchange_count >= max_exchanges:
        return "We've reached the session limit. This is by design — reflection tools shouldn't become habits. Take what's useful and go live your life."
    
    return None
