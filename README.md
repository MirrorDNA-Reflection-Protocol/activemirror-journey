# Active Mirror Journey

Canonical product/front-door repo for Active Mirror.

This repo owns the current public product experience: the simple reflection front door, BrainScan / MirrorSeed onboarding, and the working browser reflection chat.

## Current Truth

- Canonical product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Local preview: `http://127.0.0.1:8976/`
- Reflection route: `/` (`/mirror` redirects here)
- Public homepage route: `/`
- BrainScan / MirrorSeed route: `/id`, with aliases `/start`, `/mirrorseed`, `/brainscan`, and `/scan`
- Live/gateway bridge repo: `/Users/mirror-pro/repos/active-mirror-site`
- MirrorSeed compatibility repo: `/Users/mirror-pro/repos/active-mirror-identity`
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

## MirrorSeed Lock

The canonical public sequence is:

```text
BrainScan / MirrorSeed / Reflection
```

Do not rebuild `id.activemirror.ai` as a separate consumer product. That domain
should route into this app's `/app/id/` deployment.

## Deployment Note

This repo is the product source and does not deploy directly. It should not
contain a root `CNAME`, `public/CNAME`, or a GitHub Pages publish action.
`public/` is intentionally limited to static assets used by the React app;
legacy pages belong in git history or reference packs, not the Vite public
folder.

The live public deployment path is:

```text
/Users/mirror-pro/repos/activemirror-journey
  -> npm run build:deploy
  -> /Users/mirror-pro/repos/active-mirror-site/public/app
  -> active-mirror-site GitHub Pages + gateway.activemirror.ai
```
