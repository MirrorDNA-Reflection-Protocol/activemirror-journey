import { Tokenizer } from '@huggingface/tokenizers';
import {
    Tensor,
    isWebGPUSupported,
    loadAndCompile,
    loadLiteRt,
    unloadLiteRt,
} from '@litertjs/core';

const SCHEMA_VERSION = 'active_mirror.private_recall.v1';
const CACHE_NAME = 'active-mirror-private-recall-assets-v1';
const RUNTIME_CACHE_NAME = 'active-mirror-private-recall-runtime-v1';
const OPFS_FILE = 'active-mirror-private-recall-v1.json';
const IDB_NAME = 'active-mirror-private-recall-v1';
const IDB_STORE = 'state';
const MAX_ITEMS = 48;
const MAX_TEXT_LENGTH = 1800;
const VECTOR_DIMENSIONS = 256;
const MODEL_SEQUENCE_LENGTH = 1024;
const MODEL_URL = 'https://storage.googleapis.com/jmstore/WebAIDemos/models/EmbeddingGemma/embeddinggemma-300M_seq1024_mixed-precision.tflite';
const MODEL_BYTES = 183_329_528;
const MODEL_SHA256 = '8b0b8bbd0aa95f9f747c25a6c87cd05a8286933282660f6a50da877662917e31';
const TOKENIZER_REVISION = '5090578d9565bb06545b4552f76e6bc2c93e4a66';
const TOKENIZER_URL = `https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/${TOKENIZER_REVISION}/tokenizer.json`;
const TOKENIZER_BYTES = 20_323_312;
const TOKENIZER_SHA256 = '4dda02faaf32bc91031dc8c88457ac272b00c1016cc679757d1c441b248b9c47';
const TOKENIZER_CONFIG_URL = `https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/${TOKENIZER_REVISION}/tokenizer_config.json`;
const TOKENIZER_CONFIG_BYTES = 1_156_830;
const TOKENIZER_CONFIG_SHA256 = '3ca953eea6c3c9fcda9cf3df22949ff18b216f7c74bd6459230f3f1013953f3a';
const SECRET_PATTERNS = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /\b(?:sk|rk|pk)-(?:live|test|proj)?[_-]?[a-z0-9_-]{16,}\b/i,
    /\b(?:api[_ -]?key|access[_ -]?token|secret|password)\s*[:=]\s*\S{8,}/i,
    /\bbearer\s+[a-z0-9._~+\/-]{16,}=*\b/i,
];

let runtimeLoaded = false;
let model = null;
let tokenizer = null;
let accelerator = 'wasm';
let storageBackend = '';
let operationQueue = Promise.resolve();

function progress(phase, value, message) {
    self.postMessage({ type: 'progress', phase, progress: value, message });
}

function cacheKey(name) {
    const base = String(import.meta.env.BASE_URL || '/');
    return new Request(new URL(`${base.endsWith('/') ? base : `${base}/`}__private_recall__/${name}`, self.location.origin));
}

async function sha256Hex(bytes) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function readResponseBytes(response, { expectedBytes, start, span, label }) {
    if (!response.body) {
        const fallback = new Uint8Array(await response.arrayBuffer());
        progress('downloading', start + span, `${label} downloaded.`);
        return fallback;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value?.byteLength) continue;
        chunks.push(value);
        received += value.byteLength;
        const ratio = Math.min(1, received / expectedBytes);
        progress('downloading', start + span * ratio, `${label} ${Math.round(ratio * 100)}%`);
    }

    const bytes = new Uint8Array(received);
    let offset = 0;
    chunks.forEach((chunk) => {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
    });
    return bytes;
}

