# Active Mirror Plan

## Now

1. Keep the homepage chat-first and simple: `What do you want?`
2. Keep setup short: `Set it up.` plus four taps.
3. Keep privacy nudges warm and placeholder-based.
4. Keep artifacts as actual outputs, not instructions.
5. Keep model/provider names out of consumer copy.
6. Keep source-sensitive turns marked before reliance.
7. Read `docs/wiki/README.md` before changing copy, setup flow, deploy packaging, or repo boundaries.
8. Pick or create a dossier in `docs/dossiers/` before a multi-file task.
9. Treat strategy phrases as intent signals, not literal public copy, unless
   Paul explicitly says to use exact wording.

## Next Product Slice

1. Make `Start here` feel even more like a natural setup doorway, not a product lesson.
2. Keep BrainScan/MirrorSeed language behind compatibility routes and repo docs, not on the consumer shell.
3. Add one elegant generated surface only when useful:
   - draft;
   - document;
   - code starter;
   - image prompt or generated image.
4. Add a small "use placeholders" privacy helper that never feels like a scolding block.
5. Keep artifact challenge status quiet and useful: `Ready`, `Draft`, `Check first`, or `Needs edit`.
6. Position Active Mirror as private-first reflective AI with online help when useful; do not sell offline AI or memory as unique.

## Next Control-Plane Slice

1. Keep `npm run mirror:report` as the first status command before risky edits.
2. Keep `npm run mirror:context` as the context source instead of chat memory; it now includes `docs/wiki/` and `docs/dossiers/`.
3. Keep `npm run wiki:obsidian` as a generated reference mirror, not the source of truth.
4. Use the Model Challenge Contract for tasks that need model accountability.
5. Use `npm run guard:memory-proposal` as the first contract-backed local memory action.
6. Use `npm run guard:approval-request` before any action that may publish,
   send, deploy, or otherwise leave the local session.
7. Use `npm run guard:artifact-export` before any local file export path is trusted.
8. Use `npm run guard:audit-log` when a local gate check needs repo-local
   evidence.
9. Use `npm run guard:receipt-chain` to catch edited, deleted, or unchained
   local audit receipts.
10. Use `npm run amos:status` before live runtime wiring or public proof
    claims.
11. Use `npm run guard:runtime-integration` before claiming the app or gateway
    consumes AMOS gates.
12. Use `npm run guard:shadow-adapter` before claiming any runtime request has
    been simulated through local gates.
13. Use `npm run guard:readonly-app-adapter` before claiming app-source
    inspection evidence exists.
14. Use `npm run guard:browser-runtime-adapter` before claiming browser-local
    request projection evidence exists.
15. Use `npm run guard:ui-harness` before claiming local UI projection
    evidence exists.
16. Use `npm run guard:disabled-source-adapter` before claiming a source-code
    adapter exists or is safely disabled.
17. Use `npm run guard:source-adapter-import` before claiming a source adapter
    import has even been proposed safely.
18. Use `npm run guard:source-adapter-import-approval` before claiming a source
    adapter import approval request can be previewed.
19. Use `npm run guard:source-adapter-import-approval-create` before claiming a
    real pending approval request file exists for the source adapter import.
20. Add real approval request files only when a risky action is actually proposed.
21. Promote repeated report output into `.mirror/STATUS.md` only after checks pass.
22. Only add runtime wiring after a small contract has been used by a real task.
23. Runtime integration is still contract-only with disabled adapters.
24. Shadow adapter receipts are local-only and perform no live action.
25. Read-only app adapter receipts are source-hash evidence only.
26. Browser-local runtime adapter receipts are input-hash projections only.
27. Local UI harness receipts are projection evidence only.
28. Disabled source adapter is source-only and not imported by the active app.
29. Source adapter import remains approval-required, pending, and not live.
30. Source adapter import approval bridge previews only; it writes no real
    approval file and grants no approval.
31. Source adapter import approval request exists as a pending file only; it is
    not approval and grants no authority.
32. Use `npm run guard:source-adapter-import-patch` before claiming a local
    source import patch proposal exists.
33. Source adapter import patch proposal exists as a local diff only; it is not
    applied and not live.
34. Use `npm run guard:source-adapter-import-apply` before claiming the local
    patch is apply-ready or that a rollback plan exists.
35. Source adapter import apply readiness exists as a local check only; it is
    not approval, not an active source edit, and not live.
36. Next control-plane slice: apply the import only after explicit approval and
    another clean readiness run.

## Do Not Do Yet

- Do not expose kernel internals on the consumer homepage.
- Do not claim model training, LoRA, or owned local model sync until implemented and verified.
- Do not position the product as a medical, therapy, or psychiatric tool.
- Do not mix SWFI/client language into the public Active Mirror flow.
