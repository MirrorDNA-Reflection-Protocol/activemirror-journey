# Active Mirror Hardening Resolution Contracts

This file tracks known local hardening gaps that must stay visible until a
specific receipt closes them. It is not a deployment or health claim.

## 2026-07-01 Bounded Hardening Cycle

### resolution_contract_v1: codex-desktop-visible-renderer-ungated

- blocker: Codex Desktop visible chat has no proven pre-display final-output gate.
- fix_path: Add a supported client-level pre-display hook, or route high-trust final output through `/Users/mirror-pro/bin/codex exec --output-last-message`.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/codex_wrapper_gate_probe.py self-check` and `python3 /Users/mirror-pro/.mirrordna/scripts/codex_desktop_gate_probe.py self-check`.
- proof_needed: A live receipt with `physical_gate_proven=true` for the exact Codex Desktop renderer, not only the wrapper handoff route.
- auto_fixable: false.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/codex_desktop_gate_probe.py`, `/Users/mirror-pro/.codex/config.toml`, and Codex Desktop supported hook documentation.

### resolution_contract_v1: claude-code-visible-renderer-partial

- blocker: Claude visible-output enforcement depends on live Stop hook transcript extraction on the exact client build.
- fix_path: Capture a live Claude Stop receipt proving final text or transcript path reaches `final_output_proxy.py` before visible closure language.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/ungated_surface_inventory.py self-check`.
- proof_needed: A current Stop receipt showing transcript extraction and proxy enforcement for the visible Claude renderer.
- auto_fixable: false.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/claude_stop_gate.py` and `/Users/mirror-pro/.mirrordna/scripts/ungated_surface_inventory.py`.

### resolution_contract_v1: codex-ahead-peer-plus-one-pending

- blocker: Codex ahead harness still waits for real Claude/Gemini CAH+1 receipts; simulated consensus does not count.
- fix_path: Request and record real peer +1 receipts for high-risk trust/runtime changes before promotion claims.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/peer_plus_one_gate.py self-check`.
- proof_needed: Peer +1 receipt sources from real Claude and Gemini runs for the specific trust/runtime target.
- auto_fixable: false.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/peer_plus_one_gate.py` and `/Users/mirror-pro/.mirrordna/bus/mesh_chat/one-organism.room.jsonl`.

### resolution_contract_v1: codex-ahead-lifecycle-pretool-session-warnings

- blocker: `agent_session_bridge.py self-check --all --json` reports Codex ahead harness lifecycle warnings for `pretool` and `session`.
- fix_path: Inspect the current Codex ahead harness receipts, then repair or document the missing lifecycle coverage without changing model pins, launchers, or client routing.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`, `python3 /Users/mirror-pro/.mirrordna/scripts/codex_ahead_harness.py doctor`, and `/Users/mirror-pro/.mirrordna/health/codex_ahead_harness.json`.
- proof_needed: A bridge or harness receipt where Codex has no `pretool` or `session` lifecycle warnings, while peer +1 and visible-renderer debts remain separately labeled if still open.
- auto_fixable: true, only after current harness receipt ownership is checked.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/codex_ahead_harness.py` and `/Users/mirror-pro/.mirrordna/bus/codex_ahead_harness.jsonl`.

### resolution_contract_v1: continuity-agent-runtime-degraded

