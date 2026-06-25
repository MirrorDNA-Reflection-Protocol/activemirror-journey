# Active Mirror Journey

Canonical product/front-door repo for Active Mirror.

This repo owns the March-gold public experience: the dark glass `Intelligence Reflected` homepage, BrainScan/Mirror Seed onboarding, and the working browser reflection chat.

## Current Truth

- Canonical product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Local preview: `http://127.0.0.1:8976/`
- Reflection route: `/mirror` and `/app`
- BrainScan route: `/start`
- Workspace/control route: `/workspace`
- Live/gateway bridge repo: `/Users/mirror-pro/repos/active-mirror-site`
- Prototype/reference repo: `/Users/mirror-pro/repos/activemirror-genui`

## Commands

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 8976 --strictPort
npm run build
```

## Product Lock

Lead with the user action, not the machinery:

> Start with one real thing. Get the clearer question, the next move, and control over what becomes memory.

Do not lead consumer surfaces with provider names, model menus, receipt internals, route labels, or governance jargon. Keep that material in trust/system pages.

## Deployment Note

This repo is the product source. The currently live public deployment path may still pass through `active-mirror-site` and GitHub Pages/Cloudflare. Confirm the deploy source before publishing.
