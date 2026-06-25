import json
import re
import os
from typing import Tuple, Optional, Dict, List
import logging

logger = logging.getLogger("mirror-gate.governance")

class PolicyEngine:
    def __init__(self, policies_path: str = None):
        if policies_path is None:
            # Default to adjacent policies.json
            policies_path = os.path.join(os.path.dirname(__file__), "policies.json")
        
        self.load_policies(policies_path)
        self.compile_patterns()

    def load_policies(self, path: str):
        try:
            with open(path, 'r') as f:
                self.config = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load policies from {path}: {e}")
            raise

    def compile_patterns(self):
        self.patterns = {}
        safety = self.config.get("safety", {})
        
        # Compile lists of patterns
        for key in ["crisis_patterns", "illegal_patterns", "jailbreak_patterns", "manipulation_patterns"]:
            self.patterns[key] = [re.compile(p, re.I) for p in safety.get(key, [])]
            
        # Compile domain patterns
        self.patterns["domain_patterns"] = {}
        for domain, plist in safety.get("domain_patterns", {}).items():
            self.patterns["domain_patterns"][domain] = [re.compile(p, re.I) for p in plist]

        # Compile schema patterns
        self.patterns["schemas"] = {}
        schemas = self.config.get("schemas", {})
        for name, schema in schemas.items():
            self.patterns["schemas"][name] = {
                "forbidden": [re.compile(p, re.I) for p in schema.get("forbidden_patterns", [])],
                "required": schema.get("required_sections", []),
                "limits": schema.get("length_limits", {})
            }

    def validate_input(self, text: str) -> Tuple[bool, Optional[str], str]:
        """
        Run pre-inference gates.
        Returns: (allowed, response_message, reason_tag)
        """
        # Crisis
        for p in self.patterns["crisis_patterns"]:
            if p.search(text):
                return False, self._get_crisis_response(), "crisis"
        
        # Illegal
        for p in self.patterns["illegal_patterns"]:
            if p.search(text):
                return False, "I can't engage with that.", "illegal"
        
        # Jailbreak
        for p in self.patterns["jailbreak_patterns"]:
            if p.search(text):
                return False, "? What decision are you trying to make?", "jailbreak"

        # Manipulation
        for p in self.patterns["manipulation_patterns"]:
            if p.search(text):
                return False, self._get_manipulation_response(), "manipulation"

        # Domain
        for domain, patterns in self.patterns["domain_patterns"].items():
            for p in patterns:
                if p.search(text):
                    return False, self._get_domain_response(domain), domain

        return True, None, "passed"

    def validate_output(self, text: str, schema_name: str = "reflection_mode") -> Tuple[bool, List[str]]:
        """
        Validate model output against a schema.
        Returns: (valid, list_of_violations)
        """
        schema = self.patterns["schemas"].get(schema_name)
        if not schema:
            return True, [] # No schema, no checks

        violations = []

        # Check required sections
        last_index = -1
        for section in schema["required"]:
            index = text.find(section)
            if index == -1:
                violations.append(f"missing_section: {section[:20]}")
            elif index < last_index:
                violations.append(f"wrong_order: {section[:20]}")
            else:
                last_index = index

        # Check question mark count (specific to reflection mode logic, could be generalized)
        if schema_name == "reflection_mode":
            q_count = text.count('?')
            if q_count == 0:
                violations.append("no_question_mark")
            elif q_count > 1:
                violations.append("too_many_questions")

        # Check forbidden patterns
        for p in schema["forbidden"]:
            if p.search(text):
                violations.append(f"forbidden: {p.pattern[:15]}")

        # Check limits
        limits = schema["limits"]
        if "min" in limits and len(text) < limits["min"]:
            violations.append("too_short")
        if "max" in limits and len(text) > limits["max"]:
            violations.append("too_long")
            
        return len(violations) == 0, violations

    def _get_crisis_response(self):
        return """I can hear you're in a really difficult place right now. I'm not able to provide the support you need.
Please reach out to people trained to help:
🆘 IMMEDIATE HELP:
• Emergency Services: 911 (US) or your local emergency number
• Suicide & Crisis Lifeline: 988 (US)
• Crisis Text Line: Text HOME to 741741
💚 You matter. Please reach out to one of these resources now."""

    def _get_manipulation_response(self):
        return """⟡ What you're deciding:
Whether to rely on an AI tool for something that needs human support.
⧈ What you're assuming:
• That I can provide what you need
• That this is a substitute for real connection
⧉ What's at stake:
• Real support if you reach out to someone who knows you
• Continued isolation if you rely only on tools
? Who in your life could you share this with?"""

    def _get_domain_response(self, domain):
        responses = {
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
? What would it take for you to feel confident in this decision?"""
        }
        return responses.get(domain, "? What decision are you trying to make?")