- blocker: Continuity console reports `status=degraded` with `agent_runtime_degraded`.
- fix_path: Keep product/UI hardening local until the continuity bridge identifies and clears the degraded runtime primitive.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` and `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`.
- proof_needed: Continuity console receipt with non-degraded status, or a scoped receipt proving the degraded primitive is unrelated to the proposed change.
- auto_fixable: false.
- next_search_path: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` and `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.

### resolution_contract_v1: agent-session-bridge-slow-oversized-receipt

- blocker: `agent_session_bridge.py self-check --all --json` returned `ok=true` but took longer than a quick gate pass and needed a `/tmp` receipt plus compact `jq` summary to avoid oversized chat output.
- fix_path: Add or use a stable compact summary receipt for all-actor bridge checks, preserving the full JSON receipt for audit without forcing automation output truncation.
- owner: Active Mirror trust/runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` and `/tmp/am_agent_session_bridge_20260630T202243Z.json`.
- proof_needed: A compact bridge receipt with `generated_at`, top-level `ok`, actor `ok`, warning counts, and failure counts, plus the full receipt path for drilldown.
- auto_fixable: true, after confirming current bridge-script dirty ownership.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` output writer and `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json`.

### resolution_contract_v1: preexisting-front-door-guard-delta

- blocker: `scripts/front_door_guard.mjs` was already modified before this cycle's local edit decision.
- fix_path: Preserve the existing guard delta unless a focused review confirms ownership and desired promotion.
- owner: Active Mirror product/trust lane.
- command_or_file: `git diff -- scripts/front_door_guard.mjs` and `npm run guard:front-door`.
- proof_needed: Passing front-door guard plus explicit decision to keep or revise the added consumer-surface bans.
- auto_fixable: true, only by focused review inside this repo.
- next_search_path: `/Users/mirror-pro/repos/activemirror-journey/scripts/front_door_guard.mjs`.

## 2026-07-01T13:56:10+05:30 Bridge Invocation Evidence

Current evidence update: `/Users/mirror-pro/.mirrordna/health/continuity_console.json`
now reports top-level `status=ok`, `runtime.health_status=ok`, and
`runtime.agent_status=ok` for the 2026-07-01T08:06:02Z receipt. The older
`continuity-agent-runtime-degraded` contract remains historical debt until a
focused cleanup pass updates or archives stale contracts, but continuity
degradation was not the live blocker in this run.

### resolution_contract_v1: agent-session-bridge-zero-byte-sigterm-attempt

- blocker: A first file-backed non-heartbeat run of `agent_session_bridge.py self-check --all --json` exited `143` and left a zero-byte JSON receipt plus zero-byte stderr, so the automation had no parseable bridge proof from that attempt.
- fix_path: Add or use a native compact/progress receipt mode for all-actor bridge checks, preserving the full JSON receipt while preventing zero-output termination paths.
- owner: Active Mirror runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`, `/tmp/am_hardening_agent_session_bridge_20260701T082325Z.json`, `/tmp/am_hardening_agent_session_bridge_retry_20260701T082346Z.json`, and `/tmp/am_hardening_agent_session_bridge_wrapped_20260701T082517Z.json`.
- proof_needed: The exact bridge command produces a nonzero JSON receipt or a governed compact health receipt without an external heartbeat wrapper; actor `ok`, warning counts, failure counts, and the full receipt path must remain available.
- auto_fixable: true, after dirty ownership is resolved for `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` self-check output writer and `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json`.

## 2026-07-01T15:54:23+05:30 Runtime Council Evidence

- council_owner: runtime.
- checked_scope: Required Active Mirror/AMOS local gates only; no SWFI, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- bridge_full_receipt: `/tmp/am_hardening_agent_session_bridge_20260701T102328Z.json`, `940609` bytes, top-level `ok=true`, `report_count=3`.
- bridge_schema_note: The bridge receipt uses top-level `reports`, not `actors`; compact receipt tooling must parse the live schema instead of assuming an older actor-list shape.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; Codex ahead peer +1 warning remains; bridge output remains too large for direct automation chat output.
- promotion_decision: Promote only local receipt evidence and this contract update; do not patch `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` while the `.mirrordna` worktree has unrelated dirty governance/runtime changes.

### resolution_contract_v1: agent-session-bridge-live-schema-compact-proof

- blocker: The live all-actor bridge receipt is parseable and passing, but its native output is still oversized and the compact parser must handle the current top-level `reports` schema.
- fix_path: Add or use a native compact bridge summary that preserves `generated_at`, top-level `ok`, each report actor, actor `ok`, warning counts, failure counts, and the full receipt path.
- owner: Active Mirror runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json` and `/tmp/am_hardening_agent_session_bridge_20260701T102328Z.json`.
- proof_needed: A compact bridge receipt emitted by the bridge or an approved wrapper without chat-output truncation, plus the full JSON receipt path for drilldown.
- auto_fixable: true, after dirty ownership is resolved for `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` self-check output writer and `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json`.

## 2026-07-01T16:54:19+05:30 Runtime Council Source-Context Evidence

- council_owner: runtime.
- checked_scope: Required Active Mirror/AMOS local gates and actor context only; no SWFI, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- bridge_full_receipt: `/tmp/am_hardening_20260701T165214+0530/07_agent_session_bridge.log`, `940620` bytes, top-level `ok=true`, `report_count=3`.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project` while the active repo for this run is `/Users/mirror-pro/repos/activemirror-journey`.
- promotion_decision: Promote this local resolution contract and automation receipt only; do not patch lattice/runtime writers while ownership of `.mirrordna` source changes is unresolved.

