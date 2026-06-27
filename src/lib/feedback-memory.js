const FEEDBACK_KEY = 'active_mirror_feedback_v1';
const MAX_FEEDBACK = 80;

function storage() {
    if (typeof window === 'undefined') return null;

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function clean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : undefined;
    return String(value || '')
        .replace(/[^a-zA-Z0-9_./:-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80);
}

function metadataFromResult(result = {}) {
    const mirror = result.mirror || {};

    return {
        route: clean(result.route?.capability || 'reflection'),
        truthState: clean(result.truth_state?.status || mirror.truth_state?.status || 'unknown'),
        visualKind: clean(mirror.visual?.kind || 'none'),
        fallback: Boolean(result.fallback),
    };
}

export function recordMirrorFeedback({ page = 'mirror', surface = 'reflection', turn = 1, label = '', result = {} } = {}) {
    const target = storage();
    if (!target) return null;

    const entry = {
        ts: new Date().toISOString(),
        page: clean(page),
        surface: clean(surface),
        turn: clean(turn),
        label: clean(label),
        ...metadataFromResult(result),
    };

    try {
        const existing = JSON.parse(target.getItem(FEEDBACK_KEY) || '[]');
        const next = Array.isArray(existing) ? [...existing, entry].slice(-MAX_FEEDBACK) : [entry];
        target.setItem(FEEDBACK_KEY, JSON.stringify(next));
        return entry;
    } catch {
        target.removeItem(FEEDBACK_KEY);
        return null;
    }
}

export function getMirrorFeedbackMetadata() {
    const target = storage();
    if (!target) return [];

    try {
        const parsed = JSON.parse(target.getItem(FEEDBACK_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