async function fetchVerifiedAsset({ name, url, expectedBytes, expectedSha256, start, span, label }) {
    const cache = await caches.open(CACHE_NAME);
    const key = cacheKey(name);
    const cached = await cache.match(key);
    if (cached) {
        const cachedBytes = new Uint8Array(await cached.arrayBuffer());
        const cachedHash = cached.headers.get('x-active-mirror-sha256');
        const cachedDigest = cachedBytes.byteLength === expectedBytes
            ? await sha256Hex(cachedBytes.buffer)
            : '';
        if (cachedDigest === expectedSha256 && cachedHash === expectedSha256) {
            progress('opening', start + span, `${label} found on this device.`);
            return { bytes: cachedBytes, cached: true };
        }
        await cache.delete(key);
    }

    let response;
    try {
        response = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    } catch {
        throw new Error(`${label} is not on this device yet. Connect once to finish setup.`);
    }
    if (!response.ok) throw new Error(`${label} could not be downloaded (${response.status}).`);

    const bytes = await readResponseBytes(response, { expectedBytes, start, span, label });
    if (bytes.byteLength !== expectedBytes) {
        throw new Error(`${label} was incomplete. Nothing was installed.`);
    }
    progress('verifying', start + span, `Checking ${label.toLowerCase()}.`);
    const digest = await sha256Hex(bytes.buffer);
    if (digest !== expectedSha256) {
        throw new Error(`${label} did not pass its integrity check. Nothing was installed.`);
    }

    await cache.put(key, new Response(bytes, {
        headers: {
            'content-type': name.endsWith('.json') ? 'application/json' : 'application/octet-stream',
            'content-length': String(bytes.byteLength),
            'x-active-mirror-sha256': digest,
        },
    }));
    return { bytes, cached: false };
}

async function prepareRuntime(wasmBaseUrl) {
    if (!runtimeLoaded) {
        progress('opening', 0.02, 'Opening private recall.');
        self.Module = {
            locateFile: (filename) => new URL(filename, wasmBaseUrl).href,
            printErr: (message) => {
                const text = String(message || '');
                if (/^(?:INFO|WARNING):/.test(text)) {
                    console.debug(text);
                    return;
                }
                console.error(text);
            },
        };
        await loadLiteRt(wasmBaseUrl);
        runtimeLoaded = true;
    }

    const modelAsset = await fetchVerifiedAsset({
        name: 'embedding-model.tflite',
        url: MODEL_URL,
        expectedBytes: MODEL_BYTES,
        expectedSha256: MODEL_SHA256,
        start: 0.04,
        span: 0.76,
        label: 'Recall files',
    });
    const tokenizerAsset = await fetchVerifiedAsset({
        name: 'tokenizer.json',
        url: TOKENIZER_URL,
        expectedBytes: TOKENIZER_BYTES,
        expectedSha256: TOKENIZER_SHA256,
        start: 0.80,
        span: 0.13,
        label: 'Language index',
    });
    const tokenizerConfigAsset = await fetchVerifiedAsset({
        name: 'tokenizer-config.json',
        url: TOKENIZER_CONFIG_URL,
        expectedBytes: TOKENIZER_CONFIG_BYTES,
        expectedSha256: TOKENIZER_CONFIG_SHA256,
        start: 0.93,
        span: 0.02,
        label: 'Language settings',
    });

    if (!tokenizer) {
        progress('opening', 0.95, 'Opening the local language index.');
        tokenizer = new Tokenizer(
            JSON.parse(new TextDecoder().decode(tokenizerAsset.bytes)),
            JSON.parse(new TextDecoder().decode(tokenizerConfigAsset.bytes)),
        );
    }

    if (!model) {
        progress('opening', 0.97, 'Tuning private recall for this device.');
        accelerator = isWebGPUSupported() ? 'webgpu' : 'wasm';
        try {
            model = await loadAndCompile(modelAsset.bytes, { accelerator });
        } catch (error) {
            if (accelerator !== 'webgpu') throw error;
            progress('opening', 0.98, 'Device graphics unavailable. Using the device processor.');
            accelerator = 'wasm';
            model = await loadAndCompile(modelAsset.bytes, { accelerator });
        }
    }

    progress('ready', 1, 'Private recall is ready.');
    return {
        cached: modelAsset.cached && tokenizerAsset.cached && tokenizerConfigAsset.cached,
        accelerator,
    };
}

function defaultManifest() {
    return { schema_version: SCHEMA_VERSION, enabled: false, items: [] };
}

function normalizeManifest(value) {
    const items = Array.isArray(value?.items)
        ? value.items
            .filter((item) => item && typeof item.id === 'string' && Array.isArray(item.vector))
            .filter((item) => item.vector.length === VECTOR_DIMENSIONS)
            .slice(0, MAX_ITEMS)
        : [];
    return { schema_version: SCHEMA_VERSION, enabled: value?.enabled === true, items };
}

