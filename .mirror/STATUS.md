# Active Mirror Status

Updated: 2026-07-07

## Current State

- Product source repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy/gateway repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live app route: `https://activemirror.ai/app/`
- Current live app bundle verified: `index-BBeJ1fR5.js`
- Gateway health version verified: `2026-07-07-media-kv-fallback-v1`

## Verified Checks

- `npm run guard:mirror` passed.
- `npm run build:deploy` passed in product source.
- `npm run guard:front-door` passed.
- `npm run guard:friction` passed.
- `npm run guard:redaction` passed.
- `npm run truth` passed with scoped limitations.
- `npm run build && npm run copy:audit` passed in deploy repo.
- `npm run canary:prod` passed 14/14.
- Live mobile `/app/id/` verified after the 2026-07-04 setup polish: `Set it up.`, four taps, plain result rows, browser-local state, no old setup copy, no overflow, no console errors.
- Repo-local wiki added at `docs/wiki/README.md` and included in `.mirror/CONTEXT_PACK.yaml`.
- Obsidian reference sync is available through `npm run wiki:obsidian`.
- Repo-local dossiers are available at `docs/dossiers/` and checked with `npm run guard:dossiers`.
- Artifact outputs carry runtime challenge packets checked by `npm run guard:challenge`.
- Offline/online owned-AI positioning and AMOS proof-layer intake are captured as dossiers, not consumer homepage copy.
- Production mobile and desktop privacy smoke passed.
- Production artifact route returned a usable draft, not advice about making one.
- `build:deploy` is wired through `prebuild:deploy`, so deploy packaging runs the local guard chain.
- `guard:mirror` preserves canonical local repo paths but also runs inside GitHub Actions checkouts.
- `.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml` exists for risky deploy/file/memory actions.
- `npm run mirror:report` prints checked scope, unchecked scope, bad news, and next controls.
- `npm run mirror:context` builds a file-derived context pack from `.mirror/CONTEXT_PACK.yaml`.
- `.mirror/AUDIT_LOGS/TEMPLATE.yaml` and `.mirror/ROLLBACKS/TEMPLATE.yaml` define receipt and restore shapes.
- `.mirror/SOURCE_LEDGER.md` tracks public claims that need local evidence or fresh verification.
- `.mirror/SKILLS/` contains lightweight policy stubs only; it does not spawn agent teams.
- AMOS control-plane foundation contracts exist as schemas for SCD state,
  workspace boundary, consent ladder, and agent contract.
- Live generated-media storage currently reports `kv_durable_free_tier` with
  signed gateway URLs and secret HMAC signing.

## Bad News / Known Limits

- The product source and deploy/gateway source are still two repos.
- GitHub Pages legacy deployment can time out in `deployment_queued`; a `gh-pages` republish may be needed.
- Browser-local state is useful, but not a full owned identity/memory sync layer yet.
- Generated artifacts are useful text/brief/code outputs today; they are not yet a fully sandboxed file-export system.
- The current UI is still a product front door, not the full ActiveMirrorOS control plane.
- File export registry exists as a design stub only; there are no active registered exports.
- Approval requests are scaffolded, but no real approval workflow is wired into the app yet.
- Audit, rollback, skill, and source-ledger files are repo-local contracts only; they are not a runtime control plane.
- GitHub Wiki is not canonical or mirrored; the Obsidian copy is generated reference material only.
- The new AMOS control-plane schemas are contracts only; no runtime validator or
  action gate consumes them yet.

## Unrelated Local Dirt

- `docs/ACTIVE_MIRROR_HARDENING_RESOLUTION_CONTRACTS.md` is untracked and was not created by this status update.
- `.mirror/.PLAN.md.swp` is held by an active Vim process and was not removed.
