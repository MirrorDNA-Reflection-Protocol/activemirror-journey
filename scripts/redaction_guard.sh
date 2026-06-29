#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  bash scripts/redaction_guard.sh [paths...]

Defaults:
  public index.html src/App.jsx src/pages src/components src/lib

Allowlist:
  .redaction-allowlist (optional)
  - One glob per line to exclude paths (comments start with #)
EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    usage
    exit 0
fi

if ! command -v rg >/dev/null 2>&1; then
    echo "ripgrep (rg) is required"
    exit 2
fi

if [ "$#" -gt 0 ]; then
    targets=("$@")
else
    targets=("public" "index.html" "src/App.jsx" "src/pages" "src/components" "src/lib")
fi

existing_targets=()
for t in "${targets[@]}"; do
    if [ -e "$t" ]; then
        existing_targets+=("$t")
    fi
done

if [ "${#existing_targets[@]}" -eq 0 ]; then
    echo "No target paths found to scan"
    exit 0
fi

rg_base=(
    rg
    --line-number
    --color=never
    --hidden
    --glob
    '!**/.git/**'
    --glob
    '!**/node_modules/**'
)

if [ -f ".redaction-allowlist" ]; then
    while IFS= read -r line; do
        line="${line%%$'\r'}"
        if [ -z "$line" ] || [[ "$line" =~ ^# ]]; then
            continue
        fi
        rg_base+=(--glob "!${line}")
    done < ".redaction-allowlist"
fi

patterns=(
    '-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----'
    'sk-[A-Za-z0-9]{20,}'
    'sk-ant-[A-Za-z0-9-]{20,}'
    'gsk_[A-Za-z0-9]{20,}'
    'AKIA[0-9A-Z]{16}'
    'Bearer[[:space:]]+[A-Za-z0-9._-]{24,}'
    '/Users/[A-Za-z0-9._/-]+'
    '~/(\.mirrordna|MirrorDNA-Vault)'
    '/MirrorDNA-Vault/'
)

labels=(
    'private-key'
    'openai-key-like'
    'anthropic-key-like'
    'groq-key-like'
    'aws-access-key-like'
    'bearer-token-like'
    'absolute-user-path'
    'vault-reference'
    'vault-reference-abs'
)

failures=0

echo "Running redaction guard over: ${existing_targets[*]}"

for i in "${!patterns[@]}"; do
    pattern="${patterns[$i]}"
    label="${labels[$i]}"
    matches="$("${rg_base[@]}" -e "$pattern" "${existing_targets[@]}" || true)"
    if [ -n "$matches" ]; then
        echo "FAIL (${label}):"
        printf '%s\n' "$matches"
        failures=$((failures + 1))
    else
        echo "PASS (${label})"
    fi
done

if [ "$failures" -gt 0 ]; then
    echo "Redaction guard FAILED with ${failures} pattern group(s)."
    exit 1
fi

echo "Redaction guard PASSED."
