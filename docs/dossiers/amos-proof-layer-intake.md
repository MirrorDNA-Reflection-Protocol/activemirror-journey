# Dossier: AMOS Proof Layer Intake

Status: intake
Updated: 2026-07-04
Owner: Active Mirror / AMOS

## Objective

Capture what is useful from the AMOS Architecture Implementation Pack and the
Euclid Reflective Build Pack without mixing internal AMOS machinery into the
consumer Active Mirror front door.

## User Outcome

The product can become more trustworthy over time because outputs, claims, and
actions can gain public proof traces, consent state, and attestations without
asking the user to understand AMOS architecture.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Source packs:
  - `/Users/mirror-pro/Downloads/AMOS_Architecture_Implementation_Pack.docx`
  - `/Users/mirror-pro/Downloads/amos_euclid_reflective_build_pack/`
- Files likely to change:
  - `src/lib/challenge-packet.js`
  - `docs/dossiers/`
  - `docs/wiki/language-guide.md`
  - `.mirror/SOURCE_LEDGER.md`

## Boundaries

- Not in scope: importing the AMOS Python runtime into the consumer app,
  claiming consciousness, exposing chain-of-thought, or mixing SWFI/client work.
- Requires approval: new runtime dependency, browser model downloads,
  persistent vault writes, provider routing changes, deploy automation changes.
- Must not expose: hidden chain-of-thought, raw private vault content, secrets,
  client material, or AMOS internal labels on consumer screens.
- Must stay internal: Euclid Trace, Reflective Workspace, MirrorGraph,
  GlyphTrail, MirrorHarness, MirrorWorkers, MirrorBoard, MirrorSubstrate.

## Required Inputs

- DOCX doctrine:
  - identity is not model weights
  - conversation history is not state
  - memory is compiled into claims, decisions, artifacts, source links, and graph
    edges
  - reasoning is not permission
  - artifact lineage should be visible
  - model changes but harness, memory, consent, trace, and user vault stay
    portable
- Euclid pack:
  - `README.md`
  - `docs/01_EUCLID_TRACE_PROTOCOL.md`
  - `docs/02_REFLECTIVE_WORKSPACE_PROTOCOL.md`
  - `docs/03_CONSCIOUSNESS_BOUNDARY_DOCTRINE.md`
  - `docs/06_14_DAY_ROADMAP.md`
  - `MANIFEST.json`

## Implementation Surface

- UI: keep consumer UI normal. The user should see helpful statuses like
  `Ready`, `Draft`, `Check first`, or `Needs edit`, not internal proof language.
- Runtime: challenge packets are the current thin proof boundary. Future Euclid
  traces can be attached to high-risk claims and artifacts.
- Model or gateway: models remain helpers. Active Mirror owns the visible
  challenge, status, and promotion rules.
- Local storage: no vault writes from this intake.
- Generated artifacts: attach status and recovery path before any artifact is
  treated as usable.

## Checks

- Local guards:
  - `npm run guard:challenge`
  - `npm run guard:dossiers`
  - `npm run guard:front-door`
  - `npm run guard:redaction`
  - `npm run truth`
- Browser QA:
  - no AMOS internal labels on consumer first screen
  - artifact status remains readable and non-scary
- Deploy checks:
  - required only if user-facing source is packaged to deploy repo
- Receipts:
  - source pack paths and manifest hash references
  - local guard outputs
  - changed file list

## Challenge Contract

- Challenge offered: use AMOS proof architecture to harden Active Mirror without
  making the product confusing or overclaiming consciousness.
- Acceptance condition: only safe doctrines and proof boundaries are promoted;
  internal AMOS labels stay out of consumer copy.
- Failure condition: consumer copy says or implies consciousness, hidden
  reasoning, completed vault ownership, or formal proof where only attestation
  exists.
- Consequence if failed: block deploy, move the claim to source-ledger review,
  and downgrade the output to advisory.
- Recovery path: rewrite as user-facing value, add explicit limits, or keep it in
  AMOS docs only.

## Bad News / Limits

- The AMOS packs are intake material, not proof that the consumer app implements
  the full architecture.
- Euclid Trace is a public proof scaffold, not hidden chain-of-thought and not a
  truth guarantee.
- Reflective Workspace is consciousness-inspired, not evidence of consciousness.
- The Mac Mini / phone routing model belongs to AMOS control-plane planning, not
  the public homepage.

## Handoff

Use the AMOS packs to strengthen proof, challenge, consent, and attestation
inside the product. Do not use AMOS terms as homepage copy. The consumer should
feel the benefit, not read the architecture.

