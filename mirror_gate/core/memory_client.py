import os
import logging
from typing import List, Dict, Any

try:
    from mem0 import Memory
except ImportError:
    Memory = None

logger = logging.getLogger("mirror-gate.memory")

# Force local cache to avoid permission errors
os.environ["HF_HOME"] = os.path.abspath("mirror_gate/data/cache/hf")
os.environ["TORCH_HOME"] = os.path.abspath("mirror_gate/data/cache/torch")

class MemoryClient:
    def __init__(self, user_id: str = "default_user"):
        self.user_id = user_id
        self.enabled = False
        
        if Memory:
            try:
                # Use Local Ollama (Sovereign)
                config = {
                    "vector_store": {
                        "provider": "qdrant",
                        "config": {
                            "collection_name": "mirror_memory",
                            "path": "mirror_gate/data/qdrant_db",
                            "embedding_model_dims": 384
                        }
                    },
                    "embedder": {
                        "provider": "huggingface", 
                        "config": {
                            "model": "all-MiniLM-L6-v2"
                        }
                    },
                    "llm": {
                        "provider": "ollama",
                        "config": {
                            "model": "mirrorbrain-ami:latest",
                            "temperature": 0
                        }
                    }
                }
                
                logger.info("⟡ The Weave: Configured with Ollama (mirrorbrain-ami:latest)")
                self.memory = Memory.from_config(config)
                self.enabled = True
                logger.info("⟡ The Weave: Memory layer initialized (Local+Groq).")
            except Exception as e:
                logger.error(f"Failed to initialize mem0: {e}")
                self.enabled = False
        else:
            logger.warning("mem0ai not installed. Memory layer disabled.")

    def search(self, query: str, limit: int = 3) -> str:
        if not self.enabled: return ""
        try:
            results = self.memory.search(query, user_id=self.user_id, limit=limit)
            if not results: return ""
            
            context_block = "\nRELEVANT CONTEXT FROM MEMORY:\n"
            for mem in results:
                if isinstance(mem, str):
                    text = mem
                else:
                    text = mem.get('memory') or mem.get('text') or str(mem)
                context_block += f"- {text}\n"
            return context_block
        except Exception as e:
            logger.error(f"Memory search failed: {e}")
            return ""

    def add(self, text: str, metadata: Dict[str, Any] = None):
        if not self.enabled: return
        try:
            self.memory.add(text, user_id=self.user_id, metadata=metadata)
            logger.info("Memory stored successfully.")
        except Exception as e:
            logger.error(f"Memory storage failed: {e}")
