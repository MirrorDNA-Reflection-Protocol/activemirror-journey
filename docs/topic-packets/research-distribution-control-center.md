# Research Discovery And Distribution Control Center

## Topic

- Name: Research discovery and multi-network distribution
- Lane: Active Mirror
- Status: open
- Owner: Paul Desai
- Updated: 2026-08-11

## User Outcome

One sentence:

```text
Make Active Mirror research easy to find, then prepare one approved publication packet that can be scheduled across connected social accounts without repeated logins.
```

## Why It Matters

- The live research route currently redirects into a client-rendered app shell, so paper content and citation metadata are absent from the initial HTML.
- Repeated manual posting creates account, copy, and proof drift.

## Source Material

- Files: `src/data/research.json`, `src/pages/Research.jsx`, `scripts/build_research_pages.mjs`
- Links: `https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Desai%2C%20Paul%22`, `https://github.com/MirrorDNA-Reflection-Protocol/mirror-ledger`
- Screenshots: deploy bridge `output/playwright/research-desktop.png`, `research-mobile.png`, `electric-mind-mobile.png`
- Commits: pending for this source slice
- Live routes: `https://activemirror.ai/research/`, `https://activemirror.ai/app/research/`
- Unknowns: Mini reachability, Postiz host name, and exact account identities beyond Paul's LinkedIn profile

## Rules And Boundaries

- Consumer language: call records theses, preprints, reports, or corrections according to their source; do not imply peer review.
- Privacy: public metadata only; no credentials or private account data in manifests.
- Deploy path: build here, exact-copy through `active-mirror-site`, then use its separate deployment gate.
- Approval required: exact content, destination identity, schedule, and an unexpired packet hash before dispatch.
- No-touch paths: unsafe approval-free `visibility_engine.py`; parked legacy `ai.mirrordna.auto-publish` service.

## Tools And Gates

- Local commands: `npm run build:deploy`, `npm audit`
- Browser checks: Playwright desktop and 390px mobile screenshots; clean browser console
- Research checks: exact creator-bound Zenodo snapshot, DOI uniqueness, static metadata guard
- Deploy checks: deploy bridge preflight and Cloudflare Worker dry run only

## Current Proof

- Checked: eight exact Zenodo records, static collection and Electric Mind pages, canonical/citation/JSON-LD metadata, responsive rendering, package copy, Worker alias, sitemap, and `llms.txt` source trail.
- Unchecked: live deployment, search-engine indexing, Google Scholar inclusion, Postiz runtime health, and every social-provider OAuth connection.
- Evidence paths: `dist/research/` in source; `research/` and `site-worker/index.js` in the deploy branch.

## Bad News

- The improved pages are not live until the separately governed deploy bridge is merged and deployed.
- Postiz is selected but not installed because the always-on Mini was unreachable and the host/OAuth identities are not proven.
- Each social network still requires one initial provider authorization; the control center removes repeat logins after that.

## Next Move

- Review and merge the deploy bridge pull request through the production gate, verify both public routes, then install Postiz on the Mini and connect exact accounts one time.

## Update Log

### 2026-08-11

- Changed: created crawler-readable research pages and a dedicated Electric Mind thesis page; added the guarded MirrorPublish/Postiz distribution design.
- Files touched: research catalog, React research page, static generator/guard, package scripts, deploy packaging/Worker/sitemap/identity files.
- Tools/gates used: source build gates, zero-vulnerability dependency audit, deploy preflight, Cloudflare dry run, and Playwright desktop/mobile review.
- Deploy status: source-ready and packaged on a non-main deploy branch; not live.
- Public routes checked: current live redirects/app shell were audited; new pages were checked locally only.
- Remaining risk: production deployment/indexing and provider OAuth remain pending.
