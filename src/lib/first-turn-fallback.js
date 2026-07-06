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
    if (/\b(hallucinat\w*|overreach\w*|overthink\w*|drift\w*)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(site|page|product|homepage|copy|marketing|sales|sell|ads?|positioning|offer|user|customer|demo|public|proof|reflection|receipts?|systems?|first use|first-use|ritual|onboarding)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/\b(hallucinat\w*|overthink\w*|overwhelmed|scattered|spiral\w*|circles|too much|lost|losing the thread|too many ideas|cannot pick|can't pick|what else|lock\w* the next thing|less clear|feels urgent|feels obvious|adding tools|anxious|panic|tired|drift|drifting|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text) || /\b(i feel|i am|i'm|we are|we're)\b.*\b(confused|stuck|lost)\b/.test(text)) {
        return 'reset';
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
        reflection: 'This needs checking before it shapes your next move.',
        question: 'Which claim would change what you do if it were wrong?',
        move: 'Check one current source, then use only what changed.',
    },
    private_output: {
        reflection: 'Leave the exact private details out. I can still help with the useful version.',
        question: 'What should the shareable version help them do?',
        move: 'Replace names, keys, or account details with [name], [secret], or [detail], then send the version you can share.',
    },
    needs_detail: {
        reflection: 'Give me one direction and I can start.',
        question: 'Make, decide, fix, or understand?',
        move: 'Pick one word, then add one sentence about the thing.',
    },
    launch_clarity: {
        reflection: 'The first screen should make one useful action obvious before anything else asks for attention.',
        question: 'What should someone try in the first thirty seconds?',
        move: 'Pick one promise and one button. Hide anything that competes with them.',
    },
    decision: {
        reflection: 'Another opinion will not help as much as one real signal.',
        question: 'What signal would make one option easier to choose?',
        move: 'Name the signal, then run the smallest test you can run today.',
    },
    reset: {
        reflection: 'There are too many things open. Make one of them lighter first.',
        question: 'Which one would make today easier?',
        move: 'Pick that one, set a ten-minute timer, and do the smallest visible step.',
    },
    artifact: {
        reflection: 'This wants to become something you can use.',
        question: 'What output would still be useful if it were rough?',
        move: 'Draft the smallest usable version with a title, three bullets, and one ask.',
    },
    general: {
        reflection: 'This is wide enough to get heavy. Make the first version small.',
        question: 'What would make today feel a little easier?',
        move: 'Write one sentence that names the result you want by tonight.',
    },
};

const LANGUAGE_MIRRORS = {
    hi: {
        source_check: {
            reflection: 'Is par banane se pehle ek current source check zaroori hai.',
            question: 'Kaunsa claim galat nikla to aapka next step badal jayega?',
            move: 'Us ek claim ko likhiye, phir use ek current source se check kijiye.',
        },
        private_output: {
            reflection: 'Main useful part mein madad kar sakta hoon. Real secret bahar rakhiye.',
            question: 'Aap mujhse kya banwana, decide karwana, ya fix karwana chahte hain?',
            move: 'Dobara bhejiye, real value ki jagah [secret] ya [detail] likh kar.',
        },
        needs_detail: {
            reflection: 'Ek direction de dijiye, main start kar sakta hoon.',
            question: 'Banana hai, decide karna hai, fix karna hai, ya samajhna hai?',
            move: 'Ek option chuniye, phir ek sentence aur add kijiye.',
        },
        launch_clarity: {
            reflection: 'First screen par ek useful action sabse pehle obvious hona chahiye.',
            question: 'Pehle thirty seconds mein user kya try kare?',
            move: 'Ek promise aur ek button chuniye. Baaki sab temporarily hide kijiye.',
        },
        decision: {
            reflection: 'Ek aur opinion se zyada ek real-world signal help karega.',
            question: 'Kaunsa signal ek option ko clearly better bana dega?',
            move: 'Signal ka naam likhiye, phir aaj uska sabse chhota test run kijiye.',
        },
        reset: {
            reflection: 'Ek se zyada thread open hain. Jo aaj ko easier banata hai, usse start kijiye.',
            question: 'Kaunsa thread pehle matter karta hai?',
            move: 'Us ek ko chuniye aur ten minutes ke liye smallest visible step kijiye.',
        },
        artifact: {
            reflection: 'Ye kisi usable cheez mein badalna chahta hai.',
            question: 'Rough hone ke baad bhi kaunsa output useful rahega?',
            move: 'Title, teen bullets, aur ek ask ke saath smallest usable version draft kijiye.',
        },
        general: {
            reflection: 'Ye abhi wide hai. Isse itna chhota kijiye ki aaj move ho sake.',
            question: 'Iska smallest testable version kya hai?',
            move: 'Testable version ek sentence mein likhiye, phir ek person ko dikhaiye.',
        },
    },
    es: {
        needs_detail: {
            reflection: 'Dame una direccion y puedo empezar.',
            question: 'Quieres hacer, decidir, arreglar o entender algo?',
            move: 'Elige una opcion y agrega una frase concreta.',
        },
        general: {
            reflection: 'Esto todavia es amplio. Hazlo lo bastante pequeno para moverlo hoy.',
            question: 'Cual es la version mas pequena que puedes probar hoy?',
            move: 'Escribe la version probada en una frase y muestrala a una persona.',
        },
    },
    fr: {
        needs_detail: {
            reflection: 'Donne-moi une direction et je peux commencer.',
            question: 'Tu veux faire, decider, corriger ou comprendre quelque chose?',
            move: 'Choisis une option, puis ajoute une phrase concrete.',
        },
        general: {
            reflection: 'C est encore large. Reduis-le jusqu a ce que ca puisse avancer aujourd hui.',
            question: 'Quelle est la plus petite version testable aujourd hui?',
            move: 'Ecris la version testable en une phrase, puis montre-la a une personne.',
        },
    },
};

function languageCode(language = {}) {
    const code = String(language.reply_language || language.code || '').toLowerCase();
    if (code === 'hinglish') return 'hi';
    return code;
}

function mirrorForLanguage(kind, language = {}) {
    const code = languageCode(language);
    return LANGUAGE_MIRRORS[code]?.[kind] || LANGUAGE_MIRRORS[code]?.general || MIRRORS[kind] || MIRRORS.general;
}

function receiptForLanguage(clean, reason, language = {}) {
    const code = languageCode(language);
    if (code === 'hi') {
        return {
            context_used: `Sirf aapka sentence "${clean}" use hua.`,
            context_excluded: 'Private notes, files, identity context, aur memory bahar rahe.',
            memory_decision: 'Kuch save nahi hua jab tak aap choose na karein.',
            route: reason === 'network'
                ? 'Live answer unreachable tha, isliye local fallback use hua.'
                : 'Local fallback.',
        };
    }
    return {
        context_used: `Only your sentence about "${clean}".`,
        context_excluded: 'Private notes, files, identity context, and memory stayed out.',
        memory_decision: 'Nothing saved unless you choose it.',
        route: reason === 'network'
            ? 'Local fallback because the live answer was unreachable.'
            : 'Local fallback.',
    };
}

export function makeOfflineMirrorResult(intent = '', reason = 'network', language = {}) {
    const clean = cleanIntent(intent) || 'this';
    const kind = classify(clean);
    const mirror = mirrorForLanguage(kind, language);

    return {
        ok: true,
        fallback: true,
        mirror: {
            ...mirror,
            receipt: receiptForLanguage(clean, reason, language),
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
                label: 'Reflective, not checked with sources.',
                reason: 'No current or external factual claim was detected.',
                signals: [],
            },
    };
}
