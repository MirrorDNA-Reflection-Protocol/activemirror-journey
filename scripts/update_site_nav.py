import os
import re

# Configuration
ROOT_DIR = '/Users/mirror-admin/Documents/GitHub/activemirror-site'
TARGET_EXT = '.html'

# New Content
NAV_LINKS_CONTENT = '''<div class="nav-links">
                <a href="/demo/" style="color:var(--text-primary); font-weight:500;">Demo</a>
                <a href="/mobile/">Mobile</a>
                <a href="/architecture/">Architecture</a>
                <a href="/research/">Research</a>
                <a href="/open-source/">Open Source</a>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" target="_blank">Docs</a>
                <a href="/blog/">Blog</a>
            </div>'''

FOOTER_LINKS_CONTENT = '''<div class="footer-links">
                <a href="https://github.com/MirrorDNA-Reflection-Protocol">GitHub</a>
                <a href="https://twitter.com/pauldesai123">Twitter</a>
                <a href="mailto:paul@activemirror.ai">Email</a>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" target="_blank">Docs</a>
                <a href="/mobile/">Mobile</a>
                <a href="/architecture/">Architecture</a>
                <a href="/research/">Research</a>
                <a href="/open-source/">Open Source</a>
                <a href="/protocols/">Protocols</a>
                <a href="/blog/">Blog</a>
            </div>'''

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Regex patterns
    # Handles various spacing and line breaks
    nav_pattern = re.compile(r'<div class="nav-links">[\s\S]*?</div>', re.MULTILINE)
    footer_pattern = re.compile(r'<div class="footer-links"[\s\S]*?>[\s\S]*?</div>', re.MULTILINE) # Handle potential style attrs

    # Update Nav
    # Special handling: Check if any link should be 'active'
    # Simple approach: replace all, then regex to set active based on path
    # But for now, just standardizing links is the priority. 
    # The 'active' class logic might be lost, but consistency is better than broken links.
    # We can try to preserve active state if we determine the current page matches.
    
    content = nav_pattern.sub(NAV_LINKS_CONTENT, content)
    
    # Update Footer
    content = footer_pattern.sub(FOOTER_LINKS_CONTENT, content)

    if content != original_content:
        print(f"Updating {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        print(f"No changes for {filepath}")

def main():
    print(f"Scanning {ROOT_DIR}...")
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith(TARGET_EXT):
                filepath = os.path.join(root, file)
                update_file(filepath)
    print("Update complete.")

if __name__ == "__main__":
    main()
