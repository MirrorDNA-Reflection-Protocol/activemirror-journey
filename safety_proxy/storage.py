"""
Storage abstraction for Active Mirror Safety Proxy.
Supports file-based (local) and Supabase (cloud) backends.
Auto-selects based on SUPABASE_URL env var.
"""

import os
import json
import hashlib
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger("mirror-storage")


class StorageBackend(ABC):
    """Abstract storage interface for the safety proxy."""

    # ── Seeds ──
    @abstractmethod
    async def get_seed(self, shortcode: str) -> Optional[Dict]:
        ...

    @abstractmethod
    async def create_seed(self, shortcode: str, content: str) -> Dict:
        ...

    @abstractmethod
    async def increment_seed_views(self, shortcode: str) -> int:
        ...

    @abstractmethod
    async def count_shared_seeds(self) -> int:
        ...

    # ── Seed Counter ──
    @abstractmethod
    async def get_seed_counter(self) -> Dict:
        ...

    @abstractmethod
    async def increment_seed_counter(self) -> Dict:
        ...

    @abstractmethod
    async def increment_shared_counter(self) -> None:
        ...

    # ── Permanent Record ──
    @abstractmethod
    async def read_permanent_record(self) -> List[str]:
        ...

    @abstractmethod
    async def append_permanent_record(self, entry: str) -> None:
        ...

    # ── Waitlist ──
    @abstractmethod
    async def get_waitlist(self) -> List[Dict]:
        ...

    @abstractmethod
    async def add_to_waitlist(self, entry: Dict) -> bool:
        """Returns False if duplicate."""
        ...

    @abstractmethod
    async def get_waitlist_stats(self) -> Dict:
        ...


class FileStorageBackend(StorageBackend):
    """File-based storage using ~/.mirrordna/ paths."""

    def __init__(self, seeds_dir: Path, counter_path: Path, record_path: Path, waitlist_path: Path):
        self.seeds_dir = seeds_dir
        self.counter_path = counter_path
        self.record_path = record_path
        self.waitlist_path = waitlist_path
        self.seeds_dir.mkdir(parents=True, exist_ok=True)

    # ── Seeds ──
    async def get_seed(self, shortcode: str) -> Optional[Dict]:
        seed_file = self.seeds_dir / f"{shortcode}.json"
        if not seed_file.exists():
            return None
        try:
            return json.loads(seed_file.read_text())
        except Exception:
            return None

    async def create_seed(self, shortcode: str, content: str) -> Dict:
        seed_file = self.seeds_dir / f"{shortcode}.json"
        data = {
            "content": content,
            "created": datetime.now(timezone.utc).isoformat(),
            "views": 0
        }
        seed_file.write_text(json.dumps(data, indent=2))
        return data

    async def increment_seed_views(self, shortcode: str) -> int:
        seed_file = self.seeds_dir / f"{shortcode}.json"
        data = json.loads(seed_file.read_text())
        data["views"] += 1
        seed_file.write_text(json.dumps(data, indent=2))
        return data["views"]

    async def count_shared_seeds(self) -> int:
        return sum(1 for _ in self.seeds_dir.glob("*.json"))

    # ── Seed Counter ──
    async def get_seed_counter(self) -> Dict:
        if self.counter_path.exists():
            try:
                return json.loads(self.counter_path.read_text())
            except Exception:
                pass
        return {"count": 50, "last_updated": datetime.now(timezone.utc).isoformat()}

    async def increment_seed_counter(self) -> Dict:
        data = await self.get_seed_counter()
        data["count"] += 1
        data["last_updated"] = datetime.now(timezone.utc).isoformat()
        self.counter_path.write_text(json.dumps(data, indent=2))
        return data

    async def increment_shared_counter(self) -> None:
        data = await self.get_seed_counter()
        data["shared"] = data.get("shared", 0) + 1
        self.counter_path.write_text(json.dumps(data, indent=2))

    # ── Permanent Record ──
    async def read_permanent_record(self) -> List[str]:
        if not self.record_path.exists():
            return []
        text = self.record_path.read_text().strip()
        return text.split('\n') if text else []

    async def append_permanent_record(self, entry: str) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        line = f"[{timestamp}] {entry}\n"
        with open(self.record_path, 'a') as f:
            f.write(line)

    # ── Waitlist ──
    async def get_waitlist(self) -> List[Dict]:
        if not self.waitlist_path.exists():
            return []
        try:
            return json.loads(self.waitlist_path.read_text())
        except Exception:
            return []

    async def add_to_waitlist(self, entry: Dict) -> bool:
        waitlist = await self.get_waitlist()
        existing = [e.get('email', '').lower() for e in waitlist]
        if entry.get('email', '').lower() in existing:
            return False
        waitlist.append(entry)
        self.waitlist_path.write_text(json.dumps(waitlist, indent=2))
        return True

    async def get_waitlist_stats(self) -> Dict:
        waitlist = await self.get_waitlist()
        sources = {}
        for e in waitlist:
            s = e.get('source', 'unknown')
            sources[s] = sources.get(s, 0) + 1
        return {"total": len(waitlist), "sources": sources}


