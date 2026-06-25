#!/usr/bin/env python3
"""
Update RSS feed with all blog posts
"""

import json
from pathlib import Path
from datetime import datetime
import re

BLOG_POSTS_DIR = Path("blog/posts")
FEED_FILE = Path("feed.xml")


def get_all_posts():
    """Get all blog posts sorted by date (newest first)"""
    posts = []
    
    for filepath in BLOG_POSTS_DIR.glob("*.html"):
        filename = filepath.name
        match = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.html", filename)
        if match:
            date_str = match.group(1)
            slug = match.group(2)
            
            content = filepath.read_text()
            
            title_match = re.search(r"<title>(.+?) — Active Mirror Blog</title>", content)
            title = title_match.group(1) if title_match else slug.replace("-", " ").title()
            
            meta_match = re.search(r'<meta name="description" content="(.+?)">', content)
            meta = meta_match.group(1) if meta_match else ""
            
            category_match = re.search(r'letter-spacing: 0\.05em;">.*? · (.+?)</span>', content)
            category = category_match.group(1) if category_match else "AI Sovereignty"
            
            posts.append({
                "filename": filename,
                "date": date_str,
                "title": title,
                "meta": meta,
                "category": category,
                "slug": slug
            })
    
    posts.sort(key=lambda x: x["date"], reverse=True)
    return posts


def generate_rss_item(post):
    """Generate RSS item for a single post"""
    date_obj = datetime.strptime(post["date"], "%Y-%m-%d")
    pub_date = date_obj.strftime("%a, %d %b %Y 00:00:00 +0000")
    
    return f'''    <item>
      <title>{post["title"]}</title>
      <link>https://activemirror.ai/blog/posts/{post["filename"]}</link>
      <description>{post["meta"]}</description>
      <pubDate>{pub_date}</pubDate>
      <guid>https://activemirror.ai/blog/posts/{post["filename"]}</guid>
      <category>{post["category"]}</category>
    </item>'''


def update_feed():
    """Update the RSS feed with all posts"""
    posts = get_all_posts()
    
    if not posts:
        print("No posts found")
        return
    
    items = '\n'.join(generate_rss_item(p) for p in posts)
    last_build = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")
    
    feed = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Active Mirror Blog</title>
    <description>Insights on sovereign AI, local LLMs, identity persistence, and the future of human-AI collaboration.</description>
    <link>https://activemirror.ai/blog/</link>
    <atom:link href="https://activemirror.ai/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>{last_build}</lastBuildDate>
{items}
  </channel>
</rss>'''
    
    FEED_FILE.write_text(feed)
    print(f"Updated RSS feed with {len(posts)} posts")


if __name__ == "__main__":
    update_feed()
