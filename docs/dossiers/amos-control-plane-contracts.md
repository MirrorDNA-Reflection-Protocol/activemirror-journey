# Dossier: AMOS Control Plane Contracts

Status: draft
Updated: 2026-07-07
Owner: Active Mirror / AMOS

## Objective

Turn the layered AMOS stack note into buildable contracts without turning the
public Active Mirror app into a control-plane explainer.

## User Outcome

Active Mirror keeps the first user experience simple, while the enterprise and
internal product can grow around explicit workspace boundaries, state contracts,
consent levels, and agent permissions.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: none for this dossier
- Local route: docs and repo-local schemas only
- Files likely to change:
  - `.mirror/schemas/scd_state.schema.json`
  - `.mirror/schemas/workspace_boundary.schema.json`
  - `.mirror/schemas/consent_ladder.schema.json`
  - `.mirror/schemas/agent_contract.schema.json`
  - `docs/dossiers/amos-control-plane-contracts.md`
  - `docs/dossiers/README.md`
  - `docs/CONTINUITY_LEDGER.md`

## Boundaries

- Not in scope: building a full AMOS runtime, desktop shell, Crabbox runner,
  OpenWiki integration, SWFI workspace, phone approval path, or durable identity
  sync in this slice.
- Not in scope: changing the consumer homepage or adding AMOS, SCD, MirrorDNA,
  control-plane, agent-contract, or consent-ladder language to first-touch copy.
- Requires approval: production actions, billing, secrets, durable private
  memory, client data, SWFI implementation, and external writes.
- Must stay separated: consumer front door, enterprise proof surface, internal
  AMOS architecture, and SWFI/client work.

## Required Inputs

- Source docs:
  - `/Users/mirror-pro/.codex/attachments/83ae4042-534a-4067-906c-410a675cd0ff/pasted-text.txt`
- Existing local context:
  - `docs/dossiers/amos-cognitive-mesh.md`
  - `docs/topic-packets/amos-cognitive-mesh-v0-1.md`
  - `.mirror/DECISIONS.md`
  - `.mirror/SOURCE_LEDGER.md`
- Current public baseline:
  - `https://activemirror.ai/app/` remains simple and chat-first.

## Implementation Surface

- UI: no consumer UI change in this slice.
- Runtime: schema-only foundation for future AMOS runtime work.
- Runtime gate: `scripts/amos_contract_gate.mjs` validates local contract
  examples and returns `allow`, `approval_required`, or `block`.
- Approval gate: `scripts/amos_approval_request_gate.mjs` creates a pending
  approval request only when the contract gate returns `approval_required`.
- First local action gate: `scripts/amos_memory_proposal_gate.mjs` creates
  reviewable memory proposals only after the contract gate returns `allow`.
- Model or gateway: no provider routing change.
- Local storage: proposal YAML only; no durable memory promotion.
- Approval storage: pending approval YAML only when a real risky action needs
  review.
- Generated artifacts: no new export capability.

## Leveraged Now

1. **SCD State Contract**
   - Keep one machine-readable object for active workspace, goal, agent,
     allowed memory, allowed tools, pending actions, approvals, output rules,
     and state hashes.

2. **Workspace Boundary**
   - Keep explicit read/write/tool/egress/memory boundaries before any agent or
     model receives context.

3. **Consent Ladder**
   - Separate public read, private read, draft-only, external write, and
     irreversible sensitive actions.

4. **Agent Contract**
   - Every future agent needs role, workspace, read/write boundaries, allowed
     tools, forbidden tools, approval triggers, output types, and audit.

5. **Action Request**
   - A candidate action must name workspace, agent, tool, action, reads, writes,
     egress, reversibility, consent level, approval token, and output type.

6. **Memory Proposal Request**
   - A candidate memory update must become a reviewable proposal first. The
     proposal writer is allowed to write `.mirror/MEMORY_UPDATE_PROPOSALS/`
     only after the action request passes workspace, agent, tool, consent, and
     output checks.

7. **Approval Request**
   - A consequential action that passes boundaries but needs consent becomes a
     pending approval request. Blocked actions write nothing. Already-allowed
     actions write nothing because no approval queue is needed.

## Deferred

- OpenWiki repo cognition.
- Crabbox disposable execution.
- Desktop shell.
- MCP connector bridge.
- Graph/vector/vault memory substrate.
- SWFI-specific enterprise workspace.
- UX4G trust component library.

These are useful, but only after the four contracts above can be validated and
bound to a runtime.

## Checks

- Local guards:
  - `npm run guard:dossiers`
  - `npm run guard:language`
  - `npm run build:deploy`
- Schema checks:
  - parse all `.mirror/schemas/*.schema.json` as JSON
- Contract checks:
  - `npm run guard:amos-contracts`
  - `npm run guard:memory-proposal`
  - `npm run guard:approval-request`
- Browser QA:
  - not required unless public UI changes
- Deploy checks:
  - not required unless packaged public assets change

## Challenge Contract

- Challenge offered: make AMOS buildable through small contracts rather than a
  giant architecture claim.
- Acceptance condition: the repo has explicit schemas for state, workspace,
  consent, and agent authority, and the public app stays simple.
- Failure condition: the public site claims a full control plane is live before
  runtime enforcement exists.
- Consequence if failed: move language back to dossiers or enterprise pages and
  block consumer deploy.
- Recovery path: return public copy to `What do you want?` and keep AMOS work in
  internal contracts.

## Bad News / Limits

- These are local contracts and a local gate, not live app runtime enforcement.
- The consumer app still does not implement the full AMOS control plane.
- No private memory, external tool action, or approval workflow is made live by
  this dossier.
- Memory proposal writing is local repo scaffolding only; proposal files still
  need human approval before they become memory.
- Approval request writing is local repo scaffolding only; it does not perform
  the requested action or approve itself.
- SWFI remains separate and is not touched.

## Handoff

Use this dossier when AMOS/control-plane ideas come up. The next practical build
slice is to connect the same contract pattern to artifact export before any
live runtime wiring.
