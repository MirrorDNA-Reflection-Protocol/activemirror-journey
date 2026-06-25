"""
Smart Model Router v1.0
Selects optimal LLM based on query characteristics.

Routes to:
- Fast model (Llama 3.3 70B): Simple queries, quick answers
- Reasoning model (DeepSeek): Code, math, complex reasoning
- Creative model (Mistral): Writing, brainstorming, creative tasks
- Vision model (Llama 4 Scout): Image analysis

Part of MirrorGate v3.2 — Sovereign Inference Control Plane
"""

import os
import re
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Tuple

class ModelTier(Enum):
    FAST = "fast"           # Quick, simple responses
    REASONING = "reasoning"  # Code, math, logic
    CREATIVE = "creative"    # Writing, brainstorming
    VISION = "vision"        # Image analysis
    IMAGE_GEN = "image_gen"  # Image generation


@dataclass
class ModelConfig:
    name: str
    provider: str
    model_id: str
    api_base: str
    tier: ModelTier
    max_tokens: int
    temperature_default: float


# Model configurations
MODELS = {
    ModelTier.FAST: ModelConfig(
        name="Llama 3.3 70B",
        provider="Groq",
        model_id="llama-3.3-70b-versatile",
        api_base="https://api.groq.com/openai/v1",
        tier=ModelTier.FAST,
        max_tokens=800,
        temperature_default=0.3
    ),
    ModelTier.REASONING: ModelConfig(
        name="DeepSeek R1",
        provider="DeepSeek",
        model_id="deepseek-reasoner",
        api_base="https://api.deepseek.com/v1",
        tier=ModelTier.REASONING,
        max_tokens=1200,
        temperature_default=0.1
    ),
    ModelTier.CREATIVE: ModelConfig(
        name="Mistral Large",
        provider="Mistral",
        model_id="mistral-large-latest",
        api_base="https://api.mistral.ai/v1",
        tier=ModelTier.CREATIVE,
        max_tokens=1000,
        temperature_default=0.7
    ),
    ModelTier.VISION: ModelConfig(
        name="Llama 4 Scout",
        provider="Groq",
        model_id="meta-llama/llama-4-scout-17b-16e-instruct",
        api_base="https://api.groq.com/openai/v1",
        tier=ModelTier.VISION,
        max_tokens=800,
        temperature_default=0.3
    ),
    ModelTier.IMAGE_GEN: ModelConfig(
        name="FLUX Schnell",
        provider="Pollinations",
        model_id="flux",
        api_base="https://pollinations.ai",
        tier=ModelTier.IMAGE_GEN,
        max_tokens=0,  # Not applicable for image gen
        temperature_default=0.0
    )
}

# Pattern matching for query classification
PATTERNS = {
    ModelTier.REASONING: [
        # Code patterns
        r'\b(code|function|class|method|bug|error|debug|implement|algorithm)\b',
        r'\b(python|javascript|typescript|java|rust|go|sql|html|css)\b',
        r'\b(api|endpoint|database|query|regex|parse)\b',
        # Math/logic patterns
        r'\b(calculate|solve|equation|formula|math|proof|derive)\b',
        r'\b(analyze|compare|evaluate|optimize|efficiency)\b',
        r'\b(step by step|explain how|walk me through)\b',
    ],
    ModelTier.CREATIVE: [
        # Writing patterns
        r'\b(write|draft|compose|brainstorm|ideas)\b',
        r'\b(story|poem|essay|article|blog|script|dialogue)\b',
        r'\b(creative|imaginative|unique|original)\b',
        # Brainstorming patterns
        r'\b(what if|imagine|suppose|possibilities|alternatives)\b',
        r'\b(inspire|motivation|perspective|viewpoint)\b',
        # Reflection patterns — Creative tier handles introspection best
        r'\bi (feel|felt|am feeling)\b',
        r'\bi\'?m (stuck|lost|confused|overwhelmed|anxious|scared|afraid|lonely|sad|angry|frustrated)\b',
        r'\bwhy do i (keep|always|never)\b',
        r'\bwhat\'?s wrong with me\b',
        r'\bi don\'?t know (what|how|why|if)\b',
        r'\bhelp me understand (myself|why i|what i)\b',
        r'\bi (need|want) to (change|grow|heal|let go|move on)\b',
        r'\b(self-worth|self-doubt|imposter|shame|guilt|grief|loss)\b',
        r'\b(relationship|intimacy|connection|loneliness|isolation)\b',
        r'\b(reflect|reflecting|introspect|journal)\b',
        r'\b(meaning|purpose|identity|who am i)\b',
    ],
    ModelTier.IMAGE_GEN: [
        # Direct image generation requests
        r'\b(generate|create|make|draw|paint|render|design)\s+(an?\s+)?(image|picture|photo|artwork|illustration|portrait|scene)\b',
        r'\b(image|picture|photo|artwork|illustration)\s+of\b',
        r'\bshow me (an?\s+)?(image|picture|visual)\b',
        r'\b(visualize|depict|illustrate)\b',
        r'\bcreate\s+(a\s+)?visual\b',
        r'\bdraw\s+(me\s+)?(a|an)\b',
    ]
}

# Signals for atmosphere/resonance detection
ATMOSPHERE_SIGNALS = {
    "focus": ["concentrate", "focus", "attention", "deep work", "clarity"],
    "flow": ["creative", "inspired", "ideas flowing", "momentum", "zone"],
    "relief": ["finally", "resolved", "figured out", "breakthrough", "solved"],
    "surge": ["excited", "energized", "pumped", "ready", "let's go"],
    "calm": ["peaceful", "relaxed", "reflecting", "contemplating"],
    "curiosity": ["wondering", "curious", "what if", "how does", "why"]
}


