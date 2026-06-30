# Active Mirror ID Flow

Status: product contract for the public front door.

## Canonical User Path

1. Homepage asks: `What do you want?`
2. User gets a useful reflection before any account, setup, or explanation.
3. If they want better defaults, they open `/id`.
4. BrainScan asks six preference questions.
5. The answers generate a browser-local Mirror ID object.
6. The user can keep it in this browser or download `active-mirror-id.json`.
7. `Save and reflect` returns to the chat and uses the approved preferences.

## Public Language

Use:

- `Mirror ID`
- `Make it yours`
- `Saved in this browser`
- `Download Mirror ID`
- `Six quick choices. Better answers.`

Avoid on consumer surfaces:

- `MirrorSeed`
- `node of 1`
- `sovereign`
- `kernel`
- `model route`
- `cryptographic receipt`
- model/provider names

## Accuracy Boundary

BrainScan is preference calibration, not psychometrics.

Allowed claim: the answers improve starting defaults.

Disallowed claim: the scan captures a true personality, identity, diagnosis, or complete self-model.

## Storage Boundary

Default storage is browser local storage through `src/lib/mirror-state.js`.

The user must explicitly choose to save. Download is portable and does not require an account.

## Build Guard

`npm run guard:front-door` must continue to pass before build/deploy.