### resolution_contract_v1: codex-graph-context-stale-active-workspace

- blocker: Codex actor-local graph context points at `/Users/mirror-pro/Documents/New project`, not the active Active Mirror Journey workspace.
- fix_path: Refresh the actor-local graph context through the governed lattice writer or document why the graph projection is intentionally decoupled from the active Codex repo.
- owner: Active Mirror runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` and `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`.
- proof_needed: A current graph-context receipt showing the active Codex context maps to `/Users/mirror-pro/repos/activemirror-journey`, or a scoped receipt proving the stale projection cannot influence routing decisions.
- auto_fixable: partial, only through the governed lattice refresh path after writer ownership is checked.
- next_search_path: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md`, `/Users/mirror-pro/.mirrordna/state/lattice/discovery_registry.json`, and the graph context refresh writer.

## 2026-07-01T17:54:26+05:30 Runtime Council Bridge-Cwd Evidence

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, required AMOS gates, and all-actor bridge receipt only; no SWFI, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- bridge_full_receipt: `/tmp/am_hardening_agent_session_bridge_20260701T122224Z.json`, `940621` bytes, top-level `ok=true`, `report_count=3`.
- bridge_actor_cwd_evidence: the bridge reports `cwd=/Users/mirror-pro/repos/new-project` for Codex, Claude, and Gemini while this active run uses `/Users/mirror-pro/repos/activemirror-journey`.
- promotion_decision: Promote this local resolution contract and compact automation receipt only; do not patch `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` while that script is already modified outside this repo.

### resolution_contract_v1: bridge-actor-cwd-stale-new-project

