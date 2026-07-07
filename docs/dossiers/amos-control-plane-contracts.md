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
  - `.mirror/schemas/runtime_integration.schema.json`
  - `.mirror/schemas/shadow_runtime_request.schema.json`
  - `.mirror/schemas/shadow_runtime_receipt.schema.json`
  - `.mirror/schemas/readonly_app_adapter_request.schema.json`
  - `.mirror/schemas/readonly_app_adapter_receipt.schema.json`
  - `.mirror/schemas/browser_runtime_adapter_request.schema.json`
  - `.mirror/schemas/browser_runtime_adapter_receipt.schema.json`
  - `.mirror/schemas/ui_harness_request.schema.json`
  - `.mirror/schemas/ui_harness_receipt.schema.json`
  - `.mirror/schemas/disabled_source_adapter_request.schema.json`
  - `.mirror/schemas/disabled_source_adapter_receipt.schema.json`
  - `.mirror/schemas/source_adapter_import_request.schema.json`
  - `.mirror/schemas/source_adapter_import_receipt.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_request.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_receipt.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_create_request.schema.json`
  - `.mirror/schemas/source_adapter_import_approval_create_receipt.schema.json`
  - `.mirror/schemas/source_adapter_import_patch_request.schema.json`
  - `.mirror/schemas/source_adapter_import_patch_receipt.schema.json`
  - `src/lib/amos-disabled-source-adapter.js`
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
- Artifact export gate: `scripts/amos_artifact_export_gate.mjs` creates
  local-only exports only after contract, path, root, content-type,
  secret-scan, hash, and manifest checks pass.
- Audit log gate: `scripts/amos_audit_log_gate.mjs` creates repo-local audit
  receipts only after the contract gate allows the audit writer and the audit
  request passes local shape checks.
- Receipt chain gate: `scripts/amos_receipt_chain_gate.mjs` verifies
  repo-local audit receipts against a deterministic SHA-256 chain file.
- AMOS status report: `scripts/amos_status_report.mjs` runs the local gates and
  receipt-chain verifier, then prints a bad-news-first local control report.
- Model or gateway: no provider routing change.
- Local storage: proposal YAML only; no durable memory promotion.
- Approval storage: pending approval YAML only when a real risky action needs
  review.
- Generated artifacts: local-only export gate scaffold; no public download
  infrastructure.
- Audit storage: local YAML receipts only; hash-chained locally, but no
  signing, publishing, or runtime enforcement.
- Receipt chain storage: local JSON chain root only; no asymmetric signature,
  external timestamp, public notarization, or live runtime verifier.
- Runtime integration: contract-only manifest with consumer app and gateway
  adapters declared disabled.
- Shadow adapter: local dry-run receipt only; no live app, gateway, model,
  network, or memory action.
- Read-only app adapter: local source-hash receipt only; no live app, gateway,
  model, network, route, deploy, or memory action.
- Browser-local runtime adapter: local in-memory projection receipt only; no
  live app, gateway, model, network, route, deploy, or durable memory action.
- Local UI harness: local projection receipt only; no live app, gateway, model,
  network, route, deploy, arbitrary UI, or durable memory action.
- Disabled source adapter: source-only, not imported by the active app, and no
  live app, gateway, model, network, route, deploy, arbitrary UI, or durable
  memory action.
- Source adapter import proposal: approval-required, pending, not applied, not
  imported by the active app, and no live app, gateway, model, network, route,
  deploy, arbitrary UI, or durable memory action.
- Source adapter import approval bridge: pending approval preview only, no real
  approval file, no source import, and no live app, gateway, model, network,
  route, deploy, arbitrary UI, or durable memory action.
- Source adapter import approval creation: pending approval request file only,
  no granted approval, no source import, and no live app, gateway, model,
  network, route, deploy, arbitrary UI, or durable memory action.
- Source adapter import patch proposal: local diff file only, no source edit,
  no source import, and no live app, gateway, model, network, route, deploy,
  arbitrary UI, or durable memory action.

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

8. **Artifact Export Request**
   - A draft artifact can be copied only from an allowed repo-local source root
     into `.mirror/ARTIFACT_EXPORTS/` after path traversal, absolute path,
     symlink escape, content-type, secret-scan, hash, and receipt checks pass.

9. **Audit Log Request**
   - A completed or checked local gate can write a repo-local audit receipt
     only after an explicit audit-log action request passes the contract gate.
     The receipt records checked scope, unchecked scope, evidence, bad news,
     decision, and follow-up.

10. **Receipt Chain**
   - Local audit receipts are hashed as file bytes and linked in sorted file
     order. `npm run guard:receipt-chain` fails if a receipt changes, disappears,
     or is added without updating the chain.

11. **AMOS Status Report**
   - `npm run amos:status` runs the local AMOS gates and reports bad news,
     checked gates, receipt-chain state, working-tree state, and next safe
     action. It exits green only when the local gates pass, but still reports
     `partial` because the public app and gateway do not consume these controls
     yet.

12. **Runtime Integration Contract**
   - `npm run guard:runtime-integration` verifies that the consumer app and
     gateway integration manifest remains contract-only. It blocks live
     adapters, enabled surfaces, missing local gates, missing receipts, and
     unsupported claims that public runtime enforcement is live.

