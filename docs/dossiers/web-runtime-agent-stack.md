# Dossier: Web Runtime Agent Stack

Status: intake
Updated: 2026-07-04
Owner: Active Mirror

## Objective

Define where browser-agent tools fit in Active Mirror without polluting the
consumer chat front door or making the public app feel like an automation lab.

## User Outcome

Users keep a simple chat experience. Teams and power users can later get a
controlled web runtime that can operate inside owned apps, run repeatable browser
workflows, and verify UI behavior before demos or releases.

## Scope

- Consumer app: keep as chat-first reflection plus useful artifacts.
- Owned web apps: evaluate Page Agent as an embedded in-page control layer.
- Repeatable browser flows: evaluate Stagehand.
- External sites: evaluate browser-use and Skyvern by task type.
- QA: evaluate symbolic GUI testing patterns such as WebTestPilot.
- Skill/protocol layer: keep WebMCP/WebSkills as watchlist until directly
  verified from primary docs.

## Boundaries

- Do not add these tools to the public homepage until a concrete user flow needs
  them.
- Do not let an in-page agent bypass server-side permissions, auth, consent,
  or destructive-action approval.
- Do not expose model names, tool-stack names, or internal runtime language in
  consumer copy.
- Do not use third-party page-control tools on client/confidential systems
  without a scoped security review.

## Required Inputs

- Page Agent upstream README: `https://github.com/alibaba/page-agent`
- Stagehand upstream README: `https://github.com/browserbase/stagehand`
- browser-use upstream README: `https://github.com/browser-use/browser-use`
- Skyvern upstream README: `https://github.com/skyvern-ai/skyvern`
- WebTestPilot arXiv record: `https://arxiv.org/abs/2602.11724`
- Current Active Mirror product contract:
  - `AGENTS.md`
  - `.mirror/TASK_CONTRACT.yaml`
  - `docs/dossiers/active-mirror-front-door.md`

## Implementation Surface

- Active Mirror consumer app:
  - no immediate implementation;
  - keep chat primary;
  - artifact/canvas appears only when useful.
- Enterprise/runtime app:
  - Page Agent for apps we own and can instrument safely;
  - Stagehand for production browser workflows that need code plus AI;
  - browser-use for outside-the-page automation where setup can be controlled;
  - Skyvern for visual-heavy or messy third-party portals;
  - symbolic GUI testing for QA receipts and pre/post condition checks.
- Trust layer:
  - every page action needs permission class, precondition, action, result,
    rollback path, and receipt.

## Checks

- Before implementation:
  - verify current upstream licenses and APIs from primary docs;
  - write a one-page threat model for any in-page agent;
  - prove no prompt text, DOM text, or secrets are sent without consent;
  - run mobile and desktop smoke for any UI surface touched.
- Existing repo checks:
  - `npm run guard:front-door`
  - `npm run guard:friction`
  - `npm run guard:redaction`
  - `npm run truth`
  - `npm run guard:dossiers`

## Challenge Contract

- Challenge offered: keep browser-agent power behind a governed runtime surface,
  not the first-use consumer page.
- Acceptance condition: a prototype can operate one owned demo page, log its
  proposed action, ask before any sensitive action, and produce a receipt.
- Failure condition: the agent acts silently, ships internal language to users,
  sends raw DOM/private text unnecessarily, or makes the homepage more complex.
- Consequence if failed: stop integration and keep the feature in docs only.
- Recovery path: reduce to one owned-page demo with mocked actions and a visible
  approval checkpoint.

## Bad News / Limits

- Page Agent is strongest for apps we own; it is not a general cross-site
  browser agent by itself.
- Stagehand, browser-use, and Skyvern can add real power but also add attack
  surface, cost, and operational complexity.
- WebMCP/WebSkills was not verified from the attempted raw GitHub paths in this
  intake, so it remains a watchlist item, not an adopted dependency.
- None of these replace Active Mirror's identity, consent, memory, or receipt
  layer. They are action surfaces.

## Handoff

Next safe slice: build a local, mocked "owned page" Page Agent lab outside the
consumer homepage. The lab should prove one action proposal, one approval gate,
one blocked action, and one receipt. Do not wire it to SWFI, LexEdge, or the live
public app until that small loop is verified.

