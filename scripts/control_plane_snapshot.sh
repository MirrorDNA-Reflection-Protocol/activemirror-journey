#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://activemirror.ai}"
BASE_URL="${BASE_URL%/}"
SNAPSHOT_ROOT="${2:-ops/control-plane-snapshots}"
SNAPSHOT_NAME="${3:-$(date -u +%Y%m%dT%H%M%SZ)}"

SNAPSHOT_DIR="${SNAPSHOT_ROOT%/}/${SNAPSHOT_NAME}"
DOMAIN="$(printf '%s' "$BASE_URL" | sed -E 's#^https?://##; s#/.*##')"

mkdir -p "$SNAPSHOT_DIR"

fetch_body() {
    local url="$1"
    local file="$2"
    if curl -fsSL "$url" > "$file"; then
        return 0
    fi
    printf 'FETCH_ERROR %s\n' "$url" > "$file"
    return 0
}

fetch_headers() {
    local url="$1"
    local file="$2"
    if curl -sSI "$url" > "$file"; then
        return 0
    fi
    printf 'HEADER_FETCH_ERROR %s\n' "$url" > "$file"
    return 0
}

{
    echo "captured_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "base_url=${BASE_URL}"
    echo "domain=${DOMAIN}"
} > "${SNAPSHOT_DIR}/meta.txt"

fetch_body "${BASE_URL}/" "${SNAPSHOT_DIR}/home.html"
fetch_body "${BASE_URL}/confessions/" "${SNAPSHOT_DIR}/confessions.html"
fetch_body "${BASE_URL}/robots.txt" "${SNAPSHOT_DIR}/robots.txt"
fetch_body "${BASE_URL}/manifest.json" "${SNAPSHOT_DIR}/manifest.json"
fetch_body "${BASE_URL}/sitemap.xml" "${SNAPSHOT_DIR}/sitemap.xml"

fetch_headers "${BASE_URL}/" "${SNAPSHOT_DIR}/headers-home.txt"
fetch_headers "${BASE_URL}/robots.txt" "${SNAPSHOT_DIR}/headers-robots.txt"

{
    echo "domain=${DOMAIN}"
    if command -v dig >/dev/null 2>&1; then
        echo "-- dig A --"
        dig +short "${DOMAIN}" A || true
        echo "-- dig AAAA --"
        dig +short "${DOMAIN}" AAAA || true
        echo "-- dig CNAME --"
        dig +short "${DOMAIN}" CNAME || true
        echo "-- dig TXT _dnslink --"
        dig +short "_dnslink.${DOMAIN}" TXT || true
    elif command -v nslookup >/dev/null 2>&1; then
        echo "-- nslookup --"
        nslookup "${DOMAIN}" || true
        echo "-- nslookup TXT _dnslink --"
        nslookup -type=TXT "_dnslink.${DOMAIN}" || true
    else
        echo "No DNS tool available (dig/nslookup)"
    fi
} > "${SNAPSHOT_DIR}/dns.txt"

if command -v sha256sum >/dev/null 2>&1; then
    (cd "$SNAPSHOT_DIR" && sha256sum ./* > checksums.txt)
else
    (cd "$SNAPSHOT_DIR" && shasum -a 256 ./* > checksums.txt)
fi

echo "Snapshot saved: ${SNAPSHOT_DIR}"
