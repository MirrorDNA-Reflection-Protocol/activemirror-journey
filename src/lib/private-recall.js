import { assessLocalMirrorSense } from './local-mirror-sense.js';
import { getPrivateRecallPreference, setPrivateRecallPreference } from './mirror-state.js';

export const PRIVATE_RECALL_MODEL_BYTES = 183_329_528;
export const PRIVATE_RECALL_TOKENIZER_BYTES = 21_480_142;
export const PRIVATE_RECALL_RUNTIME_BYTES = 9_272_337;
export const PRIVATE_RECALL_DOWNLOAD_BYTES = PRIVATE_RECALL_MODEL_BYTES
    + PRIVATE_RECALL_TOKENIZER_BYTES
    + PRIVATE_RECALL_RUNTIME_BYTES;
export const PRIVATE_RECALL_MAX_ITEMS = 48;

const REQUIRED_FREE_BYTES = 280_000_000;
const listeners = new Set();
const pending = new Map();

let worker = null;
let requestId = 0;
let snapshot = {
    enabled: readPreference(),
    ready: false,
    phase: readPreference() ? 'waiting' : 'off',
    progress: 0,
    message: readPreference() ? 'Ready when you need it.' : '',
    count: 0,
    storage: '',
    accelerator: '',
    persistent: false,
    error: '',
};

function readPreference() {
    return getPrivateRecallPreference();
}

async function persistPreference(enabled) {
    setPrivateRecallPreference(enabled);
}

function updateSnapshot(next) {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener(snapshot));
    return snapshot;
}

function privateRecallWasmBaseUrl() {
    const base = String(import.meta.env.BASE_URL || '/');
    const path = import.meta.env.DEV
        ? '/node_modules/@litertjs/core/wasm/'
        : `${base.endsWith('/') ? base : `${base}/`}assets/litert/wasm/`;
    return new URL(path, window.location.origin).href;
}

function supportError() {
    if (typeof Worker === 'undefined') return 'This browser cannot run recall in the background.';
    if (!globalThis.crypto?.subtle) return 'This browser cannot verify the private recall download.';
    if (!globalThis.caches) return 'This browser cannot keep private recall for offline use.';
    if (!navigator.storage) return 'This browser does not expose private local storage.';
    return '';
}

function ensureWorker() {
    const unsupported = supportError();
    if (unsupported) throw new Error(unsupported);
    if (worker) return worker;

    worker = import.meta.env.DEV
        ? new Worker('/__private_recall_worker.js')
        : new Worker(new URL('../workers/private-recall.worker.js', import.meta.url));
    worker.addEventListener('message', (event) => {
        const message = event.data || {};
        if (message.type === 'progress') {
            updateSnapshot({
                phase: message.phase || snapshot.phase,
                progress: Number.isFinite(message.progress) ? message.progress : snapshot.progress,
                message: message.message || snapshot.message,
                error: '',
            });
            return;
        }

        if (message.type !== 'response') return;
        const request = pending.get(message.id);
        if (!request) return;
        pending.delete(message.id);
        if (message.ok) request.resolve(message.result || {});
        else request.reject(new Error(message.error || 'Private recall could not finish.'));
    });
    worker.addEventListener('error', () => {
        const error = new Error('Private recall stopped in this browser.');
        pending.forEach((request) => request.reject(error));
        pending.clear();
        updateSnapshot({ ready: false, phase: 'error', error: error.message });
    });
    return worker;
}

function stopWorker() {
    if (worker) worker.terminate();
    worker = null;
    pending.forEach((request) => request.reject(new Error('Private recall was stopped.')));
    pending.clear();
}

function request(type, payload = {}) {
    const activeWorker = ensureWorker();
    const id = `recall-${Date.now()}-${++requestId}`;
    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        activeWorker.postMessage({ id, type, payload });
    });
}

async function prepare() {
    const result = await request('prepare', { wasmBaseUrl: privateRecallWasmBaseUrl() });
    await persistPreference(true);
    return updateSnapshot({
        enabled: true,
        ready: true,
        phase: 'ready',
        progress: 1,
        message: result.cached ? 'Ready offline.' : 'Private recall is ready.',
        count: result.count || 0,
        storage: result.storage || '',
        accelerator: result.accelerator || 'wasm',
        persistent: Boolean(result.persistent),
        error: '',
    });
}

export function getPrivateRecallSnapshot() {
    return snapshot;
}

export function subscribePrivateRecall(listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
}

export async function restorePrivateRecallPreference() {
    if (snapshot.enabled) return snapshot;
    if (supportError()) return snapshot;
    let enabled = false;
    try {
        enabled = Boolean((await request('preference')).enabled);
    } catch {
        enabled = false;
    }
    if (!enabled) {
        stopWorker();
        return snapshot;
    }
    setPrivateRecallPreference(true);
    return updateSnapshot({ enabled: true, ready: false, phase: 'waiting', message: 'Ready when you need it.', error: '' });
}