class SupabaseStorageBackend(StorageBackend):
    """Supabase-backed storage for cloud deployment."""

    def __init__(self, url: str, key: str):
        from supabase import create_client
        self.client = create_client(url, key)
        logger.info("Supabase storage backend initialized")

    # ── Seeds ──
    async def get_seed(self, shortcode: str) -> Optional[Dict]:
        result = self.client.table("seeds").select("*").eq("shortcode", shortcode).execute()
        if result.data:
            row = result.data[0]
            return {"content": row["content"], "created": row["created_at"], "views": row["views"]}
        return None

    async def create_seed(self, shortcode: str, content: str) -> Dict:
        now = datetime.now(timezone.utc).isoformat()
        self.client.table("seeds").insert({
            "shortcode": shortcode,
            "content": content,
            "created_at": now,
            "views": 0
        }).execute()
        return {"content": content, "created": now, "views": 0}

    async def increment_seed_views(self, shortcode: str) -> int:
        result = self.client.table("seeds").select("views").eq("shortcode", shortcode).execute()
        current = result.data[0]["views"] if result.data else 0
        new_views = current + 1
        self.client.table("seeds").update({"views": new_views}).eq("shortcode", shortcode).execute()
        return new_views

    async def count_shared_seeds(self) -> int:
        result = self.client.table("seeds").select("shortcode", count="exact").execute()
        return result.count or 0

    # ── Seed Counter ──
    async def get_seed_counter(self) -> Dict:
        result = self.client.table("seed_counter").select("*").eq("id", 1).execute()
        if result.data:
            row = result.data[0]
            return {"count": row["count"], "last_updated": row["last_updated"], "shared": row.get("shared", 0)}
        return {"count": 50, "last_updated": datetime.now(timezone.utc).isoformat(), "shared": 0}

    async def increment_seed_counter(self) -> Dict:
        data = await self.get_seed_counter()
        data["count"] += 1
        data["last_updated"] = datetime.now(timezone.utc).isoformat()
        self.client.table("seed_counter").upsert({
            "id": 1,
            "count": data["count"],
            "last_updated": data["last_updated"],
            "shared": data.get("shared", 0)
        }).execute()
        return data

    async def increment_shared_counter(self) -> None:
        data = await self.get_seed_counter()
        data["shared"] = data.get("shared", 0) + 1
        self.client.table("seed_counter").upsert({
            "id": 1,
            "count": data["count"],
            "last_updated": data["last_updated"],
            "shared": data["shared"]
        }).execute()

    # ── Permanent Record ──
    async def read_permanent_record(self) -> List[str]:
        result = self.client.table("permanent_record").select("*").order("created_at").execute()
        return [f"[{row['created_at']}] {row['entry']}" for row in (result.data or [])]

    async def append_permanent_record(self, entry: str) -> None:
        self.client.table("permanent_record").insert({
            "entry": entry,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()

    # ── Waitlist ──
    async def get_waitlist(self) -> List[Dict]:
        result = self.client.table("waitlist").select("*").order("created_at").execute()
        return result.data or []

    async def add_to_waitlist(self, entry: Dict) -> bool:
        email = entry.get("email", "").lower()
        existing = self.client.table("waitlist").select("email").eq("email", email).execute()
        if existing.data:
            return False
        self.client.table("waitlist").insert({
            "email": email,
            "source": entry.get("source", "mirror"),
            "created_at": entry.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "ip_hash": entry.get("ip_hash", "")
        }).execute()
        return True

    async def get_waitlist_stats(self) -> Dict:
        result = self.client.table("waitlist").select("source").execute()
        rows = result.data or []
        sources = {}
        for r in rows:
            s = r.get("source", "unknown")
            sources[s] = sources.get(s, 0) + 1
        return {"total": len(rows), "sources": sources}


def create_storage() -> StorageBackend:
    """Factory: auto-select backend based on environment."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if supabase_url and supabase_key:
        logger.info(f"Using Supabase storage: {supabase_url[:30]}...")
        return SupabaseStorageBackend(supabase_url, supabase_key)

    logger.info("Using file-based storage")
    home = Path.home()
    return FileStorageBackend(
        seeds_dir=home / ".mirrordna" / "seeds",
        counter_path=home / ".mirrordna" / "seed_counter.json",
        record_path=home / ".mirrordna" / "CRIMINAL_RECORD.log",
        waitlist_path=Path(os.getenv("VAULT_PATH", str(home / "MirrorDNA-Vault" / "00_CANONICAL"))) / "waitlist.json"
    )
