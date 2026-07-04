# Dossier: Model Challenge Contract

Status: active
Updated: 2026-07-04
Owner: Active Mirror

## Objective

Give agents and model workers explicit task challenges with enforceable
consequences when they fail, without pretending the model itself can be punished.

## User Outcome

Paul gets fewer vague completions. The system can say whether a model accepted a
challenge, what it had to prove, what failed, and what happens next.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: not applicable unless a challenge is tied to a deploy task
- Local route: not applicable
- Files likely to change:
  - `docs/dossiers/`
  - `.mirror/`
  - `scripts/`
  - task-specific source files named by the active dossier

## Boundaries

- Not in scope: emotional punishment language, fake authority over a base model,
  hidden memory writes, provider policy bypass, or claims that a model can be
  made perfect by prompt alone.
- Requires approval: changing provider routing, secrets, durable memory, billing,
  auth, or deploy automation.
- Must not expose: provider keys, private vault content, client-confidential
  material, or unsafe hidden chain-of-thought.
- Must stay internal: scoring details that would teach a model how to fake the
  gate instead of passing the work.

## Required Inputs

- The active task dossier.
- `.mirror/TASK_CONTRACT.yaml`
- `.mirror/AGENT_POLICY.yaml`
- Any task-specific source files, checks, and live receipts.

## Implementation Surface

- UI: optional. Consumer-facing language should say what happens next, not
  describe model discipline.
- Runtime: model outputs remain advisory until checked by guards, receipts, or
  human approval.
- Model or gateway: challenge acceptance can be logged as task metadata, but
  enforcement happens in downstream gates.
- Local storage: no hidden memory promotion.
- Generated artifacts: only promote artifacts that pass the task checks.

## Checks

- Local guards:
  - `npm run guard:dossiers`
  - `npm run guard:challenge`
  - task-specific guards from the active dossier
- Browser QA: required only for user-facing UI changes.
- Deploy checks: required only for live promotion.
- Receipts:
  - accepted challenge
  - checked scope
  - failed checks
  - blocked promotion if failed
  - recovery path

## Challenge Contract

- Challenge offered: prove the work against named files, routes, checks, and
  receipts before claiming success. Artifact outputs now carry
  `active_mirror.artifact_challenge.v1` packets.
- Acceptance condition: the model states checked scope, unchecked scope, and the
  exact gates it will satisfy.
- Failure condition: hallucinated evidence, unstated scope, skipped checks,
  internal-language leakage, unsafe data exposure, or a false done/ready claim.
- Consequence if failed: the output is downgraded to advisory, no deploy or
  memory promotion occurs, and the failure is written into the handoff.
- Recovery path: narrow the scope, rerun checks, repair the failing surface, and
  only then re-offer the challenge.

## Bad News / Limits

- This does not make a model obedient by force. It makes promotion conditional.
- Prompt rules are not enforcement. The effective control is the gate that can
  block, downgrade, or refuse promotion.
- Some qualities, such as tone and non-sycophancy, still need evaluator judgment
  and human review.

## Handoff

Use this dossier when a task needs model accountability. Say "challenge accepted"
only when the task has clear gates. If the gates are missing, the next step is to
write the challenge, not to claim readiness.
