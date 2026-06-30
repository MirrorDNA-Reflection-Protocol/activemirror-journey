/**
 * mirror-state.js — Single source of truth for user state across all pages.
 *
 * ALL localStorage reads/writes go through here.
 * New pages import from here. Never read localStorage directly.
 *
 * Keys managed:
 *   mirrorState_v1  — unified state object (canonical)
 *
 * Legacy keys (read for migration, never written):
 *   brainScan_archetype, mirrorArchetype, mirrorId,
 *   mirrorSigData, mirrorBrainId, mirrorBlueprint,
 *   mirrorIntake_draft, mirrorIntake_complete
 */

const STATE_KEY = 'mirrorState_v1';

// ── Default State ──

const DEFAULT_STATE = {
    // BrainScan output
    archetype: null,       // "architect", "builder", etc.
    archetypeName: null,   // "The Architect"
    twin: null,            // "guardian", "scout", etc.
    twinName: null,        // "Guardian"
    strengths: [],
    blindSpots: [],
    mirrorId: null,        // "0x..."
    brainId: null,         // Brain API ID
    preferences: [],        // Explicit user choices from setup
    mirrorSeed: null,       // Portable Mirror ID object generated from setup

    // MirrorIntake output
    blueprint: null,       // Full blueprint object
    intakeComplete: false,
    intakeDraft: null,     // Partial form state (auto-save)

    // Explicitly approved working defaults
    activeDefault: null,    // { question, move, source, savedAt }
    mirrorDefaults: [],     // Recent approved defaults, newest first

    // Timestamps
    brainScanCompletedAt: null,
    intakeCompletedAt: null,
};

// ── Core API ──

function _read() {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {}

    // Migrate from legacy keys on first read
    return _migrateLegacy();
}

function _write(state) {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        // Also write legacy keys for backwards compat with pages not yet migrated
        if (state.archetype) {
            localStorage.setItem('brainScan_archetype', state.archetype);
            localStorage.setItem('mirrorArchetype', state.archetype);
        }
        if (state.mirrorId) {
            localStorage.setItem('mirrorId', state.mirrorId);
        }
        if (state.blueprint) {
            localStorage.setItem('mirrorBlueprint', JSON.stringify(state.blueprint));
        }
    } catch {}
}

function _migrateLegacy() {
    const state = { ...DEFAULT_STATE };
    try {
        // BrainScan data
        const sigData = localStorage.getItem('mirrorSigData');
        if (sigData) {
            const sig = JSON.parse(sigData);
            state.archetype = sig.archetype || null;
            state.archetypeName = sig.archetypeName || null;
            state.twin = sig.twin || null;
            state.twinName = sig.twinName || null;
            state.strengths = sig.strengths || [];
            state.blindSpots = sig.blindSpots || [];
            state.mirrorId = sig.mirrorId || null;
            state.brainScanCompletedAt = sig.completedAt || null;
        } else {
            state.archetype = localStorage.getItem('brainScan_archetype')
                || localStorage.getItem('mirrorArchetype')
                || localStorage.getItem('cognitiveArchetype')
                || null;
            state.mirrorId = localStorage.getItem('mirrorId') || null;
        }

        state.brainId = localStorage.getItem('mirrorBrainId') || null;

        // Intake data
        const bp = localStorage.getItem('mirrorBlueprint');
        if (bp) state.blueprint = JSON.parse(bp);
        state.intakeComplete = localStorage.getItem('mirrorIntake_complete') === 'true';
        const draft = localStorage.getItem('mirrorIntake_draft');
        if (draft) state.intakeDraft = JSON.parse(draft);
    } catch {}

    // Write migrated state
    _write(state);
    return state;
}

// ── Public API ──

/** Get full state. */
export function getState() {
    return _read();
}

/** Update state (partial merge). */
export function setState(updates) {
    const current = _read();
    const next = { ...current, ...updates };
    _write(next);
    return next;
}

/** Save BrainScan results (called from Start.jsx COMPLETE phase). */
export function saveBrainScan({ archetype, archetypeName, twin, twinName, strengths, blindSpots, mirrorId, brainId, preferences, mirrorSeed }) {
    return setState({
        archetype,
        archetypeName: archetypeName || null,
        twin: twin || null,
        twinName: twinName || null,
        strengths: strengths || [],
        blindSpots: blindSpots || [],
        mirrorId: mirrorId || null,
        brainId: brainId || null,
        preferences: Array.isArray(preferences) ? preferences : [],
        mirrorSeed: mirrorSeed || null,
        brainScanCompletedAt: new Date().toISOString(),
    });
}

/** Import a downloaded Active Mirror choices file. */
export function importMirrorSettings(settings = {}) {
    const seed = settings?.schema ? settings : settings?.mirrorSeed;
    if (!seed || typeof seed !== 'object' || !String(seed.schema || '').startsWith('active-mirror-id/')) {
        throw new Error('invalid_active_mirror_settings');
    }

    const createdAt = seed.createdAt || settings.createdAt || new Date().toISOString();
    const preferences = Array.isArray(seed.preferences) ? seed.preferences : [];
    const mirrorSeed = {
        ...seed,
        createdAt,
    };
    const blueprint = {
        kind: 'saved-choices',
        firstUse: seed.entry || null,
        startingStyle: seed.styleHint?.label || null,
        preferences,
        mirrorSeed,
        startPrompt: seed.firstReflection || '',
        completedAt: createdAt,
    };

    return setState({
        archetype: seed.styleHint?.archetype || null,
        archetypeName: seed.styleHint?.label || null,
        strengths: [],
        blindSpots: seed.entry?.label ? [seed.entry.label] : [],
        mirrorId: seed.id || null,
        brainId: seed.brainId || null,
        preferences,
        mirrorSeed,
        brainScanCompletedAt: createdAt,
        blueprint,
        intakeComplete: true,
        intakeCompletedAt: createdAt,
    });
}

