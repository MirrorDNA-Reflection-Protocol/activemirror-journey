# Dossier: Evolution Control Plane

Status: intake
Updated: 2026-07-04
Owner: Active Mirror / AMOS

## Objective

Absorb self-evolving-agent research into a governed AMOS control plane, not a
self-modifying agent.

## User Outcome

The system can improve from real work without silently changing identity,
memory, prompts, tools, or model behavior.

## Scope

- Kernel repo: `/Users/mirror-pro/Documents/activemirroros-trust-kernel`
- Product repo source ledger and docs only.

## Boundaries

- Not in scope: online RL, automatic model training, autonomous self-modifying
  agents, or consumer-visible evolution claims.
- Requires approval: memory writes, prompt changes, skill promotion, tool
  contract changes, dataset candidates, and training handoff.
- Must not expose: training data, private traces, or claims that the model
  updates itself.

## Required Inputs

- arXiv `2607.01120`
- AReaL arXiv `2505.24298`
- AReaL GitHub project
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/EVOLUTION_CONTROL_PLANE.md`

## Implementation Surface

- Public app: none beyond source-ledger intake.
- AMOS kernel: evolution event schema, update policy, and weight-update blocks.
- Enterprise future: replay, approval, rollback, and attestation receipts.

## Checks

- Kernel: `python3 -m pytest tests/test_kernel.py`
- Kernel: `make preflight`
- Product: `npm run guard:dossiers`

## Challenge Contract

- Acceptance condition: updates become proposals with replay/approval rules.
- Failure condition: any automatic weight update, silent personality drift, or
  memory write without consent.
- Recovery path: block the update and record a rejected evolution event.

## Bad News / Limits

- Research validates the need for the control-plane pattern; it does not prove
  Active Mirror has autonomous safe self-evolution today.
- Weight updates remain blocked.

## Handoff

Use this as AMOS governance infrastructure. Do not market it as consumer magic.

## Safe Claim

Safe self-evolution starts with governed memory, replay, approval, rollback, and
attestation. Weight updates are blocked by default.

## Product Language

- Gets better from accepted work.
- Keeps changes reviewable.
- No silent personality drift.

## Blocked Language

- self-aware
- autonomous self-modifying AI
- automatically trains itself on you
- weight updates without approval

## Promotion Boundary

Do not expose this as consumer copy. It belongs in enterprise/AMOS proof until a
specific public feature exists.
