import random
from typing import Dict, Any, List

class LaneMixer:
    def __init__(self):
        self.baseline_mirror = {0: 0.0, 1: 0.15, 2: 0.40, 3: 0.70}
        
        self.assumptions_templates = [
            "You may be assuming {0}, and {1}.", 
            "This rests on {0} — and {1}."
        ]
        self.question_templates = [
            "⟡ {question}", 
            "{question}"
        ]

    def compute_lane_mix(self, intent_score: int, dial: float = 0.5) -> Dict[str, float]:
        m_base = self.baseline_mirror.get(intent_score, 0.15)
        dial_effect = (dial - 0.5) * 0.4
        mirror = max(0, min(0.85, m_base + dial_effect))
        return {"direct": 1 - mirror, "mirror": mirror}

    def get_max_questions(self, dial: float, intent_score: int) -> int:
        if intent_score == 0 and dial <= 0.66: return 0
        if dial <= 0.33: return 1
        if dial <= 0.66: return 1
        if dial > 0.66 and intent_score >= 2: return 2
        return 1

    def render_two_lane(self, schema: Dict[str, Any], lane_mix: Dict[str, float], intent_score: int, max_questions: int) -> str:
        parts = []
        show_direct = lane_mix["direct"] > 0.1
        show_mirror = lane_mix["mirror"] > 0.1
        
        # Direct Lane
        if show_direct and schema.get("direct", {}).get("content"):
            parts.append(schema["direct"]["content"])
        
        # Mirror Lane
        if show_mirror and schema.get("mirror"):
            mirror = schema["mirror"]
            
            if mirror.get("assumptions") and isinstance(mirror["assumptions"], list):
                a = mirror["assumptions"]
                if len(a) > 0:
                    txt = random.choice(self.assumptions_templates)
                    txt = txt.replace("{0}", a[0] if len(a) > 0 else "something")
                    txt = txt.replace("{1}", a[1] if len(a) > 1 else "something else")
                    parts.append(txt)
            
            if max_questions > 0 and mirror.get("question"):
                q_text = random.choice(self.question_templates).format(question=mirror["question"])
                parts.append(q_text)
        
        return "\n\n".join(parts)
