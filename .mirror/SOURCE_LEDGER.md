# Active Mirror Source Ledger

Purpose: track public/product claims that need evidence before they appear in copy, docs, or deploy notes.

## Current Rule

- Claims visible to users need a source, file, receipt, or explicit uncertainty label.
- Market/category claims need fresh web research before publication.
- Internal strategy language does not become public copy without a source and a user-facing reason.
- SWFI/client-specific facts stay out of this repo unless the line is only a boundary note.

## Claims To Verify

| Claim | Surface | Status | Evidence |
|---|---|---|---|
| Active Mirror is a reflective AI front door. | product copy | source-backed-local | `src/pages/HomePage.jsx`, `CANONICAL_SITE.md` |
| Active Mirror can create small useful outputs from a first turn. | product behavior | source-backed-local | `src/lib/first-turn-fallback.js`, production artifact smoke in `.mirror/STATUS.md` |
| Browser-local state is not full owned identity sync yet. | product limit | source-backed-local | `.mirror/STATUS.md` |
| Offline/local AI and memory are crowded categories; Active Mirror should not claim uniqueness there. | market positioning | source-backed-current | Apple Private Cloud Compute, Microsoft Recall, Vercel AI SDK, Transformers.js/WebGPU, OpenAI/Gemini/Personal.ai memory signals; summarized in `docs/dossiers/offline-online-owned-ai-position.md` |
| Active Mirror's stronger lane is private-first reflection with online help only when useful. | product positioning | source-backed-current + local-product | `docs/dossiers/offline-online-owned-ai-position.md`, `src/lib/challenge-packet.js`, `src/lib/local-mirror-sense.js` |
| AMOS Euclid Trace is a public proof scaffold, not hidden chain-of-thought or a guarantee of truth. | proof boundary | source-backed-local | `/Users/mirror-pro/Downloads/amos_euclid_reflective_build_pack/docs/01_EUCLID_TRACE_PROTOCOL.md`, `docs/dossiers/amos-proof-layer-intake.md` |
| Decision memory should be context-sensitive rather than fixed personality profiling. | research-positioning | source-backed-current + intake | PNAS DOI `10.1073/pnas.2526798123`, `docs/dossiers/decision-reason-mapper.md`, `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/DECISION_REASON_MAPPER.md` |
| Safe self-evolution starts with governed memory and replay, not model mutation. | AMOS architecture | source-backed-current + intake | arXiv `2607.01120`, AReaL arXiv `2505.24298`, `docs/dossiers/evolution-control-plane.md`, `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/EVOLUTION_CONTROL_PLANE.md` |
| Memory operations should be explicit, auditable actions before they become durable state. | AMOS architecture | source-backed-current + intake | AutoMem arXiv `2607.01224`, `docs/dossiers/memory-skill-layer.md`, `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/MEMORY_SKILL_LAYER.md` |
| Context-change and coordination metaphors are internal instrumentation, not consumer claims. | AMOS boundary | theory-grade + intake | Frontiers DOI `10.3389/fnins.2026.1836602`, `docs/dossiers/context-coordination-layer.md`, `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/COORDINATION_LAYER.md` |
| Synthetic-continuity language must block consciousness, life, and mind claims. | AMOS boundary | analogy-grade + intake | University of Minnesota SpudCell article, Biotic SpudCell page, Guardian coverage, `docs/dossiers/synthetic-continuity-boundary.md`, `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/SYNTHETIC_CONTINUITY.md` |
| ActiveMirrorOS should be treated as a governed persistent-state agent layer, not a chatbot memory feature. | AMOS architecture | intake | `/Users/mirror-pro/Downloads/ActiveMirrorOS_Governed_Agent_OS_Synthesis.md`, `docs/dossiers/governed-agent-os.md` |
| AMOS Cognitive Mesh should be a governed agent control plane, not a loose autonomous swarm. | AMOS architecture | intake | `/Users/mirror-pro/Downloads/AMOS_Cognitive_Mesh_Build_Pack_v0.1.md`, `docs/dossiers/amos-cognitive-mesh.md`, `docs/topic-packets/amos-cognitive-mesh-v0-1.md` |
| AMOS control-plane work should start with small validated contracts before tools, memory, agents, or external actions run. | AMOS architecture | intake + local-contract | `/Users/mirror-pro/.codex/attachments/83ae4042-534a-4067-906c-410a675cd0ff/pasted-text.txt`, `docs/dossiers/amos-control-plane-contracts.md`, `scripts/amos_contract_gate.mjs`, `.mirror/schemas/scd_state.schema.json`, `.mirror/schemas/workspace_boundary.schema.json`, `.mirror/schemas/consent_ladder.schema.json`, `.mirror/schemas/agent_contract.schema.json`, `.mirror/schemas/action_request.schema.json` |
| Memory operations should begin as reviewable proposals, not hidden durable saves. | AMOS architecture | local-contract | `scripts/amos_memory_proposal_gate.mjs`, `.mirror/schemas/memory_proposal_request.schema.json`, `.mirror/CONTRACTS/amos/action_request.memory_proposal.example.json`, `.mirror/CONTRACTS/amos/memory_proposal_request.example.json` |
| Approval-required actions should create a pending approval request before any external or public action runs. | AMOS architecture | local-contract | `scripts/amos_approval_request_gate.mjs`, `.mirror/schemas/approval_request.schema.json`, `.mirror/CONTRACTS/amos/scd_state.approval.example.json`, `.mirror/CONTRACTS/amos/action_request.publish_public.approval.example.json` |
| Artifact export should be local-only unless path, root, content-type, secret-scan, hash, and manifest checks pass. | AMOS architecture | local-contract | `scripts/amos_artifact_export_gate.mjs`, `.mirror/schemas/artifact_export_request.schema.json`, `.mirror/CONTRACTS/amos/action_request.artifact_export.example.json`, `.mirror/CONTRACTS/amos/artifact_export_request.example.json`, `.mirror/FILE_EXPORT_REGISTRY.md` |
| Local AMOS gate checks should leave audit receipts before any live runtime wiring is claimed. | AMOS architecture | local-contract | `scripts/amos_audit_log_gate.mjs`, `.mirror/schemas/audit_log_request.schema.json`, `.mirror/CONTRACTS/amos/action_request.audit_log.example.json`, `.mirror/CONTRACTS/amos/audit_log_request.example.json`, `.mirror/AUDIT_LOGS/20260707T130000Z-amos_local_gates.yaml` |
| Local AMOS audit receipts are chained with deterministic SHA-256 tamper checks. | AMOS architecture | local-contract | `scripts/amos_receipt_chain_gate.mjs`, `.mirror/schemas/receipt_chain.schema.json`, `.mirror/RECEIPT_CHAINS/audit-log-chain.json`, `.mirror/AUDIT_LOGS/20260707T131500Z-amos_receipt_chain.yaml`, `npm run guard:receipt-chain` |
| Local AMOS control health can be checked with one bad-news-first status command. | AMOS architecture | local-contract | `scripts/amos_status_report.mjs`, `.mirror/CONTRACTS/amos/audit_log_request.amos_status.example.json`, `.mirror/AUDIT_LOGS/20260707T132500Z-amos_status_report.yaml`, `npm run amos:status` |
| AMOS runtime integration remains contract-only until a future app or gateway adapter is approved. | AMOS architecture | local-contract | `scripts/amos_runtime_integration_gate.mjs`, `.mirror/schemas/runtime_integration.schema.json`, `.mirror/CONTRACTS/amos/runtime_integration.contract_only.example.json`, `.mirror/AUDIT_LOGS/20260707T132730Z-amos_runtime_integration_contract.yaml`, `npm run guard:runtime-integration` |
| AMOS shadow runtime requests can emit local dry-run receipts without performing live actions. | AMOS architecture | local-contract | `scripts/amos_shadow_adapter_gate.mjs`, `.mirror/schemas/shadow_runtime_request.schema.json`, `.mirror/schemas/shadow_runtime_receipt.schema.json`, `.mirror/CONTRACTS/amos/shadow_runtime_request.consumer.example.json`, `.mirror/RUNTIME_DRY_RUNS/20260707T133841Z-shadow_consumer_first_turn.json`, `npm run guard:shadow-adapter` |
| AMOS read-only app adapter proposals can emit source-hash receipts without live runtime behavior. | AMOS architecture | local-contract | `scripts/amos_readonly_app_adapter_gate.mjs`, `.mirror/schemas/readonly_app_adapter_request.schema.json`, `.mirror/schemas/readonly_app_adapter_receipt.schema.json`, `.mirror/CONTRACTS/amos/readonly_app_adapter.consumer.example.json`, `.mirror/RUNTIME_DRY_RUNS/20260707T134909Z-readonly_consumer_app_surface.json`, `npm run guard:readonly-app-adapter` |
| AMOS browser-local runtime adapter proposals can emit in-memory request projection receipts without live runtime behavior. | AMOS architecture | local-contract | `scripts/amos_browser_runtime_adapter_gate.mjs`, `.mirror/schemas/browser_runtime_adapter_request.schema.json`, `.mirror/schemas/browser_runtime_adapter_receipt.schema.json`, `.mirror/CONTRACTS/amos/browser_runtime_adapter.consumer.example.json`, `.mirror/RUNTIME_DRY_RUNS/20260707T140008Z-browser_local_consumer_turn.json`, `npm run guard:browser-runtime-adapter` |
| AMOS local UI harness proposals can call the browser-local runtime adapter and emit UI projection receipts without live runtime behavior. | AMOS architecture | local-contract | `scripts/amos_ui_harness_gate.mjs`, `.mirror/schemas/ui_harness_request.schema.json`, `.mirror/schemas/ui_harness_receipt.schema.json`, `.mirror/CONTRACTS/amos/ui_harness.consumer.example.json`, `.mirror/RUNTIME_DRY_RUNS/20260707T140840Z-local_ui_consumer_turn.json`, `npm run guard:ui-harness` |
| AMOS disabled source adapter exists in app source without being imported or live. | AMOS architecture | local-contract | `src/lib/amos-disabled-source-adapter.js`, `scripts/amos_disabled_source_adapter_gate.mjs`, `.mirror/schemas/disabled_source_adapter_request.schema.json`, `.mirror/schemas/disabled_source_adapter_receipt.schema.json`, `.mirror/RUNTIME_DRY_RUNS/20260707T141644Z-disabled_source_adapter_consumer.json`, `npm run guard:disabled-source-adapter` |

