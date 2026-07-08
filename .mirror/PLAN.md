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
16. Use `npm run guard:disabled-source-adapter` before claiming the source-code
    adapter exists, is imported, or is safely disabled.
17. Use `npm run guard:source-adapter-import-applied` before claiming the
    disabled source adapter import is present and inert.
18. Add real approval request files only when a risky action is actually proposed.
19. Promote repeated report output into `.mirror/STATUS.md` only after checks pass.
20. Only add runtime wiring after a small contract has been used by a real task.
21. Runtime integration is still contract-only with disabled adapters.
22. Shadow adapter receipts are local-only and perform no live action.
23. Read-only app adapter receipts are source-hash evidence only.
24. Browser-local runtime adapter receipts are input-hash projections only.
25. Local UI harness receipts are projection evidence only.
26. Disabled source adapter is imported by active app source but remains inert.
27. Source adapter import applied gate verifies the import is present once and
    not invoked; it is not live AMOS runtime enforcement.
28. Historical proposal, approval, patch, and apply-readiness gates remain as
    evidence of the path to this state, not the active build health check.
29. Next control-plane slice: create the tiny invocation contract before any
    real runtime call, model call, memory write, gateway change, or UI behavior.

## Do Not Do Yet

- Do not expose kernel internals on the consumer homepage.
- Do not claim model training, LoRA, or owned local model sync until implemented and verified.
- Do not position the product as a medical, therapy, or psychiatric tool.
- Do not mix SWFI/client language into the public Active Mirror flow.