@dataclass
class RouterDecision:
    model: ModelConfig
    reasoning: str
    confidence: float
    atmosphere: str
    query_type: str


class SmartRouter:
    """
    Intelligently routes queries to the optimal model.
    """

    def __init__(self):
        self.available_apis = self._check_available_apis()

    def _check_available_apis(self) -> dict:
        """Check which APIs have keys configured."""
        return {
            "groq": bool(os.getenv("GROQ_API_KEY")),
            "deepseek": bool(os.getenv("DEEPSEEK_API_KEY")),
            "mistral": bool(os.getenv("MISTRAL_API_KEY")),
        }

    def _detect_atmosphere(self, text: str) -> str:
        """Detect emotional/cognitive atmosphere from text."""
        text_lower = text.lower()
        scores = {}

        for atmosphere, signals in ATMOSPHERE_SIGNALS.items():
            score = sum(1 for s in signals if s in text_lower)
            if score > 0:
                scores[atmosphere] = score

        if scores:
            return max(scores, key=scores.get)
        return "neutral"

    def _classify_query(self, text: str, has_image: bool = False) -> Tuple[ModelTier, str, float]:
        """
        Classify query to determine optimal model tier.

        Returns:
            (tier, query_type, confidence)
        """
        if has_image:
            return ModelTier.VISION, "image_analysis", 1.0

        text_lower = text.lower()

        # Check image generation patterns FIRST (highest priority)
        image_gen_score = 0
        for pattern in PATTERNS[ModelTier.IMAGE_GEN]:
            if re.search(pattern, text_lower):
                image_gen_score += 1

        if image_gen_score >= 1:
            return ModelTier.IMAGE_GEN, "image_generation", min(0.7 + image_gen_score * 0.1, 0.95)

        # Check reasoning patterns
        reasoning_score = 0
        for pattern in PATTERNS[ModelTier.REASONING]:
            if re.search(pattern, text_lower):
                reasoning_score += 1

        # Check creative patterns
        creative_score = 0
        for pattern in PATTERNS[ModelTier.CREATIVE]:
            if re.search(pattern, text_lower):
                creative_score += 1

        # Determine tier
        if reasoning_score >= 2:
            return ModelTier.REASONING, "code_or_reasoning", min(0.5 + reasoning_score * 0.15, 0.95)
        elif creative_score >= 2:
            return ModelTier.CREATIVE, "creative_writing", min(0.5 + creative_score * 0.15, 0.95)
        elif reasoning_score == 1:
            return ModelTier.REASONING, "technical_question", 0.6
        elif creative_score == 1:
            return ModelTier.CREATIVE, "light_creative", 0.5
        else:
            return ModelTier.FAST, "general_query", 0.7

    def _get_fallback_model(self, preferred_tier: ModelTier) -> ModelConfig:
        """Get fallback model if preferred tier unavailable."""
        # Always fall back to Groq (fast) if others unavailable
        if preferred_tier == ModelTier.REASONING and not self.available_apis.get("deepseek"):
            return MODELS[ModelTier.FAST]
        elif preferred_tier == ModelTier.CREATIVE and not self.available_apis.get("mistral"):
            return MODELS[ModelTier.FAST]
        return MODELS[preferred_tier]

    def route(self, query: str, has_image: bool = False) -> RouterDecision:
        """
        Route query to optimal model.

        Args:
            query: User's message
            has_image: Whether query includes an image

        Returns:
            RouterDecision with model config and metadata
        """
        tier, query_type, confidence = self._classify_query(query, has_image)
        atmosphere = self._detect_atmosphere(query)

        # Get model (with fallback if API unavailable)
        model = self._get_fallback_model(tier)

        # Build reasoning explanation
        reasoning_parts = []
        if has_image:
            reasoning_parts.append("Image detected")
        if tier == ModelTier.REASONING:
            reasoning_parts.append("Technical/reasoning patterns found")
        elif tier == ModelTier.CREATIVE:
            reasoning_parts.append("Creative intent detected")
        else:
            reasoning_parts.append("General query")

        if model.tier != tier:
            reasoning_parts.append(f"(fallback from {tier.value})")

        reasoning = " → ".join(reasoning_parts) + f" → {model.name}"

        return RouterDecision(
            model=model,
            reasoning=reasoning,
            confidence=confidence,
            atmosphere=atmosphere,
            query_type=query_type
        )

    def get_api_key(self, model: ModelConfig) -> Optional[str]:
        """Get API key for model's provider."""
        provider_keys = {
            "Groq": "GROQ_API_KEY",
            "DeepSeek": "DEEPSEEK_API_KEY",
            "Mistral": "MISTRAL_API_KEY",
            "OpenAI": "OPENAI_API_KEY",
            "Google": "GOOGLE_API_KEY",
        }
        key_name = provider_keys.get(model.provider)
        return os.getenv(key_name) if key_name else None

    def get_fallback_chain(self, failed_model: ModelConfig) -> list:
        """
        Return ordered list of (ModelConfig, api_key) fallbacks,
        skipping the model that just failed.
        Cascade: Groq → DeepSeek → Mistral → (stop).
        """
        chain_order = [ModelTier.FAST, ModelTier.REASONING, ModelTier.CREATIVE]
        results = []
        for tier in chain_order:
            candidate = MODELS.get(tier)
            if not candidate:
                continue
            if candidate.model_id == failed_model.model_id:
                continue  # skip the one that just failed
            key = self.get_api_key(candidate)
            if key:
                results.append((candidate, key))
        return results


# Singleton instance
smart_router = SmartRouter()


__all__ = ['SmartRouter', 'smart_router', 'ModelTier', 'ModelConfig', 'RouterDecision', 'MODELS']
