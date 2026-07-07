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

## Blocked Until Verified

- Broad market-size claims.
- Claims that competitors do not offer memory, privacy, or reflection.
- Claims that local models are trained, personalized, or user-owned.
- Claims that cryptographic proof, ZKP, or enterprise audit is implemented in the consumer app.
- Claims that the consumer app implements full AMOS, Euclid Trace, MirrorGraph, or Reflective Workspace runtime.
- Claims that Active Mirror reads hidden motives, creates consciousness, is alive,
  or runs full governed memory/evolution modules in the public app.
