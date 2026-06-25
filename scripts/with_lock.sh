#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  bash scripts/with_lock.sh <lock-name> <command> [args...]

Environment:
  LOCK_ROOT            Lock directory root (default: .ops/locks)
  LOCK_TTL_SECONDS     Stale lock threshold in seconds (default: 1800)
  LOCK_RETRY_SECONDS   Retry interval in seconds (default: 1)
  LOCK_TIMEOUT_SECONDS Max wait time before failing (default: 120)
EOF
}

if [ "$#" -lt 2 ]; then
    usage
    exit 2
fi

LOCK_NAME="$1"
shift

LOCK_ROOT="${LOCK_ROOT:-.ops/locks}"
LOCK_TTL_SECONDS="${LOCK_TTL_SECONDS:-1800}"
LOCK_RETRY_SECONDS="${LOCK_RETRY_SECONDS:-1}"
LOCK_TIMEOUT_SECONDS="${LOCK_TIMEOUT_SECONDS:-120}"

safe_name="$(printf '%s' "$LOCK_NAME" | tr '/ ' '__')"
LOCK_DIR="${LOCK_ROOT}/${safe_name}.lock"
OWNER_FILE="${LOCK_DIR}/owner"

mkdir -p "$LOCK_ROOT"

cleanup() {
    if [ -f "$OWNER_FILE" ] && grep -q "^pid=${$}$" "$OWNER_FILE"; then
        rm -rf "$LOCK_DIR"
    fi
}
trap cleanup EXIT INT TERM

acquired=0
start_ts="$(date +%s)"

while [ "$acquired" -eq 0 ]; do
    if mkdir "$LOCK_DIR" 2>/dev/null; then
        {
            printf 'pid=%s\n' "$$"
            printf 'host=%s\n' "$(hostname)"
            printf 'started_epoch=%s\n' "$(date +%s)"
            printf 'lock_name=%s\n' "$LOCK_NAME"
            printf 'command=%s\n' "$*"
        } > "$OWNER_FILE"
        acquired=1
        break
    fi

    now_ts="$(date +%s)"
    elapsed="$((now_ts - start_ts))"

    if [ "$elapsed" -ge "$LOCK_TIMEOUT_SECONDS" ]; then
        echo "Lock timeout: ${LOCK_NAME} (${LOCK_DIR})"
        if [ -f "$OWNER_FILE" ]; then
            echo "Current owner:"
            cat "$OWNER_FILE"
        fi
        exit 1
    fi

    if [ -f "$OWNER_FILE" ]; then
        owner_started="$(awk -F= '/^started_epoch=/{print $2}' "$OWNER_FILE" || true)"
        if [ -n "$owner_started" ]; then
            owner_age="$((now_ts - owner_started))"
            if [ "$owner_age" -gt "$LOCK_TTL_SECONDS" ]; then
                echo "Removing stale lock: ${LOCK_NAME} (age=${owner_age}s > ttl=${LOCK_TTL_SECONDS}s)"
                rm -rf "$LOCK_DIR"
                continue
            fi
        fi
    fi

    sleep "$LOCK_RETRY_SECONDS"
done

"$@"