## Blocked Until Verified

- Broad market-size claims.
- Claims that competitors do not offer memory, privacy, or reflection.
- Claims that local models are trained, personalized, or user-owned.
- Claims that cryptographic proof, ZKP, or enterprise audit is implemented in the consumer app.
- Claims that local receipt chains are signed, externally timestamped,
  publicly notarized, or verified by the live app/gateway.
- Claims that the public app or gateway consumes AMOS contracts at runtime.
- Claims that the shadow adapter performed live app, gateway, model, network,
  or durable memory actions.
- Claims that the read-only app adapter performed live app, gateway, model,
  network, route, deploy, or durable memory actions.
- Claims that the browser-local runtime adapter performed live app, gateway,
  model, network, route, deploy, or durable memory actions.
- Claims that the local UI harness performed live app, gateway, model, network,
  route, deploy, arbitrary UI, or durable memory actions.
- Claims that the disabled source adapter is imported by the active app or
  performs live app, gateway, model, network, route, deploy, arbitrary UI, or
  durable memory actions.
- Claims that the consumer app implements full AMOS, Euclid Trace, MirrorGraph, or Reflective Workspace runtime.
- Claims that Active Mirror reads hidden motives, creates consciousness, is alive,
  or runs full governed memory/evolution modules in the public app.
