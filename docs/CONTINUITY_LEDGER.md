# Active Mirror Continuity Ledger

This file is the working state object for the Active Mirror public-site lane. Read it before changing the site, deploy bridge, model route, public copy, or user flow.

It exists to prevent repo confusion, repeated strategy loops, stale deploy assumptions, and internal language leaking onto the public product.

## Current Lane

- Lane: Active Mirror public product and commercial front door.
- Product source repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy bridge repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live app: `https://activemirror.ai/app/`
- Live public research route: `https://activemirror.ai/app/research/`
- Root research route: `https://activemirror.ai/research/`
- SWFI/client work: out of scope unless Paul explicitly switches lanes.

## Standing Rules

- Start from the user outcome, not the architecture.
- Keep the first screen simple: `What do you want?`
- Keep consumer copy short, normal, and non-technical.
- Do not expose model names publicly until routing and policy are settled.
- Do not expose client names or confidential deployment details.
- Keep `BrainScan`, `MirrorSeed`, `MirrorDNA`, `kernel`, `protocol`, `sovereign`, `cryptographic`, and similar internal language out of consumer copy unless the route is explicitly technical.
- Use public proof language only when backed by files, commits, DOI records, source trails, or verified routes.
- Bad news, partial status, and limits must be stated before success language.
- Do not touch unrelated dirty files.

## Active Gates

Source repo gates:

- `npm run guard:language`
- `npm run build:deploy`
- `npm run guard:dossiers`
- `.mirror` contracts through the existing build chain

Deploy repo gates:

- `npm run build`
- `npm run copy:audit`
- `npm run smoke:browser`
- `npm run canary:prod`

Public copy guard:

- Script: `scripts/public_language_guard.mjs`
- Purpose: block internal/legal/architecture phrases from likely visible public copy.
- Required visible research phrases:
  - `Real work, safely anonymized.`
  - `Proof you can open.`

## Current State: 2026-07-05

Recent shipped work:

- Added public research route in the source repo.
- Added deploy support for `/research/` and `/app/research/`.
- Added `docs/dossiers/reflective-orchestration-kernel.md` as an internal architecture north-star dossier.
- Changed public proof copy away from internal lines like `What we can claim` and `client exposure`.
- Added public language guard so those phrases are blocked before future builds.
- Deployed the updated app bundle to `activemirror.ai`.

Verified live:

- `https://activemirror.ai/app/assets/Research-Cy-kCjEG.js` is live and contains the corrected research copy.
- `npm run smoke:browser` passed on production for mobile and desktop routes, including `/app/research/`.
- `npm run canary:prod` passed `15/15`.
- Playwright visible-text check passed for `/app/research/` on mobile and desktop:
  - shows `Real work, safely anonymized.`
  - shows `Proof you can open.`
  - shows `Source repository`
  - does not visibly show `MirrorDNA`
  - does not visibly show `SWFI`
  - does not visibly show internal claim/kernel language

Recent source commits:

- `cc5a32b Add public research route`
- `d5fe59c Refine research proof copy and add ROK dossier`
- `764febe Add public language guard`

Recent deploy commits:

- `aefb487 Deploy public research route`
- `d88bcbb Cover research route in browser smoke`
- `4284a06 Deploy refined research proof copy`
- `54b143a Deploy public language guard copy`

## Known Limits

- Product source and deploy bridge are still two repos.
- Browser-local state is not yet a full owned identity or cross-device memory layer.
- The public app is not the full ActiveMirrorOS control plane.
- The ROK dossier is internal architecture context, not a public implementation claim.
- Public research/case-study language is intentionally anonymized until Paul approves stronger client wording.
- `caniuse-lite` may emit a stale data warning during builds; this did not block the latest build.
- `friction-sweep` referenced a missing `references/friction-classes.md` file during this session, so the sweep used the evident friction class directly.

## Current Local Dirt To Preserve

Do not revert or stage without a separate reason:

