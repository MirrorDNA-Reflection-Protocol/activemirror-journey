#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  bash scripts/control_plane_diff.sh <snapshot_dir_a> <snapshot_dir_b>

Compares control-plane snapshots while filtering volatile HTTP header lines.
Returns non-zero if any meaningful differences are found.
EOF
}

if [ "$#" -ne 2 ]; then
    usage
    exit 2
fi

A="$1"
B="$2"

if [ ! -d "$A" ] || [ ! -d "$B" ]; then
    echo "Both inputs must be directories."
    exit 2
fi

normalize_file() {
    local file="$1"
    local base
    base="$(basename "$file")"

    if [[ "$base" == checksums.txt ]]; then
        return
    fi

    if [[ "$base" == headers-* ]]; then
        rg -v '^(date:|expires:|age:|cf-ray:|x-timer:|x-fastly-request-id:|report-to:|nel:|x-served-by:|x-cache-hits:|cf-cache-status:|x-cache:|x-proxy-cache:|x-github-request-id:)' "$file" || true
        return
    fi

    if [[ "$base" == dns.txt ]]; then
        sort "$file"
        return
    fi

    if [[ "$base" == meta.txt ]]; then
        rg -v '^captured_at_utc=' "$file" || true
        return
    fi

    cat "$file"
}

tmp_files="$(mktemp)"
{
    (cd "$A" && find . -type f | sort)
    (cd "$B" && find . -type f | sort)
} | sort -u > "$tmp_files"

diffs=0

while IFS= read -r rel; do
    [ -z "$rel" ] && continue
    fa="${A%/}/${rel#./}"
    fb="${B%/}/${rel#./}"

    if [ ! -f "$fa" ]; then
        echo "Only in B: ${rel#./}"
        diffs=$((diffs + 1))
        continue
    fi

    if [ ! -f "$fb" ]; then
        echo "Only in A: ${rel#./}"
        diffs=$((diffs + 1))
        continue
    fi

    ta="$(mktemp)"
    tb="$(mktemp)"
    normalize_file "$fa" > "$ta"
    normalize_file "$fb" > "$tb"

    if ! diff -u "$ta" "$tb" >/dev/null; then
        echo "Changed: ${rel#./}"
        diff -u "$ta" "$tb" || true
        diffs=$((diffs + 1))
    fi

    rm -f "$ta" "$tb"
done < "$tmp_files"

rm -f "$tmp_files"

if [ "$diffs" -gt 0 ]; then
    echo "Control-plane diff detected ${diffs} changed file(s)."
    exit 1
fi

echo "No meaningful control-plane diffs detected."
