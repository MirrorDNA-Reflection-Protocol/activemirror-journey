# Browser-Local Recall Build Receipt - 2026-07-11

## Product Outcome

Active Mirror can now keep its shell and an explicitly enabled private-recall
index in the browser. After one connected setup, the tested browser can reload,
respond locally, retrieve an explicitly saved item, and add recalled context to
the composer only after the person chooses `Use in message`.

The conversation contract is also less mechanical: ordinary typed turns route
to a calm, curious conversational voice with bounded tab-only continuity;
explicit requests for a decision or plan retain the reflective route.

## Browser-Local Stack

- LiteRT.js `2.5.2`, pinned.
- Hugging Face Tokenizers `0.1.3`, pinned.
- EmbeddingGemma LiteRT model: `183329528` bytes.
- Model SHA-256: `8b0b8bbd0aa95f9f747c25a6c87cd05a8286933282660f6a50da877662917e31`.
- Tokenizer files pinned to immutable revision
  `5090578d9565bb06545b4552f76e6bc2c93e4a66` and verified by byte count and
  SHA-256.
- 256-dimensional normalized local vectors.
- WebGPU first, with compile-time WASM/XNNPACK fallback.
- IndexedDB manifest with OPFS fallback.
- Cache API model/tokenizer storage and opt-in-only LiteRT runtime caching.
- Generated service worker caches only the app entry and hashed JS/CSS shell;
  API requests, prompts, uploads, responses, images, and videos are excluded.

## Browser Evidence

Local production browser evidence is under `outputs/` and is not a public
deployment receipt.

- `offline-app-shell-e2e/test-report.json`: PASS.
- `offline-app-shell-e2e/playwright-trace.zip`: captured.
- `offline-app-shell-e2e/online-mobile.png`: captured at 390x844.
- `offline-app-shell-e2e/offline-mobile.png`: captured at 390x844.
- `private-recall-live-e2e/final-report.json`: PASS for online and offline reopen.
- `private-recall-live-e2e/offline-functional-final-report.json`: PASS for local
  fallback, saved-item retrieval, explicit context use, and zero console/page/
  request failures.

The live private-recall run exposed and repaired three failures before passing:

1. WebGPU capability was reported without an available GPU device; the worker
   now falls back to WASM/XNNPACK.
2. LiteRT runtime JS/WASM was not persisted; it is now cached only after recall
   opt-in and removed by `Clear recall`.
3. Known-offline submit still attempted the gateway; offline turns now route
   directly to the local response and telemetry stays local.

## Checked Scope

- Full source guards and production build.
- Mobile shell registration, app-shell cache, and offline reload.
- No horizontal viewport overflow at 390x844.
- One-time model/tokenizer download, byte checks, and SHA-256 checks.
- WebGPU failure to CPU fallback.
- Online-to-offline private-recall restart in one isolated persistent profile.
- Local indexing and semantic retrieval of an explicitly saved item.
- Recalled text absent before approval and present after `Use in message`.
- Zero console errors, page errors, and failed requests in the final offline
  functional run.

## Unchecked Scope

- First-ever use with no connection and no cached shell.
- The full model matrix across low-memory Android devices, Safari, and Firefox.
- Indic-language retrieval quality benchmarks across all supported scripts.
- Browser storage eviction behavior under real low-storage pressure.
- Public deployment until deploy-bridge packaging, Worker deployment, and live
  canaries pass.

## Primary References

- https://ai.google.dev/edge/litert/web
- https://github.com/huggingface/transformers.js
- https://onnxruntime.ai/docs/tutorials/web/
- https://developer.chrome.com/docs/ai/built-in

The references establish available browser runtimes. They do not substitute for
the local evidence or the remaining device and language benchmarks.
