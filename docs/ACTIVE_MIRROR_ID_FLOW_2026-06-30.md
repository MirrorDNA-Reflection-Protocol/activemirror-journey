# Active Mirror Saved Choices Flow

Status: product contract for the public front door.

## Canonical User Path

1. Homepage asks: `What do you want?`
2. User gets a useful reflection before any account, setup, or explanation.
3. If they want better defaults, they open `/id`.
4. Quick setup asks six preference questions.
5. The answers generate a browser-local saved choices object.
6. The user can keep it in this browser or download `active-mirror-choices.json`.
7. `Save and start` returns to the chat and uses the approved preferences.

## Public Language

Use:

- `Quick setup`
- `Make it yours`
- `Saved in this browser`
- `Download choices`
- `Make it feel like yours.`

Avoid on consumer surfaces:

- `MirrorSeed`
- `BrainScan`
- `Mirror ID`
- `node of 1`
- `sovereign`
- `kernel`
- `model route`
- `cryptographic receipt`
- model/provider names

## Accuracy Boundary

Quick setup is preference calibration, not psychometrics.

Allowed claim: the answers improve starting defaults.

Disallowed claim: the scan captures a true personality, identity, diagnosis, or complete self-model.

## Storage Boundary

Default storage is browser local storage through `src/lib/mirror-state.js`.

The user must explicitly choose to save. Download is portable and does not require an account.

## Build Guard

`npm run guard:front-door` must continue to pass before build/deploy.
