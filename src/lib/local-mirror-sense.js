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

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

export function maskSoftPrivateText(value) {
    return cleanText(value)
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
        .replace(/(^|[^\w])\+?\d[\d\s().-]{8,}\d\b/g, '$1[phone]')
        .replace(/\b(account|passport|aadhaar|pan|ssn|otp|pin)\b\s*(?:number|no\.?|#)?\s*[:=]?\s*[A-Z0-9-]{4,}/gi, '$1 [detail]');
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
    const setupChoices = [
        ...(Array.isArray(seed?.preferences) ? seed.preferences.map((item) => item.answer) : []),
        ...(Array.isArray(seed?.blueprint?.preferences) ? seed.blueprint.preferences.map((item) => item.answer) : []),
        seed?.blueprint?.help?.label,
        seed?.blueprint?.boundary?.label,
        seed?.blueprint?.directness?.label || seed?.blueprint?.memory?.label,
    ].filter(Boolean);
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
