"""
MirrorGate Model Router v1.0
Smart routing across multiple models for ultimate experience.

Routes based on:
- Query complexity → Simple = Groq (fast), Complex = DeepSeek (reasoning)
- Privacy hints → "confidential/private" = Mac Mini (local)
- Creative tasks → Mistral (European, good at creative)
- Fallback chain → If one fails, try next

Part of MirrorGate v3.3 — Ultimate Reflection Experience
"""

import re
from enum import Enum
from typing import Optional, List, Tuple, Dict, Any, Union
from dataclasses import dataclass

class ModelProvider(Enum):
    GROQ = "groq"           # Llama 3.3 70B - Fast, free, general
    DEEPSEEK = "deepseek"   # DeepSeek V3 - Best reasoning
    MISTRAL = "mistral"     # Mistral Large - Creative, European
    OPENAI = "openai"       # GPT-4o Mini - Frontier fallback
    GOOGLE = "google"       # Gemini 2.0 Flash - Free Vision, Large Context
    LOCAL = "local"         # Mac Mini M4 Ollama - Sovereign

class QueryCategory(Enum):
    QUICK_FACT = "quick_fact"       # Simple questions, lookups
    REASONING = "reasoning"          # Math, logic, code, analysis
    CREATIVE = "creative"            # Writing, brainstorming, stories
    CONVERSATIONAL = "conversational" # Chat, casual, general
    PRIVATE = "private"              # Confidential, personal
    REFLECTION = "reflection"        # Introspection, feelings
    VISUAL = "visual"                # Image analysis, multimodal

@dataclass
class ModelRoute:
    provider: ModelProvider
    model_name: str
    model_id: str
    temperature: float
    max_tokens: int
    reasoning: str
    atmosphere: str = "calm"  # Default atmosphere
    fallback: Optional['ModelRoute'] = None

# ═══════════════════════════════════════════════════════════════
# MODEL CONFIGURATIONS
# ═══════════════════════════════════════════════════════════════

MODELS = {
    ModelProvider.GROQ: {
        "name": "Llama 3.3 70B",
        "id": "llama-3.3-70b-versatile",
        "api_base": "https://api.groq.com/openai/v1",
        "env_key": "GROQ_API_KEY",
        "strengths": ["fast", "free", "general"],
        "default_temp": 0.7,
        "max_tokens": 800
    },
    ModelProvider.DEEPSEEK: {
        "name": "DeepSeek V3",
        "id": "deepseek-chat",
        "api_base": "https://api.deepseek.com",
        "env_key": "DEEPSEEK_API_KEY",
        "strengths": ["reasoning", "math", "code", "analysis"],
        "default_temp": 0.3,
        "max_tokens": 1200
    },
    ModelProvider.MISTRAL: {
        "name": "Mistral Large",
        "id": "mistral-large-latest",
        "api_base": "https://api.mistral.ai",
        "env_key": "MISTRAL_API_KEY",
        "strengths": ["creative", "writing", "european"],
        "default_temp": 0.8,
        "max_tokens": 1000
    },
    ModelProvider.OPENAI: {
        "name": "GPT-4o Mini",
        "id": "gpt-4o-mini",
        "api_base": "https://api.openai.com/v1",
        "env_key": "OPENAI_API_KEY",
        "strengths": ["frontier", "reliable", "fallback"],
        "default_temp": 0.7,
        "max_tokens": 800
    },
    ModelProvider.GOOGLE: {
        "name": "Gemini 2.0 Flash",
        "id": "gemini-2.0-flash-exp",
        "api_base": "https://generativelanguage.googleapis.com/v1beta",
        "env_key": "GOOGLE_API_KEY",
        "strengths": ["vision", "multimodal", "free", "large_context"],
        "default_temp": 0.7,
        "max_tokens": 2048
    },
    ModelProvider.LOCAL: {
        "name": "Qwen 2.5 7B",
        "id": "qwen2.5:7b",
        "api_base": "http://localhost:11434",
        "env_key": None,  # No key needed
        "strengths": ["private", "sovereign", "local"],
        "default_temp": 0.7,
        "max_tokens": 1000
    }
}

# ═══════════════════════════════════════════════════════════════
# QUERY CLASSIFICATION PATTERNS
# ═══════════════════════════════════════════════════════════════

