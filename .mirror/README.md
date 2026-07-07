# Active Mirror Control Folder

This folder is the repo-local control surface for agent work on the Active Mirror product/front-door source.

Active repo: `/Users/mirror-pro/repos/activemirror-journey`

Live deploy bridge: `/Users/mirror-pro/repos/active-mirror-site/public/app`

Core rule:

> Build the user-facing reflection experience here. Package to the deploy repo only after local guards and browser checks pass.

## Scope

Allowed here:

- Consumer reflection front door.
- BrainScan / MirrorSeed / Reflection flow.
- Browser-local state, preferences, and onboarding.
- Product copy, UI, visual polish, and usability guards.
- Repo-local contracts, plans, decisions, risks, evals, screenshots, and memory proposals.

Not allowed here:

- SWFI or client-specific implementation.
- Secret storage.
- Production billing config.
- Raw private vault exports.
- New consumer product work in legacy repos.

## Operating Order

1. Read `AGENTS.md`.
2. Read `.mirror/TASK_CONTRACT.yaml`.
3. Update `.mirror/STATUS.md` when the visible product state changes.
4. Keep `.mirror/DECISIONS.md` for durable decisions only.
5. Keep `.mirror/RISKS.md` honest and current.
6. Build and test locally.
7. Package to `active-mirror-site/public/app` only when deploy is intended.

## AMOS Contract Seeds

The public app is still the simple front door. AMOS/control-plane work starts
with small contracts:

- `.mirror/schemas/scd_state.schema.json`
- `.mirror/schemas/workspace_boundary.schema.json`
- `.mirror/schemas/consent_ladder.schema.json`
- `.mirror/schemas/agent_contract.schema.json`
- `.mirror/schemas/action_request.schema.json`
- `.mirror/schemas/memory_proposal_request.schema.json`
- `.mirror/schemas/audit_log_request.schema.json`
- `.mirror/schemas/receipt_chain.schema.json`

These schemas do not make a runtime live. They define what a future runtime must
validate before tools, memory, agents, or external actions are allowed.

Run the local contract gate with:

```bash
npm run guard:amos-contracts
```

The default examples live in `.mirror/CONTRACTS/amos/`. The gate returns
`allow`, `approval_required`, or `block` and is now part of `npm run prebuild`.

## Artifact Export Gate

Local artifact export is gated. The export writer first runs the AMOS contract
gate, then checks the source path, allowed root, content type, secret patterns,
and SHA-256 before writing a local-only artifact plus manifest.

```bash
npm run guard:artifact-export
```

Manual dry-run:

```bash
node scripts/amos_artifact_export_gate.mjs --dry-run
```

This is not public download infrastructure. Public or external export still
needs approval and a separate runtime/deploy path.

## Audit Log Gate

Local AMOS gate checks can now leave repo-local audit receipts. The audit
writer first runs the AMOS contract gate, then validates the audit-log request
shape before writing under `.mirror/AUDIT_LOGS/`.

```bash
npm run guard:audit-log
```

Manual dry-run:

```bash
node scripts/amos_audit_log_gate.mjs --dry-run
```

Manual write:

```bash
node scripts/amos_audit_log_gate.mjs --write
```

Written files are local evidence only. They do not make the public app or
gateway consume AMOS contracts at runtime.

## Receipt Chain Gate

Repo-local audit receipts are chained with deterministic SHA-256 checks. The
chain verifier hashes each audit receipt file, then links those hashes in sorted
file order. Any edited, deleted, or unchained audit receipt fails the local
guard.

```bash
npm run guard:receipt-chain
```

Manual dry-run:

```bash
node scripts/amos_receipt_chain_gate.mjs --dry-run
```

Manual write:

```bash
node scripts/amos_receipt_chain_gate.mjs --write
```

The current chain lives at `.mirror/RECEIPT_CHAINS/audit-log-chain.json`.
This is local tamper detection only. It is not an asymmetric signature,
external timestamp, public notarization, or live runtime verifier.

## AMOS Status Report

Use one command before live runtime wiring or public proof claims:

```bash
npm run amos:status
```

