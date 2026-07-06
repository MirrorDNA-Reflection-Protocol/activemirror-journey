# Dossier: Governed Agent OS

Status: internal intake
Updated: 2026-07-06
Owner: Active Mirror

## Objective

Preserve the ActiveMirrorOS governed-agent synthesis as internal architecture guidance without leaking operating-system language into the consumer front door.

## User Outcome

Users should feel a better assistant: one that understands the intent, helps produce useful work, remembers only what they choose, and does not silently act outside their control.

They should not have to understand routers, policies, databases, contracts, traces, or agent runtimes before using Active Mirror.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: `https://activemirror.ai/app/`
- Internal source doc: `/Users/mirror-pro/Downloads/ActiveMirrorOS_Governed_Agent_OS_Synthesis.md`
- Files likely to change later:
  - `docs/dossiers/*.md`
  - `docs/wiki/*.md`
  - `.mirror/SOURCE_LEDGER.md`
  - future AMOS runtime repos, not consumer copy by default

## Boundaries

- Not in scope:
  - public homepage copy
  - SWFI/client implementation
  - claiming a full operating system exists in the current public app
  - claiming deterministic AI behavior
  - making Pixel approval a hard dependency for basic product use
- Requires approval:
  - credential access design
  - memory write authority
  - action execution outside the browser
  - client or enterprise deployment claims
- Must not expose:
  - raw credentials
  - private memory
  - client material
  - internal model/provider routing
  - AMOS architecture language before user value
- Must stay internal:
  - MirrorRouter
  - MirrorPolicy
  - MirrorLoop
  - MirrorGym
  - MirrorTrust Kernel
  - three-device control-plane language

## Required Inputs

- Source docs:
  - `/Users/mirror-pro/Downloads/ActiveMirrorOS_Governed_Agent_OS_Synthesis.md`
- Current public language rules:
  - `docs/wiki/language-guide.md`
  - `scripts/public_language_guard.mjs`
  - `scripts/front_door_guard.mjs`
- Current product proof:
  - `src/pages/HomePage.jsx`
  - `src/lib/first-turn-fallback.js`
  - `src/lib/mirror-state.js`
  - `src/lib/challenge-packet.js`

## Architecture Absorption

The useful thesis:

```text
Active Mirror is not the model, database, or memory.
Active Mirror is the governed loop around identity-state, consent, action, and reflection.
```

The practical MVP:

```text
User input
-> memory candidate
-> contract validation
-> policy approval
-> durable write
-> retrieval
-> audited response
```

The consumer translation:

```text
Ask one thing.
Get useful help.
Choose what gets remembered.
Stay in control.
```

## Implementation Surface

- UI:
  - Keep the homepage chat-first.
  - Keep OS/control-plane language out of the consumer shell.
  - Use enterprise pages for architecture diagrams and control consoles only after the offer is clear.
- Runtime:
  - Treat the current browser app as the front door, not the full AMOS runtime.
  - Treat the Worker gateway as the model/policy adapter, not the whole state core.
- Model or gateway:
  - Models propose.
  - Active Mirror validates, gates, stores, and routes.
- Local storage:
  - Browser-local preferences and continuity are real but limited.
  - Do not call them full user-owned identity sync.
- Generated artifacts:
  - Keep outputs small, useful, and explicitly reviewable.

## Candidate State Model

The synthesis prioritizes commitments, not just memories. Future AMOS state should track:

- users
- identities
- sessions
- memories
- memory_edges
- commitments
- tasks
- approvals
- policies
- credentials_metadata
- tool_permissions
- agent_runs
- agent_steps
- audit_events
- external_effects
- documents
- artifacts
- eval_runs
- failure_cases
- router_decisions
- quota_events

## Checks

- Local guards:
  - `npm run guard:language`
  - `npm run guard:front-door`
  - `npm run guard:friction`
  - `npm run guard:dossiers`
- Browser QA:
  - Verify the homepage does not expose AMOS, OS, router, policy, protocol, proof-room, or source-backed language before the first action.
- Deploy checks:
  - Build in `activemirror-journey`.
  - Copy only the `/app` bundle into `active-mirror-site`.
  - Run deploy repo guards and browser smoke.
- Receipts:
  - Add a post-deploy receipt only after live route checks pass.

## Challenge Contract

- Challenge offered: Can the architecture improve the product without making the product sound like architecture?
- Acceptance condition: the public app feels simpler while internal docs become more precise.
- Failure condition: homepage, setup, phone, or first response starts explaining MirrorRouter, MirrorPolicy, OS, protocols, proof, or source-backed claims before the user asks.
- Consequence if failed: block deploy and rewrite public copy back to user-first language.
- Recovery path: move architecture language into dossiers, wiki, research, or enterprise proof-room pages.

## Bad News / Limits

- The public app does not yet implement the full PostgreSQL state core described in the synthesis.
- The Mac Mini / Pixel / OnePlus topology is an architecture direction, not a consumer requirement.
- Browser-local continuity is useful, but it is not complete owned-memory infrastructure.
- The synthesis is strong for AMOS; it is too heavy for homepage copy.

## Handoff

Use this dossier when AMOS/state/control-plane ideas come up. The next practical AMOS build slice is not a new public slogan; it is a small governed memory loop:

```text
memory candidate -> user approval -> local/durable write -> retrieval -> visible edit/delete
```
