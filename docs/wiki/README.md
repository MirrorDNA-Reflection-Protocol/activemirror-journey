# Active Mirror Wiki

Status: repo-local source of truth for the public product lane.

Use this wiki when a thread, agent, or contributor needs to know what Active Mirror is today, where the live site comes from, and which language belongs on the user-facing surface.

## Start Here

- [Current Product Map](./current-product-map.md)
- [User Flow](./user-flow.md)
- [Language Guide](./language-guide.md)
- [Build And Deploy Runbook](./build-and-deploy.md)
- [Open Questions](./open-questions.md)
- [Build Dossiers](../dossiers/README.md)

## Obsidian Mirror

The repo wiki is canonical. To refresh the Obsidian reference copy:

```bash
npm run wiki:obsidian
```

Default target:

```text
/Users/mirror-pro/MirrorDNA-Vault/01_ACTIVE/ActiveMirror/Product Wiki
```

## What This Wiki Is For

- Keep the canonical product/deploy split easy to find.
- Preserve the current user-facing flow without re-litigating it every thread.
- Separate consumer language from enterprise/internal system language.
- Record what is verified, what is local-only, and what remains unresolved.

## What This Wiki Is Not

- Not a SWFI workspace.
- Not a vault export.
- Not a replacement for tests, canaries, or live route checks.
- Not proof that a claim is current unless the page names the check and date.

## Current Rule

Consumer Active Mirror starts with one thing:

```text
What do you want?
```

Everything else should help the user get from that sentence to a useful next move, a small output, or a saved preference they explicitly chose.
