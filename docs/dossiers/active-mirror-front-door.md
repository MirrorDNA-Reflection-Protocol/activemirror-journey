# Dossier: Active Mirror Front Door

Status: active
Updated: 2026-07-04
Owner: Active Mirror

## Objective

Keep the public Active Mirror experience simple, chat-first, and useful enough
that a new user can start without reading a product explanation.

## User Outcome

The user lands, sees one clear prompt, starts with their own words, and receives
a useful next response or artifact without being forced through internal product
language.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: `https://activemirror.ai/app/`
- Setup route: `https://activemirror.ai/app/id/`
- Local preview: `http://127.0.0.1:8976/`
- Files likely to change:
  - `src/pages/HomePage.jsx`
  - `src/pages/Start.jsx`
  - `src/pages/DeviceExperience.jsx`
  - `src/lib/first-turn-fallback.js`
  - `src/lib/local-mirror-sense.js`
  - `src/components/`
  - `docs/wiki/`
  - `docs/dossiers/`

## Boundaries

- Not in scope: SWFI, client dashboards, local control-plane internals, provider
  key work, full owned-memory sync, full ActiveMirrorOS runtime.
- Requires approval: new dependencies, model/provider secret changes,
  durable memory promotion, downloadable file export features, billing/auth.
- Must not expose: secrets, raw private vault content, provider keys, model names
  in consumer copy, clinical or psychiatric positioning.
- Must stay internal: BrainScan/Mirror Seed as technical compatibility language,
  kernel/gateway details, proof machinery unless needed for enterprise pages.

## Required Inputs

- `AGENTS.md`
- `.mirror/TASK_CONTRACT.yaml`
- `.mirror/AGENT_POLICY.yaml`
- `.mirror/STATUS.md`
- `docs/wiki/README.md`
- `docs/wiki/user-flow.md`
- `docs/wiki/language-guide.md`
- `docs/wiki/build-and-deploy.md`
- Current production canary result before claiming live state.

## Implementation Surface

- UI: one obvious question, short setup doorway, returning-user import doorway,
  minimal response surface, useful artifact only when it helps.
- Runtime: browser-local state first; gateway/model calls only through existing
  app contracts.
- Model or gateway: do not expose model/provider names in public copy.
- Local storage: browser-local state is a convenience, not full owned memory sync.
- Generated artifacts: actual outputs, not instructions about making outputs;
  artifact readiness is assigned by the runtime challenge packet.

## Checks

- Local guards:
  - `npm run guard:mirror`
  - `npm run guard:front-door`
  - `npm run guard:friction`
  - `npm run guard:challenge`
  - `npm run guard:redaction`
  - `npm run truth`
  - `npm run build:deploy`
- Browser QA:
  - mobile `/app/`
  - mobile `/app/id/`
  - desktop `/app/`
  - no horizontal overflow
  - no stale setup copy
  - no internal consumer copy
- Deploy checks:
  - package built app into `/Users/mirror-pro/repos/active-mirror-site/public/app`
  - run deploy-repo checks
  - run production canary after Pages deploy
- Receipts:
  - local command output
  - production canary output
  - changed file list

## Challenge Contract

- Challenge offered: keep the consumer front door simple enough that a first-time
  user knows where to start without reading architecture.
- Acceptance condition: the agent states the exact files and checks it will use
  before risky edits, then keeps public copy in normal user language.
- Failure condition: internal terms, model names, private-vault language,
  clinical positioning, or stale setup copy leaks into the consumer path.
- Consequence if failed: do not deploy, do not mark done, write the failure into
  the handoff, and route the next action to copy/UI repair.
- Recovery path: run the local guards, inspect mobile and desktop, remove leaked
  internal language, and rerun the same checks before promotion.

## Bad News / Limits

- The product source and deploy/gateway source are still two repos.
- Browser-local state is not yet durable identity sync.
- The current public app is a front door and chat experience, not the whole
  ActiveMirrorOS control plane.
- A green local build is not live proof; live proof needs deploy and canary.

## Handoff

Before editing, read this dossier and the wiki files it names. Keep the consumer
surface in normal language. If a feature needs internal explanation to make
sense, it probably belongs in docs, enterprise, or a later control-plane surface.
