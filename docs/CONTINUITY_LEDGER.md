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
