import os
import time
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("mirror-gate.vault")

# Default path for MirrorDNA Vault
DEFAULT_VAULT_PATH = os.path.expanduser("~/Library/Mobile Documents/iCloud~md~obsidian/Documents/MirrorDNA-Vault/")

class VaultReader:
    def __init__(self, vault_path: str = DEFAULT_VAULT_PATH):
        self.vault_path = vault_path
        self.max_files = 3
        self.max_chars_per_file = 2000
        # Freshness window in seconds (e.g., 24 hours)
        self.freshness_window = 24 * 60 * 60 

    def get_recent_context(self) -> str:
        """
        Scans the vault for files modified in the last 24 hours.
        Returns a formatted context string.
        """
        if not os.path.exists(self.vault_path):
            logger.warning(f"Vault path not found: {self.vault_path}")
            return ""

        try:
            recent_files = []
            now = time.time()

            # Walk the vault
            for root, _, files in os.walk(self.vault_path):
                for file in files:
                    if not file.endswith(".md"):
                        continue
                        
                    full_path = os.path.join(root, file)
                    try:
                        mtime = os.path.getmtime(full_path)
                        if now - mtime < self.freshness_window:
                            recent_files.append((full_path, mtime))
                    except OSError:
                        pass # Skip files we can't stat

            # Sort by most recent
            recent_files.sort(key=lambda x: x[1], reverse=True)
            
            # Take top N
            top_files = recent_files[:self.max_files]
            
            if not top_files:
                return ""

            context_block = "\nACTIVE CONTEXT (VAULT SYNAPSE):\n"
            context_block += f"(Files modified in last {self.freshness_window // 3600} hours)\n"
            
            for path, mtime in top_files:
                filename = os.path.basename(path)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Truncate if needed
                    if len(content) > self.max_chars_per_file:
                        content = content[:self.max_chars_per_file] + "... [TRUNCATED]"
                        
                    context_block += f"\n--- FILE: {filename} ---\n{content}\n"
                except Exception as e:
                    logger.error(f"Failed to read vault file {filename}: {e}")

            return context_block

        except Exception as e:
            logger.error(f"Critical error scanning vault: {e}")
            return ""