/** Save intake draft (auto-save from Setup.jsx). */
export function saveIntakeDraft(draft) {
    return setState({ intakeDraft: draft });
}

/** Load intake draft. */
export function getIntakeDraft() {
    return _read().intakeDraft;
}

/** Save completed blueprint (called from Setup.jsx blueprint phase). */
export function saveBlueprint(blueprint) {
    return setState({
        blueprint,
        intakeComplete: true,
        intakeCompletedAt: new Date().toISOString(),
    });
}

/** Get blueprint if exists. */
export function getBlueprint() {
    return _read().blueprint;
}

/** Get archetype info for display. */
export function getArchetype() {
    const s = _read();
    if (!s.archetype) return null;
    return {
        archetype: s.archetype,
        archetypeName: s.archetypeName,
        twin: s.twin,
        twinName: s.twinName,
        strengths: s.strengths,
        blindSpots: s.blindSpots,
        mirrorId: s.mirrorId,
        preferences: Array.isArray(s.preferences) ? s.preferences : [],
        mirrorSeed: s.mirrorSeed || null,
    };
}

/** Check if user completed BrainScan. */
export function hasBrainScan() {
    return !!_read().archetype;
}

/** Check if user completed Intake. */
export function hasIntake() {
    return _read().intakeComplete;
}

/** Get MirrorBalance mode string (for display). */
export function getMirrorMode() {
    const bp = _read().blueprint;
    return bp?.modeLabel || bp?.mode || null;
}

function cleanDefaultText(value, limit = 260) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function defaultMatches(item, key) {
    return Boolean(key)
        && (item?.savedAt === key || `${item?.question || ''}::${item?.move || ''}` === key);
}

function normalizeMirrorDefault({ question, move, source = 'reflection', savedAt } = {}) {
    return {
        question: cleanDefaultText(question),
        move: cleanDefaultText(move),
        source: cleanDefaultText(source, 48),
        savedAt: savedAt || new Date().toISOString(),
    };
}

/** Get the current approved browser-local default, if any. */
export function getActiveMirrorDefault() {
    return _read().activeDefault || null;
}

/** Get recent approved browser-local defaults, newest first. */
export function getMirrorDefaults() {
    const defaults = _read().mirrorDefaults;
    return Array.isArray(defaults) ? defaults : [];
}

/** Save one approved reflection pattern as a browser-local default. */
export function saveMirrorDefault({ question, move, source = 'reflection' } = {}) {
    const item = normalizeMirrorDefault({ question, move, source });

    if (!item.question && !item.move) return getActiveMirrorDefault();

    const current = _read();
    const existing = Array.isArray(current.mirrorDefaults) ? current.mirrorDefaults : [];
    const nextDefaults = [
        item,
        ...existing.filter((defaultItem) => (
            defaultItem?.question !== item.question || defaultItem?.move !== item.move
        )),
    ].slice(0, 5);

    return setState({
        activeDefault: item,
        mirrorDefaults: nextDefaults,
    }).activeDefault;
}

/** Make an existing approved default active again. */
export function useMirrorDefault(defaultItem) {
    const item = normalizeMirrorDefault(defaultItem);
    if (!item.question && !item.move) return clearMirrorDefault();
    return setState({ activeDefault: item }).activeDefault;
}

/** Edit an approved browser-local default by savedAt or question/move key. */
export function updateMirrorDefault(key, updates = {}) {
    const current = _read();
    const existing = Array.isArray(current.mirrorDefaults) ? current.mirrorDefaults : [];
    let updatedItem = null;
    const nextDefaults = existing.map((item) => {
        if (!defaultMatches(item, key)) return item;
        updatedItem = normalizeMirrorDefault({
            ...item,
            ...updates,
            source: item.source || updates.source || 'home',
            savedAt: item.savedAt || key,
        });
        return updatedItem;
    }).filter((item) => item.question || item.move);

    if (!updatedItem) return current;

    const activeDefault = defaultMatches(current.activeDefault, key)
        ? updatedItem
        : current.activeDefault;

    return setState({
        activeDefault,
        mirrorDefaults: nextDefaults.slice(0, 5),
    });
}

/** Delete an approved browser-local default by savedAt or question/move key. */
export function deleteMirrorDefault(key) {
    const current = _read();
    const existing = Array.isArray(current.mirrorDefaults) ? current.mirrorDefaults : [];
    const nextDefaults = existing.filter((item) => !defaultMatches(item, key));
    const activeDefault = defaultMatches(current.activeDefault, key) ? null : current.activeDefault;

    return setState({
        activeDefault,
        mirrorDefaults: nextDefaults,
    });
}

/** Clear the active default without deleting BrainScan or intake state. */
export function clearMirrorDefault() {
    return setState({ activeDefault: null }).activeDefault;
}

/** Clear all state (for testing/reset). */
export function clearState() {
    localStorage.removeItem(STATE_KEY);
    // Also clear legacy keys
    ['brainScan_archetype', 'mirrorArchetype', 'cognitiveArchetype',
     'mirrorId', 'mirrorSigData', 'mirrorBrainId',
     'mirrorBlueprint', 'mirrorIntake_draft', 'mirrorIntake_complete',
    ].forEach(k => localStorage.removeItem(k));
}
