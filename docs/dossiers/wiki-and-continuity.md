# Dossier: Wiki And Continuity

Status: active
Updated: 2026-07-04
Owner: Active Mirror

## Objective

Keep Active Mirror product memory in source-controlled files so future agents do
not rebuild the same context from long chats.

## User Outcome

Paul can ask for the next slice and the agent can start from current product
truth: repo roles, user flow, language rules, checks, deploy steps, and open
questions.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Local route: not applicable
- Live route: not applicable
- Files likely to change:
  - `docs/wiki/`
  - `docs/dossiers/`
  - `.mirror/CONTEXT_PACK.yaml`
  - `.mirror/PLAN.md`
  - `.mirror/STATUS.md`
  - `scripts/sync_wiki_to_obsidian.mjs`
  - `scripts/dossier_guard.mjs`
  - `package.json`

## Boundaries

- Not in scope: private vault export, SWFI, provider secrets, live UI deploy,
  generated site copy unless a product dossier names it.
- Requires approval: durable memory promotion outside repo docs, destructive
  cleanup, provider key changes.
- Must not expose: keys, raw vault content, client-confidential material.
- Must stay internal: incomplete claims, stale live-state assumptions, old repo
  confusion.

## Required Inputs

- `docs/wiki/README.md`
- `docs/wiki/current-product-map.md`
- `docs/wiki/build-and-deploy.md`
- `docs/wiki/open-questions.md`
- `docs/dossiers/README.md`
- `.mirror/CONTEXT_PACK.yaml`
- Latest `git status -sb` in both product and deploy repos when relevant.

## Implementation Surface

- UI: none unless a separate product dossier says so.
- Runtime: none.
- Model or gateway: none.
- Local storage: Obsidian reference copy may be refreshed with
  `npm run wiki:obsidian`.
- Generated artifacts: repo-local markdown and Obsidian reference notes.

## Checks

- Local guards:
  - `npm run guard:dossiers`
  - `npm run mirror:context`
  - `npm run wiki:obsidian:dry`
- Browser QA: not required for docs-only changes.
- Deploy checks: not required unless public UI or deploy repo changes.
- Receipts:
  - context-pack output
  - Obsidian sync receipt when refreshed
  - changed file list

## Challenge Contract

- Challenge offered: make the next agent able to continue from files instead of
  asking Paul to reconstruct months of context.
- Acceptance condition: every new dossier names objective, user outcome, scope,
  boundaries, required inputs, checks, bad news, and handoff.
- Failure condition: the packet is too vague to act from, omits boundaries, or
  turns private/vault/client material into broad repo context.
- Consequence if failed: do not treat the dossier as canonical, do not promote it
  into the context pack, and fix or replace it before using it for task work.
- Recovery path: run `npm run guard:dossiers`, add missing sections, and rerun
  `npm run mirror:context`.

## Bad News / Limits

- The Obsidian copy is generated reference material, not the source of truth.
- The GitHub Wiki surface is not currently treated as canonical.
- These dossiers reduce drift, but they do not replace live verification.

## Handoff

If the next task is unclear, start by selecting or creating a dossier. If no
dossier fits, create one before editing product code.
