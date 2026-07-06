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

fetch() {
    curl -sS -A "ActiveMirrorSmoke/1.0" "$1" || true
}

check_200() {
    local url="$1"
    local code
    code="$(curl -sS -A "ActiveMirrorSmoke/1.0" -o /dev/null -w '%{http_code}' "$url" || true)"
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

root_html="$(fetch "${BASE_URL}/")"
app_html="$(fetch "${BASE_URL}/app/")"
product_html="$(fetch "${BASE_URL}/product/")"
pricing_html="$(fetch "${BASE_URL}/pricing/")"
trust_html="$(fetch "${BASE_URL}/trust/")"
mirror_html="$(fetch "${BASE_URL}/mirror/")"
enterprise_html="$(fetch "${BASE_URL}/enterprise/")"
research_html="$(fetch "${BASE_URL}/research/")"
about_html="$(fetch "${BASE_URL}/about/")"
privacy_html="$(fetch "${BASE_URL}/privacy/")"
terms_html="$(fetch "${BASE_URL}/terms/")"
robots_txt="$(fetch "${BASE_URL}/robots.txt")"

check_200 "${BASE_URL}/"
check_200 "${BASE_URL}/app/"
check_200 "${BASE_URL}/app/id/"
check_200 "${BASE_URL}/app/about/"
check_200 "${BASE_URL}/app/enterprise/"
check_200 "${BASE_URL}/app/privacy/"
check_200 "${BASE_URL}/app/terms/"
check_200 "${BASE_URL}/product/"
check_200 "${BASE_URL}/pricing/"
check_200 "${BASE_URL}/trust/"
check_200 "${BASE_URL}/mirror/"
check_200 "${BASE_URL}/enterprise/"
check_200 "${BASE_URL}/research/"
check_200 "${BASE_URL}/about/"
check_200 "${BASE_URL}/privacy/"
check_200 "${BASE_URL}/terms/"
check_200 "${BASE_URL}/robots.txt"
check_200 "${BASE_URL}/sitemap.xml"

check_contains "root HTML" "$root_html" '<title>Active Mirror - start with one thing</title>'
check_contains "root HTML" "$root_html" 'window.location.replace(target)'
check_contains "root HTML" "$root_html" 'href="/app/"'
check_not_regex "root HTML" "$root_html" 'modulepreload[^>]*web-llm'

check_contains "app HTML" "$app_html" '<div id="root"></div>'
check_contains "app HTML" "$app_html" 'type="module"'
check_contains "app HTML" "$app_html" '/app/assets/'
check_not_contains "app HTML" "$app_html" 'Scam checks for people'
check_not_contains "app HTML" "$app_html" 'AI Superego'

check_contains "product alias" "$product_html" 'url=/app/'
check_contains "mirror alias" "$mirror_html" 'url=/app/'
check_contains "pricing alias" "$pricing_html" 'url=/app/enterprise/'
check_contains "trust alias" "$trust_html" 'url=/app/privacy/'
check_contains "enterprise alias" "$enterprise_html" 'url=/app/enterprise/'
check_contains "research alias" "$research_html" 'url=/app/research/'
check_contains "about alias" "$about_html" 'url=/app/about/'
check_contains "privacy alias" "$privacy_html" 'url=/app/privacy'
check_contains "terms alias" "$terms_html" 'url=/app/terms'

check_not_contains "product alias" "$product_html" 'A private AI workspace for important decisions.'
check_not_contains "pricing alias" "$pricing_html" '$19/mo'
check_not_contains "trust alias" "$trust_html" 'Trust by Design starts with approved memory.'
check_not_contains "mirror alias" "$mirror_html" 'Reflect with the full workspace.'

check_not_contains "robots.txt" "$robots_txt" 'BEGIN Cloudflare Managed content'
check_not_contains "robots.txt" "$robots_txt" 'Content-Signal:'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: GPTBot\s+Disallow: /'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: ClaudeBot\s+Disallow: /'
check_not_regex "robots.txt" "$robots_txt" 'User-agent: Google-Extended\s+Disallow: /'

if [ "$failures" -gt 0 ]; then
    printf "\nSmoke check FAILED: %d issue(s)\n" "$failures"
    exit 1
fi

printf "\nSmoke check PASSED: all checks green\n"
