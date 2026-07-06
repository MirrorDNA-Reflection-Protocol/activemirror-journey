# Dossier: Memory Skill Layer

Status: intake
Updated: 2026-07-04
Owner: Active Mirror / AMOS

## Objective

Treat memory as an explicit, auditable action space instead of a hidden database.

## User Outcome

The mirror should search before writing, avoid duplicate memory, ask before
saving, and let the user keep or reject what matters.

## Scope

- Kernel module: `mirror_kernel/memory_skill_layer.py`
- Product repo docs/source ledger only.

## Boundaries

- Not in scope: automatic personal memory, personality training, or training on
  user content.
- Requires approval: any durable memory write, promotion, forget action, or
  training-candidate handoff.
- Must not expose: private vault content, duplicate unchecked memory, or
  cross-project memory.

## Required Inputs

- AutoMem arXiv `2607.01224`
- AutoMem project page
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/MEMORY_SKILL_LAYER.md`

## Implementation Surface

- Public app: docs/source ledger only.
- AMOS kernel: explicit memory action trace and retrieval-before-write tests.
- Future consumer use: only with visible save/reject/edit controls.

## Checks

- Kernel: `python3 -m pytest tests/test_kernel.py`
- Product: `npm run guard:dossiers`
- Copy review: no claim that Active Mirror silently learns from the user.

## Challenge Contract

- Acceptance condition: memory operations are explicit, consent-bound, and
  project-scoped.
- Failure condition: blind append, cross-project memory, or memory write without
  consent.
- Recovery path: quarantine the proposed memory action.

## Bad News / Limits

- AutoMem benchmarks are games, not proof of personal identity memory.
- The consumer app does not yet implement the full memory action trace.

## Handoff

Use this to design future memory behavior. Keep current public copy simple:
nothing is saved unless the user chooses.

## Safe Claim

Memory actions can be made visible, traceable, and consent-bound.

## Product Language

- Nothing is saved unless you choose.
- Search before save.
- Keep what helps. Drop the rest.

## Blocked Language

- automatic personal memory
- personality training
- always learning from you
- memory writes without consent

## Promotion Boundary

The current app has browser-local setup and optional user actions. Do not claim
full governed memory skill until the runtime implements the action trace.
