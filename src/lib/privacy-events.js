const EVENT_ENDPOINT = 'https://gateway.activemirror.ai/v1/events';
const REMOTE_EVENTS_ENABLED = import.meta.env?.VITE_ACTIVE_MIRROR_REMOTE_EVENTS === 'true';
const SESSION_KEY = 'active_mirror_event_session_v1';
const BUFFER_KEY = 'active_mirror_event_buffer_v1';
const MAX_BUFFERED_EVENTS = 30;

const ALLOWED_EVENTS = new Set([
    'home_view',
    'mirror_view',
    'starter_clicked',
    'followup_clicked',
    'mirror_submit',
    'mirror_result',
    'gateway_error',
    'ecosystem_result',
    'cta_clicked',
]);

const ALLOWED_DETAIL_KEYS = new Set([
    'page',
    'surface',
    'source',
    'route',
    'status',
    'fallback',
    'visualKind',
    'turn',
    'target',
]);

function safeStorage(kind) {
    try {
        return kind === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
        return null;
    }
}

function randomId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    globalThis.crypto?.getRandomValues?.(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getPrivacySessionId() {
    const storage = safeStorage('session');
    if (!storage) return randomId();

    const existing = storage.getItem(SESSION_KEY);
    if (existing) return existing;

    const next = randomId();
    storage.setItem(SESSION_KEY, next);
    return next;
}

function cleanValue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : undefined;
    return String(value || '')
        .replace(/[^a-zA-Z0-9_./:-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80);
}

function makePayload(eventName, details = {}) {
    if (!ALLOWED_EVENTS.has(eventName)) return null;

    const payload = {
        event: eventName,
        session: getPrivacySessionId().slice(0, 36),
        ts: new Date().toISOString(),
    };

    Object.entries(details).forEach(([key, value]) => {
        if (!ALLOWED_DETAIL_KEYS.has(key)) return;
        const clean = cleanValue(value);
        if (clean !== undefined && clean !== '') payload[key] = clean;
    });

    return payload;
}

function rememberLocally(payload) {
    const storage = safeStorage('session');
    if (!storage) return;

    try {
        const existing = JSON.parse(storage.getItem(BUFFER_KEY) || '[]');
        const next = Array.isArray(existing) ? [...existing, payload].slice(-MAX_BUFFERED_EVENTS) : [payload];
        storage.setItem(BUFFER_KEY, JSON.stringify(next));
    } catch {
        storage.removeItem(BUFFER_KEY);
    }
}

export function trackEvent(eventName, details = {}) {
    if (typeof window === 'undefined') return;

    const payload = makePayload(eventName, details);
    if (!payload) return;

    rememberLocally(payload);

    if (!REMOTE_EVENTS_ENABLED) return;

    const body = JSON.stringify(payload);
    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'text/plain' });
            navigator.sendBeacon(EVENT_ENDPOINT, blob);
            return;
        }
    } catch {
        // Fall through to fetch; analytics must never break the product path.
    }

    fetch(EVENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    }).catch(() => {});
}
