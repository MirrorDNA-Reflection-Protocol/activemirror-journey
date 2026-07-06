# Dossier: Decision Reason Mapper

Status: intake
Updated: 2026-07-04
Owner: Active Mirror / AMOS

## Objective

Absorb decision-reason research into AMOS without turning Active Mirror into a
personality profiler.

## User Outcome

The mirror can notice which reason is active in a specific situation and respond
with a better next move.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Kernel repo: `/Users/mirror-pro/Documents/activemirroros-trust-kernel`
- Kernel files:
  - `mirror_kernel/decision_reason_mapper.py`
  - `docs/DECISION_REASON_MAPPER.md`

## Boundaries

- Not in scope: personality profiling, hidden motive inference, clinical
  diagnosis, or consumer-visible AMOS jargon.
- Requires approval: promoting decision traces into durable user memory.
- Must not expose: private decision history, raw vault content, or internal
  contradiction labels on the first-use screen.

## Required Inputs

- PNAS DOI `10.1073/pnas.2526798123`
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/DECISION_REASON_MAPPER.md`
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/mirror_kernel/decision_reason_mapper.py`

## Implementation Surface

- Public app: docs/source ledger only for now.
- AMOS kernel: stated-reason trace schema and tests.
- Future consumer use: only after consent-safe trace storage and user editing
  controls exist.

## Checks

- Kernel: `python3 -m pytest tests/test_kernel.py`
- Product: `npm run guard:dossiers`
- Copy review: no hidden-motive or personality-profile claims on consumer pages.

## Challenge Contract

- Acceptance condition: stated reasons and visible choices are mapped without
  claiming mind reading.
- Failure condition: copy or code implies hidden motives, stable personality
  scoring, or clinical profiling.
- Recovery path: downgrade to intake and keep the module internal.

## Bad News / Limits

- The paper supports classification of articulated verbal reasons, not hidden
  motive detection.
- Decision memory is not implemented as a consumer feature yet.

## Handoff

Use this to make Active Mirror more context-sensitive. Do not use it to label a
person.

## Safe Claim

Active Mirror can map stated reasons, visible options, context structure, and
contradiction patterns. It does not infer hidden motives.

## Product Language

- Decision memory, not personality profiling.
- Learns how reasoning changes by context.

## Blocked Language

- reads hidden motives
- knows who you really are
- personality profile
- mind reading

## Promotion Boundary

This is AMOS intake. Do not claim the consumer app has full decision memory
until consent-safe traces, editing controls, and deletion controls are live.
