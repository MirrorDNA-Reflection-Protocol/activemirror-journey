#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://activemirror.ai}"
BASE_URL="${BASE_URL%/}"

failures=0

pass() {
    printf "PASS: %s\n" "$1"
}

fail() {
    printf "FAIL: %s\n" "$1"
    failures=$((failures + 1))
}

check_200() {
    local url="$1"
    local code
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || true)"
    if [ "$code" = "200" ]; then
        pass "$url -> 200"
    else
        fail "$url -> $code"
    fi
}

check_contains() {
    local label="$1"
    local body="$2"
    local needle="$3"
    if printf '%s' "$body" | rg -Fq "$needle"; then
        pass "$label contains: $needle"
    else
        fail "$label missing: $needle"
    fi
}

check_not_contains() {
    local label="$1"
    local body="$2"
    local needle="$3"
    if printf '%s' "$body" | rg -Fq "$needle"; then
        fail "$label unexpectedly contains: $needle"
    else
        pass "$label does not contain: $needle"
    fi
}

check_not_regex() {
    local label="$1"
    local body="$2"
    local pattern="$3"
    if printf '%s' "$body" | rg -Uq "$pattern"; then
        fail "$label matches blocked pattern: $pattern"
    else
        pass "$label does not match blocked pattern"
    fi
}

printf "Running production smoke checks for %s\n" "$BASE_URL"

home_html="$(curl -sS "${BASE_URL}/" || true)"
conf_html="$(curl -sS "${BASE_URL}/confessions/" || true)"
arch_html="$(curl -sS "${BASE_URL}/docs/architecture/" || true)"
products_html="$(curl -sS "${BASE_URL}/products/" || true)"
research_html="$(curl -sS "${BASE_URL}/research/" || true)"
builds_html="$(curl -sS "${BASE_URL}/builds/" || true)"
contact_html="$(curl -sS "${BASE_URL}/about/contact/" || true)"
scan_html="$(curl -sS "${BASE_URL}/scan/" || true)"
privacy_html="$(curl -sS "${BASE_URL}/privacy/" || true)"
terms_html="$(curl -sS "${BASE_URL}/terms/" || true)"
trust_html="$(curl -sS "${BASE_URL}/trust/" || true)"
robots_txt="$(curl -sS "${BASE_URL}/robots.txt" || true)"
manifest_json="$(curl -sS "${BASE_URL}/manifest.json" || true)"

check_200 "${BASE_URL}/"
check_200 "${BASE_URL}/confessions/"
check_200 "${BASE_URL}/docs/architecture/"
check_200 "${BASE_URL}/products/"
check_200 "${BASE_URL}/research/"
check_200 "${BASE_URL}/builds/"
check_200 "${BASE_URL}/about/contact/"
check_200 "${BASE_URL}/scan/"
check_200 "${BASE_URL}/privacy/"
check_200 "${BASE_URL}/terms/"
check_200 "${BASE_URL}/trust/"
check_200 "${BASE_URL}/manifest.json"
check_200 "${BASE_URL}/assets/og-image.png"
check_200 "${BASE_URL}/apple-touch-icon.png"
check_200 "${BASE_URL}/mirror-icon-192.png"
check_200 "${BASE_URL}/mirror-icon-512.png"
check_200 "${BASE_URL}/robots.txt"
check_200 "${BASE_URL}/sitemap.xml"

check_contains "home HTML" "$home_html" 'href="/manifest.json"'
check_contains "home HTML" "$home_html" 'https://activemirror.ai/assets/og-image.png'
check_contains "home HTML" "$home_html" '<title>Active Mirror | Scam checks for people, governed AI for teams</title>'
check_not_regex "home HTML" "$home_html" 'modulepreload[^>]*web-llm'

check_contains "confessions HTML" "$conf_html" '<title>Confessions — AI Superego Live Feed</title>'
check_contains "confessions HTML" "$conf_html" 'https://activemirror.ai/confessions/'
check_contains "architecture HTML" "$arch_html" 'https://activemirror.ai/docs/architecture/'
check_contains "products HTML" "$products_html" 'https://activemirror.ai/products/'
check_contains "research HTML" "$research_html" 'https://activemirror.ai/research/'
check_contains "builds HTML" "$builds_html" 'https://activemirror.ai/builds/'
check_contains "contact HTML" "$contact_html" 'https://activemirror.ai/about/contact/'
check_contains "scan HTML" "$scan_html" 'https://activemirror.ai/scan/'
check_contains "privacy HTML" "$privacy_html" 'https://activemirror.ai/privacy/'
check_contains "terms HTML" "$terms_html" 'https://activemirror.ai/terms/'
check_contains "trust HTML" "$trust_html" 'https://activemirror.ai/trust/'

check_contains "manifest.json" "$manifest_json" '"start_url": "/"'
check_contains "manifest.json" "$manifest_json" '"scope": "/"'

check_not_contains "robots.txt" "$robots_txt" 'BEGIN Cloudflare Managed content'
check_not_contains "robots.txt" "$robots_txt" 'Content-Signal:'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: GPTBot\s+Disallow: /'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: ClaudeBot\s+Disallow: /'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: Google-Extended\s+Disallow: /'
check_contains "robots.txt" "$robots_txt" 'User-agent: GPTBot'
check_contains "robots.txt" "$robots_txt" 'User-agent: ClaudeBot'
check_contains "robots.txt" "$robots_txt" 'User-agent: Google-Extended'

if [ "$failures" -gt 0 ]; then
    printf "\nSmoke check FAILED: %d issue(s)\n" "$failures"
    exit 1
fi

printf "\nSmoke check PASSED: all checks green\n"
