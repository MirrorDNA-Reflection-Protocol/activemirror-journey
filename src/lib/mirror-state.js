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
const SESSION_CHAT_KEY = 'activeMirror_homeChat_session_v1';
const PRIVATE_RECALL_LEGACY_KEY = 'activeMirrorPrivateRecall.v1';
const SESSION_CONTEXT_MAX_MESSAGES = 4;

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
    continuityLedger: [],   // Explicitly saved browser-local continuity, newest first
    homeChat: {
        enabled: false,     // Explicit opt-in: keep the current chat on this browser
        thread: null,       // Latest home-page chat state, not promoted to memory
        savedThreads: [],    // Explicitly saved browser-local chats, newest first
    },
    privateRecall: {
        enabled: false,      // Consent flag only; recall files and text use origin-private stores
    },

    // Timestamps
    brainScanCompletedAt: null,
    intakeCompletedAt: null,
};

// ── Core API ──

function _read() {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (raw) return stripSessionContextFields({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}

    // Migrate from legacy keys on first read
    return _migrateLegacy();
}

function _write(state) {
    try {
        const safeState = stripSessionContextFields(state);
        localStorage.setItem(STATE_KEY, JSON.stringify(safeState));
        // Also write legacy keys for backwards compat with pages not yet migrated
        if (safeState.archetype) {
            localStorage.setItem('brainScan_archetype', safeState.archetype);
            localStorage.setItem('mirrorArchetype', safeState.archetype);
        }
        if (safeState.mirrorId) {
            localStorage.setItem('mirrorId', safeState.mirrorId);
        }
        if (safeState.blueprint) {
            localStorage.setItem('mirrorBlueprint', JSON.stringify(safeState.blueprint));
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
    const next = stripSessionContextFields({ ...current, ...updates });
    _write(next);
    return next;
}

/** Read and migrate the explicit private-recall consent flag. */
export function getPrivateRecallPreference() {
    const current = _read();
    if (current.privateRecall?.enabled === true) return true;
    try {
        if (localStorage.getItem(PRIVATE_RECALL_LEGACY_KEY) === 'enabled') {
            setState({ privateRecall: { enabled: true } });
            localStorage.removeItem(PRIVATE_RECALL_LEGACY_KEY);
            return true;
        }
    } catch {}
    return false;
}

/** Store only private-recall consent in the canonical browser state. */
export function setPrivateRecallPreference(enabled) {
    const next = setState({ privateRecall: { enabled: Boolean(enabled) } });
    try {
        localStorage.removeItem(PRIVATE_RECALL_LEGACY_KEY);
    } catch {}
    return Boolean(next.privateRecall?.enabled);
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

function normalizeMirrorDefault({ question, move, workingRead, source = 'reflection', savedAt } = {}) {
    return {
        question: cleanDefaultText(question),
        move: cleanDefaultText(move),
        workingRead: cleanDefaultText(workingRead),
        source: cleanDefaultText(source, 48),
        savedAt: savedAt || new Date().toISOString(),
    };
}

function normalizeContinuityEntry({ intent, question, move, workingRead, source = 'reflection', savedAt } = {}) {
    return {
        intent: cleanDefaultText(intent || question, 220),
        move: cleanDefaultText(move, 220),
        workingRead: cleanDefaultText(workingRead, 260),
        source: cleanDefaultText(source, 48),
        savedAt: savedAt || new Date().toISOString(),
    };
}

function cleanChatText(value, limit = 1000) {
    return String(value || '')
        .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[secret]')
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
        .replace(/\b(api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{4,}/gi, '$1: [secret]')
        .replace(/(^|[^\w])\+?\d[\d\s().-]{8,}\d\b/g, '$1[phone]')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
}

function stripSessionContextFields(value) {
    if (Array.isArray(value)) return value.map(stripSessionContextFields);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !['session_context', 'sessionContextTurns', 'sessionContextMessages'].includes(key))
            .map(([key, item]) => [key, stripSessionContextFields(item)])
    );
}

function normalizeSessionContextMessages(messages = []) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter((message) => ['user', 'assistant'].includes(message?.role))
        .map((message) => ({
            role: message.role,
            content: cleanChatText(message?.content, 480),
        }))
        .filter((message) => message.content)
        .slice(-SESSION_CONTEXT_MAX_MESSAGES);
}

function safeJsonClone(value, limit = 60000) {
    if (!value || typeof value !== 'object') return null;
    try {
        const text = JSON.stringify(value);
        if (text.length > limit) return null;
        return stripSessionContextFields(JSON.parse(text));
    } catch {
        return null;
    }
}

function normalizeHomeChatThread(thread = {}, { includeSessionContext = false } = {}) {
    const result = safeJsonClone(thread.result, 30000);
    const sendableDraft = safeJsonClone(thread.sendableDraft, 60000);
    const lastIntent = result?.kind === 'privacy_hold'
        ? ''
        : cleanChatText(thread.lastIntent, 1000);
    const draftText = cleanChatText(thread.draftText, 1000);

    if (!draftText && !lastIntent && !result && !sendableDraft) return null;

    const normalized = {
        version: 1,
        draftText,
        lastIntent,
        lastSource: cleanChatText(thread.lastSource || 'typed', 48),
        lastStarterKind: cleanChatText(thread.lastStarterKind || '', 48),
        result,
        sendableDraft,
        workSurfaceOpen: Boolean(thread.workSurfaceOpen),
        updatedAt: thread.updatedAt || new Date().toISOString(),
    };
    if (includeSessionContext) {
        normalized.sessionContextMessages = normalizeSessionContextMessages(thread.sessionContextMessages);
    }
    return normalized;
}

function savedChatTitle(thread = {}) {
    const mirror = thread.result?.mirror || {};
    return cleanChatText(
        thread.title
        || thread.lastIntent
        || mirror.question
        || mirror.move
        || 'Saved chat',
        80
    ) || 'Saved chat';
}

function normalizeSavedHomeChat(entry = {}) {
    const thread = normalizeHomeChatThread(entry.thread || entry);
    if (!thread) return null;
    const savedAt = entry.savedAt || new Date().toISOString();
    return {
        id: cleanChatText(entry.id || savedAt, 80),
        title: savedChatTitle({ ...thread, title: entry.title }),
        savedAt,
        thread,
    };
}

function normalizeSavedHomeChats(entries = []) {
    if (!Array.isArray(entries)) return [];
    return entries
        .map(normalizeSavedHomeChat)
        .filter(Boolean)
        .slice(0, 8);
}

function currentHomeChatState() {
    const current = _read();
    const homeChat = current.homeChat && typeof current.homeChat === 'object'
        ? current.homeChat
        : DEFAULT_STATE.homeChat;
    return {
        enabled: Boolean(homeChat.enabled),
        thread: normalizeHomeChatThread(homeChat.thread || {}),
        savedThreads: normalizeSavedHomeChats(homeChat.savedThreads || []),
    };
}

function readSessionChat() {
    try {
        const raw = sessionStorage.getItem(SESSION_CHAT_KEY);
        if (!raw) return null;
        return normalizeHomeChatThread(JSON.parse(raw), { includeSessionContext: true });
    } catch {
        return null;
    }
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
export function saveMirrorDefault({ question, move, workingRead, source = 'reflection' } = {}) {
    const item = normalizeMirrorDefault({ question, move, workingRead, source });

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

/** Get explicitly saved browser-local continuity entries, newest first. */
export function getContinuityLedger() {
    const entries = _read().continuityLedger;
    return Array.isArray(entries) ? entries : [];
}

/** Save one user-approved continuity entry. Never called automatically. */
export function saveContinuityEntry({ intent, question, move, workingRead, source = 'reflection' } = {}) {
    const item = normalizeContinuityEntry({ intent, question, move, workingRead, source });
    if (!item.intent && !item.move) return getContinuityLedger();

    const current = _read();
    const existing = Array.isArray(current.continuityLedger) ? current.continuityLedger : [];
    const nextLedger = [
        item,
        ...existing.filter((entry) => (
            entry?.intent !== item.intent || entry?.move !== item.move
        )),
    ].slice(0, 12);

    return setState({ continuityLedger: nextLedger }).continuityLedger;
}

/** Delete one saved continuity entry by timestamp. */
export function deleteContinuityEntry(key) {
    const current = _read();
    const existing = Array.isArray(current.continuityLedger) ? current.continuityLedger : [];
    return setState({
        continuityLedger: existing.filter((entry) => entry?.savedAt !== key),
    }).continuityLedger;
}

/** Clear user-approved continuity entries without deleting profile or defaults. */
export function clearContinuityLedger() {
    return setState({ continuityLedger: [] }).continuityLedger;
}

/** Get the explicit browser-local home chat continuity setting and thread. */
export function getHomeChatContinuity() {
    return currentHomeChatState();
}

/** Get the current tab/session chat. It survives refresh until the tab closes, but is not durable memory. */
export function getSessionHomeChat() {
    return readSessionChat();
}

/** Save current chat for refresh recovery in this browser session only. */
export function saveSessionHomeChat(thread = {}) {
    const normalized = normalizeHomeChatThread({
        ...thread,
        updatedAt: new Date().toISOString(),
    }, { includeSessionContext: true });
    try {
        if (!normalized) {
            sessionStorage.removeItem(SESSION_CHAT_KEY);
            return null;
        }
        sessionStorage.setItem(SESSION_CHAT_KEY, JSON.stringify(normalized));
    } catch {}
    return normalized;
}

/** Clear current tab/session chat without touching saved choices or explicit memory. */
export function clearSessionHomeChat() {
    try {
        sessionStorage.removeItem(SESSION_CHAT_KEY);
    } catch {}
    return null;
}

/** Enable or disable browser-local chat continuity. Disabling clears the thread. */
export function setHomeChatContinuityEnabled(enabled, thread = {}) {
    const current = currentHomeChatState();
    const nextEnabled = Boolean(enabled);
    return setState({
        homeChat: {
            enabled: nextEnabled,
            thread: nextEnabled ? normalizeHomeChatThread(thread || current.thread || {}) : null,
            savedThreads: current.savedThreads,
        },
    }).homeChat;
}

/** Save the current home chat only after the user has enabled browser-local continuity. */
export function saveHomeChatContinuity(thread = {}) {
    const current = currentHomeChatState();
    if (!current.enabled) return current;
    return setState({
        homeChat: {
            enabled: true,
            thread: normalizeHomeChatThread({
                ...thread,
                updatedAt: new Date().toISOString(),
            }),
            savedThreads: current.savedThreads,
        },
    }).homeChat;
}

/** Clear the current home chat without touching saved setup choices or approved notes. */
export function clearHomeChatContinuity({ keepEnabled = false } = {}) {
    const current = currentHomeChatState();
    return setState({
        homeChat: {
            enabled: Boolean(keepEnabled),
            thread: null,
            savedThreads: current.savedThreads,
        },
    }).homeChat;
}

/** Save the current home chat as an explicit browser-local checkpoint. */
export function saveHomeChatThread(thread = {}) {
    const current = currentHomeChatState();
    const normalizedThread = normalizeHomeChatThread(thread);
    if (!normalizedThread) return current.savedThreads;
    const savedAt = new Date().toISOString();
    const item = normalizeSavedHomeChat({
        id: savedAt,
        savedAt,
        thread: normalizedThread,
    });
    const nextSavedThreads = [
        item,
        ...current.savedThreads.filter((saved) => (
            saved.title !== item.title || saved.thread?.lastIntent !== item.thread?.lastIntent
        )),
    ].slice(0, 8);
    return setState({
        homeChat: {
            enabled: current.enabled,
            thread: current.thread,
            savedThreads: nextSavedThreads,
        },
    }).homeChat.savedThreads;
}

/** Restore an explicitly saved browser-local chat into the current chat slot. */
export function restoreHomeChatThread(key) {
    const current = currentHomeChatState();
    const match = current.savedThreads.find((saved) => saved.id === key || saved.savedAt === key);
    if (!match?.thread) return current;
    return setState({
        homeChat: {
            enabled: true,
            thread: normalizeHomeChatThread(match.thread),
            savedThreads: current.savedThreads,
        },
    }).homeChat;
}

/** Delete one explicitly saved browser-local chat. */
export function deleteHomeChatThread(key) {
    const current = currentHomeChatState();
    return setState({
        homeChat: {
            enabled: current.enabled,
            thread: current.thread,
            savedThreads: current.savedThreads.filter((saved) => saved.id !== key && saved.savedAt !== key),
        },
    }).homeChat.savedThreads;
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
    clearSessionHomeChat();
    // Also clear legacy keys
    ['brainScan_archetype', 'mirrorArchetype', 'cognitiveArchetype',
     'mirrorId', 'mirrorSigData', 'mirrorBrainId',
     'mirrorBlueprint', 'mirrorIntake_draft', 'mirrorIntake_complete', PRIVATE_RECALL_LEGACY_KEY,
    ].forEach(k => localStorage.removeItem(k));
}