- blocker: `agent_session_bridge.py self-check --all --json` reports all actor `cwd` values as `/Users/mirror-pro/repos/new-project`, not the active `/Users/mirror-pro/repos/activemirror-journey` workspace.
- fix_path: Refresh or correct actor cwd projection through the governed bridge/lattice writer, or document why bridge actor cwd intentionally points at the shared launcher repo and cannot affect Active Mirror routing decisions.
- owner: Active Mirror runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`, `/tmp/am_hardening_agent_session_bridge_20260701T122224Z.json`, and `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md`.
- proof_needed: A current bridge receipt where actor cwd and graph context either map to `/Users/mirror-pro/repos/activemirror-journey` for this run or include a scoped receipt proving the mismatch is non-authoritative for product/runtime decisions.
- auto_fixable: partial, only after dirty ownership is resolved for `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` cwd/report assembly, `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/*.json`, and the governed graph context refresh writer.

## 2026-07-01T18:58:27+05:30 Runtime Council Current-Truth Receipt

- council_owner: runtime.
- checked_scope: Active Mirror/AMOS local gates, council-control-plane source, continuity console, ungated-surface inventory, and all-actor bridge receipt only; no SWFI, client-confidential lanes, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- unchecked_scope: Physical pre-display gating inside Codex Desktop visible chat; live Claude visible-renderer transcript proof; governed bridge/lattice writer internals; overlapping automation receipts created by other runs in the same minute.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/tmp/am_hardening_memory_signature_gate_20260701T132459Z.log`, `/tmp/am_hardening_honesty_kernel_20260701T132459Z.log`, `/tmp/am_hardening_codex_wrapper_gate_probe_20260701T132459Z.log`, `/tmp/am_hardening_ungated_surface_inventory_20260701T132500Z.log`, `/tmp/am_hardening_final_output_proxy_20260701T132500Z.log`, `/tmp/am_hardening_trust_by_design_protocol_20260701T132504Z.log`, and `/tmp/am_hardening_agent_session_bridge_20260701T132511Z.log`.
- bridge_full_receipt: `/tmp/am_hardening_agent_session_bridge_20260701T132511Z.log`, `940632` bytes, top-level `ok=true`, `report_count=3`.
- bridge_warning_summary: Codex warnings `2`, Claude warnings `1`, Gemini warnings `1`, actor failures `0`; current warnings are visible-renderer physical-gate debt and pending real Claude/Gemini CAH+1 receipts.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=ok`, `runtime.health_status=ok`, and `runtime.agent_status=ok`; continuity degradation is not the live blocker in this run.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`, while the active bridge reports actor `cwd=/Users/mirror-pro/repos/new-project`; keep actor-context mismatch debt open until the governed writer explains or refreshes it.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; Codex ahead peer +1 receipts remain pending; bridge output remains too large for direct automation chat output; `.mirrordna` has broad unrelated dirty/generated state.
- promotion_decision: Promote this local receipt evidence and automation compact receipt only; do not patch `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` while control-plane source ownership is dirty.

## 2026-07-01T18:55:02+05:30 Runtime Council Bridge-Cwd Recheck

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, required AMOS gates, actor context, and compact receipt promotion only; no SWFI, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- bridge_full_receipt: `/tmp/am_hardening_agent_session_bridge_20260701T132415Z.json`, `940632` bytes, top-level `ok=true`, `report_count=3`.
- bridge_actor_cwd_evidence: the bridge still reports `cwd=/Users/mirror-pro/repos/new-project` for Codex, Claude, and Gemini while this active run uses `/Users/mirror-pro/repos/activemirror-journey`.
- graph_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; Codex ahead peer +1 warning remains; bridge output remains too large for direct automation chat output; actor cwd and graph context still do not name the active repo.
- promotion_decision: Promote this local evidence and compact automation receipt only; do not patch `.mirrordna` bridge/lattice writers until dirty ownership and the intended active-context model are clear.

### resolution_contract_v1: bridge-actor-cwd-stale-new-project-current-recheck

- blocker: Current bridge receipt still maps all actor `cwd` values to `/Users/mirror-pro/repos/new-project`, not `/Users/mirror-pro/repos/activemirror-journey`.
- fix_path: Refresh or correct actor cwd projection through the governed bridge/lattice writer, or add a scoped receipt proving the bridge cwd is a launcher-context field that does not steer Active Mirror product/runtime decisions.
- owner: Active Mirror runtime lane.
- command_or_file: `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json` and `/tmp/am_hardening_agent_session_bridge_20260701T132415Z.json`.
- proof_needed: A current bridge receipt where actor cwd maps to the active workspace, or a scoped proof that the stale cwd is non-authoritative for routing and promotion.
- auto_fixable: partial, only after dirty ownership is resolved for `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` cwd/report assembly and `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/`.

### resolution_contract_v1: codex-graph-context-stale-active-workspace-current-recheck

- blocker: Codex actor-local graph context still points at `/Users/mirror-pro/Documents/New project`, not the active `/Users/mirror-pro/repos/activemirror-journey` workspace.
- fix_path: Refresh the actor-local graph context through the governed lattice writer, or add a scoped receipt proving the graph projection is intentionally decoupled from the current Codex repo.
- owner: Active Mirror runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md`.
- proof_needed: A current graph-context receipt naming `/Users/mirror-pro/repos/activemirror-journey`, or a scoped proof that stale graph context cannot influence routing, source selection, or promotion.
- auto_fixable: partial, only through the governed lattice refresh path after writer ownership is checked.
- next_search_path: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md`, `/Users/mirror-pro/.mirrordna/state/lattice/discovery_registry.json`, and the graph context refresh writer.

## 2026-07-01T19:55:12+05:30 Runtime Council Native-Health Receipt

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, council-control-plane source, required AMOS gates, continuity console, graph context, and all-actor bridge receipt only; no SWFI, client-confidential lanes, production deploy, Cloudflare, Hetzner, model training, adapters, restarts, or broad cleanup.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/tmp/am_perpetual_hardening_20260701T195314+0530/01_memory_signature_gate.log`, `/tmp/am_perpetual_hardening_20260701T195314+0530/02_honesty_kernel.log`, `/tmp/am_perpetual_hardening_20260701T195314+0530/03_codex_wrapper_gate_probe.log`, `/tmp/am_perpetual_hardening_20260701T195314+0530/04_ungated_surface_inventory.log`, `/tmp/am_perpetual_hardening_20260701T195314+0530/05_final_output_proxy.log`, `/tmp/am_perpetual_hardening_20260701T195314+0530/06_trust_by_design_protocol.log`, and `/tmp/am_perpetual_hardening_20260701T195314+0530/07_agent_session_bridge.log`.
- bridge_full_receipt: `/tmp/am_perpetual_hardening_20260701T195314+0530/07_agent_session_bridge.log`, `940635` bytes, top-level `ok=true`, `report_count=3`.
- bridge_warning_summary: Codex warnings `2`, Claude warnings `1`, Gemini warnings `1`, actor failures `0`; current warnings are visible-renderer physical-gate debt and pending real Claude/Gemini CAH+1 receipts.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=ok`, `runtime.health_status=ok`, and `runtime.agent_status=ok`.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`, while the bridge reports actor `cwd=/Users/mirror-pro/repos/new-project`; neither matches the active `/Users/mirror-pro/repos/activemirror-journey` workspace.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; Codex ahead peer +1 receipts remain pending; bridge output remains too large for direct automation chat output; `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is missing; `.mirrordna` has broad unrelated dirty/generated state.
- promotion_decision: Promote this local receipt evidence and compact automation receipt only; do not patch `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` while control-plane source ownership is dirty.

### resolution_contract_v1: agent-session-bridge-native-health-missing-current

- blocker: `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is missing even though `agent_session_bridge.py self-check --all --json` returns a passing full receipt.
- fix_path: Add or verify a native compact bridge health writer that preserves top-level `ok`, actor `ok`, warning counts, failure counts, actor `cwd`, `generated_at`, and the full receipt path.
- owner: Active Mirror runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` and `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json`.
- proof_needed: A current `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` compact receipt validated by `python3 -m json.tool`, or a scoped receipt proving another canonical compact bridge health path has replaced it.
- auto_fixable: partial, only after dirty ownership is resolved for `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` self-check output writer, `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json`, and `/Users/mirror-pro/.mirrordna/state/lattice/agent_runtime.json`.

## 2026-07-01T21:56:05+05:30 Runtime Council Current-Evidence Receipt

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, council-control-plane source, required AMOS gates, continuity console, graph context, all-actor bridge receipt, and local receipt/doc promotion only.
- unchecked_scope: Physical pre-display gating inside Codex Desktop visible chat; live Claude visible-renderer transcript proof; dirty `.mirrordna` bridge/lattice writer internals; production deploys, Cloudflare, Hetzner, model training, adapters, and restarts.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/01_memory_signature_gate.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/02_honesty_kernel.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/03_codex_wrapper_gate_probe.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/04_ungated_surface_inventory.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/05_final_output_proxy.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/06_trust_by_design_protocol.out`, and `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/07_agent_session_bridge.out`.
- bridge_full_receipt: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T215411+0530/07_agent_session_bridge.out`, `940635` bytes, top-level `ok=true`, `report_count=3`.
- bridge_warning_summary: Codex warnings `2`, Claude warnings `1`, Gemini warnings `1`, actor failures `0`; bridge actor `cwd` values still point at `/Users/mirror-pro/repos/new-project`.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=ok`, `runtime.health_status=ok`, and `runtime.agent_status=ok`; continuity degradation is not the live blocker in this run.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`, while this active run uses `/Users/mirror-pro/repos/activemirror-journey`.
- dirty_ownership_evidence: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` has a pre-existing `697` added / `16` removed line diff, `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is missing, and `/Users/mirror-pro/repos/active-mirror-site/docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md` is already modified outside this repo.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; real Claude/Gemini CAH+1 receipts remain pending; bridge output remains oversized; native bridge health is missing; actor cwd and graph context still point at New project paths.
- resolution_contracts_in_force: `codex-desktop-visible-renderer-ungated`, `claude-code-visible-renderer-partial`, `codex-ahead-peer-plus-one-pending`, `agent-session-bridge-slow-oversized-receipt`, `codex-graph-context-stale-active-workspace-current-recheck`, `bridge-actor-cwd-stale-new-project-current-recheck`, `agent-session-bridge-native-health-missing-current`, and `agent-session-bridge-dirty-ownership-blocks-runtime-patch`.
- promotion_decision: Promote this local evidence section and compact automation receipt only; do not patch runtime/control-plane writers until dirty ownership is resolved.

### resolution_contract_v1: agent-session-bridge-dirty-ownership-blocks-runtime-patch

- blocker: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` has a pre-existing `697` added / `16` removed line diff, and related graph-context state is untracked, so patching the bridge writer in this run would mix ownership.
- fix_path: Attribute, finish, or isolate the existing bridge-script changes first; then add or verify native compact bridge health and actor cwd/graph-context projection in a clean scoped diff.
- owner: Active Mirror runtime lane.
- command_or_file: `git -C /Users/mirror-pro/.mirrordna diff --numstat -- scripts/agent_session_bridge.py` and `git -C /Users/mirror-pro/.mirrordna status --short -- scripts/agent_session_bridge.py state/lattice/graph_context/codex.md health/agent_session_bridge.json`.
- proof_needed: A clean or explicitly owned bridge-writer diff receipt, followed by passing `agent_session_bridge.py self-check --all --json`, `trust_by_design_protocol.py self-check --no-write`, and `memory_signature_gate.py self-check`.
- auto_fixable: partial, only after ownership is established.
- next_search_path: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`, `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/`, and `/Users/mirror-pro/.mirrordna/state/lattice/agent_runtime.json`.

## 2026-07-01T22:55:39+05:30 Runtime Council Current-Evidence Receipt

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, council-control-plane source, required AMOS gates, continuity console, graph context, all-actor bridge receipt, and local receipt/doc promotion only.
- unchecked_scope: Physical pre-display gating inside Codex Desktop visible chat; live Claude visible-renderer transcript proof; dirty `.mirrordna` bridge/lattice writer internals; production deploys, Cloudflare, Hetzner, model training, adapters, and restarts.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/01_memory_signature_gate.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/02_honesty_kernel.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/03_codex_wrapper_gate_probe.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/04_ungated_surface_inventory.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/05_final_output_proxy.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/06_trust_by_design_protocol.out`, and `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/07_agent_session_bridge.out`.
- memory_signature_evidence: `manifest_root_sha256=6c710047b8d87efd97e37f5277ed7af085aaa5f0019bf55e47eb6641dffd6f84`, `file_count=300`, and decision `allow`.
- ungated_surface_evidence: inventory still reports `surface_count=11` and `ungated_count=2`; Codex Desktop visible chat remains `UNGATED_CLIENT`, and Claude visible renderer remains `PARTIAL`.
- trust_by_design_evidence: Trust by Design returned `status=PASS`; adversarial completion canary returned `case_count=16`, `failed_count=0`.
- bridge_full_receipt: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260701T225331+0530-activemirror-journey/07_agent_session_bridge.out`, `940635` bytes, top-level `ok=true`, `report_count=3`.
- bridge_warning_summary: Codex warnings `2`, Claude warnings `1`, Gemini warnings `1`, actor failures `0`; bridge actor `cwd` values still point at `/Users/mirror-pro/repos/new-project`.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=ok`, `runtime.health_status=ok`, and `runtime.agent_status=ok`.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`, while this active run uses `/Users/mirror-pro/repos/activemirror-journey`.
- dirty_ownership_evidence: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` still has a pre-existing `697` added / `16` removed line diff, `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is missing, and `/Users/mirror-pro/repos/active-mirror-site/docs/POST_DEPLOY_RECEIPT_2026-07-01_COUNCIL_CONTROL_PLANE.md` is already modified outside this repo.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; real Claude/Gemini CAH+1 receipts remain pending; bridge output remains oversized; native bridge health is missing; actor cwd and graph context still point at New project paths.
- resolution_contracts_in_force: `codex-desktop-visible-renderer-ungated`, `claude-code-visible-renderer-partial`, `codex-ahead-peer-plus-one-pending`, `agent-session-bridge-slow-oversized-receipt`, `codex-graph-context-stale-active-workspace-current-recheck`, `bridge-actor-cwd-stale-new-project-current-recheck`, `agent-session-bridge-native-health-missing-current`, and `agent-session-bridge-dirty-ownership-blocks-runtime-patch`.
- promotion_decision: Promote this local evidence section and compact automation receipt only; do not patch runtime/control-plane writers until dirty ownership is resolved.

## 2026-07-02T01:55:42+05:30 Runtime Council Current-Evidence Receipt

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, council-control-plane source, required AMOS gates, body/lattice context, continuity console, graph context, all-actor bridge receipt, and local receipt/doc promotion only.
- unchecked_scope: Physical pre-display gating inside Codex Desktop visible chat; live Claude visible-renderer transcript proof; dirty `.mirrordna` bridge/lattice writer internals; production deploys, Cloudflare, Hetzner, model training, adapters, and restarts.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/01_memory_signature_gate.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/02_honesty_kernel.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/03_codex_wrapper_gate_probe.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/04_ungated_surface_inventory.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/05_final_output_proxy.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/06_trust_by_design_protocol.out`, and `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/07_agent_session_bridge.json`.
- memory_signature_evidence: `manifest_root_sha256=6c710047b8d87efd97e37f5277ed7af085aaa5f0019bf55e47eb6641dffd6f84`, `file_count=300`, and decision `allow`.
- ungated_surface_evidence: inventory still reports `surface_count=11` and `ungated_count=2`; Codex Desktop visible chat remains `UNGATED_CLIENT`, and Claude visible renderer remains `PARTIAL`.
- trust_by_design_evidence: Trust by Design returned `status=PASS`; adversarial completion canary remained at `case_count=16` and `failed_count=0`.
- bridge_full_receipt: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T015219+0530-activemirror-journey/07_agent_session_bridge.json`, `944677` bytes, top-level `ok=true`, `report_count=3`.
- bridge_warning_summary: Codex warnings `3`, Claude warnings `1`, Gemini warnings `1`, actor failures `0`; bridge actor `cwd` values still point at `/Users/mirror-pro/repos/new-project`.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=degraded`, `runtime.health_status=degraded`, `runtime.agent_status=ok`, and `generated_at=2026-07-01T19:56:55.383449+00:00`.
- source_context_evidence: `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still reports `cwd: /Users/mirror-pro/Documents/New project`, while this active run uses `/Users/mirror-pro/repos/activemirror-journey`.
- dirty_ownership_evidence: `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py` still has a pre-existing `697` added / `16` removed line diff; `/Users/mirror-pro/.mirrordna/scripts/agent_surface_sync.py` and `/Users/mirror-pro/.mirrordna/scripts/body_lattice_sync.py` are also modified; `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is missing.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; real Claude/Gemini CAH+1 receipts remain pending; continuity console is degraded at runtime health; bridge output remains oversized; native bridge health is missing; actor cwd and graph context still point at New project paths.
- resolution_contracts_in_force: `codex-desktop-visible-renderer-ungated`, `claude-code-visible-renderer-partial`, `codex-ahead-peer-plus-one-pending`, `codex-ahead-lifecycle-pretool-session-warnings`, `agent-session-bridge-slow-oversized-receipt`, `codex-graph-context-stale-active-workspace-current-recheck`, `bridge-actor-cwd-stale-new-project-current-recheck`, `agent-session-bridge-native-health-missing-current`, `agent-session-bridge-dirty-ownership-blocks-runtime-patch`, and `continuity-runtime-health-degraded-current`.
- promotion_decision: Promote this local evidence section and compact automation receipt only; do not patch runtime/control-plane writers until dirty ownership is resolved.

### resolution_contract_v1: continuity-runtime-health-degraded-current

- blocker: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` currently reports top-level `status=degraded` and `runtime.health_status=degraded`, even though `runtime.agent_status=ok` and the live bridge gate returned `ok=true`.
- fix_path: Compare the degraded runtime-health primitive against the live bridge pass receipt, then repair or refresh only through the governed continuity/body-lattice writer after dirty ownership is clear.
- owner: Active Mirror runtime lane.
- command_or_file: `/Users/mirror-pro/.mirrordna/health/continuity_console.json`, `python3 /Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py self-check --all --json`, and `python3 /Users/mirror-pro/.mirrordna/scripts/body_lattice_sync.py --apply`.
- proof_needed: A current continuity console receipt with `status=ok` and `runtime.health_status=ok`, or a scoped receipt proving the degraded runtime-health primitive is unrelated to Active Mirror product/runtime promotion.
- auto_fixable: partial, only after `.mirrordna` writer ownership is established.
- next_search_path: `/Users/mirror-pro/.mirrordna/health/continuity_console.json`, `/Users/mirror-pro/.mirrordna/health/health_runtime.json`, `/Users/mirror-pro/.mirrordna/scripts/body_lattice_sync.py`, and `/Users/mirror-pro/.mirrordna/scripts/agent_session_bridge.py`.

## 2026-07-02T08:55:59+05:30 Runtime Council Current-Evidence Receipt

- council_owner: runtime.
- checked_scope: Active Mirror Journey local automation cycle, council-control-plane source, required AMOS gates, continuity console, Codex graph context, native bridge-health path, all-actor bridge receipt, and local receipt/doc promotion only.
- unchecked_scope: Physical pre-display gating inside Codex Desktop visible chat; live Claude visible-renderer transcript proof; `.mirrordna` bridge/lattice writer internals; production deploys, Cloudflare, Hetzner, model training, adapters, and restarts.
- gate_summary: `memory_signature_gate.py self-check`, `honesty_kernel.py self-check`, `codex_wrapper_gate_probe.py self-check`, `ungated_surface_inventory.py self-check`, `final_output_proxy.py self-check`, `trust_by_design_protocol.py self-check --no-write`, and `agent_session_bridge.py self-check --all --json` returned exit `0`.
- gate_receipts: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/01_memory_signature_gate.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/02_honesty_kernel.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/03_codex_wrapper_gate_probe.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/04_ungated_surface_inventory.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/05_final_output_proxy.out`, `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/06_trust_by_design_protocol.out`, and `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/07_agent_session_bridge.out`.
- promoted_receipts: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/08_gate_run_compact_summary.json` and `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/receipts/2026-07-02T085559+0530-activemirror-journey-runtime-current-evidence.json`.
- memory_signature_evidence: `manifest_root_sha256=6c710047b8d87efd97e37f5277ed7af085aaa5f0019bf55e47eb6641dffd6f84`, `file_count=300`, and decision `allow`.
- ungated_surface_evidence: inventory still reports `surface_count=11` and `ungated_or_partial_count=2`; Codex Desktop visible chat remains `UNGATED_CLIENT`, and Claude visible renderer remains `PARTIAL`.
- trust_by_design_evidence: Trust by Design returned `status=PASS`; adversarial completion canary remained at `case_count=16` and `failed_count=0`.
- bridge_full_receipt: `/Users/mirror-pro/.codex/automations/active-mirror-genui-browser-os-intelligence-scan/runs/20260702T085348+0530-activemirror-journey-runtime-ratchet/07_agent_session_bridge.out`, `944687` bytes, top-level `ok=true`, `report_count=3`, actor failures `0`, total warning count `5`.
- bridge_actor_context_evidence: Codex, Claude, and Gemini bridge actor `cwd` values still point at `/Users/mirror-pro/repos/new-project`; `/Users/mirror-pro/.mirrordna/state/lattice/graph_context/codex.md` still references `/Users/mirror-pro/Documents/New project`.
- live_continuity_evidence: `/Users/mirror-pro/.mirrordna/health/continuity_console.json` reports top-level `status=degraded`, `runtime.health_status=degraded`, and `issues=["pending_recovery_actions"]`.
- native_bridge_health_evidence: `/Users/mirror-pro/.mirrordna/health/agent_session_bridge.json` is still missing.
- current_bad_news: Codex Desktop visible chat remains `UNGATED_CLIENT`; Claude visible renderer remains `PARTIAL`; governed wrapper proof covers only `/Users/mirror-pro/bin/codex exec ... --output-last-message`; continuity console is degraded; native bridge health is missing; bridge output remains oversized; bridge actor cwd and Codex graph context still point at New project paths.
- resolution_contracts_in_force: `codex-desktop-chat-visible-renderer`, `claude-code-visible-renderer`, `codex-wrapper-route-limited`, `continuity-console-degraded`, `agent-session-bridge-health-missing`, `agent-session-bridge-output-oversized`, `agent-session-bridge-warnings-current`, `agent-session-bridge-launcher-cwd-new-project`, and `codex-graph-context-stale-new-project`.
- promotion_decision: Promote this local evidence section, the compact automation summary, and the receipt only; do not patch runtime/control-plane writers or product behavior until dirty ownership and native bridge-health scope are clear.
