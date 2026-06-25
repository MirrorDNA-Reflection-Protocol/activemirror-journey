# ⚠️ URGENT: activemirror.ai Complete Repair

**Traffic:** 1000+ visitors in 24 hours seeing broken site
**Priority:** CRITICAL — fix systematically, page by page

## The Problem

Recent changes broke the site:
1. Static pages moved to `_legacy_backup/` but links still point to old locations
2. Navigation links reference non-existent pages
3. Assets folder not in public/
4. HTML malformed in several places
5. The "Start Free" section on home looks broken

## Current Architecture

- **Main branch**: Source code (React + static HTML)
- **gh-pages branch**: Built/deployed site (auto-deploys from main)
- **React SPA**: `/` (home page via src/pages/Home.jsx)
- **Static HTML**: `/mirror/`, `/terms/`, `/privacy/`, `/legacy/`

## Pages to Fix (IN ORDER)

### Page 1: https://activemirror.ai/ (Home - React)
Source: `src/pages/Home.jsx`

Check:
- [ ] Logo displays correctly
- [ ] "Intelligence Reflected" text not clipped on mobile
- [ ] "Start Reflection" button works → goes to /mirror/
- [ ] "Visit Site" button works (what should this do?)
- [ ] "Protocol" and "The Story" buttons work
- [ ] Footer links work (Terms, Privacy)
- [ ] No console errors

### Page 2: https://activemirror.ai/mirror/ (Reflection Tool - Static)
Source: `public/mirror/index.html`

Check:
- [ ] Consent gate appears and "I Understand" button works
- [ ] After consent, chat interface loads
- [ ] Can type message and get response (Cloud mode)
- [ ] Sovereign mode toggle works
- [ ] All styling looks correct
- [ ] Mobile viewport works
- [ ] No console errors

### Page 3: https://activemirror.ai/terms/ (Legal - Static)
Source: `public/terms/index.html`

Check:
- [ ] Page loads with correct styling
- [ ] Logo in nav displays (currently 404 on /assets/logo.png)
- [ ] Nav links work (Mirror, Docs, GitHub)
- [ ] Footer links work
- [ ] No broken images

### Page 4: https://activemirror.ai/privacy/ (Legal - Static)
Source: `public/privacy/index.html`

Check:
- [ ] Same as terms page
- [ ] All links functional

### Page 5: https://activemirror.ai/legacy/ (Old Landing - Static)
Source: `public/legacy/index.html`

Check:
- [ ] Logo displays
- [ ] All nav links work
- [ ] "Launch Identity Generator" → id.activemirror.ai
- [ ] Solution cards display (even if "Coming Soon")
- [ ] GitHub repo links work
- [ ] Footer links work
- [ ] No 404 errors in console

## Known Broken Things

1. `/assets/logo.png` - 404
   - Fix: Copy `assets/` folder to `public/assets/` OR update references

2. Navigation links to non-existent pages:
   - `/blog/`, `/mobile/`, `/architecture/`, `/research/`, `/open-source/`, `/protocols/`
   - These pages exist in `_legacy_backup/static_pages/` but not served
   - Fix: Either restore pages OR remove/update links

3. Malformed HTML:
   - `<a href="...">...</div>` (mismatched tags)
   - Run HTML validator on all static pages

4. Home page "Visit Site" button:
   - Links to `./legacy/index.html` - is this intentional?

## Fix Strategy

### Option A: Minimal (Recommended)
1. Fix asset paths (logo.png)
2. Remove broken nav links (point to Docs/GitHub instead)
3. Fix malformed HTML
4. Ensure /mirror/ chat works perfectly
5. Test all pages end-to-end

### Option B: Full Restore
1. Move static pages back from `_legacy_backup/`
2. Restore full navigation
3. More work but complete site

## Commands to Run

```bash
# 1. Check what's broken
cd ~/Documents/GitHub/activemirror-site
grep -rn "/assets/logo" public/
grep -rn 'href="/blog\|href="/mobile\|href="/architecture' public/

# 2. Fix assets
mkdir -p public/assets
cp assets/logo.png public/assets/
cp assets/logo.jpg public/assets/
cp assets/og-image.png public/assets/

# 3. Validate HTML
npx html-validate "public/**/*.html" 2>/dev/null || echo "Install: npm i -D html-validate"

# 4. Build and test locally
npm run build
npx serve dist -p 3000

# 5. Test each page manually in browser

# 6. Commit and push
git add -A
git commit -m "fix: Complete site repair - all pages working"
git push origin main
```

## Success Criteria

- [ ] Zero 404 errors on any page
- [ ] Zero console errors
- [ ] All navigation works
- [ ] Chat on /mirror/ works (cloud mode minimum)
- [ ] Mobile looks good
- [ ] Consent gate functional
- [ ] Professional appearance restored

## DO NOT

- Do not remove safety features from /mirror/
- Do not change the core chat functionality
- Do not break what's working to fix what's broken
- Do not guess — test everything

---

**Start with Page 1, fix completely, verify, then move to Page 2, etc.**
