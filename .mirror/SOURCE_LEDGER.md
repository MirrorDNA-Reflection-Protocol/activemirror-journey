# Active Mirror Source Ledger

Purpose: track public/product claims that need evidence before they appear in copy, docs, or deploy notes.

## Current Rule

- Claims visible to users need a source, file, receipt, or explicit uncertainty label.
- Market/category claims need fresh web research before publication.
- Internal strategy language does not become public copy without a source and a user-facing reason.
- SWFI/client-specific facts stay out of this repo unless the line is only a boundary note.

## Claims To Verify

| Claim | Surface | Status | Evidence |
|---|---|---|---|
| Active Mirror is a reflective AI front door. | product copy | source-backed-local | `src/pages/HomePage.jsx`, `CANONICAL_SITE.md` |
| Active Mirror can create small useful outputs from a first turn. | product behavior | source-backed-local | `src/lib/first-turn-fallback.js`, production artifact smoke in `.mirror/STATUS.md` |
| Browser-local state is not full owned identity sync yet. | product limit | source-backed-local | `.mirror/STATUS.md` |
| Offline/local AI and memory are crowded categories; Active Mirror should not claim uniqueness there. | market positioning | source-backed-current | Apple Private Cloud Compute, Microsoft Recall, Vercel AI SDK, Transformers.js/WebGPU, OpenAI/Gemini/Personal.ai memory signals; summarized in `docs/dossiers/offline-online-owned-ai-position.md` |
| Active Mirror's stronger lane is private-first reflection with online help only when useful. | product positioning | source-backed-current + local-product | `docs/dossiers/offline-online-owned-ai-position.md`, `src/lib/challenge-packet.js`, `src/lib/local-mirror-sense.js` |
| AMOS Euclid Trace is a public proof scaffold, not hidden chain-of-thought or a guarantee of truth. | proof boundary | source-backed-local | `/Users/mirror-pro/Downloads/amos_euclid_reflective_build_pack/docs/01_EUCLID_TRACE_PROTOCOL.md`, `docs/dossiers/amos-proof-layer-intake.md` |

## Blocked Until Verified

- Broad market-size claims.
- Claims that competitors do not offer memory, privacy, or reflection.
- Claims that local models are trained, personalized, or user-owned.
- Claims that cryptographic proof, ZKP, or enterprise audit is implemented in the consumer app.
- Claims that the consumer app implements full AMOS, Euclid Trace, MirrorGraph, or Reflective Workspace runtime.
