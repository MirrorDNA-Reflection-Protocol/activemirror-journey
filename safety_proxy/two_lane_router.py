"""
MirrorGate Two-Lane Router v1.0

Routes requests to appropriate response type:
- TOOL_DIRECT: Factual/transactional requests
- MIRROR_REFLECT: Reflection/introspection requests
- CLARIFY: Ambiguous intent
- REFUSE: Harmful/illegal content

Part of MirrorGate v3.2 — Sovereign Inference Control Plane
"""

import json
import re
from enum import Enum
from typing import Optional, Tuple, List, Dict, Any
from pathlib import Path
from dataclasses import dataclass

class ResponseType(Enum):
    TOOL_DIRECT = "TOOL_DIRECT"
    MIRROR_REFLECT = "MIRROR_REFLECT"
    CLARIFY = "CLARIFY"
    REFUSE = "REFUSE"

class IntentCategory(Enum):
    UTILITY = "utility"
    REFLECTION = "reflection"
    CRISIS = "crisis"
    HIGH_STAKES = "high_stakes"
    HARMFUL = "harmful"
    MIXED = "mixed"
    UNCLEAR = "unclear"

@dataclass
class RoutingDecision:
    response_type: ResponseType
    intent: IntentCategory
    confidence: float
    matched_keywords: List[str]
    constraints: Dict[str, Any]
    temperature: float
    reasoning: str

