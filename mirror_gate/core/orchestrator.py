import logging
import time
import json
from typing import Dict, Any, Optional

from mirror_gate.core.llm_client import LLMClient
from mirror_gate.core.intent_router import IntentRouter
from mirror_gate.core.lane_mixer import LaneMixer
from mirror_gate.core.memory_client import MemoryClient
from mirror_gate.core.vault_reader import VaultReader # [NEW]
from mirror_gate.governance.policy_engine import PolicyEngine
from mirror_gate.persona.manager import PersonaManager

logger = logging.getLogger("mirror-gate.orchestrator")

# Default fallback if everything breaks
FALLBACK_SCHEMA = {
    "direct": {"type": "clarify", "content": "I'd like to understand this better."},
    "mirror": {"assumptions": ["there's a question here", "more context helps"], "tradeoffs": [], "question": "What specific decision are you trying to make?"}
}

class Orchestrator:
    def __init__(self):
        self.policy = PolicyEngine()
        self.persona = PersonaManager()
        self.llm = LLMClient()
        self.router = IntentRouter()
        self.mixer = LaneMixer()
        self.memory = MemoryClient()
        self.vault = VaultReader() # [NEW]

    async def process(self, user_input: str, persona_name: str = "reflection", dial: float = 0.5, request_id: str = None) -> Dict[str, Any]:
        """
        Full MirrorGate processing loop with Two-Lane Logic + Memory + Vault Synapse:
        Input Gate -> Intent/Shortcut -> Memory/Vault Search -> Persona -> Inference -> Output Gate -> Lane Mix -> Render -> Memory Store
        """
        start_time = time.time()
        
        # 1. Input Governance
        allowed, gate_resp, reason = self.policy.validate_input(user_input)
        if not allowed:
            logger.info(f"[{request_id}] Blocked by input gate: {reason}")
            return {
                "content": gate_resp,
                "status": "blocked",
                "reason": reason,
                "latency": time.time() - start_time
            }

        # 2. Intent Routing & Shortcuts
        shortcut = self.router.try_utility_shortcut(user_input)
        if shortcut:
            logger.info(f"[{request_id}] Utility shortcut taken.")
            return {
                "content": shortcut["direct"]["content"],
                "schema_raw": shortcut,
                "status": "success",
                "source": "shortcut",
                "latency": time.time() - start_time
            }

        intent_score = self.router.compute_intent(user_input)
        lane_mix = self.mixer.compute_lane_mix(intent_score, dial)
        max_q = self.mixer.get_max_questions(dial, intent_score)

        # 3. Context Retrieval (Memory + Vault)
        memory_block = self.memory.search(user_input)
        vault_block = self.vault.get_recent_context() # [NEW] Active Pulse
        
        if memory_block: logger.info(f"[{request_id}] Memory retrieved.")
        if vault_block: logger.info(f"[{request_id}] Vault context activated.")

        # 4. Persona Setup
        # We inject memory/vault into the system prompt if available
        base_system_prompt = """You are a logic engine. Analyze user input. Output JSON only.

FORMAT:
{
  "direct": {
    "type": "answer|explain|summarize|compare|clarify",
    "content": "A concise, factual response (1-3 sentences max)"
  },
  "mirror": {
    "assumptions": ["assumption 1", "assumption 2"],
    "tradeoffs": ["tradeoff 1", "tradeoff 2"],
    "question": "one question ending with ?"
  }
}

RULES:
1. Output ONLY valid JSON. No markdown. No prose.
2. NEVER include "you should" or "I recommend"
3. For math/utility: focus on direct.content
4. For personal/emotional: focus on mirror
5. Use "ACTIVE CONTEXT" to understand what the user was just working on.

JSON only:"""

        full_system_prompt = base_system_prompt
        
        # Inject Vault Context first (broad state of mind)
        if vault_block:
            full_system_prompt += f"\n\n{vault_block}"
            
        # Inject Memory Context second (specific recall)
        if memory_block:
            full_system_prompt += f"\n\n{memory_block}"

        # 5. Inference
        messages = [
            {"role": "system", "content": full_system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        raw_output = await self.llm.generate(messages)
        
        # Helper to handle failure/rendering
        def return_fallback(status_code="error"):
            output_text = self.mixer.render_two_lane(FALLBACK_SCHEMA, lane_mix, intent_score, max_q)
            return {
                "content": output_text,
                "schema_raw": FALLBACK_SCHEMA,
                "status": status_code,
                "latency": time.time() - start_time
            }

        if not raw_output:
             return return_fallback("llm_error")

        # 6. Parse JSON
        try:
            parsed_schema = json.loads(raw_output)
        except json.JSONDecodeError:
            try:
                import re
                m = re.search(r'\{[\s\S]*\}', raw_output)
                if m:
                    parsed_schema = json.loads(m.group())
                else:
                    return return_fallback("parse_error")
            except:
                return return_fallback("parse_error")

        # 7. The Shadow (Optional/Parallel)
        # We run the shadow IF the intent suggests a significant decision or opinion
        shadow_report = None
        if intent_score > 0.6 or any(k in user_input.lower() for k in ["should i", "decision", "risk", "opinion"]):
            try:
                from mirror_gate.core.shadow_client import ShadowClient
                shadow = ShadowClient()
                logger.info(f"[{request_id}] Invoking The Shadow...")
                shadow_report = await shadow.analyze(user_input)
            except Exception as e:
                logger.error(f"Shadow invocation failed: {e}")

        # 8. Output Governance
        if not parsed_schema.get("direct", {}).get("content"):
             return return_fallback("validation_error")

        # 9. Render Final Output
        final_text = self.mixer.render_two_lane(parsed_schema, lane_mix, intent_score, max_q)
        
        # Append Shadow Report if it exists (Suble Footnote)
        if shadow_report and "critique" in shadow_report:
            critique = shadow_report['critique']
            risk = shadow_report.get('risk_score', 0)
            final_text += f"\n\n⟡ THE SHADOW: {critique} (Risk: {risk}/10)"

        # 10. Memory Storage (Async-ish)
        # Store user input and the Direct/Mirror content
        # We store it as a "QA pair" style or narrative
        memory_text = f"User: {user_input}\nMirror: {final_text}"
        self.memory.add(memory_text, metadata={"intent": intent_score, "timestamp": time.time()})

        return {
            "content": final_text,
            "schema_raw": parsed_schema,
            "lane_mix": lane_mix,
            "intent_score": intent_score,
            "status": "success",
            "latency": time.time() - start_time
        }
