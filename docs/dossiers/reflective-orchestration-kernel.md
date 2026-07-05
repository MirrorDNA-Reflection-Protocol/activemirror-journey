# Dossier: Reflective Orchestration Kernel

Status: draft
Updated: 2026-07-05
Owner: Active Mirror

## Objective

Absorb the ActiveMirrorOS vNext ROK specification as the internal architecture
spine for AMOS without turning it into premature public-site claims.

The core decision: the durable product is not a single LLM, persona, or model
prompt. The durable product is a governed orchestration kernel that compiles
context, composes skills, routes models, gates actions, verifies memory, and
records execution evidence.

## User Outcome

Active Mirror users should experience better AI help without needing to
understand the machinery:

- one useful next move,
- less generic AI output,
- private context handled carefully,
- outputs that can become documents, plans, code, research packs, or review
  notes,
- continuity that improves over time without blindly storing everything.

Enterprise users should be able to deploy the same pattern around their own
tools, files, approval rules, and evidence requirements.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: no new public route from this dossier alone
- Local route: internal docs only
- Files likely to change:
  - `docs/dossiers/reflective-orchestration-kernel.md`
  - future AMOS control-plane specs
  - future router, memory, skill, evaluation, and action-gate contracts

## Boundaries

- Not in scope: shipping all ROK layers in the public app.
- Not in scope: claiming Active Mirror has a complete AMOS kernel in production.
- Not in scope: SWFI-specific public claims or named-client disclosure.
- Requires approval: exposing client examples, memory authority, automation
  control, model routing, or trust-kernel internals publicly.
- Must not expose: private memory, secrets, client data, control-plane topology,
  or internal agent receipts.
- Must stay internal: layer names like Context Compiler, LoopDNA, Trust
  Compiler, Drift Firewall, and Reasoning Dataset Generator unless they are
  translated into plain user-facing benefits.

## Required Inputs

- Source docs:
  - `/Users/mirror-pro/.codex/attachments/87ac8736-eed6-463c-b984-b369bedcbd5e/pasted-text.txt`
- Design references:
  - OpenAI-style public IA: Research, Business, Try it
  - Active Mirror public copy rule: experience first, machinery only when asked
- Existing code:
  - `src/pages/HomePage.jsx`
  - `src/pages/Research.jsx`
  - `src/pages/Enterprise.jsx`
  - `src/lib/first-turn-fallback.js`
  - `src/lib/challenge-packet.js`
- Current receipts or checks:
  - `npm run build:deploy`
  - `npm run guard:dossiers`
  - deploy `npm run smoke:browser`

## Implementation Surface

- UI:
  - Keep the consumer front door simple: `What do you want?`
  - Keep ROK terms out of consumer UI.
  - Use Research and Business pages only for public proof and deployment paths.
- Runtime:
  - Future AMOS runtime should implement a kernel-owned execution path:
    context packet -> skill plan -> model route -> action gate -> verifier ->
    memory candidate.
- Model or gateway:
  - Models are replaceable advisory engines.
  - No model commits memory or state directly.
  - Routing should be role-based, not brand-based.
- Local storage:
  - Public app browser state remains bounded setup state, not full MirrorDNA.
  - AMOS memory should move through candidate, verified, long-term, archive.
- Generated artifacts:
  - Every serious execution should create execution evidence, not hidden
    chain-of-thought.

## Checks

- Local guards:
  - `npm run guard:dossiers`
  - `npm run build:deploy`
- Browser QA:
  - Verify public pages do not expose ROK machinery as confusing consumer copy.
  - Verify Research route still presents open proof plainly.
- Deploy checks:
  - `npm run guard:canonical`
  - `npm run build`
  - `npm run copy:audit`
  - `npm run smoke:browser`
  - `npm run canary:prod`
- Receipts:
  - Source commit in `activemirror-journey`
  - Deploy commit in `active-mirror-site`

## Challenge Contract

- Challenge offered: before any ROK layer is described publicly, prove whether
  it is implemented, simulated, planned, or only a doctrine.
- Acceptance condition: public copy is understandable without internal terms
  and every high-trust claim is source-bound or softened.
- Failure condition: public site says or implies Active Mirror already runs a
  complete orchestration kernel, owns a user's full local AI identity, or has
  client-specific proof without approval.
- Consequence if failed: block deploy, move the phrase into internal docs, and
  replace it with a user-facing benefit.
- Recovery path: implement the layer behind a gate, add a receipt/check, then
  promote only the smallest true public claim.

## Bad News / Limits

- This dossier does not implement ROK.
- The public app is still a reflective front door with bounded browser state,
  gateway-backed reflection, and artifact generation.
- The AMOS kernel, model router, memory engine, LoopDNA, Trust Compiler, and
  evaluation harness are architecture targets, not fully shipped product
  surfaces.
- The attached spec references current tools and papers, but this dossier does
  not independently verify every cited external development.
- The safest current public claim is that Active Mirror has published protocols,
  a public source trail, and an anonymized deployment story. Stronger claims
  require implementation evidence.

## Handoff

Use this dossier as the architecture north star for AMOS work:

1. Build the smallest ROK slice first: typed context packet, skill plan, model
   route, action gate, verifier, memory candidate.
2. Keep all internal layer names out of the consumer front door.
3. Translate ROK into user outcomes:
   - better next moves,
   - better outputs,
   - safer private context,
   - better continuity,
   - inspectable work for teams.
4. Public pages can say `Research & deployment`; they should not say
   `Reflective Orchestration Kernel` unless there is a specific technical page
   and verified implementation status.
