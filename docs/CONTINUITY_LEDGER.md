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

For a topic that will last more than one session, create a topic packet from `docs/TOPIC_PACKET_TEMPLATE.md`, save it under `docs/topic-packets/`, and link it here. If it becomes a strategy or architecture item, promote it to `docs/dossiers/` only after it has a clear user outcome and boundaries.

## Topic Packets

- [AMOS Cognitive Mesh v0.1](./topic-packets/amos-cognitive-mesh-v0-1.md)

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

### 2026-07-05: Continuity Guard Added

- Changed: added a build-time continuity guard so the repo checks for the ledger, topic packet template, AGENTS pointer, canonical repo paths, required sections, and key gates.
- Files touched:
  - `scripts/continuity_guard.mjs`
  - `package.json`
  - `docs/CONTINUITY_LEDGER.md`
- Tools and gates used:
  - `npm run guard:continuity`
  - `npm run build:deploy`
- Deploy status: not deployed yet; this is source/build governance only unless a later slice packages a new app bundle.
- Public routes checked: none for this guard-only slice.
- Bad news or limits:
  - The guard verifies the continuity contract exists and is wired, but it does not prove future agents read with judgment.
  - It checks repo-local continuity, not global memory across every machine or client.
- Next safe move: commit and push the guard, then use it as part of every future `prebuild`.

### 2026-07-05: Context Pack Continuity Auto-Ingest

- Changed: `npm run mirror:context` now auto-includes the continuity ledger, topic packet template, and all Markdown files under `docs/topic-packets/`.
- Files touched:
  - `scripts/mirror_context_pack_builder.mjs`
  - `docs/topic-packets/README.md`
  - `docs/CONTINUITY_LEDGER.md`
- Tools and gates used:
  - `npm run mirror:context`
  - `npm run guard:continuity`
  - `npm run build:deploy`
- Deploy status: not deployed yet; this is repo-context/governance behavior, not a public UI change.
- Public routes checked: none for this context-pack slice.
- Bad news or limits:
  - This improves model/session continuity only when agents run or read the context pack.
  - It does not sync private memory across devices or models by itself.
- Next safe move: commit and push, then create topic packets only for active multi-session topics instead of dumping every idea into the ledger.

### 2026-07-05: Readable Context Bundle Added

- Changed: added `npm run mirror:context:bundle`, which writes a readable Markdown context bundle to `outputs/active-mirror-context-bundle.md`.
- Files touched:
  - `scripts/mirror_context_pack_builder.mjs`
  - `scripts/continuity_guard.mjs`
  - `package.json`
  - `docs/CONTINUITY_LEDGER.md`
- Tools and gates used:
  - `npm run mirror:context`
  - `npm run mirror:context:bundle`
  - `npm run guard:continuity`
  - `npm run build:deploy`
- Deploy status: not deployed; this is a local context-pack capability.
- Public routes checked: none for this local context-pack slice.
- Bad news or limits:
  - Very large files are included by path, bytes, and hash instead of full content to keep the bundle ingestible.
  - The bundle is generated under `outputs/`; it is evidence and runtime context, not source truth.
- Next safe move: use topic packets for active long-running topics, then regenerate the bundle before handing work to another model or session.

### 2026-07-05: Experimental Multilingual Reflection

- Changed: added experimental reply-language detection and payload routing so Active Mirror can answer in the user's message/browser language without adding another setup step.
- Files touched:
  - `src/lib/language-preference.js`
  - `src/lib/first-turn-fallback.js`
  - `src/pages/HomePage.jsx`
  - `src/pages/Start.jsx`
  - `src/components/TruthStateNotice.jsx`
  - `scripts/multilingual_guard.mjs`
  - `package.json`
  - `docs/CONTINUITY_LEDGER.md`
- Gateway companion changes live in `/Users/mirror-pro/repos/active-mirror-site/worker/src/` and must be deployed before live multilingual model replies are guaranteed.
- Tools and gates planned:
  - `npm run guard:multilingual`
  - `npm run build:deploy`
  - `/Users/mirror-pro/repos/active-mirror-site`: `npm run worker:test`
  - Live smoke with non-English prompt after worker deploy.
- Deploy status: not deployed at the time of this ledger entry.
- Bad news or limits:
  - This is not full product UI translation yet.
  - Non-English support is experimental because model quality varies by language and the browser built-in translation APIs are not universal.
  - The first durable claim is multilingual reflection, source-check, and artifact routing; localized onboarding can follow later if real users need it.
- Next safe move: run source and worker tests, package app bundle into the deploy repo, deploy the worker/site, then verify a Hindi or Hinglish prompt on `https://activemirror.ai/app/`.

### 2026-07-05: Answer-First Intent Router Correction

- Changed: user testing showed Active Mirror was asking reflective questions when the user wanted online information. The product rule is now: reflection mirrors intent internally; the visible mode should answer, source-check, draft, create, or ask one necessary detail.
- Files touched:
  - `src/pages/HomePage.jsx`
  - `src/components/TruthStateNotice.jsx`
  - `scripts/first_turn_friction_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
  - Gateway companion changes in `/Users/mirror-pro/repos/active-mirror-site/worker/src/` and `worker/KERNEL.md`.
- Product phrasing:
  - ChatGPT-class assistant behavior, with Active Mirror as the harness for intent, privacy, truth, continuity, and usefulness.
  - Reflection is for the model first; the user should feel understood, not interrogated.
- Bad news or limits:
  - This does not yet implement full browser-local continuity memory beyond existing save/import/export surfaces.
  - Shopping/source quality depends on the gateway source-check provider and available sources.
- Next safe move: run guards/tests, then verify that a prompt like "I am looking for tires online" auto-checks sources instead of rendering a reflection-question card.

### 2026-07-05: Front Door Copy Lock

- Decision: the consumer front door should stay simple: `What do you want?` plus `Reflection > Prediction`.
- Product rule: do not explain the thesis on the first screen. Let the user type, then let Active Mirror infer intent, source-check when needed, draft when asked, and ask only one necessary question.
- Personality rule: keep the feel fast, direct, lightly warm, and nonlinear-friendly without naming personality labels, cognitive styles, or diagnoses.
- Bad news or limits:
  - This still depends on the source-check route for current web answers.
  - Browser-local continuity is not full cross-device identity sync yet.
- Next safe move: package this copy and answer-first router into the deploy repo and verify with Playwright.

### 2026-07-05: Shipped Answer-First Harness

- Source commit: `5c9d1a9 Refine Active Mirror first-turn assistant behavior`.
- Deploy commit: `7c4fcd0 Deploy Active Mirror answer-first harness`.
- Worker deploy: `active-mirror-site-gateway` version `42b7de4c-269d-4c26-9fd4-2ecd35c06d92`.
- Pages deploy: GitHub Actions `Deploy site` run `28741543099`, success.
- Production checks:
  - `npm run canary:prod`: `15/15` pass.
  - Live Playwright front-door check passed on `https://activemirror.ai/app/`.
  - Local Playwright smoke verified "I am looking for tires online" routes directly to source-check first and "Who are you?" routes through the deterministic Active Mirror identity path.
- Shipped behavior:
  - Front door: `What do you want?` and `Reflection > Prediction`.
  - Current/search/shopping asks source-check first instead of showing a reflection-question card.
  - Identity questions use the signed Active Mirror identity capsule instead of local marketing copy.
  - The product character is fast, direct, useful, and nonlinear-friendly without user labels or diagnoses.
- Bad news or limits:
  - Static site and gateway are deployed; full browser-local continuity is still not cross-device sync.
  - Source answers depend on the live source-check provider and may return a verification plan when citations are not strong enough.
  - The app can feel like Codex/ChatGPT in behavior, but it must not get Codex-level shell/keychain/repo access without explicit scoped connectors and approval gates.
- Next safe move: add browser-local continuity ledger entries for accepted conclusions and user-approved working defaults, then expose them as a small "what you chose to remember" view.

### 2026-07-05: Browser-Local Saved Context

