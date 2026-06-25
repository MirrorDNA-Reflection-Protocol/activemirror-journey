import os
import httpx
import logging
from typing import Optional, List, Dict

logger = logging.getLogger("mirror-gate.core")

class LLMClient:
    def __init__(self, api_key: str = None, model: str = "openai/gpt-oss-20b"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set. LLM calls will fail.")

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.4, max_tokens: int = 400, timeout: float = 15.0) -> Optional[str]:
        if not self.api_key:
            logger.error("Cannot generate: Missing API Key")
            return None

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Groq API error: {response.status_code} - {response.text}")
                    return None
                
                data = response.json()
                return data["choices"][0]["message"]["content"]
        
        except Exception as e:
            logger.error(f"Groq API exception: {e}")
            return None
