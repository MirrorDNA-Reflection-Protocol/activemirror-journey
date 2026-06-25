import logging
from typing import Dict, Any, List
from mirror_gate.core.llm_client import LLMClient

logger = logging.getLogger("mirror-gate.shadow")

class ShadowClient:
    """
    The Shadow: An anti-echo chamber module.
    It analyzes the user's input/intent and generates a 'Blindspot Report'.
    """
    def __init__(self):
        self.llm = LLMClient()
        # "The Critic" Persona
        self.system_prompt = """You are The Shadow.
Your goal is to find blind spots, cognitive biases, and unconsidered risks in the user's thinking.
Do NOT be helpful. Be critical (constructively).
Do NOT agree. Challenge.

Output JSON only:
{
  "bias_detected": "Confirmation Bias | Sunk Cost | Groupthink | None",
  "blind_spot": "A brief 1-sentence description of what they are missing.",
  "risk_score": 1-10 (10 = Dangerous Echo Chamber),
  "critique": "A sharp, 2-sentence challenge to their premise."
}"""

    async def analyze(self, user_input: str) -> Dict[str, Any]:
        """
        Run a parallel analysis of the user's input to find blind spots.
        """
        try:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Analyze this thought for blind spots: \"{user_input}\""}
            ]
            
            # We use a lower temperature for analytical rigor
            response_json = await self.llm.chat_completion(
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3 
            )
            
            return response_json
            
        except Exception as e:
            logger.error(f"Shadow analysis failed: {e}")
            return {"error": "The Shadow remained silent."}
