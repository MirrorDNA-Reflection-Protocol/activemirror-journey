# Topic Packet: AMOS Cognitive Mesh v0.1

## Topic

- Name: AMOS Cognitive Mesh v0.1
- Lane: AMOS/internal architecture plus enterprise track
- Status: open
- Owner: Active Mirror / AMOS
- Updated: 2026-07-07

## User Outcome

One sentence:

```text
Active Mirror can grow toward a governed agent control plane without turning the public app into an architecture manual.
```

## Why It Matters

- It separates consumer experience from internal execution machinery.
- It gives AMOS a build order: gateway, receipts, skill contracts, containers,
  browser guard, truth labels, vector recall, boundary skills, then agents.
- It preserves the non-negotiable law that no agent receives authority directly.

## Source Material

- Files:
  - `/Users/mirror-pro/Downloads/AMOS_Cognitive_Mesh_Build_Pack_v0.1.md`
- Links:
  - none in this packet
- Screenshots:
  - none
- Specs:
  - AMOS Cognitive Mesh Build Pack v0.1
- Commits:
  - pending
- Live routes:
  - no live route; this is architecture intake
- Unknowns:
  - exact canonical runtime repo for AMOS mesh implementation
  - whether Pixel Shield is required for v0.1 or starts as a placeholder

## Rules And Boundaries

- Consumer language: no mesh/gateway/container/receipt jargon on the first screen.
- Privacy: no durable memory write without user-approved scope.
- Model/provider names: keep public copy provider-neutral.
- Client exposure: do not name SWFI or client-specific claims here.
- Deploy path: product source first, then deploy bridge only for public assets.
- Approval required: auth, secrets, billing, durable memory, phone approval, and
  production-write surfaces.
- No-touch paths: SWFI implementation, secrets, provider keys, private vault
  exports, and unrelated dirty files.

## Tools And Gates

- Local commands:
  - `npm run guard:dossiers`
  - `npm run guard:language`
  - `npm run build:deploy`
- Browser checks:
  - run after public app changes
- Public canaries:
  - run after deploy
- Research checks:
  - required before publishing market claims
- Deploy checks:
  - deploy bridge preflight, browser smoke, production canary

## Current Proof

- Checked:
  - build pack read from Downloads
  - existing repo boundary says public app is not full AMOS control plane
- Unchecked:
  - AMOS mesh runtime implementation
  - Pixel approval workflow
  - execution containers
  - MirrorTruth/MirrorVec runtime modules
- Evidence paths:
  - `docs/dossiers/amos-cognitive-mesh.md`
  - `docs/CONTINUITY_LEDGER.md`
  - `.mirror/SOURCE_LEDGER.md`

## Bad News

- This packet makes the direction rememberable; it does not ship the mesh.
- The current app must not claim this architecture as live capability.
- SWFI remains a separated product lane.

## Next Move

- Finish the current public gateway/media hardening slice.
- Keep AMOS mesh work as an internal/enterprise build track, starting with a
  MirrorGateway skeleton only after a repo and runtime boundary are chosen.

## Update Log

### 2026-07-07

- Changed: created the topic packet and linked it to the AMOS Cognitive Mesh
  dossier.
- Files touched:
  - `docs/topic-packets/amos-cognitive-mesh-v0-1.md`
  - `docs/dossiers/amos-cognitive-mesh.md`
- Tools/gates used:
  - pending
- Deploy status:
  - not deployed; documentation/intake only
- Public routes checked:
  - none
- Remaining risk:
  - AMOS runtime implementation still needs a separate repo or clearly bounded
    internal track.
