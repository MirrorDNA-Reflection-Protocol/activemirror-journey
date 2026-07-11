import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('src/pages/HomePage.jsx');
const manager = read('src/lib/private-recall.js');
const mirrorState = read('src/lib/mirror-state.js');
const worker = read('src/workers/private-recall.worker.js');
const panel = read('src/components/PrivateRecallPanel.jsx');
const suggestions = read('src/components/PrivateRecallSuggestions.jsx');
const vite = read('vite.config.js');
const index = read('index.html');
const packageJson = JSON.parse(read('package.json'));

let failures = 0;
function check(condition, message) {
    if (condition) return;
    failures += 1;
    console.error(`FAIL: ${message}`);
}

check(packageJson.dependencies['@litertjs/core'] === '2.5.2', 'LiteRT.js must stay pinned to the approved runtime version');
check(packageJson.dependencies['@huggingface/tokenizers'] === '0.1.3', 'the lightweight browser tokenizer must stay pinned');
check(manager.includes("new Worker('/__private_recall_worker.js')") && manager.includes("new Worker(new URL('../workers/private-recall.worker.js', import.meta.url))"), 'private recall must load through a bundled classic worker in development and production');
check(!manager.includes('const worker = new Worker'), 'the private recall worker must not start on first page load');
check(manager.includes('getPrivateRecallPreference') && manager.includes('setPrivateRecallPreference') && !manager.includes('window.localStorage'), 'private recall consent must use the canonical browser-state contract');
check(mirrorState.includes('privateRecall: {') && mirrorState.includes('PRIVATE_RECALL_LEGACY_KEY'), 'canonical state must retain and migrate the private-recall consent flag');
check(worker.includes('enabled: value?.enabled === true') && worker.includes('enabled: current.enabled'), 'the OPFS or IndexedDB manifest must own and preserve durable recall consent');
check(worker.includes('async function handlePreference(payload)') && manager.includes('export async function restorePrivateRecallPreference()') && manager.includes("await request('preference')") && home.includes('restorePrivateRecallPreference().catch'), 'startup must read manifest consent without compiling the model, then lazily resume it');
check(manager.includes('estimate = await navigator.storage.estimate?.()') && manager.includes('Quota reporting is optional'), 'optional quota reporting must not disable private recall');
check(worker.includes("const MODEL_SHA256 = '8b0b8bbd0aa95f9f747c25a6c87cd05a8286933282660f6a50da877662917e31'"), 'the model download must be integrity pinned');
check(worker.includes('const cachedDigest = cachedBytes.byteLength === expectedBytes') && worker.includes('cachedDigest === expectedSha256'), 'cached model assets must be re-hashed before reuse');
check(worker.includes("const TOKENIZER_REVISION = '5090578d9565bb06545b4552f76e6bc2c93e4a66'"), 'the tokenizer must use an immutable revision');
check(worker.includes("const CACHE_NAME = 'active-mirror-private-recall-assets-v1'"), 'model assets must be kept for offline reuse');
check(worker.includes("const RUNTIME_CACHE_NAME = 'active-mirror-private-recall-runtime-v1'") && worker.includes('caches.delete(RUNTIME_CACHE_NAME)'), 'clear recall must also remove the opt-in local runtime cache');
check(worker.includes("const OPFS_FILE = 'active-mirror-private-recall-v1.json'"), 'private recall must retain an origin-private file fallback');
check(worker.includes("storageBackend = 'indexeddb'"), 'private recall must keep a browser-database fallback');
check(worker.includes("async function readManifest() {\n    try {\n        storageBackend = 'indexeddb';"), 'the small mutable recall manifest must use transactional IndexedDB first');
check(worker.includes('locateFile: (filename) => new URL(filename, wasmBaseUrl).href'), 'the worker must resolve Wasm beside the self-hosted runtime');
check(worker.includes("/^(?:INFO|WARNING):/.test(text)") && worker.includes('console.debug(text)'), 'LiteRT informational diagnostics must not masquerade as browser errors');
check(worker.includes("if (accelerator !== 'webgpu') throw error") && worker.includes("accelerator = 'wasm'"), 'a false-positive WebGPU capability check must fall back to device-processor inference');
check(worker.includes("'task: search result | query: '"), 'queries must use the recommended multilingual retrieval prompt');
check(worker.includes('title: ${cleanText(title, 120)'), 'saved items must use the recommended document prompt');
check(worker.includes('VECTOR_DIMENSIONS = 256'), 'stored vectors must use the bounded Matryoshka representation');
check(worker.includes('MODEL_SEQUENCE_LENGTH = 1024') && worker.includes('const paddedIds = new Int32Array(MODEL_SEQUENCE_LENGTH)'), 'the LiteRT model must always receive its fixed padded input shape');
check(worker.includes('containsSecret(text)'), 'obvious secrets must not enter private recall');
check(vite.includes("'litert_wasm_compat_internal.wasm'") && vite.includes("'litert_wasm_internal.wasm'"), 'production builds must self-host compatible runtime files');
check(vite.includes("PRIVATE_RECALL_RUNTIME_CACHE = 'active-mirror-private-recall-runtime-v1'") && vite.includes('url.pathname.startsWith(PRIVATE_RECALL_RUNTIME_PREFIX)'), 'the self-hosted LiteRT runtime must be cached only when private recall requests it');
check(vite.includes("server.middlewares.use('/__private_recall_worker.js'") && vite.includes("format: 'iife'"), 'development must serve a classic bundled worker for the LiteRT loader');
check(index.includes('https://storage.googleapis.com') && index.includes('https://huggingface.co') && index.includes('https://*.hf.co'), 'CSP must allow only the pinned model and tokenizer hosts');
check(panel.includes('Download once. Recall anywhere.') && panel.includes('Nothing automatically'), 'setup must explain offline value and transmission boundaries');
check(!panel.includes('LiteRT') && !panel.includes('EmbeddingGemma'), 'consumer UI must not expose model or runtime names');
check(suggestions.includes('Use in message') && suggestions.includes('Nothing is added or sent until you choose it.'), 'recalled text must require an explicit send action');
check(suggestions.includes('इस डिवाइस से') && suggestions.includes("language = 'en'"), 'recall suggestions must follow supported Indian-language input while retaining an English fallback');
check(home.includes('buildPrivateRecallItems({') && home.includes('savedChats: savedHomeChats'), 'only explicitly saved product state should seed recall');
check(home.includes('Context I chose from this device:'), 'using recalled text must visibly add it to the message composer');
check(!home.includes('private_recall:') && !home.includes('privateRecall:'), 'private recall must not be silently attached to gateway requests');

