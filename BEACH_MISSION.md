# ⟡ MISSION: Restore activemirror.ai to Perfect State

**Operator:** Paul
**Executor:** Antigravity (Gemini Opus 4.5)
**Deadline:** Today — Paul goes to beach only when site is perfect
**Stakes:** 1000+ visitors seeing broken site. This reflects on us.

---

## PHASE 1: UNDERSTAND CURRENT STATE

### Step 1.1: Check what's actually being served
```bash
cd ~/Documents/GitHub/activemirror-site

# What branch is GitHub Pages serving?
gh api repos/MirrorDNA-Reflection-Protocol/activemirror-site/pages | jq '.source'

# What's on gh-pages branch?
git fetch origin gh-pages
git log origin/gh-pages --oneline -5

# What's on main?
git log main --oneline -5
```

### Step 1.2: Find the last known good state
```bash
# Look at commit history for when things worked
git log --oneline -30

# Check commits from before Jan 3 safety work
git log --oneline --before="2026-01-03"
```

### Step 1.3: Document what's broken RIGHT NOW
Visit each URL and note every issue:
- https://activemirror.ai/ 
- https://activemirror.ai/mirror/
- https://activemirror.ai/terms/
- https://activemirror.ai/privacy/
- https://activemirror.ai/legacy/

For each page record:
- Does it load?
- Console errors?
- Broken images?
- Broken links?
- Styling issues?

---

## PHASE 2: RECOVER WORKING STATE

### Step 2.1: Check _legacy_backup for original pages
```bash
ls -la _legacy_backup/static_pages/
```

These were moved here but links still point to old locations. We need them back.

### Step 2.2: Identify required pages
The site MUST have these working:
```
/                    → Home (React SPA or static)
/mirror/             → Reflection tool (CRITICAL - the product)
/terms/              → Terms of Service
/privacy/            → Privacy Policy  
/legacy/             → Legacy landing page (optional but linked)
```

These were linked but may be aspirational (decide: restore or remove links):
```
/blog/
/architecture/
/research/
/mobile/
/open-source/
/protocols/
/enterprise/
/solutions/*
```

### Step 2.3: Fix or remove broken links
DECISION REQUIRED: 
- Option A: Restore all pages from _legacy_backup (more complete)
- Option B: Remove links to pages we don't have (simpler)

**Recommend Option A** — restore the full site as it was.

---

## PHASE 3: FIX ASSETS

### Step 3.1: Copy assets to correct location
```bash
# Create public/assets if missing
mkdir -p public/assets

# Copy from root assets folder
cp -r assets/* public/assets/

# Verify
ls -la public/assets/
```

### Step 3.2: Check all asset references
```bash
# Find all image/asset references
grep -rh "src=\|href=" public/ | grep -oE '"[^"]*\.(png|jpg|svg|css|ico)"' | sort -u

# Check each one exists
```

---

## PHASE 4: FIX HTML ISSUES

### Step 4.1: Find malformed HTML
```bash
# Look for mismatched tags
grep -rn "<a.*</div>" public/
grep -rn "<div.*</a>" public/
```

### Step 4.2: Fix each file
Common issues:
- `<a href="...">...</div>` should be `<a href="...">...</a>`
- Missing closing tags
- Orphaned tags

### Step 4.3: Validate
```bash
npm install -g html-validate
html-validate "public/**/*.html"
```

---

## PHASE 5: REBUILD AND TEST

### Step 5.1: Clean build
```bash
rm -rf dist/
npm run build
```

### Step 5.2: Serve locally and test EVERY page
```bash
npx serve dist -p 3000
```

Open in browser and check:

**Page: http://localhost:3000/**
- [ ] Loads without errors
- [ ] Logo displays
- [ ] "Intelligence Reflected" not clipped
- [ ] "Start Reflection" → /mirror/
- [ ] "Visit Site" button works
- [ ] "Protocol" button works  
- [ ] "The Story" button works
- [ ] Terms/Privacy footer links work
- [ ] Mobile viewport looks good
- [ ] No console errors

**Page: http://localhost:3000/mirror/**
- [ ] Consent gate appears
- [ ] "I Understand" button dismisses gate
- [ ] Chat interface loads
- [ ] Can type and send message
- [ ] Gets response from AI
- [ ] Mode toggle works (Cloud/Sovereign)
- [ ] Mobile viewport works
- [ ] No console errors

