"""
Web Search — Grounding layer for real-time information.
Uses DuckDuckGo HTML API via httpx (no API key, no tracking).

Detects when a query needs current info and returns search results
as context to inject into the LLM prompt.
"""

import re
import logging
import html as html_lib
from typing import Optional, List
from dataclasses import dataclass
import httpx

logger = logging.getLogger("web_search")

# Patterns that signal the user wants current/real-time information
SEARCH_PATTERNS = [
    r'\b(latest|recent|current|today|now|new|2025|2026)\b',
    r'\b(news|update|happening|trending|released)\b',
    r'\b(price|stock|weather|score|result)\b',
    r'\b(who is|what is|when did|where is|how much)\b',
    r'\b(look up|search|find out|google|check)\b',
    r'\b(launched|announced|published|released|dropped)\b',
]

# Don't search for these — purely reflective/personal
NO_SEARCH_PATTERNS = [
    r'\bi (feel|felt|am feeling|think|believe)\b',
    r'\b(help me understand myself|what should i do with my life)\b',
    r'\b(reflect|journal|meditat)\b',
    r'\b(my relationship|my feelings|my life)\b',
]


@dataclass
class SearchResult:
    title: str
    snippet: str
    url: str


def needs_search(query: str) -> bool:
    """Determine if a query would benefit from web search grounding."""
    q = query.lower()

    # Skip if clearly reflective/personal
    for pattern in NO_SEARCH_PATTERNS:
        if re.search(pattern, q):
            return False

    # Check if query has search signals
    score = 0
    for pattern in SEARCH_PATTERNS:
        if re.search(pattern, q):
            score += 1

    # Questions that start with factual question words
    if re.match(r'^(who|what|when|where|how|why|is|are|was|were|did|does|can|will)\b', q):
        score += 1

    return score >= 2


def search(query: str, max_results: int = 3) -> List[SearchResult]:
    """Search DuckDuckGo HTML and parse results."""
    try:
        resp = httpx.get(
            "https://html.duckduckgo.com/html/",
            params={"q": query},
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
            timeout=5.0,
            follow_redirects=True
        )
        resp.raise_for_status()

        results = []
        # Parse the HTML response for result snippets
        # DuckDuckGo HTML returns results in <a class="result__a"> and <a class="result__snippet">
        text = resp.text

        # Extract result blocks
        blocks = re.findall(
            r'<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)</a>.*?'
            r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>',
            text, re.DOTALL
        )

        for url, title, snippet in blocks[:max_results]:
            # Clean HTML entities and tags
            clean_title = re.sub(r'<[^>]+>', '', html_lib.unescape(title)).strip()
            clean_snippet = re.sub(r'<[^>]+>', '', html_lib.unescape(snippet)).strip()

            # DuckDuckGo wraps URLs in a redirect — extract the real URL
            real_url = url
            uddg_match = re.search(r'uddg=([^&]+)', url)
            if uddg_match:
                from urllib.parse import unquote
                real_url = unquote(uddg_match.group(1))

            if clean_title and clean_snippet:
                results.append(SearchResult(
                    title=clean_title,
                    snippet=clean_snippet,
                    url=real_url
                ))

        return results
    except Exception as e:
        logger.warning(f"Web search failed: {e}")
        return []


def format_context(results: List[SearchResult]) -> str:
    """Format search results as context for the LLM."""
    if not results:
        return ""

    lines = ["[Web search results — use these for current information]:"]
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. {r.title}")
        lines.append(f"   {r.snippet}")
        lines.append(f"   Source: {r.url}")
    lines.append("[End of search results. Cite sources when using this information.]")
    return "\n".join(lines)


def get_search_context(query: str) -> Optional[str]:
    """
    Main entry point. Returns search context string if the query
    needs grounding, or None if it doesn't.
    """
    if not needs_search(query):
        return None

    results = search(query, max_results=3)
    if not results:
        return None

    context = format_context(results)
    logger.info(f"Web search grounding: {len(results)} results for '{query[:50]}...'")
    return context
