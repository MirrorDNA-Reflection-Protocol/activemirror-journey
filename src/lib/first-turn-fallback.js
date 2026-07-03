function cleanIntent(intent = '') {
    return String(intent || '')
        .replace(/\s+/g, ' ')
        .replace(/^["'`]+|["'`.!?]+$/g, '')
        .trim()
        .slice(0, 150);
}

function hasExplicitSecret(intent = '') {
    return [
        /\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{16,}\b/i,
        /\b(?:api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{6,}/i,
        /\b(?:my|the)\s+(?:password|passcode|otp|pin|token|api key|secret)\s+(?:is|=|:)\s*\S{4,}/i,
        /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    ].some((pattern) => pattern.test(intent));
}

function needsSourceCheck(text = '') {
    const explicitSourceAsk = /\b(2026|this year|recently|right now|current|latest|online|web|source|sources|research|competitor|market|verify|check|paper|study|studies|report|pricing|released|launched|who is doing)\b/.test(text);
    const timedFactAsk = /\b(today|right now|this week|this month|this year|as of)\b/.test(text)
        && /\b(news|market|price|pricing|competitor|research|source|verify|check|fact|facts|numbers|paper|study|studies|report|released|launched|happened|weather|stock|model|api)\b/.test(text);

    return explicitSourceAsk || timedFactAsk;
}

function isUnderSpecifiedIntent(text = '') {
    if (!text) return false;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length > 5) return false;
    if (/\b(make|create|build|write|draft|send|decide|choose|fix|repair|understand|explain|check|verify|research|compare|plan|launch|ship|test|learn)\b/.test(text)) {
        return false;
    }
    return /\b(website|business|money|career|idea|work|project|product|app|portfolio|content|strategy|relationship|habit|focus|school|job|life)\b/.test(text);
}

function classify(intent = '') {
    const text = cleanIntent(intent).toLowerCase();
    if (hasExplicitSecret(intent)) {
        return 'private_output';
    }
    if (/\b(models?|browser|ai apps?|apple|memory|genui)\b.*\bnow\b/.test(text)) {
        return 'source_check';
    }
    if (needsSourceCheck(text)) {
        return 'source_check';
    }
    if (!/\b(switch|whether|between|decid\w*|should i|should we|do i)\b/.test(text) && /\b(landing page|homepage|site|page)\b/.test(text) && /\b(brainscan|mirrorseed|enterprise|too much|first action|first screen|users?|button|copy|ads?)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/\b(decide|decision|choice|choos(?:e|ing)|between|whether|worth pursuing|pursue|do not know if|don't know if|should i|should we|should\b.*\bor\b|do i\b.*\bor\b|or switch|commit|quit|stay or leave|leave or stay)\b/.test(text)) {
        return 'decision';
    }
    if (/\b(real secret|actual secret|password|passcode|private key|api key|access token|otp|pin|credential)\b/.test(text)) {
        return 'private_output';
    }
    if (/\b(hallucinat\w*|overthink\w*|overwhelmed|scattered|spiral\w*|circles|too much|lost|losing the thread|too many ideas|cannot pick|can't pick|what else|lock\w* the next thing|less clear|feels urgent|feels obvious|adding tools|anxious|panic|tired|drift|drifting|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text) || /\b(i feel|i am|i'm|we are|we're)\b.*\b(confused|stuck|lost)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(site|page|product|homepage|copy|marketing|sales|sell|ads?|positioning|offer|user|customer|demo|public|proof|reflection|receipts?|systems?)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/\b(overwhelmed|scattered|confused|lost|losing the thread|too many ideas|cannot pick|can't pick|what else|lock\w* the next thing|less clear|feels urgent|feels obvious|adding tools|stuck|spiral\w*|circles|loop|too much|drift|drifting|anxious|panic|tired|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(draft|write|document|memo|email|pdf|deck|file|artifact|output|useful)\b/.test(text)) {
        return 'artifact';
    }
    if (isUnderSpecifiedIntent(text)) {
        return 'needs_detail';
    }
    return 'general';
}

const MIRRORS = {
    source_check: {
        reflection: 'This is worth checking before you build around it.',
        question: 'Which claim would change your next move if it turned out to be false?',
        move: 'Name that one claim, then check one current source before using it.',
    },
    private_output: {
        reflection: 'Use placeholders for anything private. I can still help with the useful part.',
        question: 'What do you want help making, deciding, or sending?',
        move: 'Replace names, keys, and account details with [name] or [detail], then send the useful version.',
    },
    needs_detail: {
        reflection: 'I can start, but I need one direction so I do not guess.',
        question: 'Which lane fits best: make, decide, fix, or understand?',
        move: 'Pick one word: make, decide, fix, or understand. Then add one sentence.',
    },
    launch_clarity: {
        reflection: 'The first screen should make one useful action obvious before anything else asks for attention.',
        question: 'What should someone try in the first thirty seconds?',
        move: 'Pick one promise and one button. Hide anything that competes with them.',
    },
    decision: {
        reflection: 'Another opinion will not help as much as a real-world signal.',
        question: 'What sign would make one option clearly better?',
        move: 'Name the sign, then run the smallest test that could produce it today.',
    },
    reset: {
        reflection: 'Too many open loops are being treated as one problem.',
        question: 'Which one loop would make the rest easier if it moved a little?',
        move: 'Pick that loop, set a ten-minute timer, and write only the next visible action.',
    },
    artifact: {
        reflection: 'This wants to become something you can use.',
        question: 'What output would still be useful if it were rough?',
        move: 'Draft the smallest usable version with a title, three bullets, and one ask.',
    },
    general: {
        reflection: 'The thought is still big. Make it small enough to try today.',
        question: 'What is the smallest version of this that could be tested today?',
        move: 'Write the testable version in one sentence, then show it to one person.',
    },
};

export function makeOfflineMirrorResult(intent = '', reason = 'network') {
    const clean = cleanIntent(intent) || 'this';
    const kind = classify(clean);
    const mirror = MIRRORS[kind] || MIRRORS.general;

    return {
        ok: true,
        fallback: true,
        mirror: {
            ...mirror,
            receipt: {
                context_used: `Only your sentence about "${clean}".`,
                context_excluded: 'Private notes, files, identity context, and memory stayed out.',
                memory_decision: 'Nothing saved unless you choose it.',
                route: reason === 'network'
                    ? 'Local fallback because the live answer was unreachable.'
                    : 'Local fallback.',
            },
        },
        truth_state: kind === 'source_check'
            ? {
                status: 'needs_checking',
                checked: false,
                label: 'Needs sources before you rely on it.',
                reason: 'The turn asks for current or external facts.',
                signals: ['current_or_external_claim'],
            }
            : {
                status: 'reflective',
                checked: false,
                label: 'Reflective, not source-checked.',
                reason: 'No current or external factual claim was detected.',
                signals: [],
            },
    };
}
