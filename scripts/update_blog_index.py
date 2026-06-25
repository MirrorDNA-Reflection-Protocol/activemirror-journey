#!/usr/bin/env python3
"""
Update the blog index page with the latest posts
"""

import json
from pathlib import Path
from datetime import datetime
import re

BLOG_INDEX = Path("blog/index.html")
BLOG_POSTS_DIR = Path("blog/posts")


def get_all_posts():
    """Get all blog posts sorted by date (newest first)"""
    posts = []
    
    for filepath in BLOG_POSTS_DIR.glob("*.html"):
        filename = filepath.name
        # Extract date from filename (YYYY-MM-DD-slug.html)
        match = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.html", filename)
        if match:
            date_str = match.group(1)
            slug = match.group(2)
            
            # Read file to extract title and meta
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
    
    # Sort by date descending
    posts.sort(key=lambda x: x["date"], reverse=True)
    return posts


def generate_post_html(post):
    """Generate HTML card for a single post"""
    date_obj = datetime.strptime(post["date"], "%Y-%m-%d")
    formatted_date = date_obj.strftime("%B %d, %Y")
    
    return f'''                <div class="card blog-card">
                    <span class="blog-date">{formatted_date} · {post["category"]}</span>
                    <a href="/blog/posts/{post["filename"]}">
                        <h3>{post["title"]}</h3>
                    </a>
                    <p>{post["meta"]}</p>
                </div>'''


def update_index():
    """Update the blog index with all posts"""
    posts = get_all_posts()
    
    if not posts:
        print("No posts found, keeping placeholder")
        return
    
    # Generate posts HTML
    posts_html = '\n'.join(generate_post_html(p) for p in posts)
    
    # Read current index
    content = BLOG_INDEX.read_text()
    
    # Replace the posts section
    pattern = r'(<div class="blog-grid" id="blog-posts">).*?(</div>\s*</div>\s*</section>)'
    replacement = f'''\\1
{posts_html}
            \\2'''
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write updated index
    BLOG_INDEX.write_text(new_content)
    print(f"Updated index with {len(posts)} posts")


if __name__ == "__main__":
    update_index()
