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