if (!globalThis.window) {
    globalThis.window = {
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
        },
    };
}

const recallModule = await import(pathToFileURL(path.join(root, 'src/lib/private-recall.js')).href);
const multilingualItems = recallModule.buildPrivateRecallItems({
    savedChats: [
        { id: 'hi', title: 'काम की योजना', savedAt: '2026-07-10', thread: { lastIntent: 'मुझे अपने छोटे व्यवसाय की योजना याद रखनी है।' } },
        { id: 'hinglish', title: 'Dukaan plan', savedAt: '2026-07-10', thread: { lastIntent: 'Kal dukaan ke supplier ko phone karna hai.' } },
        { id: 'secret', title: 'Do not store', savedAt: '2026-07-10', thread: { lastIntent: 'api_key=sk-proj-abcdefghijklmnopqrstuvwxyz123456' } },
    ],
    continuity: [
        { id: 'bn', intent: 'আগামীকাল বাজারের হিসাব শেষ করতে হবে।' },
        { id: 'ta', intent: 'நாளை வாடிக்கையாளரை அழைக்க வேண்டும்.' },
        { id: 'te', intent: 'రేపు దుకాణం ఖాతాలు పూర్తి చేయాలి.' },
    ],
    mirrorDefaults: [
        { id: 'mr', question: 'उद्या कोणते काम आधी करायचे?', move: 'ग्राहकाला फोन करायचा.' },
    ],
});

check(multilingualItems.length === 6, 'Hindi, Hinglish, Bengali, Tamil, Telugu, and Marathi saves must be accepted while secrets are skipped');
check(multilingualItems.some((item) => item.text.includes('मुझे अपने छोटे व्यवसाय')), 'Devanagari text must remain intact');
check(multilingualItems.some((item) => item.text.includes('Kal dukaan')), 'Hinglish text must remain intact');
check(multilingualItems.some((item) => item.text.includes('আগামীকাল')), 'Bengali text must remain intact');
check(multilingualItems.some((item) => item.text.includes('நாளை')), 'Tamil text must remain intact');
check(multilingualItems.some((item) => item.text.includes('రేపు')), 'Telugu text must remain intact');
check(!multilingualItems.some((item) => item.id === 'chat:secret'), 'secret-bearing saves must be excluded');

if (failures) {
    console.error(`Private recall guard FAILED with ${failures} finding(s).`);
    process.exit(1);
}

console.log(`Private recall guard PASSED (${multilingualItems.length} multilingual fixtures, explicit local-only recall).`);
