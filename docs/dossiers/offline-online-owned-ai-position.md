# Dossier: Offline Online Owned AI Position

Status: active
Updated: 2026-07-04
Owner: Active Mirror

## Objective

Own the local-first plus internet-aware reflective AI lane without pretending
that offline AI or memory alone is unique.

## User Outcome

The user gets an assistant that starts from their intent and their approved
context, works privately first, and brings in online models, sources, or tools
only when that helps the user get a better result.

## Scope

- Product repo: `/Users/mirror-pro/repos/activemirror-journey`
- Deploy repo: `/Users/mirror-pro/repos/active-mirror-site`
- Live route: `https://activemirror.ai/app/`
- Local route: `http://127.0.0.1:8976/`
- Files likely to change:
  - `src/pages/HomePage.jsx`
  - `src/pages/Enterprise.jsx`
  - `src/lib/challenge-packet.js`
  - `src/lib/local-mirror-sense.js`
  - `docs/wiki/language-guide.md`
  - `docs/wiki/current-product-map.md`
  - `.mirror/SOURCE_LEDGER.md`

## Boundaries

- Not in scope: claiming Active Mirror is the only local AI, the only memory
  product, or a finished owned-model system.
- Requires approval: provider routing changes, browser model downloads, durable
  memory sync, auth, billing, file export, or deploy.
- Must not expose: model/provider names in consumer copy, secrets, private vault
  material, or raw user memory.
- Must stay internal: implementation labels such as substrate, kernel, route,
  model worker, vault pipeline, and gate.

## Required Inputs

- Apple Private Cloud Compute and Apple Intelligence privacy docs:
  - `https://security.apple.com/blog/private-cloud-compute/`
  - `https://security.apple.com/blog/expanding-pcc/`
  - `https://support.apple.com/guide/iphone/apple-intelligence-and-privacy-iphe3f499e0e/ios`
- Microsoft Recall privacy and control docs:
  - `https://support.microsoft.com/en-us/windows/privacy/privacy-and-control-over-your-recall-experience`
- Vercel AI SDK docs:
  - `https://ai-sdk.dev/docs/introduction`
  - `https://ai-sdk.dev/providers/community-providers/browser-ai`
- Hugging Face Transformers.js and WebGPU docs:
  - `https://huggingface.co/docs/transformers.js/en/index`
  - `https://huggingface.co/docs/transformers.js/en/guides/webgpu`
- Browser-local LLM runtime:
  - `https://github.com/mlc-ai/web-llm`
- Memory/personalization signals:
  - `https://openai.com/index/chatgpt-memory-dreaming/`
  - `https://gemini.google/overview/personal-intelligence/`
  - `https://www.personal.ai/model-1`
- Repo-local proof: `src/lib/challenge-packet.js` and
  `src/lib/local-mirror-sense.js`.

## Implementation Surface

- UI: do not lead with offline/local jargon. Lead with `What do you want?` and
  let the experience reveal that private/local work comes first.
- Runtime: local/browser handling should be the default posture where practical;
  online calls are routed when the user needs current facts, stronger reasoning,
  media, or artifact generation.
- Model or gateway: model names stay hidden from the consumer surface until
  routing, billing, and public policy are settled.
- Local storage: browser-local state is useful but not yet full owned identity.
- Generated artifacts: artifacts must carry challenge packets so the system does
  not call unchecked work done.

## Checks

- Local guards:
  - `npm run guard:front-door`
  - `npm run guard:friction`
  - `npm run guard:challenge`
  - `npm run guard:redaction`
  - `npm run truth`
- Browser QA:
  - consumer copy does not explain architecture first
  - artifact status remains quiet and helpful
  - source-heavy asks route to checking before reliance
- Deploy checks:
  - only after product copy or runtime changes are packaged to deploy repo
- Receipts:
  - research links in `.mirror/SOURCE_LEDGER.md`
  - local guards
  - production canary if deployed

## Challenge Contract

- Challenge offered: make Active Mirror own private-first, online-when-useful
  reflection without overclaiming offline AI, memory, or model ownership.
- Acceptance condition: public copy says the user value, not the architecture;
  claims about privacy, memory, offline work, or current sources are bounded.
- Failure condition: copy implies completed owned-model sync, full offline
  autonomy, universal privacy, or market uniqueness that is not proven.
- Consequence if failed: do not deploy the copy, do not promote the claim to
  marketing, and move it to source-ledger review.
- Recovery path: narrow the claim, add a source, or move the concept to an
  internal roadmap note.

## Bad News / Limits

- Offline/local AI is not unique. Apple, Microsoft, Google, browser runtimes,
  and open-source stacks are all pushing local/private compute.
- Memory is not unique. Major assistants and specialized personal AI products
  now make memory and personalization core features.
- User-owned AI language is already used by other products. Active Mirror can
  still own a specific version: user-owned context plus reflective challenge and
  consent.
- Browser inference is real, but RAM, model size, browser support, and quality
  still constrain what can run locally for mainstream users.

## Handoff

Use this positioning internally:

> Active Mirror is the reflective layer for your AI. It starts privately with
> what you choose, brings in the internet or stronger models only when useful,
> and keeps the user in control of what becomes memory, output, or action.

Do not use this phrasing literally on the homepage unless it tests well. The
homepage should still start with the user: `What do you want?`
