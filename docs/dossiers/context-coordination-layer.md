# Dossier: Context And Coordination Layer

Status: intake
Updated: 2026-07-04
Owner: Active Mirror / AMOS

## Objective

Use context-change and coordination metaphors as internal instrumentation, not
consumer-facing jargon.

## User Outcome

The mirror can respond to what is changing now, what has accumulated, what
should stay stable, and which boundary is active.

## Scope

- Kernel modules:
  - `mirror_kernel/context_calculus.py`
  - `mirror_kernel/coordination_layer.py`
- Product repo docs/source ledger only.

## Boundaries

- Not in scope: biological cognition claims, brain-like AI claims, clinical
  state inference, or consumer-visible Markov-blanket language.
- Requires approval: any runtime use that changes memory, model routing, or
  egress behavior.
- Must not expose: internal rhythm bands or context scores on the first screen.

## Required Inputs

- Frontiers DOI `10.3389/fnins.2026.1836602`
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/CONTEXT_CALCULUS_ENGINE.md`
- `/Users/mirror-pro/Documents/activemirroros-trust-kernel/docs/COORDINATION_LAYER.md`

## Implementation Surface

- Public app: none beyond source-ledger intake.
- AMOS kernel: context snapshot and coordination-state helpers.
- Future runtime: use only as an internal router/gate.

## Checks

- Kernel: `python3 -m pytest tests/test_kernel.py`
- Product: `npm run guard:dossiers`
- Copy review: no math/neuroscience jargon on consumer surfaces.

## Challenge Contract

- Acceptance condition: the module measures bounded state changes and boundary
  status without brain or consciousness claims.
- Failure condition: copy says the system has cognition, consciousness, or
  biological-like agency.
- Recovery path: move the language to internal docs and expose only simple
  user-facing behavior.

## Bad News / Limits

- The neuroscience source is theory-grade, not settled empirical proof.
- Context Calculus and Coordination Layer are internal instrumentation, not
  current consumer features.

## Handoff

Use this to make routing and memory access more disciplined. Do not make users
read the metaphor.

## Safe Claim

Context is dynamic. AMOS can measure bounded changes in state and coordinate
which memory/tool/action surface is allowed to speak now.

## Product Language

- It keeps up with what changed.
- It uses the right context at the right time.
- It asks before using private context.

## Blocked Language

- context calculus on the homepage
- Markov blanket on the consumer app
- brain-like AI
- consciousness layer

## Promotion Boundary

Keep the language internal unless the user asks how Active Mirror works.