- Changed: added explicit user-approved saved continuity in the browser. The visible label is `Saved by you`, not ledger/internal language.
- Files touched:
  - `src/lib/mirror-state.js`
  - `src/pages/HomePage.jsx`
  - `src/pages/Privacy.jsx`
  - `src/pages/Terms.jsx`
  - `scripts/first_turn_friction_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
- Product rule:
  - Nothing enters the saved continuity list automatically.
  - The same Save button that approves a useful answer stores a short intent and next move locally.
  - The user can reuse, delete, or clear saved items from the drawer.
- Security/legal rule:
  - Store minimized text only: short intent, short move, source, timestamp.
  - No full transcript, hidden profile, files, prompts, or server-side memory is created by this slice.
  - Privacy and Terms now name saved notes/browser-local memory explicitly.
- Bad news or limits:
  - This is not cross-device identity sync.
  - Browser storage can be cleared by the user/browser and is not a backup.
  - This does not make the public app a professional advice, emergency, legal, medical, or financial service.
- Next safe move: run guards/build, package into the deploy repo, deploy the static app, and verify live with a save/open/clear smoke test.

### 2026-07-05: Front Door Legal Link Cleanup

- Changed: removed the duplicate top-nav `Privacy` link from the front door. Privacy and Terms remain in the footer/legal area.
- File touched:
  - `src/pages/HomePage.jsx`
- Product rule:
  - Legal links should be findable but not repeated in the first-screen navigation.
- Next safe move: rebuild, package, and redeploy the app bundle.

### 2026-07-06: First-Turn Copy And Metadata Polish

- Changed: softened explicit-secret/privacy fallback language, replaced the internal setup download name with `active-mirror-settings.json`, added social/link preview metadata, exposed `Enterprise` in the front-door footer, and aligned the Worker deterministic privacy fallback with the browser fallback.
- Source files touched:
  - `index.html`
  - `src/lib/first-turn-fallback.js`
  - `src/pages/HomePage.jsx`
  - `src/pages/DeviceExperience.jsx`
  - `src/pages/Start.jsx`
  - `scripts/first_turn_friction_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy/gateway files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `public/app/**`
  - `public/manifest.json`
  - `scripts/browser-smoke.mjs`
  - `worker/src/mirror-kernel.js`
- Deploy status:
  - Gateway deployed: `active-mirror-site-gateway` version `caa3238e-7bf5-4b37-9ad0-aba66223aa3f`.
  - Static site deployed: `active-mirror-static-site` version `ef6ced5a-eebf-44dd-b72c-c817ee41450a`.
- Tools and gates used:
  - Source: `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Local red team: `npm run redteam:local` (`100/100`, failed `0`, fallback `0`)
  - Deploy repo: `npm run copy:audit`, `npm run guard:canonical`, `npm run build`, `npm run site:worker:dry`
  - Live: `npm run canary:prod` (`20/20`), `npm run redteam:prod-smoke` (`20/20`, failed `0`, fallback `0`), `npm run smoke:prod`, `ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`
  - Screenshot smoke: `SMOKE_SCREENSHOT_DIR=/tmp/active-mirror-smoke-20260706 ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`
- Public routes checked:
  - `https://activemirror.ai/`
  - `https://activemirror.ai/app/`
  - `https://activemirror.ai/app/id/`
  - `https://activemirror.ai/app/device/`
  - `https://activemirror.ai/app/enterprise/`
  - `https://activemirror.ai/app/about/`
  - `https://activemirror.ai/app/research/`
  - `https://activemirror.ai/app/privacy/`
  - `https://activemirror.ai/app/terms/`
  - root aliases and metadata routes: `/manifest.json`, `/robots.txt`, `/sitemap.xml`
- Bad news or limits:
  - The social image is the existing brand poster asset, not a fresh product-scene OG image.
  - Browser-local saved context is still device/browser-local, not cross-device identity sync.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: test the live first turn with real user prompts, then improve only the response surface that feels confusing in actual use.

### 2026-07-06: Pleasant Conversation Hardening

- Changed: softened deterministic first-turn language, kept anti-sycophancy intact, fixed product-vs-reset classifier priority, and made the phone `/device/` first impression more inviting.
- Source files touched:
  - `src/lib/first-turn-fallback.js`
  - `src/pages/DeviceExperience.jsx`
  - `scripts/first_turn_friction_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy/gateway files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/mirror-kernel.js`
  - `worker/test/mirror-kernel.test.mjs`
  - `worker/test/first-turn-quality.test.mjs`
  - `scripts/red-team-gateway.mjs`
  - `scripts/browser-smoke.mjs`
  - `public/app/**`
- Product decisions:
  - Vague starts now say `Give me one direction and I can start.`
  - Source-sensitive turns say `This needs checking before it shapes your next move.`
  - Drift/reset turns say `There are too many things open. Make one of them lighter first.`
  - Product/page language routes to launch clarity, but hallucination/overthinking/drift language routes to reset first.
  - Phone starter chips use a three-column layout so actions do not clip off-screen.
- Deploy status:
  - Gateway deployed: `active-mirror-site-gateway` version `8b6d1272-eb1e-4b1a-8ff9-af53a717f9f5`.
  - Static site deployed: `active-mirror-static-site` final version `f3919bee-6959-4a1e-8f6b-13bf92f061af`.
- Tools and gates used:
  - Source: `npm run build:deploy`
  - Worker: `npm run worker:test` (`42 + 34 + first-turn 116/116`)
  - Local red team: `npm run redteam:local` (`100/100`, failed `0`, fallback `0`)
  - Deploy repo: `npm run copy:audit`, `npm run guard:canonical`, `npm run build`, `npm run site:worker:dry`
  - Live: `npm run canary:prod` (`20/20`), `npm run redteam:prod-smoke` (`20/20`, failed `0`, fallback `1`), source `npm run smoke:prod`, `ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`
  - Screenshot smoke: `SMOKE_SCREENSHOT_DIR=/tmp/active-mirror-pleasant-final-20260706 ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`
  - Live conversation sample checked prompts: `website`, `I keep going in circles and losing the thread.`, `What are the latest GenUI competitors today?`, `Tell me I am right that everyone else is wrong.`, `I want Active Mirror to feel magical without overexplaining the machinery.`
- Public routes checked:
  - `https://activemirror.ai/`
  - `https://activemirror.ai/app/`
  - `https://activemirror.ai/app/device/`
  - `https://activemirror.ai/app/id/`
  - `https://activemirror.ai/app/enterprise/`
  - `https://activemirror.ai/app/about/`
  - `https://activemirror.ai/app/research/`
  - `https://activemirror.ai/app/privacy/`
  - `https://activemirror.ai/app/terms/`
  - root aliases and metadata routes: `/manifest.json`, `/robots.txt`, `/sitemap.xml`
- Bad news or limits:
  - Prod red-team saw `fallback_count: 1`; the fallback held guardrails, but it means one live model call did not produce the primary path.
  - The phone `/device/` route is now cleaner, but the main homepage remains the primary consumer front door.
  - This pass improves tone and deterministic fallbacks; it does not add cross-device memory or a new model provider.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: run a small human-style prompt review on artifact creation and source-check turns, then adjust only if the user gets blocked when they expected a direct answer or draft.

### 2026-07-06: Enterprise Workflow Copy Polish

