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

## Live/Deploy Boundary

`/Users/mirror-pro/repos/active-mirror-site` still contains live deployment and Worker/gateway history. Product UI changes should be built and verified here first, then intentionally packaged into the live/deploy repo if needed.

## Product Rule

The first screen should look and feel like the March-gold Active Mirror surface:

- one striking dark glass object;
- one obvious primary action: `Start Reflection`;
- BrainScan/Mirror Seed available without becoming a lecture;
- ecosystem/proof routes present but secondary;
- no model names or internal route language in consumer copy.

Keep SWFI and other client work out of this repo.