async function opfsRoot() {
    if (!navigator.storage?.getDirectory) return null;
    try {
        return await navigator.storage.getDirectory();
    } catch {
        return null;
    }
}

async function openIndexedDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(IDB_STORE)) {
                request.result.createObjectStore(IDB_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function readIndexedDb() {
    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE, 'readonly');
        const request = transaction.objectStore(IDB_STORE).get('manifest');
        request.onsuccess = () => resolve(normalizeManifest(request.result));
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

async function writeIndexedDb(manifest) {
    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE, 'readwrite');
        transaction.objectStore(IDB_STORE).put(manifest, 'manifest');
        transaction.oncomplete = () => {
            db.close();
            resolve();
        };
        transaction.onerror = () => reject(transaction.error);
    });
}

async function clearIndexedDb() {
    await new Promise((resolve) => {
        const request = indexedDB.deleteDatabase(IDB_NAME);
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
}

async function readManifest() {
    try {
        storageBackend = 'indexeddb';
        return await readIndexedDb();
    } catch {
        const root = await opfsRoot();
        if (!root) return defaultManifest();
        storageBackend = 'opfs';
        try {
            const handle = await root.getFileHandle(OPFS_FILE);
            const file = await handle.getFile();
            return normalizeManifest(JSON.parse(await file.text()));
        } catch {
            return defaultManifest();
        }
    }
}

async function writeManifest(manifest) {
    try {
        storageBackend = 'indexeddb';
        await writeIndexedDb(manifest);
        return;
    } catch {
        const root = await opfsRoot();
        if (!root) throw new Error('This browser could not keep the private recall index.');
        storageBackend = 'opfs';
        const handle = await root.getFileHandle(OPFS_FILE, { create: true });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(manifest));
        await writable.close();
    }
}

async function clearManifest() {
    const root = await opfsRoot();
    if (root) {
        try {
            await root.removeEntry(OPFS_FILE);
        } catch {
            // Missing local state is already clear.
        }
    }
    await clearIndexedDb();
}

function cleanText(value, max = MAX_TEXT_LENGTH) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function containsSecret(value) {
    return SECRET_PATTERNS.some((pattern) => pattern.test(value));
}

function contentHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function normalizeVector(values) {
    const vector = Array.from(values).slice(0, VECTOR_DIMENSIONS);
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / norm);
}

async function embed(text, type = 'document', title = '', { reportProgress = false } = {}) {
    if (!model || !tokenizer) throw new Error('Private recall is not ready.');
    const prefix = type === 'query'
        ? 'task: search result | query: '
        : `title: ${cleanText(title, 120) || 'none'} | text: `;
    const encoded = tokenizer.encode(`${prefix}${cleanText(text)}`);
    const ids = Array.from(encoded?.ids || []).slice(0, MODEL_SEQUENCE_LENGTH);
    if (!ids.length) throw new Error('There was not enough text to remember.');

    // EmbeddingGemma's LiteRT export has a fixed 1024-token input. Sending a
    // shorter tensor can leave delegated execution waiting instead of failing.
    const paddedIds = new Int32Array(MODEL_SEQUENCE_LENGTH);
    paddedIds.set(ids);
    const input = new Tensor(paddedIds, [1, MODEL_SEQUENCE_LENGTH]);
    let outputs;
    try {
        if (reportProgress) progress('indexing', 0.2, 'Running private recall on this device.');
        outputs = await model.run(input);
        if (reportProgress) progress('indexing', 0.8, 'Finishing the local index.');
        const list = Array.isArray(outputs) ? outputs : Object.values(outputs || {});
        if (!list.length) throw new Error('Private recall returned no result.');
        const values = await list[0].data();
        return normalizeVector(values);
    } finally {
        input.delete();
        const list = Array.isArray(outputs) ? outputs : Object.values(outputs || {});
        list.forEach((output) => output?.delete?.());
    }
}

function cosine(left, right) {
    let score = 0;
    for (let index = 0; index < VECTOR_DIMENSIONS; index += 1) score += left[index] * right[index];
    return score;
}