CATEGORY_PATTERNS = {
    QueryCategory.QUICK_FACT: [
        r"\bwhat is\b",
        r"\bwho is\b", 
        r"\bwhen did\b",
        r"\bwhere is\b",
        r"\bdefine\b",
        r"\btell me about\b",
        r"\bwhat(?:'s| is) the\b",
    ],
    QueryCategory.REASONING: [
        r"\bexplain why\b",
        r"\banalyze\b",
        r"\bdebug\b",
        r"\bcode\b",
        r"\bprogram\b",
        r"\bcalculate\b",
        r"\bsolve\b",
        r"\bprove\b",
        r"\bderive\b",
        r"\bcompare\b",
        r"\bwhy does\b",
        r"\bhow does .+ work\b",
        r"\bstep by step\b",
        r"\bthink through\b",
        r"\bbreak down\b",
    ],
    QueryCategory.CREATIVE: [
        r"\bwrite\b",
        r"\bstory\b",
        r"\bpoem\b",
        r"\bcreate\b",
        r"\bimagine\b",
        r"\brainstorm\b",
        r"\bideas for\b",
        r"\bcome up with\b",
        r"\bdesign\b",
        r"\binvent\b",
    ],
    QueryCategory.PRIVATE: [
        r"\bconfidential\b",
        r"\bprivate\b",
        r"\bsecret\b",
        r"\bdon'?t share\b",
        r"\boffline\b",
        r"\blocal only\b",
        r"\bsovereign\b",
    ],
    QueryCategory.REFLECTION: [
        r"\bi feel\b",
        r"\bi think\b",
        r"\bi'?m (feeling|thinking|wondering)\b",
        r"\bhelp me understand myself\b",
        r"\bwhy do i\b",
        r"\bwhat does this mean for\b",
        r"\breflect\b",
    ]
}

# ═══════════════════════════════════════════════════════════════
# MODEL ROUTER
# ═══════════════════════════════════════════════════════════════

