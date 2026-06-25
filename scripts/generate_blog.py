#!/usr/bin/env python3
"""
Blog Post Generator for Active Mirror
Generates SEO-optimized weekly blog posts using OpenAI API
"""

import os
import json
from datetime import datetime
from pathlib import Path
from openai import OpenAI
from slugify import slugify

# Configuration
BLOG_DIR = Path("blog/posts")
TOPICS_FILE = Path("scripts/topics.json")

# SEO-focused topic categories
TOPIC_CATEGORIES = [
    {
        "category": "AI Sovereignty",
        "topics": [
            "Why local LLMs matter for privacy",
            "The case for owning your AI infrastructure",
            "How to run AI without cloud dependency",
            "Building trust in AI systems",
            "Sovereign AI vs platform AI: key differences"
        ]
    },
    {
        "category": "Technical Tutorials",
        "topics": [
            "Getting started with MCP servers",
            "How to create persistent AI memory",
            "Building identity-aware AI assistants",
            "Integrating local models with your workflow",
            "Setting up Ollama for sovereign AI"
        ]
    },
    {
        "category": "AI Safety & Governance",
        "topics": [
            "Truth-state enforcement in AI systems",
            "Preventing AI hallucinations at the architecture level",
            "Wrapper-first AI: a new paradigm",
            "Red-teaming your AI assistant",
            "Governance protocols for personal AI"
        ]
    },
    {
        "category": "Future of AI",
        "topics": [
            "The shift from cloud AI to local AI",
            "AI identity: why it matters",
            "Human-AI collaboration patterns",
            "The economics of sovereign AI",
            "What MCP means for AI interoperability"
        ]
    }
]


def get_next_topic():
    """Get the next topic to write about, rotating through categories"""
    if TOPICS_FILE.exists():
        with open(TOPICS_FILE) as f:
            state = json.load(f)
    else:
        state = {"category_index": 0, "topic_index": 0, "used_topics": []}
    
    cat_idx = state["category_index"]
    top_idx = state["topic_index"]
    
    category = TOPIC_CATEGORIES[cat_idx]
    topic = category["topics"][top_idx]
    
    top_idx += 1
    if top_idx >= len(category["topics"]):
        top_idx = 0
        cat_idx = (cat_idx + 1) % len(TOPIC_CATEGORIES)
    
    state["category_index"] = cat_idx
    state["topic_index"] = top_idx
    state["used_topics"].append(topic)
    
    with open(TOPICS_FILE, 'w') as f:
        json.dump(state, f, indent=2)
    
    return category["category"], topic


