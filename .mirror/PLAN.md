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
7. Add real approval request files only when a risky action is actually proposed.
8. Promote repeated report output into `.mirror/STATUS.md` only after checks pass.
9. Only add runtime wiring after a small contract has been used by a real task.

## Do Not Do Yet

- Do not expose kernel internals on the consumer homepage.
- Do not claim model training, LoRA, or owned local model sync until implemented and verified.
- Do not position the product as a medical, therapy, or psychiatric tool.
- Do not mix SWFI/client language into the public Active Mirror flow.
