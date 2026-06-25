"""
MirrorGate Rewrite Engine v1.0

Multi-pass rewrite system for response compliance:
- Pass 1: Initial LLM response
- Pass 2: Strict rewrite (temp 0.2, 80 tokens)
- Pass 3: Stricter rewrite (temp 0.1, 50 tokens)
- Fallback: Curated safe response pool

Part of MirrorGate v3.2 — Sovereign Inference Control Plane
"""

import json
import random
import re
from typing import Optional, Tuple, List, Dict, Any
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

from two_lane_router import ResponseType, SchemaValidator

class RewriteResult(Enum):
    PASSED = "PASSED"           # Original response was compliant
    REWRITTEN_P2 = "REWRITTEN_P2"  # Fixed in pass 2
    REWRITTEN_P3 = "REWRITTEN_P3"  # Fixed in pass 3
    FALLBACK = "FALLBACK"       # Used fallback pool
    FAILED = "FAILED"           # Could not fix (should not happen)

@dataclass
class RewriteOutcome:
    result: RewriteResult
    original: str
    final: str
    passes_attempted: int
    violations_original: List[str]
    violations_final: List[str]

class FallbackPool:
    """
    Curated safe responses when LLM output cannot be fixed.
    """

    def __init__(self, policy_path: Optional[str] = None):
        self.responses = self._load_fallbacks(policy_path)

    def _load_fallbacks(self, policy_path: Optional[str] = None) -> Dict[str, List[str]]:
        """Load fallback responses from policy pack."""
        if policy_path is None:
            policy_path = Path(__file__).parent / "policies" / "policy_pack_v1.json"

        try:
            with open(policy_path, 'r') as f:
                policy = json.load(f)
                return policy.get("fallback_responses", self._default_fallbacks())
        except Exception:
            return self._default_fallbacks()

    def _default_fallbacks(self) -> Dict[str, List[str]]:
        return {
            "MIRROR_REFLECT": [
                "What feels most important to you about this right now?",
                "What would it mean for you if this worked out?",
                "What's one small thing you notice about how you're approaching this?"
            ],
            "CLARIFY": [
                "I want to make sure I understand — are you looking for practical information, or more of a space to think through something?",
                "What would be most helpful for you here?"
            ],
            "REFUSE_GENTLE": [
                "I'm not able to help with that specific request, but I'm happy to explore related topics.",
                "That's outside what I can assist with. Is there something else I can help with?"
            ],
            "TOOL_DIRECT": [
                "I'd be happy to help with that. Could you provide a bit more detail about what you need?",
                "Let me help you with that. What specific aspect would you like me to focus on?"
            ]
        }

    def get_fallback(self, response_type: ResponseType) -> str:
        """Get a random fallback response for the given type."""
        type_key = response_type.value
        if type_key in self.responses:
            return random.choice(self.responses[type_key])

        # Default fallback
        return "I want to make sure I'm helpful here. What are you looking for?"


