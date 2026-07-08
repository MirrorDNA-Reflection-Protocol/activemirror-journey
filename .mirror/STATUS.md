# Active Mirror Status

Updated: 2026-07-08

## Current State

- Product source repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy/gateway repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live app route: `https://activemirror.ai/app/`
- Current live app bundle verified: `index-BBeJ1fR5.js`
- Gateway health version verified: `2026-07-07-media-kv-fallback-v1`

## Verified Checks

- `npm run guard:mirror` passed.
- `npm run build:deploy` passed in product source.
- `npm run guard:front-door` passed.
- `npm run guard:friction` passed.
- `npm run guard:redaction` passed.
- `npm run truth` passed with scoped limitations.
- `npm run build && npm run copy:audit` passed in deploy repo.
- `npm run canary:prod` passed 14/14.
- Live mobile `/app/id/` verified after the 2026-07-04 setup polish: `Set it up.`, four taps, plain result rows, browser-local state, no old setup copy, no overflow, no console errors.
- Repo-local wiki added at `docs/wiki/README.md` and included in `.mirror/CONTEXT_PACK.yaml`.
- Obsidian reference sync is available through `npm run wiki:obsidian`.
- Repo-local dossiers are available at `docs/dossiers/` and checked with `npm run guard:dossiers`.
- Artifact outputs carry runtime challenge packets checked by `npm run guard:challenge`.
- Offline/online owned-AI positioning and AMOS proof-layer intake are captured as dossiers, not consumer homepage copy.
- Production mobile and desktop privacy smoke passed.
- Production artifact route returned a usable draft, not advice about making one.
- `build:deploy` is wired through `prebuild:deploy`, so deploy packaging runs the local guard chain.
- `guard:mirror` preserves canonical local repo paths but also runs inside GitHub Actions checkouts.
- `.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml` exists for risky deploy/file/memory actions.
- `npm run mirror:report` prints checked scope, unchecked scope, bad news, and next controls.
- `npm run mirror:context` builds a file-derived context pack from `.mirror/CONTEXT_PACK.yaml`.
- `.mirror/AUDIT_LOGS/TEMPLATE.yaml` and `.mirror/ROLLBACKS/TEMPLATE.yaml` define receipt and restore shapes.
- `.mirror/SOURCE_LEDGER.md` tracks public claims that need local evidence or fresh verification.
- `.mirror/SKILLS/` contains lightweight policy stubs only; it does not spawn agent teams.
- AMOS control-plane foundation contracts exist as schemas for SCD state,
  workspace boundary, consent ladder, agent contract, and action request.
- `npm run guard:amos-contracts` runs a local AMOS contract gate and is included
  in `npm run prebuild`.
- `npm run guard:memory-proposal` runs the first AMOS contract-backed local
  action: creating reviewable memory proposals without durable promotion.
- `npm run guard:approval-request` verifies approval-required actions create
  pending approval requests in temp and that blocked/allowed actions write
  nothing.
- `npm run guard:artifact-export` verifies local-only artifact exports with
  path, allowed-root, content-type, secret-scan, SHA-256, and manifest checks.
- `npm run guard:audit-log` verifies local AMOS audit-log receipts and is
  included in `npm run prebuild`.
- `npm run guard:receipt-chain` verifies local audit receipts against
  `.mirror/RECEIPT_CHAINS/audit-log-chain.json` and is included in
  `npm run prebuild`.
- `npm run amos:status` runs the local AMOS control-plane checks and reports
  bad news, checked gates, receipt-chain state, working-tree state, and next
  safe action.
- `npm run guard:runtime-integration` verifies the AMOS runtime integration
  contract stays contract-only with app and gateway adapters disabled.
- `npm run guard:shadow-adapter` verifies a future runtime request can be
  dry-run through local gates and emit a receipt without live action.
- `npm run guard:readonly-app-adapter` verifies selected app source files can
  be hashed into a local read-only adapter receipt without live action.
- `npm run guard:browser-runtime-adapter` verifies an in-memory browser-local
  runtime request can be projected into a local receipt without live action.
- `npm run guard:ui-harness` verifies a local UI harness can call the
  browser-local runtime adapter and emit a projection receipt without live
  action.
- `npm run guard:disabled-source-adapter` verifies the disabled source adapter
  exists in app source, keeps disabled invariants, and is imported only as an
  inert source-only adapter.
- Historical source-adapter import proposal, approval, approval-create, patch,
  and apply-readiness gates exist as receipts for the path to the current
  state; they are no longer the active build health check.
- `npm run guard:source-adapter-import-applied` verifies the disabled source
  adapter import is present once in `HomePage.jsx` and is not invoked.
- Local AMOS audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T130000Z-amos_local_gates.yaml`.
- Local AMOS receipt-chain audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T131500Z-amos_receipt_chain.yaml`.
- Local AMOS status-report audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T132500Z-amos_status_report.yaml`.
- Local AMOS runtime-integration audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T132730Z-amos_runtime_integration_contract.yaml`.
- Local AMOS shadow-adapter dry-run receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T133841Z-shadow_consumer_first_turn.json`.
- Local AMOS shadow-adapter audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T133841Z-amos_shadow_adapter.yaml`.
- Local AMOS read-only app adapter receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T134909Z-readonly_consumer_app_surface.json`.
- Local AMOS read-only app adapter audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T134909Z-amos_readonly_app_adapter.yaml`.
- Local AMOS browser-local runtime adapter receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T140008Z-browser_local_consumer_turn.json`.
- Local AMOS browser-local runtime adapter audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T140008Z-amos_browser_runtime_adapter.yaml`.
- Local AMOS UI harness receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T140840Z-local_ui_consumer_turn.json`.
- Local AMOS UI harness audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T140840Z-amos_ui_harness.yaml`.
- Local AMOS disabled source adapter receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T141644Z-disabled_source_adapter_consumer.json`.
- Local AMOS disabled source adapter audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T141644Z-amos_disabled_source_adapter.yaml`.
- Local AMOS source adapter import proposal receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T143217Z-disabled_source_adapter_import_proposal.json`.
- Local AMOS source adapter import proposal audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T143217Z-amos_source_adapter_import_proposal.yaml`.
- Local AMOS source adapter import approval bridge receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T144553Z-disabled_source_adapter_import_approval_bridge.json`.
- Local AMOS source adapter import approval bridge audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T144553Z-amos_source_adapter_import_approval_bridge.yaml`.
- Pending source adapter import approval request exists at
  `.mirror/APPROVAL_REQUESTS/20260707T153055Z-source_adapter_import.yaml`.