13. **Shadow Dry-Run Adapter**
   - `npm run guard:shadow-adapter` verifies that a proposed runtime request can
     be inspected through local gates and produce a local receipt without
     calling a model, using network, writing durable memory, changing the public
     app, or changing the gateway.

14. **Read-Only App Adapter Proposal**
   - `npm run guard:readonly-app-adapter` verifies that selected consumer app
     source files and a request envelope can be hashed into a local receipt
     without calling a model, using network, writing durable memory, changing
     routes, changing the gateway, or deploying public assets.

15. **Browser-Local Runtime Adapter Proposal**
   - `npm run guard:browser-runtime-adapter` verifies that a browser-local
     in-memory request object can be projected into a local receipt without
     copying raw input into the receipt and without calling a model, using the
     network, writing durable memory, changing routes, changing the gateway, or
     deploying public assets.

16. **Local UI Harness Proposal**
   - `npm run guard:ui-harness` verifies that a local UI harness can call the
     browser-local runtime adapter and emit a UI projection receipt without
     live app wiring, model calls, network use, durable memory writes, route
     changes, gateway changes, public deploys, or arbitrary generated UI.

17. **Disabled Source Adapter Proposal**
   - `npm run guard:disabled-source-adapter` verifies that the disabled source
     adapter exists in app source, keeps disabled invariants, has no active app
     imports, and can only produce local evidence through the UI harness gate.

18. **Source Adapter Import Proposal**
   - `npm run guard:source-adapter-import` verifies that importing the disabled
     source adapter is only proposed, still pending approval, and not applied to
     active app source. It scans app imports, target files, the disabled adapter
     gate, and the required local gates before writing a local receipt.

19. **Source Adapter Import Approval Bridge**
   - `npm run guard:source-adapter-import-approval` verifies that the source
     adapter import can produce a pending approval preview without writing a
     real approval file, approving the import, or applying the import.

20. **Source Adapter Import Approval Creation**
   - `npm run guard:source-adapter-import-approval-create` verifies that the
     source adapter import can create a real pending approval request file while
     still blocking any claim that the import is approved, applied, or live.

21. **Source Adapter Import Patch Proposal**
   - `npm run guard:source-adapter-import-patch` verifies that a local diff
     proposal can be created for review while the active app source remains
     unchanged and the import stays unapplied.

## Deferred

- OpenWiki repo cognition.
- Crabbox disposable execution.
- Desktop shell.
- MCP connector bridge.
- Graph/vector/vault memory substrate.
- SWFI-specific enterprise workspace.
- UX4G trust component library.

These are useful, but only after the local contracts and gates above can be
validated and bound to a runtime.

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
  - `npm run guard:artifact-export`
  - `npm run guard:audit-log`
  - `npm run guard:receipt-chain`
  - `npm run guard:runtime-integration`
  - `npm run guard:shadow-adapter`
  - `npm run guard:readonly-app-adapter`
  - `npm run guard:browser-runtime-adapter`
  - `npm run guard:ui-harness`
  - `npm run guard:disabled-source-adapter`
  - `npm run guard:source-adapter-import`
  - `npm run guard:source-adapter-import-approval`
  - `npm run guard:source-adapter-import-approval-create`
  - `npm run guard:source-adapter-import-patch`
  - `npm run amos:status`
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
- Artifact export is local-only scaffolding; it does not create a public URL,
  user-facing download route, or durable storage path.
- Audit-log receipts are local-only scaffolding; they are hash-chained locally
  but are not signed, published, or consumed by the live app/gateway.
- Receipt chains are local-only tamper checks; they are not signatures,
  external timestamps, public notarization, or enterprise audit.
- AMOS status is a local truth surface only; it is not live runtime enforcement.
- Runtime integration is contract-only; the app and gateway adapters are
  explicitly disabled.
- Shadow adapter receipts are local dry-run receipts only; they do not prove
  live app or gateway enforcement.
- Read-only app adapter receipts are local source-hash receipts only; they do
  not prove live app or gateway enforcement.
- Browser-local runtime adapter receipts are local input-hash projection
  receipts only; they do not prove live app or gateway enforcement.
- Local UI harness receipts are local projection receipts only; they do not
  prove live app or gateway enforcement.
- Disabled source adapter receipts prove source-only disabled posture; they do
  not prove live app or gateway enforcement.
- Source adapter import proposal receipts prove only a pending local proposal;
  they do not approve or apply the import and do not prove live app or gateway
  enforcement.
- Source adapter import approval bridge receipts prove only a pending approval
  preview; they do not write a real approval file, approve the import, apply the
  import, or prove live app/gateway enforcement.
- Source adapter import approval request creation receipts prove only that a
  pending approval request file exists; they do not grant approval, apply the
  import, or prove live app/gateway enforcement.
- Source adapter import patch proposal receipts prove only that a local diff
  proposal exists; they do not edit active source, apply the import, or prove
  live app/gateway enforcement.
- SWFI remains separate and is not touched.

## Handoff

Use this dossier when AMOS/control-plane ideas come up. The next practical build
slice is to review the patch proposal and create an apply gate with rollback
before any active source file is changed.
