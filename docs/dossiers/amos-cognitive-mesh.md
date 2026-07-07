# Dossier: AMOS Cognitive Mesh

Status: draft
Updated: 2026-07-07
Owner: Active Mirror / AMOS

## Objective

Capture the AMOS Cognitive Mesh build pack as internal architecture guidance
without leaking control-plane language into the consumer front door.

## User Outcome

Future AMOS and enterprise work has a clear architecture boundary: agents can
help the user, but authority passes through scopes, containers, receipts, and
approval when consequence is real.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: none for this dossier
- Local route: docs only
- Files likely to change:
  - `docs/dossiers/amos-cognitive-mesh.md`
  - `docs/dossiers/README.md`
  - `docs/topic-packets/amos-cognitive-mesh-v0-1.md`
  - `docs/CONTINUITY_LEDGER.md`
  - `.mirror/SOURCE_LEDGER.md`

## Boundaries

- Not in scope: building the full AMOS runtime inside the public consumer app.
- Requires approval: any billing, auth, secret, durable memory, phone approval,
  production-write, or client-data workflow.
- Must not expose: SWFI/client material, model names, private vault contents, or
  internal architecture labels on the homepage.
- Must stay internal: MirrorGateway, MirrorTruth, MirrorVec, MirrorCarrier,
  MirrorLoop, Pixel Shield, execution containers, and SWFI-separated track
  names until a specific enterprise page needs them.

## Required Inputs

- Source docs:
  - `/Users/mirror-pro/Downloads/AMOS_Cognitive_Mesh_Build_Pack_v0.1.md`
- Existing code:
  - `src/pages/HomePage.jsx`
  - `worker/src/index.js` in the deploy bridge repo
- Current receipts or checks:
  - `docs/CONTINUITY_LEDGER.md`
  - `.mirror/SOURCE_LEDGER.md`

## Implementation Surface

- UI: consumer front door remains chat-first and normal-language.
- Runtime: future AMOS runtime, not this React app.
- Model or gateway: current gateway can borrow gates and receipts; it is not yet
  the full MirrorGateway.
- Local storage: browser-local saved context remains user-approved only.
- Generated artifacts: current image/document outputs stay bounded by gateway
  budgets and fallbacks.

## Checks

- Local guards:
  - `npm run guard:dossiers`
  - `npm run guard:language`
  - `npm run build:deploy`
- Browser QA:
  - `npm run smoke:browser` after app changes are packaged
- Deploy checks:
  - deploy bridge preflight and canary only when public assets change
- Receipts:
  - append `docs/CONTINUITY_LEDGER.md` entry for any public deploy

## Challenge Contract

- Challenge offered: keep the AMOS mesh as internal power and enterprise
  architecture, while the public site remains simple and useful.
- Acceptance condition: a first-time user is not asked to understand meshes,
  gateways, receipts, or agents before getting help.
- Failure condition: internal architecture terms become homepage copy or the app
  claims runtime capabilities it does not yet implement.
- Consequence if failed: block deploy with the public language guard or revert
  the public copy slice.
- Recovery path: move machinery language to enterprise/research docs and return
  the homepage to `What do you want?`.

## Bad News / Limits

- The build pack is a direction document, not proof that a full governed
  cognitive mesh is live.
- The current public app is still a product front door plus gateway, not a
  containerized multi-agent operating layer.
- R2-backed generated-media storage is blocked until Cloudflare R2 is enabled
  for the account and a bucket binding is configured.

## Handoff

Use this dossier when AMOS, control-plane, agent-mesh, or enterprise-runtime
questions come up. The next practical build slice is not to expose the mesh to
consumers; it is to finish the gateway/media hardening path, keep `/app/feedback`
as an operator surface, and build AMOS runtime modules in a separate internal
repo or enterprise track.
