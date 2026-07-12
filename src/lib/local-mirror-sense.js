const HARD_PRIVATE_PATTERNS = [
    /\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{16,}\b/i,
    /\b(?:api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{6,}/i,
    /\b(?:my|the)\s+(?:password|passcode|otp|pin|token|api key|secret)\s+(?:is|=|:)\s*\S{4,}/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
];

const SOFT_PRIVATE_PATTERNS = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:\+?\d[\d\s().-]{8,}\d)\b/,
    /\b(?:account|passport|aadhaar|pan|ssn|otp|pin)\b/i,
];

const DRIFT_PATTERNS = [
    /\b(all of this|everything|what else|do it all|make it perfect|all the possibilities)\b/i,
    /\b(i'?m confused|too much|overwhelmed|going in circles|round and round)\b/i,
];

const STOP_WORDS = new Set([
    'about', 'after', 'again', 'also', 'because', 'being', 'could', 'every', 'from',
    'have', 'into', 'just', 'like', 'more', 'need', 'that', 'their', 'there', 'thing',
    'this', 'want', 'what', 'when', 'where', 'which', 'with', 'would', 'your',
]);

export const SESSION_CONTEXT_MAX_MESSAGES = 4;

export const CONVERSATION_PERSONALITY_CONTRACT = Object.freeze({
    voice: 'curious, calm, perceptive, lightly opinionated, occasionally playful',
    boundaries: 'never a guru or therapist',
    conversation: 'may stay with the user without prescribing action',
});

const EXPLICIT_REFLECTION_PATTERN = /\b(?:help me (?:decide|choose|figure out|plan|fix|solve|understand)|what should i do|what do i do|how should i|which (?:one|option) should i|give me (?:advice|a recommendation|a plan|a next step|a next move)|(?:next|best) (?:step|move)|make (?:a|the) decision|compare (?:my|the|these) options)\b/i;
const EXPLICIT_CHAT_PATTERN = /\b(?:just talk|talk (?:to|with) me|chat with me|keep me company|no advice|without advice|no exercises?|without exercises?|no homework|tell me a joke|make me laugh|be silly|how are you)\b/i;
const BARE_GREETING_PATTERN = /^(?:hey|hi|hello|yo|how are you|what'?s up)[\s.!?]*$/i;
const SESSION_CONTEXT_TONES = new Set(['warm', 'direct', 'short', 'careful', 'playful']);

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

export function maskSoftPrivateText(value) {
    return cleanText(value)
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
        .replace(/(^|[^\w])\+?\d[\d\s().-]{8,}\d\b/g, '$1[phone]')
        .replace(/\b(account|passport|aadhaar|pan|ssn|otp|pin)\b\s*(?:number|no\.?|#)?\s*[:=]?\s*[A-Z0-9-]{4,}/gi, '$1 [detail]');
}

function maskSessionContextText(value, limit = 480) {
    return maskSoftPrivateText(value)
        .replace(/\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{8,}\b/gi, '[secret]')
        .replace(/\b(api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{4,}/gi, '$1: [secret]')
        .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi, '[private key]')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
}

export function conversationRouteFor(intent, { source = 'typed' } = {}) {
    const text = cleanText(intent);
    if (source !== 'typed' || !text || EXPLICIT_REFLECTION_PATTERN.test(text)) return 'reflection';
    if (EXPLICIT_CHAT_PATTERN.test(text) || BARE_GREETING_PATTERN.test(text)) return 'chat';
    return 'reflection';
}

export function normalizeSessionContextMessages(messages = []) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter((message) => ['user', 'assistant'].includes(message?.role))
        .map((message) => ({
            role: message.role,
            content: maskSessionContextText(message?.content),
        }))
        .filter((message) => message.content)
        .slice(-SESSION_CONTEXT_MAX_MESSAGES);
}

export function appendSessionContextMessages(messages = [], nextMessages = []) {
    const additions = Array.isArray(nextMessages) ? nextMessages : [nextMessages];
    return normalizeSessionContextMessages([
        ...normalizeSessionContextMessages(messages),
        ...additions,
    ]);
}

export function buildSessionContextEnvelope({ mode = 'reflection', tone = '', messages = [] } = {}) {
    const normalizedMode = mode === 'conversation' ? 'conversation' : 'reflection';
    const toneValue = cleanText(tone).toLowerCase();
    const normalizedTone = SESSION_CONTEXT_TONES.has(toneValue) ? toneValue : '';
    return {
        schema_version: 'session_context.v0_1',
        source: 'session',
        durable: false,
        mode: normalizedMode,
        ...(normalizedTone ? { tone: normalizedTone } : {}),
        turns: normalizeSessionContextMessages(messages),
    };
}

function tokenize(value) {
    return cleanText(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function uniqueDefaults(activeDefault, mirrorDefaults = []) {
    const seen = new Set();
    return [activeDefault, ...mirrorDefaults].filter(Boolean).filter((item) => {
        const key = `${item.question || ''}::${item.move || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return item.question || item.move;
    });
}

function scoreDefault(intentTokens, item) {
    const defaultTokens = tokenize(`${item.question || ''} ${item.move || ''}`);
    if (!intentTokens.length || !defaultTokens.length) return 0;

    const defaultSet = new Set(defaultTokens);
    const overlap = intentTokens.filter((token) => defaultSet.has(token)).length;
    const directPhrase = cleanText(item.move).length > 18
        && cleanText(item.move).toLowerCase().includes(cleanText(intentTokens.slice(0, 4).join(' ')))
        ? 0.2
        : 0;

    return overlap / Math.max(4, Math.min(intentTokens.length, defaultTokens.length)) + directPhrase;
}

export function assessLocalMirrorSense(intent, { activeDefault = null, mirrorDefaults = [], seed = null } = {}) {
    const text = cleanText(intent);
    const intentTokens = tokenize(text);
    const hardPrivate = HARD_PRIVATE_PATTERNS.some((pattern) => pattern.test(text));
    const softPrivate = SOFT_PRIVATE_PATTERNS.some((pattern) => pattern.test(text));
    const broadByLength = text.length > 420 || text.split(/[.?!]\s+/).filter(Boolean).length > 3;
    const broadByPattern = DRIFT_PATTERNS.some((pattern) => pattern.test(text));
    const defaults = uniqueDefaults(activeDefault, mirrorDefaults);
    const scoredDefaults = defaults
        .map((item) => ({ item, score: scoreDefault(intentTokens, item) }))
        .sort((a, b) => b.score - a.score);
    const best = scoredDefaults[0];
    const approvedDefault = best && best.score >= 0.24 ? best.item : null;
    const setupPreferences = [
        ...(Array.isArray(seed?.preferences) ? seed.preferences : []),
        ...(Array.isArray(seed?.mirrorSeed?.preferences) ? seed.mirrorSeed.preferences : []),
        ...(Array.isArray(seed?.blueprint?.preferences) ? seed.blueprint.preferences : []),
    ];
    const setupChoices = [
        ...setupPreferences.map((item) => item?.answer),
        seed?.blueprint?.help?.label,
        seed?.blueprint?.boundary?.label,
        seed?.blueprint?.directness?.label || seed?.blueprint?.memory?.label,
    ].filter(Boolean);
    const replyStyle = setupPreferences.find((item) => item?.preference === 'reply_style')?.answer;
    const toneCue = replyStyle ? cleanText(replyStyle) : '';
    const seedSummary = seed
        ? [
            seed.archetypeName || seed.archetype || '',
            seed.strengths?.length ? seed.strengths.slice(0, 2).join(', ') : '',
            setupChoices.length ? `choices: ${setupChoices.slice(0, 5).join(', ')}` : '',
        ].filter(Boolean).join('; ')
        : '';

    const cues = [];
    if (seedSummary) {
        cues.push({
            kind: 'memory',
            tone: 'good',
            label: 'Using your choices.',
        });
    }
    if (approvedDefault) {
        cues.push({
            kind: 'memory',
            tone: 'good',
            label: 'Using your choices.',
        });
    }
    if (broadByLength || broadByPattern) {
        cues.push({
            kind: 'drift',
            tone: 'steady',
            label: 'Keeping it small.',
        });
    }
    if (softPrivate && !hardPrivate) {
        cues.push({
            kind: 'privacy',
            tone: 'caution',
            label: 'Mask real details.',
        });
    }
    if (hardPrivate) {
        cues.push({
            kind: 'privacy',
            tone: 'block',
            label: 'Mask the secret.',
        });
    }

    return {
        hasText: text.length > 0,
        blocked: hardPrivate,
        sensitive: hardPrivate || softPrivate,
        hardPrivate,
        softPrivate,
        drift: broadByLength || broadByPattern,
        approvedDefault,
        seedSummary,
        toneCue,
        cues,
    };
}

export function buildLocalSenseContext(sense, userIntent) {
    const lines = [];
    if (sense?.seedSummary) {
        lines.push(`User-approved local profile summary: ${sense.seedSummary}.`);
    }
    if (sense?.approvedDefault) {
        lines.push(`User-approved working pattern: question "${sense.approvedDefault.question || 'not set'}"; next move "${sense.approvedDefault.move || 'not set'}".`);
    }
    if (sense?.drift) {
        lines.push('Local browser sense: keep the response narrow, practical, and limited to one next move.');
    }
    lines.push(`User intent: ${maskSoftPrivateText(userIntent)}`);
    return lines.join('\n');
}
