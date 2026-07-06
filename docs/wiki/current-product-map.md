# Current Product Map

Last checked: 2026-07-04.

## Canonical Repos

| Role | Path | Notes |
|---|---|---|
| Product source | `/Users/mirror-pro/repos/activemirror-journey` | Owns the React app users touch. |
| Live deploy and gateway | `/Users/mirror-pro/repos/active-mirror-site` | Owns GitHub Pages bundle and Worker/gateway history. |
| Identity compatibility | `/Users/mirror-pro/repos/active-mirror-identity` | Compatibility lane for `id.activemirror.ai`. Do not rebuild it as a separate consumer product. |
| Reference/prototype | `/Users/mirror-pro/repos/activemirror-genui` | Reference only unless deliberately promoted. |

## Live Public Routes

| Route | Purpose |
|---|---|
| `/app/` | Main chat-first Active Mirror surface. |
| `/app/id/` | Four-tap setup and downloadable Active Mirror ID file. |
| `/app/start/` | Redirects to `/app/id/`. |
| `/app/mirrorseed/`, `/app/brainscan/`, `/app/scan/` | Compatibility redirects to `/app/id/`. |
| `/app/privacy/`, `/app/terms/` | Public privacy and terms pages. |
| `/enterprise/` | Enterprise-oriented proof and governance page. |

## Current Product Shape

Active Mirror is a chat-first reflective AI front door.

The consumer product should feel like:

- one obvious place to begin;
- short reflective replies;
- useful next moves;
- optional setup after the user asks for it;
- saved preferences only when the user chooses;
- no model names or internal architecture on the first-use surface.

## Current Build Chain

```text
activemirror-journey
  npm run build:deploy
  dist/
  copy into active-mirror-site/public/app/
active-mirror-site
  npm run build
  npm run copy:audit
  git push
  GitHub Pages deploy
  npm run canary:prod
```

## Do Not Conflate

- Active Mirror public site is not SWFI.
- The product source repo is not the deploy repo.
- Browser-local setup is not a full memory sync layer.
- Downloadable Active Mirror ID is not proof of a complete identity model.
- Enterprise proof language does not belong on the consumer first screen.
- AMOS proof-layer architecture is intake material unless a specific runtime
  contract and guard prove it is implemented in the consumer app.
- Decision Reason Mapper, Context Calculus, Coordination Layer, Memory Skill
  Layer, Evolution Control Plane, and Synthetic Continuity are AMOS intake
  modules unless a specific consumer feature, consent control, and guard prove
  they are implemented in the public app.