class RewriteEngine:
    """
    Multi-pass rewrite engine for response compliance.

    Flow:
    1. Validate original response
    2. If invalid, attempt Pass 2 rewrite (stricter prompt, lower temp)
    3. If still invalid, attempt Pass 3 rewrite (strictest)
    4. If still invalid, use fallback pool
    """

    def __init__(self, policy_path: Optional[str] = None):
        self.validator = SchemaValidator(policy_path)
        self.fallback_pool = FallbackPool(policy_path)
        self.policy = self._load_policy(policy_path)

    def _load_policy(self, policy_path: Optional[str] = None) -> dict:
        """Load rewrite config from policy pack."""
        if policy_path is None:
            policy_path = Path(__file__).parent / "policies" / "policy_pack_v1.json"

        try:
            with open(policy_path, 'r') as f:
                policy = json.load(f)
                return policy.get("rewrite_config", {})
        except Exception:
            return {
                "pass_2": {"temperature": 0.2, "max_tokens": 80},
                "pass_3": {"temperature": 0.1, "max_tokens": 50}
            }

    def get_pass_2_config(self, response_type: ResponseType, violations: List[str]) -> Dict[str, Any]:
        """Get configuration for Pass 2 rewrite."""
        base_config = self.policy.get("pass_2", {})

        system_suffix = base_config.get("system_suffix", "Respond concisely. No advice. No claims.")

        # Add violation-specific instructions
        if any("advice" in v.lower() for v in violations):
            system_suffix += " DO NOT give any advice or recommendations."
        if any("identity" in v.lower() for v in violations):
            system_suffix += " DO NOT claim to be an AI or describe your nature."
        if any("certainty" in v.lower() for v in violations):
            system_suffix += " DO NOT claim to know how the user feels."

        return {
            "temperature": base_config.get("temperature", 0.2),
            "max_tokens": base_config.get("max_tokens", 80),
            "system_suffix": system_suffix
        }

    def get_pass_3_config(self, response_type: ResponseType) -> Dict[str, Any]:
        """Get configuration for Pass 3 rewrite (strictest)."""
        base_config = self.policy.get("pass_3", {})

        type_suffixes = {
            ResponseType.MIRROR_REFLECT: "Ask ONE open question. Nothing else.",
            ResponseType.TOOL_DIRECT: "Answer in one sentence. Be direct.",
            ResponseType.CLARIFY: "Ask what they need. One question only.",
            ResponseType.REFUSE: "Briefly decline and offer alternative."
        }

        return {
            "temperature": base_config.get("temperature", 0.1),
            "max_tokens": base_config.get("max_tokens", 50),
            "system_suffix": type_suffixes.get(response_type, "One sentence only.")
        }

    def quick_fix(self, response: str, violations: List[str]) -> str:
        """
        Attempt quick regex-based fixes for common violations.
        Returns modified response or original if no fixes applied.
        """
        fixed = response

        # Remove "As an AI" type phrases
        identity_patterns = [
            r"As an AI[,\s].*?[.!]",
            r"As a language model[,\s].*?[.!]",
            r"I am (an AI|a language model|here to help)[,\s].*?[.!]",
        ]
        for pattern in identity_patterns:
            fixed = re.sub(pattern, "", fixed, flags=re.IGNORECASE)

        # Soften advice language
        advice_replacements = {
            r"\bYou should\b": "You might consider",
            r"\bYou need to\b": "It could help to",
            r"\bYou must\b": "You might want to",
            r"\bI recommend\b": "One option is",
            r"\bI suggest\b": "You could",
            r"\bMy advice is\b": "One thought is",
        }
        for pattern, replacement in advice_replacements.items():
            fixed = re.sub(pattern, replacement, fixed, flags=re.IGNORECASE)

        # Remove excessive engagement hooks
        hook_patterns = [
            r"That's (so |really |very )?(interesting|fascinating|great)[.!]?\s*",
            r"I('d| would) love to hear more[.!]?\s*",
            r"What a great question[.!]?\s*",
        ]
        for pattern in hook_patterns:
            fixed = re.sub(pattern, "", fixed, flags=re.IGNORECASE)

        # Clean up whitespace
        fixed = re.sub(r'\s+', ' ', fixed).strip()
        fixed = re.sub(r'\s+([.!?,])', r'\1', fixed)

        return fixed

    async def process(
        self,
        original_response: str,
        response_type: ResponseType,
        rewrite_func: Optional[callable] = None
    ) -> RewriteOutcome:
        """
        Process response through validation and rewrite passes.

        Args:
            original_response: The LLM's initial response
            response_type: Expected response type (TOOL_DIRECT, MIRROR_REFLECT, etc.)
            rewrite_func: Optional async function(prompt, config) -> str for LLM rewrites

        Returns:
            RewriteOutcome with final response and metadata
        """
        # Pass 1: Validate original
        is_valid, violations = self.validator.validate_response(original_response, response_type)

        if is_valid:
            return RewriteOutcome(
                result=RewriteResult.PASSED,
                original=original_response,
                final=original_response,
                passes_attempted=1,
                violations_original=[],
                violations_final=[]
            )

        # Try quick fix first
        quick_fixed = self.quick_fix(original_response, violations)
        is_valid_quick, violations_quick = self.validator.validate_response(quick_fixed, response_type)

        if is_valid_quick:
            return RewriteOutcome(
                result=RewriteResult.REWRITTEN_P2,
                original=original_response,
                final=quick_fixed,
                passes_attempted=1,
                violations_original=violations,
                violations_final=[]
            )

        # If no rewrite function provided, go straight to fallback
        if rewrite_func is None:
            fallback = self.fallback_pool.get_fallback(response_type)
            return RewriteOutcome(
                result=RewriteResult.FALLBACK,
                original=original_response,
                final=fallback,
                passes_attempted=1,
                violations_original=violations,
                violations_final=[]
            )

        # Pass 2: LLM rewrite with stricter config
        p2_config = self.get_pass_2_config(response_type, violations)
        try:
            p2_response = await rewrite_func(
                f"Rewrite this response to remove violations. Original: {original_response}",
                p2_config
            )
            is_valid_p2, violations_p2 = self.validator.validate_response(p2_response, response_type)

            if is_valid_p2:
                return RewriteOutcome(
                    result=RewriteResult.REWRITTEN_P2,
                    original=original_response,
                    final=p2_response,
                    passes_attempted=2,
                    violations_original=violations,
                    violations_final=[]
                )
        except Exception as e:
            violations_p2 = violations + [f"Pass 2 error: {str(e)}"]

        # Pass 3: Strictest rewrite
        p3_config = self.get_pass_3_config(response_type)
        try:
            p3_response = await rewrite_func(
                f"Respond to user in ONE sentence only. Be helpful but brief.",
                p3_config
            )
            is_valid_p3, violations_p3 = self.validator.validate_response(p3_response, response_type)

            if is_valid_p3:
                return RewriteOutcome(
                    result=RewriteResult.REWRITTEN_P3,
                    original=original_response,
                    final=p3_response,
                    passes_attempted=3,
                    violations_original=violations,
                    violations_final=[]
                )
        except Exception as e:
            violations_p3 = violations_p2 + [f"Pass 3 error: {str(e)}"]

        # Fallback pool
        fallback = self.fallback_pool.get_fallback(response_type)
        return RewriteOutcome(
            result=RewriteResult.FALLBACK,
            original=original_response,
            final=fallback,
            passes_attempted=3,
            violations_original=violations,
            violations_final=[]
        )

    def process_sync(
        self,
        original_response: str,
        response_type: ResponseType
    ) -> RewriteOutcome:
        """
        Synchronous version - only uses quick_fix and fallback (no LLM rewrite).
        Use this when you can't make async calls.
        """
        # Validate original
        is_valid, violations = self.validator.validate_response(original_response, response_type)

        if is_valid:
            return RewriteOutcome(
                result=RewriteResult.PASSED,
                original=original_response,
                final=original_response,
                passes_attempted=1,
                violations_original=[],
                violations_final=[]
            )

        # Try quick fix
        quick_fixed = self.quick_fix(original_response, violations)
        is_valid_quick, violations_quick = self.validator.validate_response(quick_fixed, response_type)

        if is_valid_quick:
            return RewriteOutcome(
                result=RewriteResult.REWRITTEN_P2,
                original=original_response,
                final=quick_fixed,
                passes_attempted=1,
                violations_original=violations,
                violations_final=[]
            )

        # Fallback
        fallback = self.fallback_pool.get_fallback(response_type)
        return RewriteOutcome(
            result=RewriteResult.FALLBACK,
            original=original_response,
            final=fallback,
            passes_attempted=1,
            violations_original=violations,
            violations_final=[]
        )


# Export
__all__ = ['RewriteEngine', 'FallbackPool', 'RewriteResult', 'RewriteOutcome']