- Changed: cleaned the enterprise route so the machinery reads like a workflow preview instead of an internal demo console.
- Source files touched:
  - `src/pages/Enterprise.jsx`
  - `scripts/public_language_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `public/app/**`
  - `scripts/browser-smoke.mjs`
- Product decisions:
  - Use `Workflow preview`, `Sample flows`, `How the work moves`, and `Review steps`.
  - Block old visible phrases such as `Live workflow console`, `demo on`, `Approval activity`, `Review path`, and `request -> boundary`.
  - Keep the full machinery on the enterprise page, not the consumer first screen.
- Deploy status:
  - Static site deployed: `active-mirror-static-site` version `b99516d9-c353-48e6-948e-048f4816d67f`.
  - No Worker deploy was needed; gateway code did not change in this slice.
- Tools and gates used:
  - Source: `npm run guard:language`, `npm run build:deploy`
  - Worker: `npm run worker:test`, `npm run quality:conversation`
  - Deploy repo: `npm run app:package`, `npm run guard:canonical`, `npm run copy:audit`, `npm run build`, `npm run site:worker:dry`
  - Live: `npm run smoke:interaction`, `ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`, `npm run canary:prod`
- Public routes checked:
  - `https://activemirror.ai/app/enterprise/`
  - mobile and desktop smoke routes for `/app/`, `/app/id/`, `/app/device/`, `/app/enterprise/`, `/app/about/`, `/app/consulting/`, `/app/research/`, `/app/privacy/`, and `/app/terms/`
- Bad news or limits:
  - This is copy/presentation polish only; it does not add new enterprise backend functionality.
  - Product source and deploy bridge are still two repos.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: review the live enterprise page as a buyer, then decide whether to add one anonymized case-study proof block or keep the page purely workflow-led.

### 2026-07-06: Anonymized Enterprise Case Study Strengthened

- Changed: upgraded the enterprise case-study block from a thin before/after card set into a buyer-readable field story with withheld names/data, what changed in practice, and a repeatable workflow outcome.
- Source files touched:
  - `src/pages/Enterprise.jsx`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `public/app/**`
  - `scripts/browser-smoke.mjs`
- Product decisions:
  - Keep the proof anonymized: `Names and data withheld`.
  - Use practical language: selected context, weak lines surfaced, human review first, repeatable path.
  - Do not name clients, use logo-slide language, or claim a broad platform rollout.
- Deploy status:
  - Static site deployed: `active-mirror-static-site` version `c08efb02-ca45-4c49-9acc-dbe711e54dd1`.
  - No Worker deploy was needed; gateway code did not change in this slice.
- Tools and gates used:
  - Source: `npm run guard:language`, `npm run guard:continuity`, `npm run build:deploy`
  - Deploy repo: `npm run app:package`, `npm run guard:canonical`, `npm run copy:audit`, `npm run build`, `npm run site:worker:dry`
  - Live: `npm run smoke:interaction`, `ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`, `npm run canary:prod`
  - Screenshot QA: `/tmp/active-mirror-case-study-20260706/desktop-case-section.png`, `/tmp/active-mirror-case-study-20260706/mobile-case-section.png`, `/tmp/active-mirror-case-study-20260706/mobile-case-proof-grid.png`
- Public routes checked:
  - `https://activemirror.ai/app/enterprise/`
  - mobile and desktop smoke routes for `/app/`, `/app/id/`, `/app/device/`, `/app/enterprise/`, `/app/about/`, `/app/consulting/`, `/app/research/`, `/app/privacy/`, and `/app/terms/`
- Bad news or limits:
  - The first build failed because `not every note` was an absolute public claim; it was softened to `with surrounding notes kept out unless needed`.
  - Full-page screenshot capture returned black images, so targeted section screenshots were used for visual QA.
  - This is still an anonymized pattern, not a named client case study or a new enterprise backend feature.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: decide whether enterprise needs a short `What buyers get` strip above the request form, or stop here and keep the page from getting heavier.

### 2026-07-06: Live User Prompt QA and Practical Draft Fix

- Changed: added a repeatable live user-prompt QA harness and fixed three user-facing behavior gaps found through it.
- Source files touched:
  - `src/pages/HomePage.jsx`
  - `src/lib/language-preference.js`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/mirror-kernel.js`
  - `scripts/user-prompt-qa.mjs`
  - `scripts/interaction-smoke.mjs`
  - `scripts/browser-smoke.mjs`
  - `package.json`
  - `public/app/**`
- Product decisions:
  - Practical `reply`, `text`, `note`, and `dm` requests should open a usable draft surface immediately.
  - `recently` is current-info language and should route toward source checking instead of reflective-only output.
  - Hinglish remains experimental, but the prompt should avoid technical English like `tradeoff`, `friction`, `frame`, and `premise`.
  - Artifact-first top copy should not stay in a stale `Making...` state after the draft is ready; it now says `The draft opens below.`
- Deploy status:
  - Gateway Worker deployed: `active-mirror-site-gateway` version `efa9d25f-c0d1-45db-b788-8f986cf60a6d`.
  - Static site deployed after final polish: `active-mirror-static-site` version `5605d306-df5a-4345-ac9e-172a7818adf5`.
- Tools and gates used:
  - Source: `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Deploy repo: `npm run app:package`, `npm run guard:canonical`, `npm run copy:audit`, `npm run build`, `npm run site:worker:dry`, `npm run worker:deploy`, `npm run site:worker:deploy`
  - Live: `npm run qa:user-prompts` split as `13/13` plus `9/9`, focused post-polish `4/4`, `npm run smoke:interaction`, `npm run smoke:browser`, `npm run canary:prod`, `npm run redteam:prod-smoke`
- Live prompt QA coverage:
  - 22 user-style prompts across mobile and desktop: source/search, artifacts, decisions, vague/stuck turns, identity, sycophancy bait, privacy, Hinglish, and enterprise trust.
  - Fixed failures: stalled practical sister-reply draft, `recently` memory search not source-checking, and false-positive Hinglish flattery test caused by `perfect start`.
  - Visual QA screenshot: `/tmp/active-mirror-qa/mobile-reply-draft-final-ready.png`
- Bad news or limits:
  - Playwright's managed browser cache was missing on this machine; smoke scripts now fall back to installed Chrome only when the managed executable is absent.
  - Multilingual is still experimental, not a broad quality guarantee.
  - The prompt QA checks user-visible behavior, not every possible prompt or every browser/device class.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: keep the new QA in the deploy gate and add only one new prompt case when a real user hits a confusing response.

### 2026-07-06: Saved Context Home Cue

- Changed: added a quiet home-page cue when the browser already has user-approved saved context.
- Source files touched:
  - `src/pages/HomePage.jsx`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `scripts/browser-smoke.mjs`
- Product decisions:
  - Do not explain memory, ledger, or internal architecture on the home page.
  - Show `Pick up where you left off` only after the user explicitly saves context.
  - Keep the main experience chat-first; the cue offers `Continue` and `Saved` without adding a dashboard.
- Deploy status:
  - Static site deployed: `active-mirror-static-site` version `04968e49-ca47-4cdd-98fa-c4fdb97a7943`.
  - No Worker deploy was needed; gateway code did not change in this slice.
- Tools and gates used:
  - Source: `npm run guard:language`, `npm run guard:continuity`, `npm run build:deploy`
  - Deploy repo: `npm run app:package`, `npm run deploy:preflight`, `npm run site:worker:deploy`
  - Live: `ACTIVE_MIRROR_USER_QA_CASES=4 ACTIVE_MIRROR_USER_QA_DELAY_MS=1500 npm run deploy:verify`
  - Saved-context smoke: `SMOKE_SUBMIT_FIRST_TURN=true ACTIVE_MIRROR_BASE_URL=https://activemirror.ai/app npm run smoke:browser`
- Public routes checked:
  - mobile and desktop smoke routes for `/app/`, `/app/id/`, `/app/device/`, `/app/enterprise/`, `/app/about/`, `/app/consulting/`, `/app/research/`, `/app/privacy/`, and `/app/terms/`
- Bad news or limits:
  - The first saved-context smoke failed because the test navigated away before old follow-up/artifact assertions; the smoke order was fixed and rerun clean.
  - This is browser-local continuity only. It is not account sync, a remote vault, or cross-device memory.
  - Continue uses the same reflection route; no new backend memory authority was added.

### 2026-07-07: Poster Requests Generate Real Images

- Changed: fixed the media artifact route so user requests like `make me a poster` produce an actual downloadable image instead of only a visual brief.
- Source files touched:
  - `src/components/ArtifactCard.jsx`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/index.js`
  - `worker/test/gateway-guardrails.test.mjs`
  - `scripts/user-prompt-qa.mjs`
  - `public/app/**`
- Product decisions:
  - Keep chat primary; only open the artifact surface when the user asks for a thing.
  - Use Gemini for image generation because it is the media lane, not the reflection/personality lane.
  - Do not show model names to users.
  - If image generation fails, fall back to a clear visual brief instead of claiming a poster exists.
- Deploy status:
  - Gateway Worker deployed after the Gemini image fix: `active-mirror-site-gateway` version `10188660-0654-45aa-af33-d13d35c808cf`.
  - Static site already deployed with the image renderer: `active-mirror-static-site` version `1bb7c409-b8f7-4411-96bc-ccce7c7186ac`.
- Tools and gates used:
  - Source: `npm run guard:language`, `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Live direct API: poster request returned `fallback: false`, `kind: image`, and JPEG media data.
  - Live browser QA: `ACTIVE_MIRROR_USER_QA_START=16 ACTIVE_MIRROR_USER_QA_CASES=1 ACTIVE_MIRROR_USER_QA_TIMEOUT_MS=120000 ACTIVE_MIRROR_USER_QA_DELAY_MS=1500 npm run qa:user-prompts`
  - Live: `npm run smoke:interaction`, `npm run smoke:browser`, `npm run canary:prod`, `npm run redteam:prod-smoke`
- QA fix:
  - Added a `poster_image` user-prompt case.
  - Removed the bare `Save` readiness marker because `Saved only if you choose` could make the harness sample before the artifact finished.
  - The poster case now requires visible `Poster ready` or `Download image`.
- Bad news or limits:
  - Generated images are returned as inline media in the artifact payload; long-term production should move media to object storage or a signed URL path.
  - Browser QA needed a longer timeout because real image generation is slower than text.
  - This adds poster/image generation, not video, PDF rendering, or document export beyond existing text downloads.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: add one user-visible retry/regenerate control for image artifacts, then add a storage-backed media route before heavy ad traffic.

### 2026-07-07: Image Media Hardening and Retry Controls

- Changed: added image-specific budget enforcement, health-route truth for media storage, and user-visible retry controls for generated image artifacts.
- Source files touched:
  - `.mirror/PLAN.md`
  - `src/components/ArtifactCard.jsx`
  - `src/components/DraftActions.jsx`
  - `src/lib/challenge-packet.js`
  - `src/pages/HomePage.jsx`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/index.js`
  - `worker/wrangler.jsonc`
  - `worker/test/gateway-guardrails.test.mjs`
  - `public/app/**`
- Product decisions:
  - Keep image generation useful but bounded; media calls have stricter per-session, per-network, and daily budgets than normal chat.
  - Keep the app language normal: `Image`, `Image prompt`, `Try again`, and `Make cleaner` instead of `visual brief`.
  - Tell the truth in `/health`: media storage is `inline_fallback` unless an R2 bucket binding exists.
  - Do not claim durable hosted media, signed URLs, or canvas editing yet.
- Deploy status:
  - Gateway Worker deployed: `active-mirror-site-gateway` version `ab37e5dc-9e12-40ca-939c-63dab4c1a3d8`.
  - Static site deployed: `active-mirror-static-site` version `6adae9a8-d8bc-46bc-a519-7f8a4cce6a3e`.
- Tools and gates used:
  - Source: `npm run guard:language`, `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Deploy repo: `npm run app:package`, `npm run deploy:preflight`, `npm run worker:deploy`, `npm run site:worker:deploy`
  - Live health: `https://gateway.activemirror.ai/health` returned `image_budget: enabled`, image limits `2/12/5/80`, and `media_storage: inline_fallback`.
  - Live direct API: poster request returned `fallback: false`, `kind: image`, `title: Poster`, `media_source: gemini_image`, `media_transport: inline`, and JPEG media data.
  - Live browser QA: `ACTIVE_MIRROR_USER_QA_START=16 ACTIVE_MIRROR_USER_QA_CASES=1 ACTIVE_MIRROR_USER_QA_TIMEOUT_MS=120000 ACTIVE_MIRROR_USER_QA_DELAY_MS=1500 npm run qa:user-prompts`
  - Live: `npm run smoke:interaction`, `npm run smoke:browser`, `npm run canary:prod`, `npm run redteam:prod-smoke`
- Public routes checked:
  - `https://activemirror.ai/app/`
  - mobile and desktop smoke routes for `/app/`, `/app/id/`, `/app/device/`, `/app/enterprise/`, `/app/about/`, `/app/consulting/`, `/app/research/`, `/app/privacy/`, and `/app/terms/`
- Bad news or limits:
  - No R2/KV media bucket binding is configured in the Worker, so generated images still travel inline in the artifact response.
  - Retry and clean-up buttons re-run generation; they are not a full image editor.
  - The deploy repo still has unrelated dirty file `docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md`; preserve it unless separately owned.
- Next safe move: add R2-backed signed media storage before ad traffic or heavy public image usage.

### 2026-07-07: AMOS Cognitive Mesh Intake

- Changed: captured the AMOS Cognitive Mesh Build Pack v0.1 as internal
  architecture intake and separated it from the consumer front door.
- Source files touched:
  - `docs/dossiers/amos-cognitive-mesh.md`
  - `docs/topic-packets/amos-cognitive-mesh-v0-1.md`
  - `docs/dossiers/README.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - AMOS mesh language stays internal or enterprise-facing.
  - Public Active Mirror stays chat-first, simple, and useful.
  - No agent gets direct authority; future AMOS runtime work must pass through
    scope, containment, receipts, and approval for consequential actions.
- Deploy status:
  - Not deployed; this is docs/intake unless paired with a later app bundle.
- Tools and gates planned:
  - `npm run guard:dossiers`
  - `npm run guard:language`
  - `npm run build:deploy`
- Bad news or limits:
  - This does not ship MirrorGateway, MirrorTruth, MirrorVec, execution
    containers, Pixel approval, or a full agent mesh.
  - The current public app must not claim the AMOS mesh is live.
- Next safe move: finish the current public gateway/media hardening slice, then
  decide the canonical AMOS runtime repo before coding mesh modules.

### 2026-07-07: Signed Image URL Transport

- Changed: replaced brittle inline generated-image payloads with signed gateway
  media URLs. When R2 is not configured, the gateway now uses a short-lived
  Cloudflare edge-cache media URL instead of putting the image inside the JSON
  artifact response.
- Source files touched:
  - `index.html`
  - `src/components/ArtifactCard.jsx`
  - `src/pages/FeedbackDashboard.jsx`
  - `src/pages/HomePage.jsx`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/index.js`
  - `worker/test/gateway-guardrails.test.mjs`
  - `scripts/production-canary.mjs`
  - `scripts/gateway-monitor.mjs`
  - `scripts/app-fallbacks.mjs`
  - `scripts/browser-smoke.mjs`
  - `public/app/**`
- Product decisions:
  - Poster/image requests must produce a real image when the media route works.
  - The browser should render a signed image URL, not a large inline base64 JSON
    payload.
  - `/app/feedback/` is an operator surface and must report image storage truth
    without saying R2 is enabled.
- Deploy status:
  - Gateway Worker deployed: `active-mirror-site-gateway` version
    `36e42029-8d28-4fbe-8c9f-144b4526d1b8`.
  - Static site deployed: `active-mirror-static-site` version
    `34dc7aa8-48a7-4d13-8c0d-298d940f3fb6`.
- Tools and gates used:
  - Source: `npm run guard:dossiers`, `npm run guard:language`,
    `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Deploy repo: `npm run app:package`, `npm run deploy:preflight`,
    `npm run worker:deploy`, `npm run site:worker:deploy`
  - Live: `ACTIVE_MIRROR_USER_QA_START=16 ACTIVE_MIRROR_USER_QA_CASES=1 ACTIVE_MIRROR_USER_QA_TIMEOUT_MS=150000 ACTIVE_MIRROR_USER_QA_DELAY_MS=1500 npm run qa:user-prompts`
  - Live: `npm run canary:prod`, `npm run smoke:browser`,
    `npm run redteam:prod-smoke`
- Public routes checked:
  - `https://activemirror.ai/app/`
  - mobile and desktop smoke routes for home, setup aliases, enterprise, about,
    consulting, research, device, feedback, privacy, and terms
  - `https://gateway.activemirror.ai/health`
- Bad news or limits:
  - Cloudflare R2 is still not enabled for the account, so this is temporary
    edge-cache delivery, not durable private media storage.
  - Health currently reports `media_storage=edge_cache_ephemeral`,
    `media_url_policy=ephemeral_signed_gateway_url`, and
    `media_url_ttl_seconds=900`.
  - Media signing is still `receipt_hash_fallback`; configure a real
    `MIRROR_MEDIA_SIGNING_SECRET` plus R2 before paid traffic.
  - A browser QA failure exposed the exact old issue:
    `ERR_QUIC_PROTOCOL_ERROR.QUIC_TOO_MANY_RTOS` on large inline image JSON.
    The fix was the signed URL path plus a CSP update allowing gateway-hosted
    images.
- Next safe move: enable R2, bind `MIRROR_MEDIA_BUCKET`, set
  `MIRROR_MEDIA_SIGNING_SECRET`, then move from temporary edge cache to durable
  signed media storage.

### 2026-07-07: Minimal First-Turn Repair

- Changed: simplified the first uncertain-user path. If a visitor says they do
  not know what to ask, the app now answers with one plain start line and four
  choices: Make, Decide, Fix, Understand.
- Source files touched:
  - `src/lib/first-turn-fallback.js`
  - `src/pages/HomePage.jsx`
  - `scripts/first_turn_friction_guard.mjs`
  - `docs/CONTINUITY_LEDGER.md`
- Deploy files touched in `/Users/mirror-pro/repos/active-mirror-site`:
  - `worker/src/index.js`
  - `worker/test/gateway-guardrails.test.mjs`
  - `public/app/**`
- Product decisions:
  - Public Active Mirror stays simple, minimal, and chat-first.
  - "I do not know what to ask" is not a failure; it is a start state.
  - Consumer UI should not expose copy/save controls on the start-helper path.
  - Poster, flyer, and image requests should produce artifacts directly when
    the media route is available.
- Deploy status:
  - Gateway Worker deployed: `active-mirror-site-gateway` version
    `3d2c0146-6196-4fca-9549-f67f3983d305`.
  - Static site deployed: `active-mirror-static-site` version
    `699e0869-80a3-47a2-b1d0-0f3dc6998223`.
- Tools and gates used:
  - Source: `npm run build:deploy`
  - Worker: `npm run worker:test`
  - Deploy repo: `npm run app:package`, `npm run deploy:preflight`,
    `npm run worker:deploy`, `npm run site:worker:deploy`,
    `npm run deploy:verify`
  - Focused live mobile check for: `I do not know what to ask`
- Public routes checked:
  - `https://activemirror.ai/app/`
  - mobile and desktop smoke routes for home, setup aliases, enterprise, about,
    consulting, research, device, feedback, privacy, and terms
- Bad news or limits:
  - The truth gate remains scoped to public presentation files and does not
    prove the whole repo, the whole machine, or external certification.
  - This does not build the full AMOS control plane; it only improves the public
    chat-first front door and artifact language.
- Next safe move: keep the homepage minimal, then move the AMOS control-plane
  machinery into enterprise/internal surfaces instead of the consumer first
  screen.

### 2026-07-07: AMOS Control-Plane Contract Intake

- Changed: absorbed the leverageable pieces from the layered AMOS stack note as
  repo-local contracts, not homepage language.
- Source files touched:
  - `.mirror/schemas/scd_state.schema.json`
  - `.mirror/schemas/workspace_boundary.schema.json`
  - `.mirror/schemas/consent_ladder.schema.json`
  - `.mirror/schemas/agent_contract.schema.json`
  - `.mirror/STATUS.md`
  - `.mirror/README.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/dossiers/README.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Leverage now: state contract, workspace boundary, consent ladder, and agent
    contract.
  - Defer: desktop shell, Crabbox, OpenWiki, MCP bridge, graph/vector memory,
    UX4G component library, and SWFI-specific workspace.
  - Keep consumer first screen free of AMOS/control-plane language.
- Deploy status:
  - Not deployed; no public assets changed in this slice.
- Tools and gates planned:
  - `npm run guard:dossiers`
  - JSON parse over `.mirror/schemas/*.schema.json`
  - `npm run guard:language`
  - `npm run build:deploy`
- Bad news or limits:
  - These schemas are not enforcement yet.
  - The consumer app still does not implement the full AMOS control plane.
  - No approval workflow, durable memory sync, external tool action, or safe
    execution runner is made live by this intake.
- Next safe move: build a local validator that checks an SCD state, workspace
  boundary, consent ladder, and agent contract before a future action can run.

### 2026-07-07: AMOS Contract Gate

- Changed: built the local validator from the AMOS control-plane contract slice.
- Source files touched:
  - `.mirror/CONTRACTS/amos/scd_state.example.json`
  - `.mirror/CONTRACTS/amos/workspace_boundary.personal.example.json`
  - `.mirror/CONTRACTS/amos/consent_ladder.default.json`
  - `.mirror/CONTRACTS/amos/agent_contract.mirror_concierge.example.json`
  - `.mirror/CONTRACTS/amos/action_request.allowed.example.json`
  - `.mirror/CONTRACTS/amos/action_request.blocked.example.json`
  - `.mirror/schemas/action_request.schema.json`
  - `scripts/amos_contract_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Contract gate returns `allow`, `approval_required`, or `block`.
  - The gate checks schema versions, workspace match, agent match, pending
    action, tool allowlist, read/write boundaries, egress, consent, approval
    token, and output type.
  - `npm run guard:amos-contracts` is now part of `npm run prebuild`.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:amos-contracts`
  - explicit allowed and blocked action examples with `--expect`
- Bad news or limits:
  - This is local repo enforcement only.
  - The live app and gateway do not yet consume these contracts at runtime.
  - No external tool, memory promotion, file export, or approval queue was made
    live.
- Next safe move: attach this gate to one real local action, likely memory
  proposal or artifact export, before expanding to MCP tools or external writes.

### 2026-07-07: AMOS Memory Proposal Gate

- Changed: attached the AMOS contract gate to the first real repo-local action:
  creating a reviewable memory proposal.
- Source files touched:
  - `.mirror/CONTRACTS/amos/scd_state.example.json`
  - `.mirror/CONTRACTS/amos/workspace_boundary.personal.example.json`
  - `.mirror/CONTRACTS/amos/agent_contract.mirror_concierge.example.json`
  - `.mirror/CONTRACTS/amos/action_request.memory_proposal.example.json`
  - `.mirror/CONTRACTS/amos/memory_proposal_request.example.json`
  - `.mirror/MEMORY_UPDATE_PROPOSALS/20260707T123500Z-front_door_start_state.yaml`
  - `.mirror/schemas/memory_proposal_request.schema.json`
  - `scripts/amos_memory_proposal_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Memory starts as a proposal, not a hidden save.
  - The proposal writer runs the existing contract gate first and writes
    nothing when the action is blocked or approval-required.
  - Durable memory promotion remains approval-required and is not implemented
    by this slice.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:amos-contracts`
  - `npm run guard:memory-proposal`
  - `node scripts/amos_memory_proposal_gate.mjs --dry-run`
  - `node scripts/amos_memory_proposal_gate.mjs --write --timestamp 20260707T123500Z`
  - blocked-action probe with `action_request.blocked.example.json` returned
    `block` and wrote nothing
  - `npm run guard:dossiers`
  - JSON parse check for the new schema and example contracts
  - `npm run build:deploy`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The written proposal is pending review, not accepted memory.
  - The live app and gateway do not consume these contracts at runtime.
  - No browser memory, canonical memory, cross-device identity, or approval
    workflow was made live.
- Next safe move: connect the same contract pattern to approval request
  creation or artifact export.

### 2026-07-07: AMOS Approval Request Gate

- Changed: attached the AMOS contract gate to approval request creation. A
  candidate action that passes boundaries but requires approval can become a
  pending approval request; blocked actions and already-allowed actions write
  nothing.
- Source files touched:
  - `.mirror/CONTRACTS/amos/scd_state.approval.example.json`
  - `.mirror/CONTRACTS/amos/action_request.publish_public.approval.example.json`
  - `scripts/amos_approval_request_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Approval requests are for real risky actions only.
  - The self-test writes only to a temp directory.
  - No fake pending approval file was created in `.mirror/APPROVAL_REQUESTS/`.
  - Approval requests do not approve themselves and do not execute the target
    action.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:approval-request`
  - `node scripts/amos_contract_gate.mjs --state .mirror/CONTRACTS/amos/scd_state.approval.example.json --action .mirror/CONTRACTS/amos/action_request.publish_public.approval.example.json --expect approval_required`
  - `node scripts/amos_approval_request_gate.mjs --dry-run`
  - JSON parse check for the new approval example contracts
  - `npm run guard:dossiers`
  - `npm run build:deploy`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The live app and gateway do not consume these contracts at runtime.
  - There is still no human approval UI, approval token signing flow, or
    runtime action executor.
- Next safe move: connect the same contract pattern to artifact export.

### 2026-07-07: AMOS Artifact Export Gate

- Changed: attached the AMOS contract gate to local-only artifact export.
  A draft artifact can be copied only from an allowed repo-local source root
  into `.mirror/ARTIFACT_EXPORTS/` after path, root, content-type,
  secret-scan, SHA-256, and manifest checks pass.
- Source files touched:
  - `.mirror/CONTRACTS/amos/scd_state.example.json`
  - `.mirror/CONTRACTS/amos/workspace_boundary.personal.example.json`
  - `.mirror/CONTRACTS/amos/agent_contract.mirror_concierge.example.json`
  - `.mirror/CONTRACTS/amos/action_request.artifact_export.example.json`
  - `.mirror/CONTRACTS/amos/artifact_export_request.example.json`
  - `.mirror/schemas/artifact_export_request.schema.json`
  - `.mirror/ARTIFACT_SOURCES/example-first-move.md`
  - `.mirror/ARTIFACT_EXPORTS/.gitkeep`
  - `.mirror/ARTIFACT_EXPORTS/TEMPLATE.yaml`
  - `scripts/amos_artifact_export_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `.mirror/FILE_EXPORT_REGISTRY.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - No model gets raw download authority.
  - Export remains local-only and receipt-backed.
  - Public download routes, signed URLs, durable storage, and UI wiring remain
    out of scope for this slice.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:artifact-export`
  - `node scripts/amos_contract_gate.mjs --action .mirror/CONTRACTS/amos/action_request.artifact_export.example.json --expect allow`
  - `node scripts/amos_artifact_export_gate.mjs --dry-run`
  - JSON parse check for the new artifact schema and examples
  - `npm run guard:dossiers`
  - `npm run guard:mirror`
  - `npm run build:deploy`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The live app and gateway do not consume these contracts at runtime.
  - No public file URL, browser download button, R2 object, or approval UI was
    made live.
- Next safe move: add audit-log receipts for the local gates before any live
  runtime wiring.

### 2026-07-07: AMOS Audit Log Gate

- Changed: attached the AMOS contract gate to local audit-log receipt creation.
  A checked local gate can now write a repo-local audit receipt after an
  explicit audit-log action request passes workspace, agent, tool, consent, and
  output checks.
- Source files touched:
  - `.mirror/CONTRACTS/amos/scd_state.example.json`
  - `.mirror/CONTRACTS/amos/workspace_boundary.personal.example.json`
  - `.mirror/CONTRACTS/amos/agent_contract.mirror_concierge.example.json`
  - `.mirror/CONTRACTS/amos/action_request.audit_log.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.example.json`
  - `.mirror/schemas/audit_log_request.schema.json`
  - `.mirror/AUDIT_LOGS/20260707T130000Z-amos_local_gates.yaml`
  - `scripts/amos_audit_log_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Local gate checks should leave evidence before live runtime wiring is
    claimed.
  - Audit logs record checked scope, unchecked scope, evidence, bad news,
    decision, and follow-up.
  - Audit logs are not approvals and do not execute actions.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:audit-log`
  - `node scripts/amos_contract_gate.mjs --action .mirror/CONTRACTS/amos/action_request.audit_log.example.json --expect allow`
  - `node scripts/amos_audit_log_gate.mjs --dry-run`
  - `node scripts/amos_audit_log_gate.mjs --write --timestamp 20260707T130000Z`
  - JSON parse check for the new audit schema and example contracts
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The live app and gateway do not consume these contracts at runtime.
  - The receipt is local YAML only; at that point it was not signed,
    hash-chained, published, or connected to a verifier.
- Next safe move: sign or chain local receipts before claiming tamper-evident
  runtime proof.

### 2026-07-07: AMOS Receipt Chain Gate

- Changed: added deterministic local hash-chain verification for AMOS audit
  receipts.
- Source files touched:
  - `.mirror/CONTRACTS/amos/audit_log_request.receipt_chain.example.json`
  - `.mirror/AUDIT_LOGS/20260707T131500Z-amos_receipt_chain.yaml`
  - `.mirror/RECEIPT_CHAINS/.gitkeep`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `.mirror/schemas/receipt_chain.schema.json`
  - `scripts/amos_receipt_chain_gate.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Local audit receipts are hashed as file bytes, then linked in sorted file
    order.
  - `npm run guard:receipt-chain` fails if an audit receipt is edited, deleted,
    or added without updating `.mirror/RECEIPT_CHAINS/audit-log-chain.json`.
  - This makes local tamper detection stronger, but it is still not a signed or
    public proof system.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `node scripts/amos_receipt_chain_gate.mjs --self-test`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.receipt_chain.example.json --timestamp 20260707T131500Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T131500Z`
  - `npm run guard:receipt-chain`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The chain is local SHA-256 verification only.
  - There is no asymmetric signature, external timestamp authority, public
    notarization, live app verifier, or gateway verifier.
- Next safe move: add asymmetric signing or external anchoring only if local
  receipt chains remain useful and stable.

### 2026-07-07: AMOS Status Report

- Changed: added a single bad-news-first local status command for AMOS
  control-plane checks.
- Source files touched:
  - `.mirror/CONTRACTS/amos/audit_log_request.amos_status.example.json`
  - `.mirror/AUDIT_LOGS/20260707T132500Z-amos_status_report.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - `npm run amos:status` runs the local AMOS gates and receipt-chain verifier.
  - The report prints bad news first, then checked gates, chain state,
    working-tree state, and next safe action.
  - A green report still says `decision: partial` because these gates are
    local-only and not consumed by the live app or gateway.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run amos:status`
  - `npm run amos:status -- --json`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.amos_status.example.json --timestamp 20260707T132500Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T132500Z`
  - `npm run guard:receipt-chain`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The status report does not prove live runtime enforcement.
  - The public app and gateway still do not consume AMOS contracts, audit
    receipts, or receipt chains.
- Next safe move: define the runtime integration contract for how the app or
  gateway would consume these local gates without making it live yet.

### 2026-07-07: AMOS Runtime Integration Contract

- Changed: added a fail-closed runtime integration contract that describes how
  the consumer app and gateway would consume AMOS gates later, while explicitly
  keeping both adapters disabled today.
- Source files touched:
  - `.mirror/CONTRACTS/amos/runtime_integration.contract_only.example.json`
  - `.mirror/CONTRACTS/amos/runtime_integration.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.runtime_integration.example.json`
  - `.mirror/schemas/runtime_integration.schema.json`
  - `.mirror/AUDIT_LOGS/20260707T132730Z-amos_runtime_integration_contract.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_runtime_integration_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Runtime integration starts as a contract, not a live adapter.
  - The public app and gateway must not be described as consuming AMOS gates
    until a future adapter is built and verified.
  - The local gate blocks enabled surfaces, non-`none` adapters, missing local
    gates, missing receipts, and unsupported public-runtime claims.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `node scripts/amos_runtime_integration_gate.mjs --self-test`
  - `node scripts/amos_runtime_integration_gate.mjs --expect allow`
  - `node scripts/amos_runtime_integration_gate.mjs --manifest .mirror/CONTRACTS/amos/runtime_integration.live_blocked.example.json --expect block`
  - `npm run guard:runtime-integration`
  - `npm run amos:status`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.runtime_integration.example.json --timestamp 20260707T132730Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T132730Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The receipt chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 4
  - hash: `d583f5d6b312bf3f07f62c25d249c316f443261560dd0d27ae4c1d0471c28a35`
- Next safe move: define a shadow dry-run adapter envelope that can read a
  proposed runtime request, emit a receipt, and still perform no live action.

### 2026-07-07: AMOS Shadow Dry-Run Adapter

- Changed: added a local-only shadow adapter that inspects a proposed runtime
  request, runs local gates, and emits a dry-run receipt without performing any
  live app, gateway, model, network, or memory action.
- Source files touched:
  - `.mirror/CONTRACTS/amos/shadow_runtime_request.consumer.example.json`
  - `.mirror/CONTRACTS/amos/shadow_runtime_request.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.shadow_adapter.example.json`
  - `.mirror/schemas/shadow_runtime_request.schema.json`
  - `.mirror/schemas/shadow_runtime_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T133841Z-shadow_consumer_first_turn.json`
  - `.mirror/AUDIT_LOGS/20260707T133841Z-amos_shadow_adapter.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_shadow_adapter_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Shadow adapter output is receipt-only.
  - The shadow adapter must run `guard:runtime-integration`,
    `guard:amos-contracts`, and `guard:receipt-chain`.
  - The shadow adapter blocks requests that enable live action, network, model
    calls, external writes, public routes, or durable memory writes.
  - The shadow adapter is not a public app or gateway adapter.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:shadow-adapter`
  - `node scripts/amos_shadow_adapter_gate.mjs --expect allow`
  - `node scripts/amos_shadow_adapter_gate.mjs --request .mirror/CONTRACTS/amos/shadow_runtime_request.live_blocked.example.json --expect block`
  - `node scripts/amos_shadow_adapter_gate.mjs --write --timestamp 20260707T133841Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.shadow_adapter.example.json --timestamp 20260707T133841Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T133841Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The shadow adapter does not call a model or test real model behavior.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The dry-run receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 5
  - hash: `9e2f8bf4ecf6ebe98d515c3ee360c58f1f8b39bc6eaf6a09e8013b0ade9801cb`
- Next safe move: define a read-only app adapter proposal that can inspect a
  local request envelope without model calls, network use, memory writes, or
  route changes.

### 2026-07-07: AMOS Read-Only App Adapter Proposal

- Changed: added a local-only read-only app adapter proposal that hashes
  selected consumer app source files and a request envelope into a receipt
  without performing any live runtime action.
- Source files touched:
  - `.mirror/CONTRACTS/amos/readonly_app_adapter.consumer.example.json`
  - `.mirror/CONTRACTS/amos/readonly_app_adapter.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.readonly_app_adapter.example.json`
  - `.mirror/schemas/readonly_app_adapter_request.schema.json`
  - `.mirror/schemas/readonly_app_adapter_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T134909Z-readonly_consumer_app_surface.json`
  - `.mirror/AUDIT_LOGS/20260707T134909Z-amos_readonly_app_adapter.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_readonly_app_adapter_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Read-only app adapter output is source-hash evidence only.
  - The read-only app adapter must run `guard:runtime-integration`,
    `guard:shadow-adapter`, `guard:front-door`, and `guard:receipt-chain`.
  - The read-only app adapter blocks model calls, network use, memory writes,
    route changes, gateway changes, and public deploys.
  - The read-only app adapter does not copy app source into receipts; it records
    file paths, SHA-256 hashes, and byte counts.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:readonly-app-adapter`
  - `node scripts/amos_readonly_app_adapter_gate.mjs --expect allow`
  - `node scripts/amos_readonly_app_adapter_gate.mjs --request .mirror/CONTRACTS/amos/readonly_app_adapter.live_blocked.example.json --expect block`
  - `node scripts/amos_readonly_app_adapter_gate.mjs --write --timestamp 20260707T134909Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.readonly_app_adapter.example.json --timestamp 20260707T134909Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T134909Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The read-only app adapter does not call a model or test real model behavior.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The source-hash receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 6
  - hash: `7bca410af476af84bc8379d663c9ac879cce6d393ae0a161b03c639e27fbf52a`
- Next safe move: define a browser-local runtime adapter proposal that can
  process an in-memory request object while still blocking model calls, network
  use, durable memory writes, route changes, deploys, and gateway changes.

### 2026-07-07: AMOS Browser-Local Runtime Adapter Proposal

- Changed: added a local-only browser runtime adapter proposal that processes
  an in-memory request object into a projection receipt without copying raw
  input into the receipt.
- Source files touched:
  - `.mirror/CONTRACTS/amos/browser_runtime_adapter.consumer.example.json`
  - `.mirror/CONTRACTS/amos/browser_runtime_adapter.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.browser_runtime_adapter.example.json`
  - `.mirror/schemas/browser_runtime_adapter_request.schema.json`
  - `.mirror/schemas/browser_runtime_adapter_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T140008Z-browser_local_consumer_turn.json`
  - `.mirror/AUDIT_LOGS/20260707T140008Z-amos_browser_runtime_adapter.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_browser_runtime_adapter_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Browser-local runtime adapter output is projection-receipt only.
  - The receipt stores an input hash, not raw input text.
  - The browser-local runtime adapter must run `guard:runtime-integration`,
    `guard:shadow-adapter`, `guard:readonly-app-adapter`,
    `guard:front-door`, and `guard:receipt-chain`.
  - The browser-local runtime adapter blocks model calls, network use, durable
    memory writes, route changes, gateway changes, and public deploys.
  - The browser-local runtime adapter is not a public app or gateway adapter.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `node scripts/amos_browser_runtime_adapter_gate.mjs --self-test`
  - `node scripts/amos_browser_runtime_adapter_gate.mjs --expect allow`
  - `node scripts/amos_browser_runtime_adapter_gate.mjs --request .mirror/CONTRACTS/amos/browser_runtime_adapter.live_blocked.example.json --expect block`
  - `node scripts/amos_browser_runtime_adapter_gate.mjs --write --timestamp 20260707T140008Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.browser_runtime_adapter.example.json --timestamp 20260707T140008Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T140008Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The browser-local runtime adapter does not call a model or test real model
    behavior.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The projection receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 7
  - hash: `ea6577c2990bbe8c28ca7fe21f56e873b973d49c922165c39414eca8e5fb9eed`
- Next safe move: define a local-only UI harness proposal that can call the
  browser-local runtime adapter behind explicit gates while still blocking
  model calls, network use, durable memory writes, route changes, deploys, and
  gateway changes.

### 2026-07-07: AMOS Local UI Harness Proposal

- Changed: added a local-only UI harness proposal that calls the browser-local
  runtime adapter and emits a UI projection receipt without live app wiring.
- Source files touched:
  - `.mirror/CONTRACTS/amos/ui_harness.consumer.example.json`
  - `.mirror/CONTRACTS/amos/ui_harness.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.ui_harness.example.json`
  - `.mirror/schemas/ui_harness_request.schema.json`
  - `.mirror/schemas/ui_harness_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T140840Z-local_ui_consumer_turn.json`
  - `.mirror/AUDIT_LOGS/20260707T140840Z-amos_ui_harness.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_ui_harness_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Local UI harness output is projection-receipt only.
  - The harness calls the browser-local runtime adapter and carries the runtime
    input hash forward.
  - The harness preserves the consumer entry question, `What do you want?`, as
    a UI projection, not a public UI change.
  - The local UI harness must run `guard:runtime-integration`,
    `guard:shadow-adapter`, `guard:readonly-app-adapter`,
    `guard:browser-runtime-adapter`, `guard:front-door`, and
    `guard:receipt-chain`.
  - The local UI harness blocks model calls, network use, durable memory
    writes, route changes, gateway changes, public deploys, and arbitrary
    generated UI execution.
  - The local UI harness is not a public app or gateway adapter.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:ui-harness`
  - `node scripts/amos_ui_harness_gate.mjs --expect allow`
  - `node scripts/amos_ui_harness_gate.mjs --request .mirror/CONTRACTS/amos/ui_harness.live_blocked.example.json --expect block`
  - `node scripts/amos_ui_harness_gate.mjs --write --timestamp 20260707T140840Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.ui_harness.example.json --timestamp 20260707T140840Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T140840Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The local UI harness does not call a model or test real model behavior.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The UI projection receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 8
  - hash: `fdb7bc444c795db967d665ffbf2cbe869cb86e5a7112eb46b010906a455e9a05`
- Next safe move: define a disabled source adapter proposal in app code behind
  explicit gates while still blocking model calls, network use, durable memory
  writes, route changes, deploys, gateway changes, and arbitrary generated UI.

### 2026-07-07: AMOS Disabled Source Adapter Proposal

- Changed: added a disabled source adapter file in app source and a gate that
  proves it keeps disabled invariants and is not imported by active app source.
- Source files touched:
  - `src/lib/amos-disabled-source-adapter.js`
  - `.mirror/CONTRACTS/amos/disabled_source_adapter.consumer.example.json`
  - `.mirror/CONTRACTS/amos/disabled_source_adapter.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.disabled_source_adapter.example.json`
  - `.mirror/schemas/disabled_source_adapter_request.schema.json`
  - `.mirror/schemas/disabled_source_adapter_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T141644Z-disabled_source_adapter_consumer.json`
  - `.mirror/AUDIT_LOGS/20260707T141644Z-amos_disabled_source_adapter.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_disabled_source_adapter_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - The disabled source adapter exists as source code only.
  - The disabled source adapter is not imported by active app source.
  - The adapter exports disabled invariants and a projection helper, but all
    live capabilities remain false.
  - The disabled source adapter gate runs `guard:runtime-integration`,
    `guard:shadow-adapter`, `guard:readonly-app-adapter`,
    `guard:browser-runtime-adapter`, `guard:ui-harness`,
    `guard:front-door`, and `guard:receipt-chain`.
  - The disabled source adapter blocks model calls, network use, durable memory
    writes, route changes, gateway changes, public deploys, arbitrary generated
    UI execution, and active app imports.
  - The disabled source adapter is not live runtime wiring.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:disabled-source-adapter`
  - `node scripts/amos_disabled_source_adapter_gate.mjs --expect allow`
  - `node scripts/amos_disabled_source_adapter_gate.mjs --request .mirror/CONTRACTS/amos/disabled_source_adapter.live_blocked.example.json --expect block`
  - `rg -n "amos-disabled-source-adapter|DISABLED_SOURCE_ADAPTER_CONTRACT|createDisabledSourceAdapterProjection|assertDisabledSourceAdapter" src --glob '!src/lib/amos-disabled-source-adapter.js'`
  - `node scripts/amos_disabled_source_adapter_gate.mjs --write --timestamp 20260707T141644Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.disabled_source_adapter.example.json --timestamp 20260707T141644Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T141644Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The disabled source adapter is deliberately not imported by the active app.
  - The disabled source adapter does not call a model or test real model
    behavior.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The disabled source adapter receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 9
  - hash: `d2a8ff92f0dbe9fd6e2d8265c9b6f2b6c5ebe7da4822a872bf43010d505e91db`
- Next safe move: define an explicit import proposal contract for the disabled
  source adapter, still blocked by approval and still not live.

### 2026-07-07: AMOS Source Adapter Import Proposal Gate

- Changed: added an explicit source adapter import proposal gate that proves
  the disabled source adapter import is pending approval and not applied to the
  active app.
- Source files touched:
  - `.mirror/CONTRACTS/amos/source_adapter_import.proposal.example.json`
  - `.mirror/CONTRACTS/amos/source_adapter_import.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.source_adapter_import.example.json`
  - `.mirror/schemas/source_adapter_import_request.schema.json`
  - `.mirror/schemas/source_adapter_import_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T143217Z-disabled_source_adapter_import_proposal.json`
  - `.mirror/AUDIT_LOGS/20260707T143217Z-amos_source_adapter_import_proposal.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_source_adapter_import_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Source adapter import is approval-required and pending.
  - The disabled source adapter remains not imported by active app source.
  - The import proposal gate blocks applied/live imports, model calls, network
    use, durable memory writes, route changes, gateway changes, public deploys,
    and arbitrary generated UI execution.
  - The import proposal writes local evidence only; it does not create a real
    approval request yet.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:source-adapter-import`
  - `node scripts/amos_source_adapter_import_gate.mjs --expect approval_required`
  - `node scripts/amos_source_adapter_import_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import.live_blocked.example.json --expect block`
  - `rg -n "amos-disabled-source-adapter|DISABLED_SOURCE_ADAPTER_CONTRACT|createDisabledSourceAdapterProjection|assertDisabledSourceAdapter" src --glob '!src/lib/amos-disabled-source-adapter.js'`
  - `node scripts/amos_source_adapter_import_gate.mjs --write --timestamp 20260707T143217Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.source_adapter_import.example.json --timestamp 20260707T143217Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T143217Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The import proposal is not an approval and did not import anything.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The source adapter import receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 10
  - hash: `8040b756a40d5dd15d136ac539cac614dea73bae63237e244af18b2f9780d7e6`
- Next safe move: define an explicit approval-request bridge for the source
  adapter import proposal, still blocked until a real approval is intentionally
  created.

### 2026-07-07: AMOS Source Adapter Import Approval Bridge

- Changed: added a source adapter import approval bridge that previews the
  pending approval request without writing a real approval file or applying the
  import.
- Source files touched:
  - `.mirror/CONTRACTS/amos/source_adapter_import_approval.bridge.example.json`
  - `.mirror/CONTRACTS/amos/source_adapter_import_approval.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/scd_state.source_adapter_import.approval.example.json`
  - `.mirror/CONTRACTS/amos/action_request.source_adapter_import.approval.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_approval.example.json`
  - `.mirror/schemas/source_adapter_import_approval_request.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T144553Z-disabled_source_adapter_import_approval_bridge.json`
  - `.mirror/AUDIT_LOGS/20260707T144553Z-amos_source_adapter_import_approval_bridge.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_source_adapter_import_approval_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - The bridge runs the source adapter import proposal gate and a dry-run
    approval request.
  - The bridge does not write a real approval file.
  - The bridge does not approve or apply the source import.
  - The disabled source adapter remains not imported by active app source.
  - The bridge blocks approval writes, applied/live imports, model calls,
    network use, durable memory writes, route changes, gateway changes, public
    deploys, and arbitrary generated UI execution.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:source-adapter-import-approval`
  - `node scripts/amos_source_adapter_import_approval_gate.mjs --expect approval_required`
  - `node scripts/amos_source_adapter_import_approval_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import_approval.live_blocked.example.json --expect block`
  - `find .mirror/APPROVAL_REQUESTS -maxdepth 1 -type f -not -name 'TEMPLATE.yaml' -print`
  - `node scripts/amos_source_adapter_import_approval_gate.mjs --write --timestamp 20260707T144553Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_approval.example.json --timestamp 20260707T144553Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T144553Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The bridge previews approval only; it does not create a real approval file.
  - The import remains unapplied and not live.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The approval bridge receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 11
  - hash: `ed0eed730ada9f371589dcb9f206bd7fb801733e511e6972c35175ac3280b47c`
- Next safe move: create a real approval-request creation contract only when
  source import wiring is intentionally proposed for the active app.

### 2026-07-07: AMOS Source Adapter Import Approval Request Creation

- Changed: added a source adapter import approval request creation gate that
  writes the real pending approval request file while still proving the import
  is not approved, not applied, and not live.
- Source files touched:
  - `.mirror/APPROVAL_REQUESTS/20260707T153055Z-source_adapter_import.yaml`
  - `.mirror/CONTRACTS/amos/source_adapter_import_approval_create.request.example.json`
  - `.mirror/CONTRACTS/amos/source_adapter_import_approval_create.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_approval_create.example.json`
  - `.mirror/schemas/source_adapter_import_approval_create_request.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_create_receipt.schema.json`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T153055Z-disabled_source_adapter_import_approval_create.json`
  - `.mirror/AUDIT_LOGS/20260707T153055Z-amos_source_adapter_import_approval_create.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_source_adapter_import_approval_create_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - A pending approval request now exists for the disabled source adapter import.
  - Pending approval is not approval and grants no authority.
  - The disabled source adapter remains not imported by active app source.
  - The creation gate validates the previous approval bridge receipt and uses
    the generic approval request gate for the actual pending-file write.
  - The gate blocks approval overclaims, applied/live imports, model calls,
    network use, durable memory writes, route changes, gateway changes, public
    deploys, and arbitrary generated UI execution.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:source-adapter-import-approval-create`
  - `node scripts/amos_source_adapter_import_approval_create_gate.mjs --expect approval_required`
  - `node scripts/amos_source_adapter_import_approval_create_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import_approval_create.live_blocked.example.json --expect block`
  - `find .mirror/APPROVAL_REQUESTS -maxdepth 1 -type f -not -name 'TEMPLATE.yaml' -not -name '.gitkeep' -print`
  - `node scripts/amos_source_adapter_import_approval_create_gate.mjs --write --timestamp 20260707T153055Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_approval_create.example.json --timestamp 20260707T153055Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T153055Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The pending approval request is not approval and does not approve itself.
  - The import remains unapplied and not live.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The approval creation receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 12
  - hash: `dbaf7b305fe68457a96a918db0aa84f93b584332214461eb65f6c7643b803d29`
- Next safe move: prepare an import patch contract only after Paul explicitly
  approves the pending source adapter import request.

### 2026-07-07: AMOS Source Adapter Import Patch Proposal

- Changed: added a source adapter import patch proposal gate that writes a
  local diff proposal while proving the active source file is unchanged.
- Source files touched:
  - `.mirror/CONTRACTS/amos/source_adapter_import_patch.request.example.json`
  - `.mirror/CONTRACTS/amos/source_adapter_import_patch.live_blocked.example.json`
  - `.mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_patch.example.json`
  - `.mirror/schemas/source_adapter_import_patch_request.schema.json`
  - `.mirror/schemas/source_adapter_import_patch_receipt.schema.json`
  - `.mirror/PATCH_PROPOSALS/20260707T160235Z-disabled_source_adapter_import_patch.diff`
  - `.mirror/RUNTIME_DRY_RUNS/20260707T160235Z-disabled_source_adapter_import_patch.json`
  - `.mirror/AUDIT_LOGS/20260707T160235Z-amos_source_adapter_import_patch.yaml`
  - `.mirror/RECEIPT_CHAINS/audit-log-chain.json`
  - `scripts/amos_source_adapter_import_patch_gate.mjs`
  - `scripts/amos_status_report.mjs`
  - `package.json`
  - `.mirror/README.md`
  - `.mirror/STATUS.md`
  - `.mirror/SOURCE_LEDGER.md`
  - `.mirror/PLAN.md`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/CONTINUITY_LEDGER.md`
- Product decisions:
  - Patch proposal generation is allowed as a local review artifact only.
  - The patch proposal adds only an import line for the disabled source adapter.
  - `src/pages/HomePage.jsx` was not edited; the receipt records identical
    before/after target hashes.
  - The source adapter remains unapplied and not live.
  - The gate blocks live import, source edit, model calls, network use, durable
    memory writes, route changes, gateway changes, public deploys, and
    arbitrary generated UI execution.
- Deploy status:
  - Not deployed; no public app assets changed in this slice.
- Tools and gates used:
  - `npm run guard:source-adapter-import-patch`
  - `node scripts/amos_source_adapter_import_patch_gate.mjs --expect patch_prepared`
  - `node scripts/amos_source_adapter_import_patch_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import_patch.live_blocked.example.json --expect block`
  - `node scripts/amos_source_adapter_import_patch_gate.mjs --write --timestamp 20260707T160235Z`
  - `node scripts/amos_audit_log_gate.mjs --write --request .mirror/CONTRACTS/amos/audit_log_request.source_adapter_import_patch.example.json --timestamp 20260707T160235Z`
  - `node scripts/amos_receipt_chain_gate.mjs --write --timestamp 20260707T160235Z`
- Bad news or limits:
  - This is still local repo scaffolding only.
  - The patch proposal is not applied.
  - The import remains unapplied and not live.
  - The public app and gateway still do not consume AMOS contracts at runtime.
  - The patch proposal receipt is local JSON only.
  - The audit chain is local SHA-256 verification only; it is not signed,
    externally timestamped, publicly notarized, or verified by the live app or
    gateway.
- Current chain:
  - entries: 13
  - hash: `4be41f0ffde47801a7c2095c937841a1fbd62e2b285037d7e4e6607ee808ec68`
- Next safe move: review the patch proposal and create an apply gate with
  rollback before any active source file is changed.