class ModelRouter:
    """
    Intelligent model router that selects the best model for each query.
    
    Routing logic:
    1. Private queries → Local (Mac Mini)
    2. Reasoning/code → DeepSeek (best at analysis)
    3. Creative → Mistral (good at writing)
    4. Quick facts → Groq (fastest)
    5. Default → Groq
    
    Fallback chain: Primary → Groq → OpenAI → Local
    """
    
    def __init__(self, available_models: Optional[List[ModelProvider]] = None):
        """
        Initialize router with available models.
        
        Args:
            available_models: List of providers with valid API keys.
                             If None, assumes all are available.
        """
        self.available = available_models or list(ModelProvider)
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Pre-compile regex patterns for efficiency."""
        self.compiled_patterns = {}
        for category, patterns in CATEGORY_PATTERNS.items():
            self.compiled_patterns[category] = [
                re.compile(p, re.IGNORECASE) for p in patterns
            ]
    
    def classify_query(self, query: str) -> Tuple[QueryCategory, float, List[str]]:
        """
        Classify query into a category.
        
        Returns:
            (category, confidence, matched_patterns)
        """
        matches = {cat: [] for cat in QueryCategory}
        
        for category, patterns in self.compiled_patterns.items():
            for pattern in patterns:
                if pattern.search(query):
                    matches[category].append(pattern.pattern)
        
        # Priority: Private > Reasoning > Creative > Reflection > Quick Fact
        if matches[QueryCategory.PRIVATE]:
            return QueryCategory.PRIVATE, 1.0, matches[QueryCategory.PRIVATE]
        
        if matches[QueryCategory.REASONING]:
            return QueryCategory.REASONING, 0.9, matches[QueryCategory.REASONING]
        
        if matches[QueryCategory.CREATIVE]:
            return QueryCategory.CREATIVE, 0.85, matches[QueryCategory.CREATIVE]
        
        if matches[QueryCategory.REFLECTION]:
            return QueryCategory.REFLECTION, 0.8, matches[QueryCategory.REFLECTION]
        
        if matches[QueryCategory.QUICK_FACT]:
            return QueryCategory.QUICK_FACT, 0.75, matches[QueryCategory.QUICK_FACT]
        
        # Default to conversational
        return QueryCategory.CONVERSATIONAL, 0.5, []
    
    def get_best_model(self, category: QueryCategory) -> ModelProvider:
        """Get best model for a category."""
        category_to_model = {
            QueryCategory.QUICK_FACT: ModelProvider.GROQ,
            QueryCategory.REASONING: ModelProvider.DEEPSEEK,
            QueryCategory.CREATIVE: ModelProvider.MISTRAL,
            QueryCategory.CONVERSATIONAL: ModelProvider.GROQ,
            QueryCategory.PRIVATE: ModelProvider.LOCAL,
            QueryCategory.REFLECTION: ModelProvider.GROQ,  # Fast, good for reflection
            QueryCategory.VISUAL: ModelProvider.OPENAI,   # Vision capable
        }
        
        preferred = category_to_model.get(category, ModelProvider.GROQ)
        
        # Check if preferred is available
        if preferred in self.available:
            return preferred
        
        # Fallback order for vision/multimodal
        if category == QueryCategory.VISUAL:
            fallback_order = [ModelProvider.GOOGLE, ModelProvider.OPENAI, ModelProvider.GROQ]
        else:
            # Fallback to Groq, then OpenAI, then Local
            fallback_order = [ModelProvider.GROQ, ModelProvider.OPENAI, ModelProvider.LOCAL]
        
        for fallback in fallback_order:
            if fallback in self.available:
                return fallback
        
        return ModelProvider.GROQ  # Ultimate fallback
    
    def route(self, query: Union[str, List[Dict[str, Any]]], user_override: Optional[str] = None) -> ModelRoute:
        """
        Route query to the best model.
        
        Args:
            query: The user's message (string or multimodal list)
            user_override: Force a specific tier ("hosted", "browser", "sovereign")
        
        Returns:
            ModelRoute with full routing information
        """
        # Detect visual query
        is_visual = False
        if isinstance(query, list):
            is_visual = any(item.get("type") == "image_url" for item in query)
        
        # User override takes precedence
        if user_override == "sovereign" and not is_visual:
            provider = ModelProvider.LOCAL
            category = QueryCategory.PRIVATE
            confidence = 1.0
            matched = ["user_override:sovereign"]
        elif is_visual:
            # Use OpenAI GPT-4o-mini for vision (Gemini quota exhausted)
            provider = ModelProvider.OPENAI
            category = QueryCategory.VISUAL
            confidence = 1.0
            matched = ["multimodal_input:image"]
        else:
            # For list queries that are actually text-only (e.g. from a past multimodal turnaround)
            text_query = query
            if isinstance(query, list):
                text_query = " ".join([b.get("text", "") for b in query if b.get("type") == "text"])
            
            category, confidence, matched = self.classify_query(text_query)
            provider = self.get_best_model(category)
        
        # Map category to atmosphere (Astrocyte Resonance)
        category_to_atmosphere = {
            QueryCategory.QUICK_FACT: "calm",
            QueryCategory.REASONING: "focus",
            QueryCategory.CREATIVE: "flow",
            QueryCategory.CONVERSATIONAL: "calm",
            QueryCategory.PRIVATE: "relief",
            QueryCategory.REFLECTION: "surge",
        }
        atmosphere = category_to_atmosphere.get(category, "calm")
        
        model_config = MODELS[provider]
        
        # Build fallback chain
        fallback = None
        if provider != ModelProvider.GROQ:
            groq_config = MODELS[ModelProvider.GROQ]
            fallback = ModelRoute(
                provider=ModelProvider.GROQ,
                model_name=groq_config["name"],
                model_id=groq_config["id"],
                temperature=groq_config["default_temp"],
                max_tokens=groq_config["max_tokens"],
                reasoning="Fallback to Groq",
                atmosphere=atmosphere
            )
        
        return ModelRoute(
            provider=provider,
            model_name=model_config["name"],
            model_id=model_config["id"],
            temperature=model_config["default_temp"],
            max_tokens=model_config["max_tokens"],
            reasoning=f"{category.value} detected (confidence: {confidence:.2f}). Matched: {', '.join(matched[:3]) or 'default'}",
            atmosphere=atmosphere,
            fallback=fallback
        )
    
    def get_display_info(self, route: ModelRoute) -> Dict[str, Any]:
        """Get info for frontend display."""
        return {
            "model_name": route.model_name,
            "provider": route.provider.value,
            "reasoning": route.reasoning,
            "fallback_available": route.fallback is not None
        }

# ═══════════════════════════════════════════════════════════════
# CONVENIENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════

def create_router_with_available_keys() -> ModelRouter:
    """
    Create router with only models that have valid API keys.
    """
    import os
    available = []
    
    for provider, config in MODELS.items():
        env_key = config.get("env_key")
        if env_key is None:  # Local doesn't need key
            available.append(provider)
        elif os.getenv(env_key):
            available.append(provider)
    
    return ModelRouter(available)

# Export
__all__ = [
    'ModelRouter', 'ModelRoute', 'ModelProvider', 'QueryCategory',
    'MODELS', 'create_router_with_available_keys'
]
