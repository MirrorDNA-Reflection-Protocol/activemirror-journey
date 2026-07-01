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

function classify(intent = '') {
    const text = cleanIntent(intent).toLowerCase();
    if (hasExplicitSecret(intent)) {
        return 'private_output';
    }
    if (/\b(models?|browser|ai apps?|apple|memory|genui)\b.*\bnow\b/.test(text)) {
        return 'source_check';
    }
    if (/\b(2026|this year|recently|right now|current|latest|today|online|web|source|sources|research|competitor|market|verify|check|paper|study|studies|report|pricing|released|launched|who is doing)\b/.test(text)) {
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
    return 'general';
}

const MIRRORS = {
    source_check: {
        reflection: 'This needs a source before it becomes a direction. A fresh-sounding answer is not enough to build on.',
        question: 'Which claim would change your next move if it turned out to be false?',
        move: 'Write that one claim, then check one current source before using the answer.',
    },
    private_output: {
        reflection: 'Private details can stay with you. The useful part is the shape of the problem.',
        question: 'What is the same problem with names and secrets replaced by placeholders?',
        move: 'Write one sentence with placeholders for anything private.',
    },
    launch_clarity: {
        reflection: 'The page is asking the user to understand too much before they feel a reason to act. The first action has to beat the feature list.',
        question: 'What should someone want to do within the first thirty seconds?',
        move: 'Write one promise and one button label, then hide anything that competes with them.',
    },
    decision: {
        reflection: 'This should not be solved by preference yet. You need a real-world sign that makes one option clearly better.',
        question: 'What sign would make one option clearly better?',
        move: 'Name the sign, then run the smallest test that could produce it today.',
    },
    reset: {
        reflection: 'Too many open loops are being treated as one problem. Relief comes from moving one loop, not solving the whole pile.',
        question: 'Which one loop would make the rest easier if it moved a little?',
        move: 'Pick that loop, set a ten-minute timer, and write only the next visible action.',
    },
    artifact: {
        reflection: 'This wants to become something you can use, not another pass of thinking about it.',
        question: 'What output would still be useful if it were rough?',
        move: 'Draft the smallest usable version with a title, three bullets, and one ask.',
    },
    general: {
        reflection: 'The thought is staying big because the next move would make it testable. Shrink it until it can meet the real world today.',
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