The status report runs the local AMOS gates and the receipt-chain verifier,
then prints bad news, checked gates, current chain hash, working-tree state, and
the next safe action. A green command still reports `decision: partial` because
these controls are local-only until the app or gateway consumes them.

## Runtime Integration Gate

The runtime integration contract declares how the consumer app and gateway
would consume AMOS gates later. It is intentionally contract-only today:
all surfaces stay disabled and all adapters stay `none`.

```bash
npm run guard:runtime-integration
```

Manual checks:

```bash
node scripts/amos_runtime_integration_gate.mjs --expect allow
node scripts/amos_runtime_integration_gate.mjs --manifest .mirror/CONTRACTS/amos/runtime_integration.live_blocked.example.json --expect block
```

This gate blocks claims that AMOS runtime enforcement is live, that the public
app consumes AMOS contracts, or that the gateway consumes AMOS contracts. A
future shadow adapter must pass this contract before any live runtime wiring is
claimed.

## Shadow Dry-Run Adapter Gate

The shadow adapter simulates a future runtime request, runs the local runtime
integration, contract, and receipt-chain gates, then emits a local receipt. It
does not call a model, touch the network, write durable memory, change the
public app, or change the gateway.

```bash
npm run guard:shadow-adapter
```

Manual checks:

```bash
node scripts/amos_shadow_adapter_gate.mjs --expect allow
node scripts/amos_shadow_adapter_gate.mjs --request .mirror/CONTRACTS/amos/shadow_runtime_request.live_blocked.example.json --expect block
node scripts/amos_shadow_adapter_gate.mjs --write
```

Written dry-run receipts go to `.mirror/RUNTIME_DRY_RUNS/`. They are local
evidence only and are not live runtime enforcement.

## Read-Only App Adapter Gate

The read-only app adapter proposal inspects selected local app source files and
the request envelope, then emits source hashes as a local receipt. It does not
call a model, use the network, write memory, change routes, change the gateway,
or deploy public assets.

```bash
npm run guard:readonly-app-adapter
```

Manual checks:

```bash
node scripts/amos_readonly_app_adapter_gate.mjs --expect allow
node scripts/amos_readonly_app_adapter_gate.mjs --request .mirror/CONTRACTS/amos/readonly_app_adapter.live_blocked.example.json --expect block
node scripts/amos_readonly_app_adapter_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/` and contain source file
hashes, not copied app content. This is still local evidence only.

## Browser-Local Runtime Adapter Gate

The browser-local runtime adapter proposal processes an in-memory request
object and emits a projection receipt. It stores only an input hash in the
receipt and performs no live app, gateway, model, network, route, deploy, or
durable memory action.

```bash
npm run guard:browser-runtime-adapter
```

Manual checks:

```bash
node scripts/amos_browser_runtime_adapter_gate.mjs --expect allow
node scripts/amos_browser_runtime_adapter_gate.mjs --request .mirror/CONTRACTS/amos/browser_runtime_adapter.live_blocked.example.json --expect block
node scripts/amos_browser_runtime_adapter_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/` and contain an input hash,
requested output type, allowed local actions, and blocked capabilities. This is
still local evidence only.

## Local UI Harness Gate

The local UI harness proposal calls the browser-local runtime adapter and emits
a UI projection receipt. It keeps the consumer frame chat-first while proving
the proposed UI path is still local-only and cannot call models, use network,
write durable memory, change routes, change the gateway, deploy public assets,
or execute arbitrary generated UI.

```bash
npm run guard:ui-harness
```

Manual checks:

```bash
node scripts/amos_ui_harness_gate.mjs --expect allow
node scripts/amos_ui_harness_gate.mjs --request .mirror/CONTRACTS/amos/ui_harness.live_blocked.example.json --expect block
node scripts/amos_ui_harness_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/` and contain the UI
projection plus the browser-runtime input hash. This is still local evidence
only.

## Disabled Source Adapter Gate

The disabled source adapter proposal places a guarded adapter file in app
source while proving it is not imported by the active app. The gate checks the
disabled invariants, active source imports, the local UI harness, and the local
receipt chain. It performs no live app, gateway, model, network, route, deploy,
arbitrary UI, or durable memory action.

