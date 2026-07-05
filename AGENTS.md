# Active Mirror Journey Agent Guard

## Active Lane

This is the canonical product/front-door source for the Active Mirror public experience.

- Lane: Active Mirror only.
- Canonical product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Product role: March-gold visual front door, BrainScan/Mirror Seed onboarding, and the browser reflection experience.
- Current local preview: `http://127.0.0.1:8976/`

## Repo Boundary

Do not start new product/front-door work in:

- `/Users/mirror-pro/repos/activemirror-genui`
- `/Users/mirror-pro/repos/active-mirror-site`
- `/Users/mirror-pro/Documents/Active Mirror/commercial-site`
- `/private/tmp/am-march-journey`

Use those only as references or migration sources.

## Mirror Control Folder

Before non-trivial edits, read `.mirror/TASK_CONTRACT.yaml`, `.mirror/AGENT_POLICY.yaml`, and `.mirror/STATUS.md`.

Also read `docs/CONTINUITY_LEDGER.md` before changing the site, deploy bridge, model route, public copy, or user flow. It is the compact working state: active lane, repos, rules, gates, recent commits, live proof, known limits, and next safe move.

If a new topic is likely to span more than one session, create a small packet from `docs/TOPIC_PACKET_TEMPLATE.md`, save it under `docs/topic-packets/`, and link it from `docs/CONTINUITY_LEDGER.md`. Do not rely on chat memory alone. `npm run mirror:context` automatically includes those packets.

Use `.mirror/DECISIONS.md` for durable decisions, `.mirror/RISKS.md` for active risks, and `.mirror/PLAN.md` for the next bounded slice. Keep SWFI/client work out of this repo.

## Live/Deploy Boundary

`/Users/mirror-pro/repos/active-mirror-site` still contains live deployment and Worker/gateway history. Product UI changes should be built and verified here first, then intentionally packaged into the live/deploy repo if needed.

When packaging for live deploy, copy only `dist/index.html`, `dist/404.html`,
and `dist/assets/` into `/Users/mirror-pro/repos/active-mirror-site/public/app`.
Do not broad-copy route directories from `public/`; they can shadow React app
routes and show stale pages.

## Product Rule

The first screen should stay simple and user-led:

- one obvious question: `What do you want?`;
- one setup doorway: `Start here`;
- one import doorway: `Already have one?`;
- setup copy stays short: `Set it up.` plus four taps;
- BrainScan/Mirror Seed remain compatibility/internal language, not consumer-first copy;
- ecosystem/proof routes stay secondary;
- no model names or internal route language in consumer copy.

Keep SWFI and other client work out of this repo.