export async function enablePrivateRecall() {
    const unsupported = supportError();
    if (unsupported) {
        updateSnapshot({ phase: 'error', error: unsupported });
        throw new Error(unsupported);
    }

    updateSnapshot({
        phase: 'preparing',
        progress: 0,
        message: navigator.onLine ? 'Checking this browser, then starting the download.' : 'Looking for private recall on this device.',
        error: '',
    });

    let estimate = null;
    try {
        estimate = await navigator.storage.estimate?.();
    } catch {
        // Quota reporting is optional; the verified download remains authoritative.
    }
    const available = estimate?.quota && Number.isFinite(estimate.usage)
        ? estimate.quota - estimate.usage
        : null;
    if (available !== null && available < REQUIRED_FREE_BYTES) {
        const error = 'This browser needs about 280 MB of free site storage for private recall.';
        updateSnapshot({ phase: 'error', error });
        throw new Error(error);
    }

    let persistent = false;
    try {
        persistent = Boolean(await navigator.storage.persist?.());
    } catch {
        persistent = false;
    }

    updateSnapshot({ persistent, message: navigator.onLine ? 'Starting the one-time download.' : 'Looking for private recall on this device.' });
    try {
        const next = await prepare();
        return updateSnapshot({ ...next, persistent: next.persistent || persistent });
    } catch (error) {
        updateSnapshot({ ready: false, phase: 'error', error: error.message });
        throw error;
    }
}

export async function resumePrivateRecall() {
    if (!snapshot.enabled || snapshot.ready || snapshot.phase === 'preparing') return snapshot;
    updateSnapshot({ phase: 'preparing', progress: 0, message: 'Opening private recall.', error: '' });
    try {
        return await prepare();
    } catch (error) {
        updateSnapshot({ ready: false, phase: 'error', error: error.message });
        throw error;
    }
}

export async function syncPrivateRecallItems(items = []) {
    if (!snapshot.enabled || !snapshot.ready) return snapshot;
    const result = await request('sync', { items: items.slice(0, PRIVATE_RECALL_MAX_ITEMS) });
    return updateSnapshot({
        count: result.count || 0,
        phase: 'ready',
        progress: 1,
        message: result.skipped ? `${result.count || 0} saved. ${result.skipped} skipped.` : 'Ready offline.',
        error: '',
    });
}

export async function searchPrivateRecall(query) {
    const clean = String(query || '').trim();
    if (!snapshot.enabled || !snapshot.ready || clean.length < 6) return [];
    const result = await request('search', { query: clean, limit: 2 });
    return Array.isArray(result.matches) ? result.matches : [];
}

export async function turnOffPrivateRecall() {
    setPrivateRecallPreference(false);
    const next = updateSnapshot({
        enabled: false,
        ready: false,
        phase: 'off',
        progress: 0,
        message: 'Downloaded files kept on this device.',
        accelerator: '',
        error: '',
    });
    try {
        await request('preference', { enabled: false });
    } catch {
        // Turning off still applies to this session if the marker cannot be reached.
    } finally {
        await persistPreference(false);
        stopWorker();
    }
    return next;
}

export async function clearPrivateRecall() {
    try {
        await request('clear');
    } finally {
        await persistPreference(false);
        stopWorker();
        updateSnapshot({
            enabled: false,
            ready: false,
            phase: 'off',
            progress: 0,
            message: 'Private recall removed from this device.',
            count: 0,
            storage: '',
            accelerator: '',
            persistent: false,
            error: '',
        });
    }
    return snapshot;
}

function compactText(parts = []) {
    return parts
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join('\n')
        .replace(/\s{3,}/g, ' ')
        .slice(0, 1800);
}

function recallItem({ id, kind, title, text, savedAt }) {
    const cleanText = compactText([text]);
    if (!id || cleanText.length < 6) return null;
    if (assessLocalMirrorSense(cleanText).hardPrivate) return null;
    return {
        id: String(id).slice(0, 160),
        kind: String(kind || 'saved').slice(0, 24),
        title: String(title || 'Saved here').trim().slice(0, 120),
        text: cleanText,
        savedAt: String(savedAt || ''),
    };
}

export function buildPrivateRecallItems({ savedChats = [], continuity = [], mirrorDefaults = [] } = {}) {
    const items = [];

    savedChats.forEach((entry) => {
        const mirror = entry?.thread?.result?.mirror || {};
        const item = recallItem({
            id: `chat:${entry?.id || entry?.savedAt || items.length}`,
            kind: 'chat',
            title: entry?.title || entry?.thread?.lastIntent || 'Saved chat',
            text: compactText([
                entry?.thread?.lastIntent,
                mirror.reflection,
                mirror.question,
                mirror.move,
                entry?.thread?.sendableDraft?.content,
            ]),
            savedAt: entry?.savedAt,
        });
        if (item) items.push(item);
    });

    continuity.forEach((entry, index) => {
        const item = recallItem({
            id: `continuity:${entry?.id || entry?.key || entry?.savedAt || index}`,
            kind: 'saved',
            title: entry?.intent || entry?.question || 'Saved reflection',
            text: compactText([entry?.intent, entry?.question, entry?.move]),
            savedAt: entry?.savedAt || entry?.createdAt,
        });
        if (item) items.push(item);
    });

    mirrorDefaults.forEach((entry, index) => {
        const item = recallItem({
            id: `default:${entry?.id || entry?.key || entry?.savedAt || index}`,
            kind: 'pattern',
            title: entry?.question || 'Saved pattern',
            text: compactText([entry?.question, entry?.move]),
            savedAt: entry?.savedAt || entry?.createdAt,
        });
        if (item) items.push(item);
    });

    const unique = new Map();
    items.forEach((item) => unique.set(item.id, item));
    return [...unique.values()].slice(0, PRIVATE_RECALL_MAX_ITEMS);
}

export function privateRecallItemsFingerprint(items = []) {
    return items.map((item) => `${item.id}:${item.savedAt}:${item.text.length}`).join('|');
}