- `.mirror/CONTEXT_PACK.yaml`
- `.mirror/SOURCE_LEDGER.md`
- `docs/dossiers/README.md`
- `docs/wiki/current-product-map.md`
- `docs/wiki/language-guide.md`
- `scripts/sync_wiki_to_obsidian.mjs`
- `docs/ACTIVE_MIRROR_HARDENING_RESOLUTION_CONTRACTS.md`
- `docs/dossiers/context-coordination-layer.md`
- `docs/dossiers/decision-reason-mapper.md`
- `docs/dossiers/evolution-control-plane.md`
- `docs/dossiers/memory-skill-layer.md`
- `docs/dossiers/synthetic-continuity-boundary.md`

Deploy repo dirt to preserve:

- `/Users/mirror-pro/repos/active-mirror-site/docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`

## Next Safe Move

Keep improving the public product from the user side:

1. Review the live home and app flow as a first-time user.
2. Remove anything that feels like explanation before usefulness.
3. Keep chat primary.
4. Add only one useful generated surface when the chat clearly needs it.
5. Keep enterprise machinery on enterprise/research pages, not the consumer first screen.
6. Run source gates, package to deploy repo, then run live smoke and canary before calling it shipped.

## Topic Ingestion Protocol

When any new Active Mirror topic comes up, convert it into a small state packet before acting. The point is to make the next run feel like it never left without relying on chat memory.

Use this order:

1. Classify the lane: Active Mirror public site, deploy bridge, gateway/model route, enterprise/research page, AMOS/internal architecture, or out-of-scope.
2. Name the user-facing outcome in one sentence.
3. List the source material: files, links, screenshots, attached specs, commits, live routes, or unknowns.
4. Bind the rules: consumer language, privacy, model names, client exposure, deploy path, approval needs, and no-touch paths.
5. Name the tools/gates needed: build, guard, Playwright smoke, canary, web research, copy guard, or deploy bridge.
6. State the current proof and the missing proof.
7. Add the smallest next action.

For a lightweight topic, append a dated entry to this file.

For a topic that will last more than one session, create a topic packet from `docs/TOPIC_PACKET_TEMPLATE.md` and link it here. If it becomes a strategy or architecture item, promote it to `docs/dossiers/` only after it has a clear user outcome and boundaries.

## Topic Packets

- None promoted yet after this ledger was created.

## Update Rule

After each bounded Active Mirror site task, append a new dated entry with:

- what changed;
- files touched;
- tools and gates used;
- deploy status;
- public routes checked;
- bad news or limits;
- next safe move.

Do not turn this into a strategy essay. Keep it operational.

## Ledger Entries

### 2026-07-05: Continuity Ledger Created

- Changed: added this continuity ledger and linked it from `AGENTS.md`.
- Files touched:
  - `docs/CONTINUITY_LEDGER.md`
  - `AGENTS.md`
  - `/Users/mirror-pro/.codex/memories/extensions/ad_hoc/notes/20260705T112621Z-active-mirror-continuity-ledger.md`
- Tools and rules used:
  - `receipt-ledger` skill shape for operational receipts.
  - `.mirror/TASK_CONTRACT.yaml`, `.mirror/AGENT_POLICY.yaml`, `.mirror/STATUS.md`, `.mirror/DECISIONS.md`, `.mirror/RISKS.md`, `.mirror/PLAN.md`.
  - Repo wiki start page at `docs/wiki/README.md`.
- Deploy status: not deployed yet; this entry is documentation/control-plane continuity, not a public UI change.
- Public routes checked before this ledger entry:
  - `https://activemirror.ai/app/research/`
  - `https://activemirror.ai/research/`
- Bad news or limits:
  - This file improves repo continuity, but it is not a runtime memory system by itself.
  - Cross-topic continuity still requires future runs to read this file and update it.
- Next safe move: run the source docs/build gates, commit this ledger, then package/deploy only if the docs change needs to be present in the live app bundle.
