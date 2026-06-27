function cleanIntent(intent = '') {
    return String(intent || '')
        .replace(/\s+/g, ' ')
        .replace(/^["'`]+|["'`.!?]+$/g, '')
        .trim()
        .slice(0, 150);
}

function classify(intent = '') {
    const text = cleanIntent(intent).toLowerCase();
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
    if (/\b(leave my browser|leave the browser|personal details|personal history|privacy|private|sensitive|secret\w*|confidential|client|notes|send|sendable|shar\w*|expos\w*|reveal\w*|leak\w*|saved|swallow|safe|boundary)\b/.test(text)) {
        return 'private_output';
    }
    if (/\b(hallucinat\w*|overthink\w*|overwhelmed|scattered|spiral|too much|lost|anxious|panic|tired|drift|drifting|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text) || /\b(i feel|i am|i'm|we are|we're)\b.*\b(confused|stuck|lost)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(site|page|product|homepage|copy|marketing|sales|sell|ads?|launch|positioning|offer|user|customer|demo|public|proof|reflection|receipts?|systems?)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/\b(overwhelmed|scattered|confused|lost|stuck|spiral|loop|too much|drift|drifting|anxious|panic|tired|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(draft|write|document|memo|email|pdf|deck|file|artifact|output|useful)\b/.test(text)) {
        return 'artifact';
    }
    return 'general';
}

const MIRRORS = {
    source_check: {
        reflection: 'The risky part is not the question; it is sounding current before anything has been checked.',
        question: 'What exact claim would change your next move if it turned out to be false?',
        move: 'Write one claim to verify, then do not rely on the answer until source check is run.',
    },
    private_output: {
        reflection: 'The useful move is to separate the shape of the work from the private details inside it.',
        question: 'What can become useful without exposing names, secrets, or private context?',
        move: 'Replace private details with placeholders, then write the one sentence you would be willing to share.',
    },
    launch_clarity: {
        reflection: 'The launch problem is probably not a missing feature; it is that the first user action is not obvious enough yet.',
        question: 'What should a new user understand and do in the first thirty seconds?',
        move: 'Write one promise and one button label, then remove everything that competes with them.',
    },
    decision: {
        reflection: 'The loop is pretending this is a decision when it may still be an evidence problem.',
        question: 'What signal would make one option clearly earned instead of merely preferred?',
        move: 'Name the signal, then run the smallest test that could produce it today.',
    },
    reset: {
        reflection: 'The scatter is not the failure; too many open loops are trying to become one answer at once.',
        question: 'Which one loop would make the rest easier if it moved even a little?',
        move: 'Pick one loop, set a ten-minute timer, and write the next visible action only.',
    },
    artifact: {
        reflection: 'The work wants to become a thing, not another conversation about the thing.',
        question: 'What output would be useful even if it is rough?',
        move: 'Draft the smallest usable version with a title, three bullets, and one ask.',
    },
    general: {
        reflection: 'The loop is likely that the next move would make the thought testable, so the mind keeps asking for more certainty.',
        question: 'What is the smallest version of this that could be tested today?',
        move: 'Write the testable version in one sentence, then show it to one person or one page.',
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
                    ? 'Local fallback because the model route was unreachable.'
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
