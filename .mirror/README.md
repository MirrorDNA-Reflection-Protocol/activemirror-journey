# Active Mirror Control Folder

This folder is the repo-local control surface for agent work on the Active Mirror product/front-door source.

Active repo: `/Users/mirror-pro/repos/activemirror-journey`

Live deploy bridge: `/Users/mirror-pro/repos/active-mirror-site/public/app`

Core rule:

> Build the user-facing reflection experience here. Package to the deploy repo only after local guards and browser checks pass.

## Scope

Allowed here:

- Consumer reflection front door.
- BrainScan / MirrorSeed / Reflection flow.
- Browser-local state, preferences, and onboarding.
- Product copy, UI, visual polish, and usability guards.
- Repo-local contracts, plans, decisions, risks, evals, screenshots, and memory proposals.

Not allowed here:

- SWFI or client-specific implementation.
- Secret storage.
- Production billing config.
- Raw private vault exports.
- New consumer product work in legacy repos.

## Operating Order

1. Read `AGENTS.md`.
2. Read `.mirror/TASK_CONTRACT.yaml`.
3. Update `.mirror/STATUS.md` when the visible product state changes.
4. Keep `.mirror/DECISIONS.md` for durable decisions only.
5. Keep `.mirror/RISKS.md` honest and current.
6. Build and test locally.
7. Package to `active-mirror-site/public/app` only when deploy is intended.

## AMOS Contract Seeds

The public app is still the simple front door. AMOS/control-plane work starts
with small contracts:

- `.mirror/schemas/scd_state.schema.json`
- `.mirror/schemas/workspace_boundary.schema.json`
- `.mirror/schemas/consent_ladder.schema.json`
- `.mirror/schemas/agent_contract.schema.json`
- `.mirror/schemas/action_request.schema.json`
- `.mirror/schemas/memory_proposal_request.schema.json`

These schemas do not make a runtime live. They define what a future runtime must
validate before tools, memory, agents, or external actions are allowed.

Run the local contract gate with:

```bash
npm run guard:amos-contracts
```

The default examples live in `.mirror/CONTRACTS/amos/`. The gate returns
`allow`, `approval_required`, or `block` and is now part of `npm run prebuild`.

## Approval Request Gate

Consequential actions do not run directly. The local approval request writer
first runs the AMOS contract gate, then writes a pending approval request only
when the contract returns `approval_required`.

```bash
npm run guard:approval-request
```

Manual dry-run:

```bash
node scripts/amos_approval_request_gate.mjs --dry-run
```

Manual writes go to `.mirror/APPROVAL_REQUESTS/`. Do not create real approval
files for fake actions; they are for actual risky work that needs review.

## Memory Proposal Gate

Memory work starts as a proposal, not a hidden save. The local proposal writer
first runs the AMOS contract gate, then writes a YAML proposal only when the
contract returns `allow`.

```bash
npm run guard:memory-proposal
```

Manual dry-run:

```bash
node scripts/amos_memory_proposal_gate.mjs --dry-run
```

Manual write:

```bash
node scripts/amos_memory_proposal_gate.mjs --write
```

Written files go to `.mirror/MEMORY_UPDATE_PROPOSALS/` and still require human
approval before becoming durable memory.
