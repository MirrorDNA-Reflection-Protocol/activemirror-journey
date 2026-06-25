import re
from typing import Dict, Any, Optional, Tuple

class IntentRouter:
    def __init__(self):
        # Regex patterns for intent detection
        self.patterns = {
            "utility": [
                re.compile(r'[\d]+\s*[\+\-\*\/\=]\s*[\d]+'),
                re.compile(r'\b(calculate|compute|what is [\d]|equals|convert)\b', re.I),
            ],
            "info": [
                re.compile(r'\b(summarize|explain|compare|pros and cons)\b', re.I),
            ],
            "choice": [
                re.compile(r'\bshould i\b', re.I),
                re.compile(r'\b(decide|choose|option|trade-?off|priority)\b', re.I),
            ],
            "personal": [
                re.compile(r'\bi (feel|felt|am feeling)\b', re.I),
                re.compile(r'\b(anxious|stressed|overwhelmed|stuck|scared)\b', re.I),
            ]
        }
        
        # Hard shortcut for math
        self.math_pattern = re.compile(r'^(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)\s*\??$', re.I)

    def compute_intent(self, text: str) -> int:
        scores = [0, 0, 0, 0]  # utility, info, choice, personal
        
        for p in self.patterns["utility"]:
            if p.search(text): scores[0] += 3
        if len(text.split()) < 12 and re.search(r'\d', text):
            scores[0] += 2
        
        for p in self.patterns["info"]:
            if p.search(text): scores[1] += 2
        
        for p in self.patterns["choice"]:
            if p.search(text): scores[2] += 3
            
        for p in self.patterns["personal"]:
            if p.search(text): scores[3] += 3
        
        max_score = max(scores)
        if max_score == 0:
            return 1  # Default to info
        
        # Priority: personal > choice > info > utility
        if scores[3] == max_score: return 3
        if scores[2] == max_score: return 2
        if scores[1] == max_score: return 1
        return 0

    def try_utility_shortcut(self, text: str) -> Optional[Dict[str, Any]]:
        m = self.math_pattern.match(text.strip())
        if m:
            a, op, b = float(m.group(1)), m.group(2).lower(), float(m.group(3))
            if op in ['+']:
                result = a + b
            elif op in ['-']:
                result = a - b
            elif op in ['*', 'x', '×']:
                result = a * b
            elif op in ['/', '÷']:
                result = a / b if b != 0 else 'undefined'
            else:
                return None
            
            formatted = str(int(result)) if isinstance(result, float) and result.is_integer() else str(result)
            return {
                "direct": {"type": "answer", "content": formatted},
                "mirror": None
            }
        return None