def generate_blog_post(category: str, topic: str) -> dict:
    """Generate a blog post using OpenAI API"""
    
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    
    client = OpenAI(api_key=api_key)
    
    prompt = f"""You are writing a blog post for Active Mirror (activemirror.ai), a company building sovereign AI infrastructure.

TOPIC: {topic}
CATEGORY: {category}

Write a blog post that:
1. Is 600-800 words
2. Is SEO-optimized for the topic
3. Includes practical insights
4. Mentions Active Mirror naturally (not promotional, just factual)
5. Uses a clear, technical but accessible tone
6. Includes 2-3 subheadings
7. Ends with a call-to-action (try our tools, read docs, etc.)

IMPORTANT:
- Do NOT use markdown headers with # symbols
- Use plain text with line breaks
- Keep paragraphs short (2-3 sentences)
- Be specific and technical, not vague

Output format:
TITLE: [compelling title, max 60 chars]
META: [meta description, max 155 chars for SEO]
CONTENT:
[blog post content]
"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
        temperature=0.7
    )
    
    text = response.choices[0].message.content
    
    # Parse response
    lines = text.strip().split('\n')
    title = ""
    meta = ""
    content_lines = []
    
    in_content = False
    for line in lines:
        if line.startswith("TITLE:"):
            title = line.replace("TITLE:", "").strip()
        elif line.startswith("META:"):
            meta = line.replace("META:", "").strip()
        elif line.startswith("CONTENT:"):
            in_content = True
        elif in_content:
            content_lines.append(line)
    
    content = '\n'.join(content_lines).strip()
    
    return {
        "title": title,
        "meta": meta,
        "content": content,
        "category": category,
        "topic": topic
    }


def create_post_html(post: dict, date: datetime) -> str:
    """Create HTML file for the blog post"""
    
    slug = slugify(post["title"])
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post["title"]} — Active Mirror Blog</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="stylesheet" href="../../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="{post["meta"]}">
    <meta property="og:title" content="{post["title"]} — Active Mirror Blog">
    <meta property="og:description" content="{post["meta"]}">
    <meta property="og:image" content="https://activemirror.ai/assets/og-image.png">
    <meta property="og:url" content="https://activemirror.ai/blog/posts/{slug}.html">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
</head>
<body>
    <nav>
        <div class="container nav-content">
            <a href="/" class="logo"><img src="/assets/logo.png" alt="Active Mirror" style="height: 28px; vertical-align: middle; margin-right: 8px; filter: invert(1);">Active Mirror</a>
            <button class="mobile-menu-btn" aria-label="Menu">☰</button>
            <div class="nav-links">
                <a href="/product/">Product</a>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" target="_blank">Ecosystem</a>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/research/" target="_blank">Research</a>
                <a href="/company/">Company</a>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" target="_blank">Docs</a>
                <a href="/blog/" class="active">Blog</a>
                <a href="/contact/">Contact</a>
            </div>
        </div>
    </nav>

    <article class="section" style="padding-top: 120px;">
        <div class="container" style="max-width: 720px;">
            <span style="font-size: 0.75rem; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.05em;">{date.strftime("%B %d, %Y")} · {post["category"]}</span>
            <h1 style="margin: 16px 0 32px; font-size: 2.5rem; line-height: 1.2;">{post["title"]}</h1>
            <div class="blog-content" style="line-height: 1.8; color: var(--text-secondary);">
                {format_content(post["content"])}
            </div>
            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);">
                <a href="/blog/" class="text-accent">← Back to Blog</a>
            </div>
        </div>
    </article>

    <footer>
        <div class="container text-center">
            <p style="margin-bottom: 16px;"><span class="brand-glyph">⟡</span> Active Mirror</p>
            <p class="text-secondary" style="font-size: 0.85rem;">MIT License · Built in Goa, India</p>
            <p class="text-secondary" style="font-size: 0.75rem; margin-top: 8px;">© 2025 N1 Intelligence Pvt Ltd</p>
        </div>
    </footer>
</body>
</html>'''
    
    return html, slug


def format_content(content: str) -> str:
    """Format content paragraphs into HTML"""
    paragraphs = content.split('\n\n')
    html_parts = []
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if len(p) < 60 and not p.endswith('.') and not p.endswith(':'):
            html_parts.append(f'<h2 style="color: var(--text-primary); margin: 32px 0 16px; font-size: 1.5rem;">{p}</h2>')
        else:
            html_parts.append(f'<p style="margin-bottom: 20px;">{p}</p>')
    
    return '\n'.join(html_parts)


def main():
    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    TOPICS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    category, topic = get_next_topic()
    print(f"Generating post: {category} - {topic}")
    
    post = generate_blog_post(category, topic)
    print(f"Generated: {post['title']}")
    
    date = datetime.now()
    html, slug = create_post_html(post, date)
    
    filename = f"{date.strftime('%Y-%m-%d')}-{slug}.html"
    filepath = BLOG_DIR / filename
    
    with open(filepath, 'w') as f:
        f.write(html)
    
    print(f"Saved: {filepath}")
    
    meta = {
        "filename": filename,
        "title": post["title"],
        "meta": post["meta"],
        "category": category,
        "date": date.strftime("%Y-%m-%d"),
        "slug": slug
    }
    
    with open("scripts/latest_post.json", 'w') as f:
        json.dump(meta, f, indent=2)


if __name__ == "__main__":
    main()