**Page: http://localhost:3000/terms/**
- [ ] Page loads with styling
- [ ] Nav logo displays
- [ ] Nav links work
- [ ] Content readable
- [ ] Footer links work
- [ ] No console errors

**Page: http://localhost:3000/privacy/**
- [ ] Same checks as terms

**Page: http://localhost:3000/legacy/**
- [ ] Page loads with full styling
- [ ] Hero section displays correctly
- [ ] All nav links work or gracefully handled
- [ ] GitHub links work
- [ ] Solution cards display
- [ ] Footer complete
- [ ] No console errors

---

## PHASE 6: DEPLOY AND VERIFY

### Step 6.1: Commit all fixes
```bash
git add -A
git status  # Review what's being committed
git commit -m "⟡ Complete site restoration — all pages working

FIXED:
- Restored assets to public/assets/
- Fixed malformed HTML in all static pages
- Fixed/removed broken navigation links
- Verified all pages load correctly
- Tested chat functionality on /mirror/
- Verified mobile viewports

TESTED:
- / (home) ✓
- /mirror/ (reflection tool) ✓
- /terms/ ✓
- /privacy/ ✓
- /legacy/ ✓"
```

### Step 6.2: Push to main
```bash
git push origin main
```

### Step 6.3: Wait for GitHub Pages deploy
```bash
# Watch the deployment
gh run list --limit 5
```

### Step 6.4: Test production
Wait 2-3 minutes, then test EVERY page on live site:
- https://activemirror.ai/
- https://activemirror.ai/mirror/
- https://activemirror.ai/terms/
- https://activemirror.ai/privacy/
- https://activemirror.ai/legacy/

---

## PHASE 7: BULLETPROOF FOR FUTURE

### Step 7.1: Tag stable version
```bash
git tag -a v1.0-stable -m "Known working state - all pages verified"
git push origin v1.0-stable
```

### Step 7.2: Create pre-deploy checklist
Create file: `DEPLOY_CHECKLIST.md`
```markdown
# Before Pushing to Main

## Local Testing
- [ ] `npm run build` succeeds
- [ ] `npx serve dist` and tested all pages:
  - [ ] / loads, links work
  - [ ] /mirror/ loads, chat works
  - [ ] /terms/ loads
  - [ ] /privacy/ loads
  - [ ] /legacy/ loads
- [ ] No console errors on any page
- [ ] Mobile viewport checked
- [ ] All images load

## After Push
- [ ] GitHub Action succeeded
- [ ] Live site tested
- [ ] All pages working

If anything broken: `git revert HEAD && git push`
```

### Step 7.3: Add GitHub Action for validation
Create `.github/workflows/validate.yml`:
```yaml
name: Validate Site
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Check for 404s in built site
        run: |
          npx linkinator dist --recurse --skip "^(?!http://localhost)" || true
```

---

## SUCCESS CRITERIA

**Paul goes to beach when ALL of these are true:**

1. ✅ https://activemirror.ai/ — Loads perfectly, all links work
2. ✅ https://activemirror.ai/mirror/ — Consent gate works, chat works
3. ✅ https://activemirror.ai/terms/ — Loads with correct styling
4. ✅ https://activemirror.ai/privacy/ — Loads with correct styling
5. ✅ https://activemirror.ai/legacy/ — Loads with full content
6. ✅ Zero console errors on any page
7. ✅ Zero 404 errors on any page
8. ✅ Mobile looks professional on all pages
9. ✅ Tagged v1.0-stable for rollback safety
10. ✅ DEPLOY_CHECKLIST.md created

---

## ROLLBACK PLAN

If something goes catastrophically wrong:
```bash
# Find the last working commit
git log --oneline -20

# Reset to it
git reset --hard <commit-hash>
git push origin main --force

# Or if we tagged properly
git reset --hard v1.0-stable
git push origin main --force
```

---

## NOTES FOR EXECUTOR

1. **Don't ask questions** — make reasonable decisions and document them
2. **Test everything locally before pushing** — no pushing untested code
3. **If unsure about removing vs keeping content** — keep it
4. **The /mirror/ page is the PRODUCT** — it must work perfectly
5. **Document every fix** — Paul needs to know what changed
6. **Take your time** — thorough > fast

---

**When complete, report back with:**
1. List of everything fixed
2. Screenshots or confirmation of each page working
3. The git commit hash of the stable version
4. Any decisions made and why

⟡ Make the site reflect who we are: thoughtful, professional, trustworthy.
