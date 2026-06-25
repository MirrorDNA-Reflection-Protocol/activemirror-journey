# ANTIGRAVITY MISSION: Mac Mini Health & Cleanup

## CURRENT STATE
- **Free space:** Only 7.7GB on main drive (critical!)
- **Hugging Face cache:** 55GB 
- **Ollama models:** 5.5GB
- **System caches:** 9.5GB
- **Samsung T7 Shield:** 113GB available (external backup drive)

## YOUR MISSION
Clean up the Mac Mini, reclaim space, move large files to Samsung drive where appropriate.

## PHASE 1: ANALYSIS (Do First)

Run these and report findings:

```bash
# 1. Find largest directories
du -sh ~/* 2>/dev/null | sort -hr | head -20

# 2. Check all model caches
du -sh ~/.cache/* 2>/dev/null | sort -hr
du -sh ~/.ollama/models/* 2>/dev/null | sort -hr
du -sh ~/Library/Caches/* 2>/dev/null | sort -hr | head -10

# 3. Check Downloads folder
du -sh ~/Downloads/* 2>/dev/null | sort -hr | head -10

# 4. Find large files (>500MB) in home
find ~ -type f -size +500M -exec ls -lh {} \; 2>/dev/null | head -20

# 5. Check Docker if installed
docker system df 2>/dev/null

# 6. Check any Homebrew cache
du -sh ~/Library/Caches/Homebrew 2>/dev/null
```

## PHASE 2: SAFE CLEANUP

### Hugging Face Cache (55GB!)
```bash
# List what's in there
ls -la ~/.cache/huggingface/hub/ | head -20

# Models can be re-downloaded - safe to clear old ones
# But ASK Paul first which models to keep
```

### Ollama Models (5.5GB)
```bash
# List installed models
ollama list

# Large models Paul might not need can be removed with:
# ollama rm <model-name>
```

### System Caches (9.5GB)
```bash
# Safe to clear (will rebuild):
rm -rf ~/Library/Caches/com.apple.Safari
rm -rf ~/Library/Caches/Google/Chrome
rm -rf ~/Library/Caches/pip
rm -rf ~/Library/Caches/Homebrew

# Check Xcode derived data if present
du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null
```

### Downloads Folder
```bash
# List and let Paul decide what to delete
ls -lahS ~/Downloads/ | head -30
```

## PHASE 3: MOVE TO SAMSUNG T7

The Samsung drive is at `/Volumes/T7 Shield/`

Consider moving:
- Old project backups
- Large datasets
- Archived models Paul wants to keep but not use daily

```bash
# Create organized structure on T7
mkdir -p "/Volumes/T7 Shield/MacMini-Archive/models"
mkdir -p "/Volumes/T7 Shield/MacMini-Archive/projects"
mkdir -p "/Volumes/T7 Shield/MacMini-Archive/datasets"
```

## PHASE 4: PREVENT FUTURE BLOAT

1. Set Hugging Face cache to external:
```bash
echo 'export HF_HOME="/Volumes/T7 Shield/HF-Cache"' >> ~/.zshrc
```

2. Set Ollama models to external:
```bash
echo 'export OLLAMA_MODELS="/Volumes/T7 Shield/Ollama-Models"' >> ~/.zshrc
```

3. Clear pip cache regularly:
```bash
pip cache purge
```

## WHAT NOT TO DELETE
- ~/.mirrordna/ (MirrorDNA vault - critical)
- ~/Documents/GitHub/ (all repos - critical)
- ~/Library/Application Support/Claude/ (MCP configs)
- ~/Library/Application Support/Obsidian/ (vault data)
- Any .env files or credentials

## GOAL
Get at least 50GB free on the main drive while preserving everything important.

## REPORT TEMPLATE
After cleanup, report:
- Space before: X GB free
- Space after: Y GB free
- What was deleted
- What was moved to T7
- Any warnings or issues

---

⟡ Be thorough but careful. Ask Paul before deleting anything that isn't obviously cache.