- Local AMOS source adapter import approval request creation receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T153055Z-disabled_source_adapter_import_approval_create.json`.
- Local AMOS source adapter import approval request creation audit receipt
  exists at
  `.mirror/AUDIT_LOGS/20260707T153055Z-amos_source_adapter_import_approval_create.yaml`.
- Local AMOS source adapter import patch proposal exists at
  `.mirror/PATCH_PROPOSALS/20260707T160235Z-disabled_source_adapter_import_patch.diff`.
- Local AMOS source adapter import patch proposal receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260707T160235Z-disabled_source_adapter_import_patch.json`.
- Local AMOS source adapter import patch proposal audit receipt exists at
  `.mirror/AUDIT_LOGS/20260707T160235Z-amos_source_adapter_import_patch.yaml`.
- Local AMOS source adapter import apply rollback plan exists at
  `.mirror/ROLLBACKS/20260708T084032Z-disabled_source_adapter_import_apply_rollback.yaml`.
- Local AMOS source adapter import apply readiness receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260708T084032Z-disabled_source_adapter_import_apply.json`.
- Local AMOS source adapter import apply readiness audit receipt exists at
  `.mirror/AUDIT_LOGS/20260708T084032Z-amos_source_adapter_import_apply.yaml`.
- Local AMOS source adapter import applied receipt exists at
  `.mirror/RUNTIME_DRY_RUNS/20260708T091526Z-disabled_source_adapter_import_applied.json`.
- Local AMOS source adapter import applied audit receipt exists at
  `.mirror/AUDIT_LOGS/20260708T091526Z-amos_source_adapter_import_applied.yaml`.
- Current local audit receipt chain hash:
  `2e6d9a76d59f987575230781bb8e8f094a4f6744dd44fe07505779dfc9afa2cc`.
- Pending review proposal exists at
  `.mirror/MEMORY_UPDATE_PROPOSALS/20260707T123500Z-front_door_start_state.yaml`.
- Live generated-media storage currently reports `kv_durable_free_tier` with
  signed gateway URLs and secret HMAC signing.

## Bad News / Known Limits

- The product source and deploy/gateway source are still two repos.
- GitHub Pages legacy deployment can time out in `deployment_queued`; a `gh-pages` republish may be needed.
- Browser-local state is useful, but not a full owned identity/memory sync layer yet.
- Generated artifacts are useful text/brief/code outputs today; they are not yet a fully sandboxed file-export system.
- The current UI is still a product front door, not the full ActiveMirrorOS control plane.
- File export registry has a local gate scaffold only; there are no public
  registered exports.
- Approval requests are scaffolded, but no real approval workflow is wired into the app yet.
- Approval request creation is local repo scaffolding; no approval file was
  created for a fake publish action.
- Audit, rollback, skill, and source-ledger files are repo-local contracts only; they are not a runtime control plane.
- GitHub Wiki is not canonical or mirrored; the Obsidian copy is generated reference material only.
- The AMOS contract gate is local repo enforcement only; the live app and
  gateway do not yet consume these contracts at runtime.
- The memory proposal gate writes review proposals only; it does not promote
  browser memory, canonical memory, or cross-device identity state.
- The audit log gate writes local receipts only; the receipt-chain gate can
  hash-chain them locally, but they are not signed, published, or runtime
  enforced.
- The receipt-chain gate detects local audit receipt edits, deletes, or
  unchained additions; it is not an asymmetric signature, external timestamp,
  public notarization, or live app/gateway verifier.
- The AMOS status report is a local truth surface, not a runtime health proof
  for the public app or gateway.
- The runtime integration contract is intentionally not live wiring; the public
  app and gateway adapters are declared disabled.
- The shadow adapter emits local dry-run receipts only; it performs no live
  app, gateway, model, network, or memory action.
- The read-only app adapter emits local source-hash receipts only; it performs
  no live app, gateway, model, network, route, deploy, or memory action.
- The browser-local runtime adapter emits local in-memory projection receipts
  only; it performs no live app, gateway, model, network, route, deploy, or
  durable memory action.
- The local UI harness emits local projection receipts only; it performs no
  live app, gateway, model, network, route, deploy, arbitrary UI, or durable
  memory action.
- The disabled source adapter is imported by the active app source but is not
  invoked; it performs no live app, gateway, model, network, route, deploy,
  arbitrary UI, or durable memory action.
- Historical source-adapter import proposal, approval, approval-create, patch,
  and apply-readiness receipts prove the previous path only; they are not the
  current active source state.
- The source adapter import applied gate proves only that the import is present
  once and inert; it is not live AMOS runtime enforcement.
- The pending front-door proposal is not accepted memory until a human approves
  it.

## Unrelated Local Dirt

- `docs/ACTIVE_MIRROR_HARDENING_RESOLUTION_CONTRACTS.md` is untracked and was not created by this status update.
- `.mirror/.PLAN.md.swp` is held by an active Vim process and was not removed.
