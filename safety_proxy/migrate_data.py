#!/usr/bin/env python3
"""
One-time migration script: local files → Supabase.
Run after Supabase tables are created via 001_initial_schema.sql.

Usage:
    SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python migrate_data.py
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

def main():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars")
        sys.exit(1)

    from supabase import create_client
    client = create_client(url, key)

    home = Path.home()
    seeds_dir = home / ".mirrordna" / "seeds"
    counter_path = home / ".mirrordna" / "seed_counter.json"
    record_path = home / ".mirrordna" / "CRIMINAL_RECORD.log"
    waitlist_path = home / "MirrorDNA-Vault" / "00_CANONICAL" / "waitlist.json"

    # ── Migrate Seeds ──
    if seeds_dir.exists():
        seed_files = list(seeds_dir.glob("*.json"))
        print(f"Migrating {len(seed_files)} seeds...")
        for sf in seed_files:
            shortcode = sf.stem
            try:
                data = json.loads(sf.read_text())
                client.table("seeds").upsert({
                    "shortcode": shortcode,
                    "content": data.get("content", ""),
                    "created_at": data.get("created", datetime.now(timezone.utc).isoformat()),
                    "views": data.get("views", 0)
                }).execute()
                print(f"  ✓ {shortcode}")
            except Exception as e:
                print(f"  ✗ {shortcode}: {e}")
    else:
        print("No seeds directory found, skipping")

    # ── Migrate Seed Counter ──
    if counter_path.exists():
        print("Migrating seed counter...")
        try:
            data = json.loads(counter_path.read_text())
            client.table("seed_counter").upsert({
                "id": 1,
                "count": data.get("count", 50),
                "shared": data.get("shared", 0),
                "last_updated": data.get("last_updated", datetime.now(timezone.utc).isoformat())
            }).execute()
            print(f"  ✓ count={data.get('count')}, shared={data.get('shared')}")
        except Exception as e:
            print(f"  ✗ Counter: {e}")
    else:
        print("No seed counter found, skipping")

    # ── Migrate Permanent Record ──
    if record_path.exists():
        lines = record_path.read_text().strip().split('\n')
        lines = [l for l in lines if l.strip()]
        print(f"Migrating {len(lines)} permanent record entries...")
        for line in lines:
            try:
                # Parse [timestamp] entry format
                if line.startswith('[') and '] ' in line:
                    ts_end = line.index('] ')
                    ts = line[1:ts_end]
                    entry = line[ts_end + 2:]
                else:
                    ts = datetime.now(timezone.utc).isoformat()
                    entry = line

                client.table("permanent_record").insert({
                    "entry": entry,
                    "created_at": ts
                }).execute()
                print(f"  ✓ {entry[:60]}...")
            except Exception as e:
                print(f"  ✗ {line[:40]}: {e}")
    else:
        print("No permanent record found, skipping")

    # ── Migrate Waitlist ──
    if waitlist_path.exists():
        try:
            waitlist = json.loads(waitlist_path.read_text())
            print(f"Migrating {len(waitlist)} waitlist entries...")
            for entry in waitlist:
                try:
                    client.table("waitlist").upsert({
                        "email": entry.get("email", "").lower(),
                        "source": entry.get("source", "mirror"),
                        "ip_hash": entry.get("ip_hash", ""),
                        "created_at": entry.get("timestamp", datetime.now(timezone.utc).isoformat())
                    }).execute()
                    print(f"  ✓ {entry.get('email', '?')[:3]}***")
                except Exception as e:
                    print(f"  ✗ {entry.get('email', '?')[:3]}***: {e}")
        except Exception as e:
            print(f"Waitlist migration error: {e}")
    else:
        print("No waitlist found, skipping")

    print("\nMigration complete.")


if __name__ == "__main__":
    main()
