# Build And Deploy Runbook

Status: practical runbook for the current two-repo deployment.

## Product Source Checks

Run in `/Users/mirror-pro/repos/activemirror-journey`:

```bash
npm run build:deploy
```

This runs:

- canonical source guard;
- mirror control guard;
- front-door guard;
- friction guard;
- redaction guard;
- truth gate;
- Vite production build with `/app/` base.

Known non-blocking warning as of 2026-07-04:

```text
Browserslist: browsers data (caniuse-lite) is 7 months old.
```

## Package To Deploy Repo

Run in `/Users/mirror-pro/repos/active-mirror-site` after source build:

```bash
mkdir -p public/app
rm -rf public/app/assets
cp -R /Users/mirror-pro/repos/activemirror-journey/dist/assets public/app/assets
cp /Users/mirror-pro/repos/activemirror-journey/dist/index.html public/app/index.html
cp /Users/mirror-pro/repos/activemirror-journey/dist/404.html public/app/404.html
```

Only copy the built app shell and assets. Do not broad-copy old route directories into `public/app`.

## Deploy Repo Checks

Run in `/Users/mirror-pro/repos/active-mirror-site`:

```bash
npm run build
npm run copy:audit
```

After commit and push, wait for the GitHub Pages deploy workflow, then run:

```bash
npm run canary:prod
```

## Browser QA

Minimum browser QA for front-door/setup changes:

- mobile `/app/`;
- mobile `/app/id/`;
- desktop `/app/`;
- four-tap setup path;
- `Start chat` handoff;
- no horizontal overflow;
- no old/internal consumer copy.

## Current Verified Slice

On 2026-07-04:

- `/app/id/` first screen rendered `Set it up.` and `What are you here for?`.
- Four-tap setup saved browser-local state.
- Result screen rendered plain preference rows.
- Live mobile check had no console errors and no overflow.
- Production canary passed `14/14`.
