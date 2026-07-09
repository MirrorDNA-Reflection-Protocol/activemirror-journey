# MirrorProd Story OS

## Topic

- Name: MirrorProd Story OS
- Lane: Active Mirror public product, deploy candidate
- Status: open
- Owner: Paul
- Updated: 2026-07-09

## User Outcome

One sentence:

```text
Turn the India short-form and microdrama opportunity into a public, review-first business-video campaign demo.
```

## Why It Matters

- India short-form video and microdrama are high-signal markets, but a generic video generator is not defensible.
- MirrorProd can be higher value if it locks the business brief, story arc, approval state, outputs, and next-episode learning.
- The deploy candidate should prove the product loop and give users a scoped intake action before any generation/upload workflow.

## Source Material

- Files:
  - `/Users/mirror-pro/repos/active-mirror-site/docs/design-thinking-system/mirrorprod-story-os-v0.md`
  - `/Users/mirror-pro/repos/activemirror-site/mirrorprod-india/index.html`
  - `/Users/mirror-pro/repos/activemirror-site/videos/cafe-scam-alert.mp4`
  - `/Users/mirror-pro/repos/activemirror-site/videos/mprod-*.mp4`
  - `/Users/mirror-pro/repos/activemirror-site/videos/posters/cafe-scam-alert.jpg`
  - `/Users/mirror-pro/repos/activemirror-site/videos/posters/mprod-*.jpg`
- Links:
  - `https://www.lumikai.com/post/india-s-interactive-media-economy-state-of-interactive-media-report-2025`
  - `https://sensortower.com/blog/state-of-short-drama-apps-2025`
  - `https://blog.google/intl/en-in/brandcast-2025-ctv-shorts-and-youtube-as-indias-new-tv/`
  - `https://www.ascionline.in/social/wp-content/uploads/2025/04/ASCI-Influencer-Guidelines.pdf`
- Screenshots:
  - `/Users/mirror-pro/repos/activemirror-journey/output/playwright/mirrorprod-story-desktop-hero.png`
  - `/Users/mirror-pro/repos/activemirror-journey/output/playwright/mirrorprod-story-mobile.png`
  - `/Users/mirror-pro/repos/activemirror-journey/output/playwright/mirrorprod-story-action.png`
- Specs:
  - MirrorProd Story OS v0
- Commits:
  - `7116605 Add MirrorProd Story OS product spec`
- Live routes:
  - deploy candidate route: `/app/mirrorprod-story`
  - legacy MirrorProd route: `activemirror.ai/mirrorprod-india/` returned the generic Active Mirror page earlier in this session.
- Unknowns:
  - why the previous MirrorProd public route was reverted
  - whether MirrorProd should become a public route, sales artifact, or standalone brand

## Rules And Boundaries

- Consumer language: business outcome first, not internal architecture.
- Privacy: no client data, no private files, no raw vault material.
- Model/provider names: do not expose.
- Client exposure: use fictional cafe/bakery demo data only.
- Deploy path: product source first, then package only `dist/index.html`, `dist/404.html`, and `dist/assets/` through `/Users/mirror-pro/repos/active-mirror-site/public/app`.
- Approval required: public route, production deploy, credential use, upload, or auto-posting.
- No-touch paths:
  - deploy bridge repo unless explicitly packaging for deploy
  - homepage first screen
  - SWFI/client material

## Tools And Gates

- Local commands:
  - `npm run guard:front-door`
  - `npm run guard:language`
  - `npm run guard:friction`
  - `npm run guard:redaction`
  - `npm run truth`
  - `npm run build:deploy`
- Browser checks:
  - desktop `/app/mirrorprod-story`
  - mobile `/app/mirrorprod-story`
  - brief edits update story board and receipt
  - angle selection updates the selected campaign
  - copy brief action copies the edited campaign handoff
  - story sprint mail action includes the edited brief
  - hero leaves the production summary visible in the first desktop and mobile viewport
- Public canaries:
  - none in this slice
- Research checks:
  - already completed in the preceding market sweep
- Deploy checks:
  - `npm run app:package`
  - `npm run deploy:preflight`
  - `npm run site:worker:deploy`
  - `npm run deploy:verify`

## Current Proof

- Checked:
  - canonical target repo is `/Users/mirror-pro/repos/activemirror-journey`
  - legacy media pool exists under `/Users/mirror-pro/repos/activemirror-site/videos`
  - current deploy source reverted the public MirrorProd route
  - local preview route `/app/mirrorprod-story` renders with 9 video elements, 6 episodes, no horizontal overflow, and no console/page errors
  - media is imported from `src/assets/mirrorprod-story/` and emitted under `dist/assets/`, so deploy packaging does not need to copy a raw public route directory
  - desktop copy action and `mailto:` story-sprint action include the edited campaign brief
- Unchecked:
  - whether the Mini has newer MirrorProd assets
  - final production canary for `/app/mirrorprod-story`
- Evidence paths:
  - this packet
  - `docs/CONTINUITY_LEDGER.md`

## Bad News

- MirrorProd is not currently verified live as its own public route.
- This page is a review-first demo, not an automated generation/upload product.
- Video generation/upload credentials are not part of this build.

## Next Move

- Package the deploy candidate through the deploy bridge and verify the live `/app/mirrorprod-story` route.

## Update Log

### 2026-07-09 Deploy Candidate

- Changed: made the MirrorProd Story OS route deployable by moving media into Vite-bundled assets and adding a copyable story-sprint intake path.
- Files touched:
  - `src/pages/MirrorProdStory.jsx`
  - `src/pages/MirrorProdStory.css`
  - `src/assets/mirrorprod-story/`
  - `public/mirrorprod-story/` removed
- Tools/gates used:
  - `npm run build:deploy`
  - Playwright desktop/mobile smoke against `http://127.0.0.1:8976/app/mirrorprod-story`
- Deploy status:
  - packaging in progress
- Public routes checked:
  - pending after deploy
- Remaining risk:
  - production canary and live route proof still required

### 2026-07-09 Local Prototype

- Changed: created topic packet for the MirrorProd Story OS prototype.
- Files touched:
  - `docs/topic-packets/mirrorprod-story-os.md`
- Tools/gates used:
  - `npm run build:deploy`
  - Playwright desktop/mobile smoke against `http://127.0.0.1:8976/app/mirrorprod-story`
- Deploy status:
  - not deployed
- Public routes checked:
  - `https://activemirror.ai/mirrorprod-india/` returned generic Active Mirror page earlier in this session
- Remaining risk:
  - route and public brand decision remains open