```bash
npm run guard:disabled-source-adapter
```

Manual checks:

```bash
node scripts/amos_disabled_source_adapter_gate.mjs --expect allow
node scripts/amos_disabled_source_adapter_gate.mjs --request .mirror/CONTRACTS/amos/disabled_source_adapter.live_blocked.example.json --expect block
node scripts/amos_disabled_source_adapter_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/` and contain the source hash,
active import scan, and local UI harness result. This is still local evidence
only.

## Source Adapter Import Proposal Gate

The source adapter import proposal gate checks whether importing the disabled
source adapter is merely proposed, still pending approval, and still not active
in app source. It scans active imports, target files, the disabled adapter gate,
and required local gates before emitting a local receipt.

```bash
npm run guard:source-adapter-import
```

Manual checks:

```bash
node scripts/amos_source_adapter_import_gate.mjs --expect approval_required
node scripts/amos_source_adapter_import_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import.live_blocked.example.json --expect block
node scripts/amos_source_adapter_import_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/` and confirm the import is
approval-required, not applied, and not live. This performs no source import,
live app action, gateway change, model call, network call, route change,
deploy, arbitrary UI execution, or durable memory write.

## Source Adapter Import Approval Bridge

The source adapter import approval bridge previews the pending approval request
for the import proposal without writing a real approval file. It verifies the
source import proposal receipt, runs the approval request gate in dry-run mode,
and keeps the import unapplied.

```bash
npm run guard:source-adapter-import-approval
```

Manual checks:

```bash
node scripts/amos_source_adapter_import_approval_gate.mjs --expect approval_required
node scripts/amos_source_adapter_import_approval_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import_approval.live_blocked.example.json --expect block
node scripts/amos_source_adapter_import_approval_gate.mjs --write
```

Written receipts go to `.mirror/RUNTIME_DRY_RUNS/`. They prove only that a
pending approval request can be previewed. They do not write a real approval
file, approve the import, import source, call a model, use the network, change
routes, change the gateway, deploy assets, execute arbitrary UI, or write
durable memory.

## Source Adapter Import Approval Creation Gate

The source adapter import approval creation gate creates the real pending
approval request file for the import proposal, while still proving that no
approval was granted and no source import was applied. It verifies the approval
bridge receipt, writes through the generic approval request gate, validates the
pending file shape, and records a local receipt.

```bash
npm run guard:source-adapter-import-approval-create
```

Manual checks:

```bash
node scripts/amos_source_adapter_import_approval_create_gate.mjs --expect approval_required
node scripts/amos_source_adapter_import_approval_create_gate.mjs --request .mirror/CONTRACTS/amos/source_adapter_import_approval_create.live_blocked.example.json --expect block
node scripts/amos_source_adapter_import_approval_create_gate.mjs --write
```

Written approval requests go to `.mirror/APPROVAL_REQUESTS/`. Written receipts
go to `.mirror/RUNTIME_DRY_RUNS/`. They prove only that a pending approval
request exists. They do not grant approval, import source, call a model, use
the network, change routes, change the gateway, deploy assets, execute
arbitrary UI, or write durable memory.

## Approval Request Gate

Consequential actions do not run directly. The local approval request writer
first runs the AMOS contract gate, then writes a pending approval request only
when the contract returns `approval_required`.

```bash
npm run guard:approval-request
```

Manual dry-run:

```bash
node scripts/amos_approval_request_gate.mjs --dry-run
```

Manual writes go to `.mirror/APPROVAL_REQUESTS/`. Do not create real approval
files for fake actions; they are for actual risky work that needs review.

## Memory Proposal Gate

Memory work starts as a proposal, not a hidden save. The local proposal writer
first runs the AMOS contract gate, then writes a YAML proposal only when the
contract returns `allow`.

```bash
npm run guard:memory-proposal
```

Manual dry-run:

```bash
node scripts/amos_memory_proposal_gate.mjs --dry-run
```

Manual write:

```bash
node scripts/amos_memory_proposal_gate.mjs --write
```

Written files go to `.mirror/MEMORY_UPDATE_PROPOSALS/` and still require human
approval before becoming durable memory.
