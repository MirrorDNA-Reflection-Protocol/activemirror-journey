# ⟡ URGENT: Fix activemirror.ai — Complete Site Audit & Repair

**Context:** We have 1000+ visitors in the last 24 hours and the site is broken. This needs to be fixed NOW.

## Current Issues Identified

### 1. Missing Assets
- `/assets/logo.png` returns 404 — referenced in legacy, terms, privacy pages
- The `assets/` folder exists in repo root but doesn't get copied to `public/` or `dist/`

### 2. Broken/Inconsistent Navigation
- Legacy page has malformed HTML (`<a>...</div>` mismatches)
- Some pages reference non-existent routes
- Navigation inconsistent across pages

### 3. Structural Issues
- React SPA (/) vs static HTML pages (/mirror/, /terms/, /privacy/, /legacy/)
- Mixed routing approaches causing confusion
- 404 handling may not work for all routes

## Required Actions

### Step 1: Asset Audit
```bash
# Check what's being referenced vs what exists
grep -rh "src=\|href=" public/ | grep -oE '"/[^"]+\.(png|jpg|svg|css)"' | sort -u

# Check what files actually exist
find public/ -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" \)
```

### Step 2: Fix Assets
```bash
# Copy assets to public folder
cp -r assets/ public/assets/

# Rebuild
npm run build
```

### Step 3: Full Link Audit
Test EVERY link on EVERY page:
- https://activemirror.ai/ (home - React SPA)
- https://activemirror.ai/mirror/ (reflection tool - static)
- https://activemirror.ai/terms/ (legal - static)
- https://activemirror.ai/privacy/ (legal - static)  
- https://activemirror.ai/legacy/ (old landing - static)

For each page, check:
1. Does it load without errors?
2. Do all images/assets load?
3. Do all internal links work?
4. Do all external links work?
5. Is the navigation consistent?

### Step 4: HTML Validation
Run all static HTML through validator:
```bash
# Check for malformed HTML
npx html-validate public/**/*.html
```

### Step 5: Console Errors
Open each page in browser, check console for:
- 404 errors (missing resources)
- JavaScript errors
- CORS issues

### Step 6: Mobile Check
Test on mobile viewport:
- Text not clipping
- Buttons clickable
- Consent gate working
- Chat input functional

## Files to Review

1. `public/legacy/index.html` - main landing page issues
2. `public/terms/index.html` - legal page
3. `public/privacy/index.html` - privacy page
4. `public/mirror/index.html` - reflection tool (CRITICAL - this is the product)
5. `src/pages/Home.jsx` - React home page
6. `vite.config.js` - build configuration

## Success Criteria

After fixes:
- [ ] ALL pages load without 404s
- [ ] ALL images display correctly
- [ ] ALL links navigate correctly  
- [ ] NO console errors on any page
- [ ] Chat works on /mirror/ (both cloud and sovereign modes)
- [ ] Mobile experience is clean
- [ ] Consent gate works and can be dismissed

## Git Workflow

1. Create a branch: `git checkout -b fix/site-audit`
2. Make all fixes
3. Test thoroughly locally: `npm run dev`
4. Build and test: `npm run build && npx serve dist`
5. Commit with clear message
6. Push and merge to main

## Priority

This is URGENT. Real users are seeing a broken site. Fix it completely, test it thoroughly, document what was wrong.