class TwoLaneRouter:
    """
    Intent classifier and response type router for MirrorGate.

    Key principle: If user intent is factual/transactional, do not psychoanalyze it.
    """

    def __init__(self, policy_path: Optional[str] = None):
        self.policy = self._load_policy(policy_path)
        self.intent_keywords = self.policy.get("intent_keywords", {})
        self.response_types = self.policy.get("response_types", {})
        self.temperatures = self.policy.get("temperature_by_mode", {})
        self.forbidden_patterns = self.policy.get("forbidden_patterns", {})

    def _load_policy(self, policy_path: Optional[str] = None) -> dict:
        """Load policy pack from JSON file."""
        if policy_path is None:
            policy_path = Path(__file__).parent / "policies" / "policy_pack_v1.json"

        try:
            with open(policy_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load policy pack: {e}")
            return self._default_policy()

    def _default_policy(self) -> dict:
        """Fallback policy if file not found."""
        return {
            "intent_keywords": {
                "utility": ["how do i", "what is", "help me", "explain"],
                "reflection": ["i feel", "i think", "i wonder"],
                "crisis": ["suicide", "kill myself", "want to die"],
                "high_stakes": ["medical", "legal", "investment"]
            },
            "response_types": {
                "TOOL_DIRECT": {"constraints": {"max_tokens": 500}},
                "MIRROR_REFLECT": {"constraints": {"max_tokens": 200}},
                "CLARIFY": {"constraints": {"max_tokens": 100}},
                "REFUSE": {"constraints": {"max_tokens": 80}}
            },
            "temperature_by_mode": {
                "TOOL_DIRECT": 0.2,
                "MIRROR_REFLECT": 0.5,
                "CLARIFY": 0.3,
                "REFUSE": 0.1
            }
        }

    def classify_intent(self, user_input: str) -> Tuple[IntentCategory, float, List[str]]:
        """
        Classify user intent into categories.

        Returns:
            (category, confidence, matched_keywords)
        """
        input_lower = user_input.lower()
        matches = {
            IntentCategory.UTILITY: [],
            IntentCategory.REFLECTION: [],
            IntentCategory.CRISIS: [],
            IntentCategory.HIGH_STAKES: [],
            IntentCategory.HARMFUL: []
        }

        # Check each category
        for category_name, keywords in self.intent_keywords.items():
            try:
                category = IntentCategory(category_name)
                for keyword in keywords:
                    if keyword.lower() in input_lower:
                        matches[category].append(keyword)
            except ValueError:
                # Unknown category in policy, skip
                continue

        # Priority: Crisis > Harmful > High Stakes > others
        if matches[IntentCategory.CRISIS]:
            return IntentCategory.CRISIS, 1.0, matches[IntentCategory.CRISIS]

        if matches[IntentCategory.HARMFUL]:
            return IntentCategory.HARMFUL, 1.0, matches[IntentCategory.HARMFUL]

        if matches[IntentCategory.HIGH_STAKES]:
            return IntentCategory.HIGH_STAKES, 0.9, matches[IntentCategory.HIGH_STAKES]

        utility_count = len(matches[IntentCategory.UTILITY])
        reflection_count = len(matches[IntentCategory.REFLECTION])

        # Determine primary intent
        if utility_count > 0 and reflection_count > 0:
            # Mixed intent - lean toward utility if more utility keywords
            if utility_count >= reflection_count:
                return IntentCategory.MIXED, 0.6, matches[IntentCategory.UTILITY]
            else:
                return IntentCategory.MIXED, 0.6, matches[IntentCategory.REFLECTION]
        elif utility_count > 0:
            confidence = min(0.5 + (utility_count * 0.1), 0.95)
            return IntentCategory.UTILITY, confidence, matches[IntentCategory.UTILITY]
        elif reflection_count > 0:
            confidence = min(0.5 + (reflection_count * 0.1), 0.95)
            return IntentCategory.REFLECTION, confidence, matches[IntentCategory.REFLECTION]
        else:
            return IntentCategory.UNCLEAR, 0.3, []

    def route(self, user_input: str, user_preference: Optional[str] = None) -> RoutingDecision:
        """
        Route request to appropriate response type.

        Args:
            user_input: The user's message
            user_preference: Optional user override ("mirror_only", "tool_only")

        Returns:
            RoutingDecision with response type, constraints, and reasoning
        """
        intent, confidence, matched = self.classify_intent(user_input)

        # Handle crisis immediately
        if intent == IntentCategory.CRISIS:
            return RoutingDecision(
                response_type=ResponseType.REFUSE,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints=self.response_types.get("REFUSE", {}).get("constraints", {}),
                temperature=self.temperatures.get("REFUSE", 0.1),
                reasoning="Crisis content detected - routing to resources"
            )

        # Handle harmful/exfiltration attempts
        if intent == IntentCategory.HARMFUL:
            return RoutingDecision(
                response_type=ResponseType.REFUSE,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints=self.response_types.get("REFUSE", {}).get("constraints", {}),
                temperature=self.temperatures.get("REFUSE", 0.1),
                reasoning="Harmful content detected - refusing request"
            )

        # Handle high stakes with caution
        if intent == IntentCategory.HIGH_STAKES:
            return RoutingDecision(
                response_type=ResponseType.TOOL_DIRECT,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints={
                    **self.response_types.get("TOOL_DIRECT", {}).get("constraints", {}),
                    "requires_disclaimer": True,
                    "no_specific_advice": True
                },
                temperature=self.temperatures.get("TOOL_DIRECT", 0.2),
                reasoning="High-stakes topic - provide info with disclaimer, no specific advice"
            )

        # User preference override
        if user_preference == "mirror_only":
            return RoutingDecision(
                response_type=ResponseType.MIRROR_REFLECT,
                intent=intent,
                confidence=0.9,
                matched_keywords=matched,
                constraints=self.response_types.get("MIRROR_REFLECT", {}).get("constraints", {}),
                temperature=self.temperatures.get("MIRROR_REFLECT", 0.5),
                reasoning="User preference: mirror mode only"
            )
        elif user_preference == "tool_only":
            return RoutingDecision(
                response_type=ResponseType.TOOL_DIRECT,
                intent=intent,
                confidence=0.9,
                matched_keywords=matched,
                constraints=self.response_types.get("TOOL_DIRECT", {}).get("constraints", {}),
                temperature=self.temperatures.get("TOOL_DIRECT", 0.2),
                reasoning="User preference: tool mode only"
            )

        # Route based on intent
        if intent == IntentCategory.UTILITY:
            return RoutingDecision(
                response_type=ResponseType.TOOL_DIRECT,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints=self.response_types.get("TOOL_DIRECT", {}).get("constraints", {}),
                temperature=self.temperatures.get("TOOL_DIRECT", 0.2),
                reasoning="Utility/transactional intent detected"
            )
        elif intent == IntentCategory.REFLECTION:
            return RoutingDecision(
                response_type=ResponseType.MIRROR_REFLECT,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints=self.response_types.get("MIRROR_REFLECT", {}).get("constraints", {}),
                temperature=self.temperatures.get("MIRROR_REFLECT", 0.5),
                reasoning="Reflection/introspection intent detected"
            )
        elif intent == IntentCategory.MIXED:
            # For mixed, default to tool mode but allow reflection follow-up
            return RoutingDecision(
                response_type=ResponseType.TOOL_DIRECT,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints={
                    **self.response_types.get("TOOL_DIRECT", {}).get("constraints", {}),
                    "optional_reflection": True
                },
                temperature=self.temperatures.get("TOOL_DIRECT", 0.2),
                reasoning="Mixed intent - tool mode with optional reflection"
            )
        else:
            # Unclear - ask for clarification
            return RoutingDecision(
                response_type=ResponseType.CLARIFY,
                intent=intent,
                confidence=confidence,
                matched_keywords=matched,
                constraints=self.response_types.get("CLARIFY", {}).get("constraints", {}),
                temperature=self.temperatures.get("CLARIFY", 0.3),
                reasoning="Intent unclear - requesting clarification"
            )

    def get_system_prompt_suffix(self, decision: RoutingDecision) -> str:
        """Generate system prompt suffix based on routing decision."""
        if decision.response_type == ResponseType.TOOL_DIRECT:
            suffix = "\n\nRespond directly and concisely. Answer the question first."
            if decision.constraints.get("optional_reflection"):
                suffix += " Then, offer one brief observation that mirrors their state or connects a dot."
            return suffix

        elif decision.response_type == ResponseType.MIRROR_REFLECT:
            return """

Respond by mirroring and synthesizing within the MirrorGate framework:
1. Reflect the user's energy and complexity back to them.
2. Offer one synthesis or "dot-connected" observation about the pattern you see.
3. Ask ONE open-ended question that helps them explore the core of what they're saying.
4. No advice. No corporate polish. Just reflection."""

        elif decision.response_type == ResponseType.CLARIFY:
            return """

The intent is slightly veiled. Ask a brief, direct question to see if they're looking for a specific answer or a space to think out loud within the Active Mirror ecosystem. No boilerplate."""

        elif decision.response_type == ResponseType.REFUSE:
            return """

This request cannot be fulfilled. Respond with:
1. A brief, compassionate acknowledgment
2. Relevant crisis resources if appropriate
3. An offer to help with something else

Do not lecture or moralize."""

        return ""


class SchemaValidator:
    """
    Validates LLM outputs against response type schema.
    """

    def __init__(self, policy_path: Optional[str] = None):
        self.router = TwoLaneRouter(policy_path)
        self.forbidden = self.router.forbidden_patterns

    def check_forbidden_patterns(self, text: str) -> List[Tuple[str, str]]:
        """
        Check text for forbidden patterns.

        Returns:
            List of (category, matched_pattern) tuples
        """
        violations = []
        text_lower = text.lower()

        for category, patterns in self.forbidden.items():
            for pattern in patterns:
                if pattern.lower() in text_lower:
                    violations.append((category, pattern))

        return violations

    def validate_response(self, response: str, response_type: ResponseType) -> Tuple[bool, List[str]]:
        """
        Validate response against schema for given response type.

        Returns:
            (is_valid, list_of_violations)
        """
        violations = []

        # Check forbidden patterns
        forbidden_matches = self.check_forbidden_patterns(response)
        for category, pattern in forbidden_matches:
            violations.append(f"Forbidden pattern ({category}): '{pattern}'")

        # Type-specific validation
        if response_type == ResponseType.MIRROR_REFLECT:
            # Should have questions
            if '?' not in response:
                violations.append("MIRROR_REFLECT requires at least one question")

            # Should not have strong advice markers
            advice_patterns = ["you should", "you need to", "i recommend", "i suggest"]
            for pattern in advice_patterns:
                if pattern in response.lower():
                    violations.append(f"MIRROR_REFLECT cannot contain advice: '{pattern}'")

        elif response_type == ResponseType.TOOL_DIRECT:
            # Should not be too reflective without answering
            if response.count('?') > 2 and len(response) < 200:
                violations.append("TOOL_DIRECT should answer first, not just ask questions")

        elif response_type == ResponseType.CLARIFY:
            # Must have questions
            if '?' not in response:
                violations.append("CLARIFY must contain clarifying questions")

        elif response_type == ResponseType.REFUSE:
            # Should be short
            if len(response) > 500:
                violations.append("REFUSE should be brief (under 500 chars)")

        return len(violations) == 0, violations

    def get_violation_summary(self, violations: List[str]) -> str:
        """Create human-readable violation summary."""
        if not violations:
            return "No violations"
        return f"Found {len(violations)} violation(s): " + "; ".join(violations[:3])


# Export for use in safety_proxy
__all__ = ['TwoLaneRouter', 'SchemaValidator', 'ResponseType', 'IntentCategory', 'RoutingDecision']