async function handlePrepare(payload) {
    const runtime = await prepareRuntime(payload.wasmBaseUrl);
    const manifest = await readManifest();
    if (!manifest.enabled) {
        manifest.enabled = true;
        await writeManifest(manifest);
    }
    let persistent = false;
    try {
        persistent = Boolean(await navigator.storage.persisted?.());
    } catch {
        persistent = false;
    }
    return {
        ...runtime,
        count: manifest.items.length,
        storage: storageBackend,
        persistent,
    };
}

async function handlePreference(payload) {
    const manifest = await readManifest();
    if (typeof payload.enabled === 'boolean' && payload.enabled !== manifest.enabled) {
        manifest.enabled = payload.enabled;
        await writeManifest(manifest);
    }
    return { enabled: manifest.enabled, storage: storageBackend };
}

async function handleSync(payload) {
    const incoming = Array.isArray(payload.items) ? payload.items.slice(0, MAX_ITEMS) : [];
    const current = await readManifest();
    const existing = new Map(current.items.map((item) => [item.id, item]));
    const nextItems = [];
    let skipped = 0;

    for (let index = 0; index < incoming.length; index += 1) {
        const source = incoming[index] || {};
        const id = cleanText(source.id, 160);
        const text = cleanText(source.text);
        const title = cleanText(source.title, 120) || 'Saved here';
        if (!id || text.length < 6 || containsSecret(text)) {
            skipped += 1;
            continue;
        }
        const hash = contentHash(`${title}\n${text}`);
        const previous = existing.get(id);
        let vector = previous?.contentHash === hash ? previous.vector : null;
        if (!Array.isArray(vector) || vector.length !== VECTOR_DIMENSIONS) {
            progress('indexing', index / Math.max(1, incoming.length), `Remembering ${index + 1} of ${incoming.length}.`);
            vector = await embed(text, 'document', title, { reportProgress: true });
        }
        nextItems.push({
            id,
            kind: cleanText(source.kind, 24) || 'saved',
            title,
            text,
            savedAt: cleanText(source.savedAt, 64),
            contentHash: hash,
            vector,
        });
    }

    const manifest = { schema_version: SCHEMA_VERSION, enabled: current.enabled, items: nextItems };
    await writeManifest(manifest);
    progress('ready', 1, 'Ready offline.');
    return { count: nextItems.length, skipped, storage: storageBackend };
}

async function handleSearch(payload) {
    const query = cleanText(payload.query, 1000);
    if (query.length < 6 || containsSecret(query)) return { matches: [] };
    const manifest = await readManifest();
    if (!manifest.items.length) return { matches: [] };
    const queryVector = await embed(query, 'query');
    const limit = Math.max(1, Math.min(3, Number(payload.limit) || 2));
    const matches = manifest.items
        .map((item) => ({ ...item, score: cosine(queryVector, item.vector) }))
        .filter((item) => item.score >= 0.34)
        .sort((left, right) => right.score - left.score)
        .slice(0, limit)
        .map(({ vector, contentHash: _contentHash, ...item }) => ({
            ...item,
            score: Number(item.score.toFixed(4)),
            text: item.text.slice(0, 700),
        }));
    return { matches };
}

async function handleClear() {
    await Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(RUNTIME_CACHE_NAME),
    ]);
    await clearManifest();
    model?.delete?.();
    model = null;
    tokenizer = null;
    if (runtimeLoaded) unloadLiteRt();
    runtimeLoaded = false;
    accelerator = 'wasm';
    storageBackend = '';
    return { cleared: true };
}

async function handle(type, payload) {
    if (type === 'preference') return handlePreference(payload || {});
    if (type === 'prepare') return handlePrepare(payload || {});
    if (type === 'sync') return handleSync(payload || {});
    if (type === 'search') return handleSearch(payload || {});
    if (type === 'clear') return handleClear();
    throw new Error('Unknown private recall request.');
}

self.addEventListener('message', (event) => {
    const { id, type, payload } = event.data || {};
    operationQueue = operationQueue
        .then(async () => {
            const result = await handle(type, payload);
            self.postMessage({ type: 'response', id, ok: true, result });
        })
        .catch((error) => {
            self.postMessage({ type: 'response', id, ok: false, error: error?.message || 'Private recall failed.' });
        });
});
