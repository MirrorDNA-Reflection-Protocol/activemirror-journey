import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUp, BookmarkPlus, BrainCircuit, Check, Code2, Copy, FileText, Image, LoaderCircle, Lock, Moon, PartyPopper, PenLine, Pencil, Save, SlidersHorizontal, Sparkles, Sun, Trash2, Upload, X } from 'lucide-react';
import ArtifactCard from '../components/ArtifactCard';
import PrivateRecallPanel from '../components/PrivateRecallPanel';
import PrivateRecallSuggestions from '../components/PrivateRecallSuggestions';
import TrustStatusRail, { TrustStateMark } from '../components/TrustStatusRail';
import { NeedsSources } from '../components/TruthStateNotice';
import { useTheme } from '../contexts/ThemeContext';
import {
    appendSessionContextMessages,
    assessLocalMirrorSense,
    buildLocalSenseContext,
    buildSessionContextEnvelope,
    conversationRouteFor,
    maskSoftPrivateText,
} from '../lib/local-mirror-sense';
import { makeOfflineMirrorResult } from '../lib/first-turn-fallback';
import { attachArtifactChallenge } from '../lib/challenge-packet';
import { languagePayloadFor } from '../lib/language-preference';
import {
    clearHomeChatContinuity,
    clearContinuityLedger,
    clearMirrorDefault,
    clearSessionHomeChat,
    deleteHomeChatThread,
    deleteContinuityEntry,
    deleteMirrorDefault,
    getActiveMirrorDefault,
    getArchetype,
    getBlueprint,
    getContinuityLedger,
    getHomeChatContinuity,
    getMirrorDefaults,
    getSessionHomeChat,
    importMirrorSettings,
    restoreHomeChatThread,
    saveContinuityEntry,
    saveHomeChatContinuity,
    saveHomeChatThread,
    saveSessionHomeChat,
    saveMirrorDefault,
    setHomeChatContinuityEnabled,
    updateMirrorDefault,
    useMirrorDefault,
} from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';
import { copyText } from '../lib/sendable-actions';
import { createDisabledSourceAdapterProjection } from '../lib/amos-disabled-source-adapter';
import {
    buildPrivateRecallItems,
    clearPrivateRecall,
    enablePrivateRecall,
    getPrivateRecallSnapshot,
    privateRecallItemsFingerprint,
    restorePrivateRecallPreference,
    resumePrivateRecall,
    searchPrivateRecall,
    subscribePrivateRecall,
    syncPrivateRecallItems,
    turnOffPrivateRecall,
} from '../lib/private-recall';

const DEFAULT_MIRROR_API_ORIGIN = 'https://gateway.activemirror.ai';
const MIRROR_API_ORIGIN = (() => {
    const configured = String(import.meta.env.VITE_ACTIVE_MIRROR_GATEWAY_ORIGIN || '').trim();
    if (!configured) return DEFAULT_MIRROR_API_ORIGIN;
    try {
        const url = new URL(configured);
        return /^https?:$/.test(url.protocol) ? url.origin : DEFAULT_MIRROR_API_ORIGIN;
    } catch {
        return DEFAULT_MIRROR_API_ORIGIN;
    }
})();
const MIRROR_CREATE_ENDPOINT = `${MIRROR_API_ORIGIN}/v1/mirror/create`;
const ARTIFACT_CREATE_ENDPOINT = `${MIRROR_API_ORIGIN}/v1/mirror/artifact`;
const IMAGE_ARTIFACT_MAX_ATTEMPTS = 2;
const IMAGE_ARTIFACT_RETRY_DELAY_MS = 900;
const ARTIFACT_FALLBACK_LABEL = 'Template fallback - not ready to send';

const SAMPLE_MIRROR = {
    reflection: 'You do not need the perfect prompt. Say the messy thing, and we will make it usable.',
    question: 'What is the one thing you want to move first?',
    move: 'Write the messy version in one sentence and send it here.',
    visual: {
        kind: 'reframe',
        left: 'I need better advice',
        right: 'I need one move I can actually test',
    },
    receipt: {
        context_used: 'Only the prompt on this page.',
        context_excluded: 'Private notes, identity context, and memory stay out unless approved.',
        memory_decision: 'Nothing is saved from this demo.',
    },
};

const LOADING_MIRROR = {
    reflection: 'Finding the useful thing.',
    question: 'What matters here?',
    move: 'One moment.',
    receipt: {
        context_used: 'The sentence you just sent.',
        context_excluded: 'Private context stays out unless approved.',
        memory_decision: 'Nothing saved.',
    },
};

const OFFLINE_CONVERSATION_LINES = {
    hi: 'जैसा मन में आ रहा है, वैसा कहिए। मैं बात का सिरा थामे रखूँगा और हर बात को कामों की सूची नहीं बनाऊँगा।',
    hinglish: 'Jaise aa raha hai waise bolo. Main thread pakad ke rakhunga, aur har baat ko productivity exercise nahi banaunga.',
    bn: 'মনে যেভাবে আসছে, সেভাবেই বলুন। আমি কথার সুতো ধরে রাখব, আর সবকিছুকে কাজের তালিকায় বদলে দেব না।',
    ta: 'மனதில் வருவது போலவே சொல்லுங்கள். உரையாடலின் இழையைப் பிடித்துக் கொள்கிறேன்; எல்லாவற்றையும் செய்யவேண்டிய பட்டியலாக மாற்றமாட்டேன்.',
    te: 'మనసులో వచ్చినట్టే చెప్పండి. మాటల దారిని పట్టుకుంటాను; ప్రతి విషయాన్నీ పనుల జాబితాగా మార్చను.',
    mr: 'मनात येईल तसे सांगा. मी बोलण्याचा धागा पकडून ठेवेन; प्रत्येक गोष्ट कामांच्या यादीत बदलणार नाही.',
    gu: 'મનમાં આવે તેમ કહો. હું વાતનો દોર પકડી રાખીશ; દરેક વાતને કામોની યાદીમાં ફેરવીશ નહીં.',
    kn: 'ಮನಸ್ಸಿಗೆ ಬಂದಂತೆ ಹೇಳಿ. ಮಾತಿನ ಎಳೆಯನ್ನು ಹಿಡಿದುಕೊಳ್ಳುತ್ತೇನೆ; ಪ್ರತಿಯೊಂದನ್ನೂ ಕೆಲಸಗಳ ಪಟ್ಟಿಯಾಗಿಸುವುದಿಲ್ಲ.',
    ml: 'മനസ്സിൽ വരുന്നതുപോലെ പറയൂ. സംഭാഷണത്തിന്റെ നൂൽ പിടിച്ചുനിർത്താം; എല്ലാം ചെയ്യേണ്ട കാര്യങ്ങളുടെ പട്ടികയാക്കില്ല.',
    pa: 'ਜਿਵੇਂ ਮਨ ਵਿੱਚ ਆ ਰਿਹਾ ਹੈ, ਤਿਵੇਂ ਦੱਸੋ। ਮੈਂ ਗੱਲ ਦੀ ਡੋਰ ਫੜੀ ਰੱਖਾਂਗਾ; ਹਰ ਗੱਲ ਨੂੰ ਕੰਮਾਂ ਦੀ ਸੂਚੀ ਨਹੀਂ ਬਣਾਵਾਂਗਾ।',
    or: 'ମନରେ ଯେମିତି ଆସୁଛି ସେମିତି କୁହନ୍ତୁ। ମୁଁ କଥାର ସୂତା ଧରି ରଖିବି; ପ୍ରତ୍ୟେକ କଥାକୁ କାମ ତାଲିକାରେ ବଦଳାଇବି ନାହିଁ।',
    ur: 'جو دل میں آ رہا ہے، ویسے ہی کہیں۔ میں بات کا سلسلہ تھامے رکھوں گا، اور ہر بات کو کاموں کی فہرست نہیں بناؤں گا۔',
};

const RECALL_CONTEXT_LABELS = {
    hi: 'इस डिवाइस से चुना गया संदर्भ:',
    hinglish: 'Is device se chuna hua context:',
    bn: 'এই ডিভাইস থেকে বেছে নেওয়া প্রসঙ্গ:',
    ta: 'இந்தச் சாதனத்திலிருந்து தேர்ந்தெடுத்த பின்னணி:',
    te: 'ఈ పరికరం నుంచి ఎంచుకున్న సందర్భం:',
    mr: 'या डिवाइसवरून निवडलेला संदर्भ:',
    gu: 'આ ડિવાઇસમાંથી પસંદ કરેલો સંદર્ભ:',
    kn: 'ಈ ಸಾಧನದಿಂದ ಆಯ್ಕೆ ಮಾಡಿದ ಸಂದರ್ಭ:',
    ml: 'ഈ ഉപകരണത്തിൽ നിന്ന് തിരഞ്ഞെടുത്ത പശ്ചാത്തലം:',
    pa: 'ਇਸ ਡਿਵਾਈਸ ਤੋਂ ਚੁਣਿਆ ਸੰਦਰਭ:',
    or: 'ଏହି ଡିଭାଇସରୁ ବାଛିଥିବା ପ୍ରସଙ୍ଗ:',
    ur: 'اس ڈیوائس سے منتخب کیا گیا پس منظر:',
};

const STARTER_ACTIONS = [
    {
        kind: 'make',
        label: 'Make',
        caption: 'Message, image, doc',
        icon: PenLine,
        intent: 'I want to make something useful.',
    },
    {
        kind: 'decide',
        label: 'Decide',
        caption: 'Compare options',
        icon: Check,
        intent: 'I need to make a decision.',
    },
    {
        kind: 'fix',
        label: 'Fix',
        caption: 'Unblock a thing',
        icon: SlidersHorizontal,
        intent: 'Something is not working.',
    },
    {
        kind: 'understand',
        label: 'Understand',
        caption: 'Explain simply',
        icon: Sparkles,
        intent: 'I need to understand this better.',
    },
    {
        kind: 'fun',
        label: 'Fun',
        caption: 'Surprise me',
        icon: PartyPopper,
        intent: 'I want to do something fun.',
    },
];

const STARTER_RESULTS = {
    make: {
        reflection: 'Make the first usable version. It does not need to be perfect.',
        question: 'What kind of thing: image, message, page, doc, code, or plan?',
        move: 'Type the format and the rough idea. I will make the first version.',
        visual: {
            kind: 'reframe',
            left: 'Whole idea',
            right: 'First version',
        },
    },
    decide: {
        reflection: 'Put the options side by side. One of them is easier to test.',
        question: 'What are the two options?',
        move: 'Write Option A and Option B. I will help find the smallest test.',
        visual: {
            kind: 'axes',
            left: 'Big bet',
            right: 'Small test',
        },
    },
    fix: {
        reflection: 'Do not fix the whole system. Find the first snag.',
        question: 'What feels wrong: unclear, broken, slow, ugly, or blocked?',
        move: 'Name the visible snag in five words. I will make the repair smaller.',
        visual: {
            kind: 'reframe',
            left: 'Everything is broken',
            right: 'First snag',
        },
    },
    understand: {
        reflection: 'Make it plain first. Depth comes after the first clear handle.',
        question: 'What would help most: a definition, example, comparison, source, or next step?',
        move: 'Pick the kind of clarity you want. I will keep it usable.',
        visual: {
            kind: 'spectrum',
            left: 'More words',
            right: 'Clear handle',
        },
    },
    fun: {
        reflection: 'Good. Make it playful, but still make something you can use.',
        question: 'What kind of fun: image, tiny game, story, surprise idea, playlist, or prompt?',
        move: 'Pick one playful lane, or type a mood and I will start.',
        visual: {
            kind: 'spectrum',
            left: 'Random',
            right: 'Playful and useful',
        },
    },
};

const LAUNCHER_ACTIVITIES = {
    make: [
        ['Image', 'I want to make an image. Help me choose the subject, feeling, and one thing it should do.'],
        ['Message', 'I want to write a message. Help me make it short, clear, and easy to answer.'],
        ['Page', 'I want to make a page. Help me create the first screen and the first button.'],
        ['Doc', 'I want to make a short document. Help me create the smallest useful version.'],
        ['Code', 'I want to make a code starter. Help me define the smallest working piece.'],
        ['Plan', 'I want a simple plan. Help me choose the first three steps.'],
    ],
    decide: [
        ['Compare', 'Compare my options and give me the smallest useful signal.'],
        ['Risk', 'Check what could go wrong and what is reversible.'],
        ['Test', 'Turn this decision into a small test I can run.'],
        ['Choose', 'Help me pick one option and name the reason.'],
    ],
    fix: [
        ['Clarity', 'Fix the unclear part and make it easier to understand.'],
        ['Flow', 'Find the step where this breaks and make it smoother.'],
        ['Copy', 'Rewrite this so it is shorter and easier to act on.'],
        ['Bug', 'Help me isolate the visible failure and a small repair.'],
    ],
    understand: [
        ['Explain', 'Explain this in plain language with one example.'],
        ['Example', 'Give me one concrete example and one next step.'],
        ['Compare', 'Compare this to the closest familiar thing.'],
        ['Check', 'Check current sources before I rely on this.'],
    ],
    fun: [
        ['Image', 'Make a fun image idea from my mood. Help me choose the subject, feeling, and one surprise detail.'],
        ['Tiny game', 'Make a tiny one-screen game idea I can try or build.'],
        ['Story', 'Write a short playful story from one rough idea.'],
        ['Surprise me', 'Give me one unexpected, useful, fun thing to try right now.'],
        ['Playlist', 'Turn my mood into a small playlist brief or vibe list.'],
        ['Prompt', 'Give me a creative prompt that gets an interesting result.'],
    ],
};

function makeStarterResult(kind = 'make') {
    const starter = STARTER_RESULTS[kind] || STARTER_RESULTS.make;
    return {
        kind: 'starter',
        starterKind: kind,
        mirror: {
            ...starter,
            receipt: {
                context_used: 'Only the starter button you chose.',
                context_excluded: 'No private details were needed.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function launcherActivitiesFor(kind = '') {
    return (LAUNCHER_ACTIVITIES[kind] || []).map(([label, prompt]) => ({
        label,
        prompt,
    }));
}

function launcherIconFor(label = '') {
    if (/\b(image)\b/i.test(label)) return Image;
    if (/\b(message|copy)\b/i.test(label)) return PenLine;
    if (/\b(page|doc|plan|test)\b/i.test(label)) return FileText;
    if (/\b(code|bug)\b/i.test(label)) return Code2;
    if (/\b(risk|flow)\b/i.test(label)) return SlidersHorizontal;
    if (/\b(choose|compare|check)\b/i.test(label)) return Check;
    return Sparkles;
}

function makeLauncherFollowUps(kind = 'make') {
    return launcherActivitiesFor(kind).map((item) => {
        return {
            label: item.label,
            icon: launcherIconFor(item.label),
            action: kind === 'make' ? 'set_format' : 'reflect',
            inputPrefix: kind === 'make' ? `${item.label}: ` : '',
            intent: item.prompt,
        };
    });
}

function isMakeFormatOnly(intent = '') {
    return /^(?:image|message|page|doc|code|plan):?$/i.test(String(intent || '').trim());
}

function makeFormatInputPrefix(intent = '') {
    const format = String(intent || '').replace(/:$/, '').trim();
    return format ? `${format.charAt(0).toUpperCase()}${format.slice(1).toLowerCase()}: ` : '';
}

function explicitMakeBrief(intent = '') {
    const match = String(intent || '').trim().match(/^(image|message|page|doc|code|plan):\s*(.+)$/i);
    if (!match?.[2]?.trim()) return null;
    return {
        format: match[1].toLowerCase(),
        brief: match[2].trim(),
    };
}

function artifactKindForMakeFormat(format = '') {
    if (format === 'image') return 'image';
    if (format === 'code') return 'code';
    if (['page', 'doc', 'plan'].includes(format)) return 'doc';
    return 'draft';
}

function starterAnswer(answer = '') {
    return String(answer || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
}

function makeStarterFollowupResult(kind = 'make', answer = '') {
    const clean = starterAnswer(answer);
    const text = clean.toLowerCase();

    if (kind === 'make') {
        if (/\b(page|homepage|home page|landing|site|website|web page)\b/.test(text)) {
            return {
                kind: 'starter_followup',
                mirror: {
                    reflection: 'Page is enough. Make the first screen, not the whole site.',
                    question: 'Who is it for, and what should they click first?',
                    move: 'Write one headline and one button label.',
                    visual: {
                        kind: 'reframe',
                        left: 'Whole site',
                        right: 'First screen',
                    },
                    receipt: starterFollowupReceipt(clean),
                },
            };
        }

        if (/\b(message|email|reply|dm|text|note)\b/.test(text)) {
            return {
                kind: 'starter_followup',
                mirror: {
                    reflection: 'Make the message easy to answer.',
                    question: 'Who receives it, and what do you want back?',
                    move: 'Write the ask in one sentence.',
                    visual: {
                        kind: 'reframe',
                        left: 'Explain everything',
                        right: 'Ask one thing',
                    },
                    receipt: starterFollowupReceipt(clean),
                },
            };
        }

        if (/\b(image|visual|poster|thumbnail|video|ad|creative)\b/.test(text)) {
            return {
                kind: 'starter_followup',
                mirror: {
                    reflection: 'Start with the feeling and the one thing people should notice.',
                    question: 'What should the visual make someone feel or do?',
                    move: 'Name the subject, feeling, and action in one line.',
                    visual: {
                        kind: 'spectrum',
                        left: 'Pretty',
                        right: 'Useful feeling',
                    },
                    receipt: starterFollowupReceipt(clean),
                },
            };
        }

        return {
            kind: 'starter_followup',
            mirror: {
                reflection: `"${clean || 'This'}" is enough to start.`,
                question: 'What would make it useful to someone else?',
                move: 'Write the rough version before improving it.',
                visual: {
                    kind: 'reframe',
                    left: 'Perfect version',
                    right: 'Rough version',
                },
                receipt: starterFollowupReceipt(clean),
            },
        };
    }

    if (kind === 'decide') {
        return {
            kind: 'starter_followup',
            mirror: {
                reflection: 'Put the options side by side before arguing with yourself.',
                question: clean ? `What changes if you choose ${clean}?` : 'What are Option A and Option B?',
                move: 'Write the two options, then mark the one you can test or undo.',
                visual: {
                    kind: 'axes',
                    left: 'Commit',
                    right: 'Test',
                },
                receipt: starterFollowupReceipt(clean),
            },
        };
    }

    if (kind === 'fix') {
        if (/\b(unclear|confusing|confused|messy|wordy|copy|message)\b/.test(text)) {
            return {
                kind: 'starter_followup',
                mirror: {
                    reflection: 'Clarity is the fix. Remove one choice, one phrase, or one step.',
                    question: 'What should the person understand first?',
                    move: 'Rewrite the unclear part as one plain sentence.',
                    visual: {
                        kind: 'reframe',
                        left: 'Too much to parse',
                        right: 'One plain sentence',
                    },
                    receipt: starterFollowupReceipt(clean),
                },
            };
        }

        if (/\b(slow|lag|heavy|loading|performance)\b/.test(text)) {
            return {
                kind: 'starter_followup',
                mirror: {
                    reflection: 'Speed fixes need one measurement before one change.',
                    question: 'What is slow: load, click, typing, scrolling, or response?',
                    move: 'Measure the slowest visible step once, then change only that step.',
                    visual: {
                        kind: 'axes',
                        left: 'Guessing',
                        right: 'Measured step',
                    },
                    receipt: starterFollowupReceipt(clean),
                },
            };
        }

        return {
            kind: 'starter_followup',
            mirror: {
                reflection: 'Fix the visible symptom before chasing the hidden cause.',
                question: 'Where do you see it fail?',
                move: 'Name the screen, sentence, or step where it breaks.',
                visual: {
                    kind: 'reframe',
                    left: 'Root cause hunt',
                    right: 'Visible failure',
                },
                receipt: starterFollowupReceipt(clean),
            },
        };
    }

    return {
        kind: 'starter_followup',
        mirror: {
            reflection: 'Choose the lens that changes what you do next.',
            question: 'Do you need a definition, example, comparison, source, or next step?',
            move: 'Pick one lens and ask that version.',
            visual: {
                kind: 'spectrum',
                left: 'More input',
                right: 'Useful lens',
            },
            receipt: starterFollowupReceipt(clean),
        },
    };
}

function starterFollowupReceipt(answer = '') {
    return {
        context_used: `Your starter answer${answer ? `: "${answer}"` : ''}.`,
        context_excluded: 'No private history or saved memory was needed.',
        memory_decision: 'Nothing saved.',
    };
}

function isEcosystemAsk(intent) {
    const text = String(intent || '');
    const directProductQuestion = /\b(what can you do|what does this do|how does this work|how do i use this|what is active mirror)\b/i.test(text);
    const productSubject = /\b(active mirror|this app|this site|your mirror|your ecosystem)\b/i.test(text);
    const productTopic = /\b(ecosystem|vault|brainscan|mirrorseed|receipt|privacy|tools|features)\b/i.test(text);
    return directProductQuestion || (productSubject && productTopic);
}

function isSourceHeavyAsk(intent) {
    const text = String(intent || '');
    const explicitSourceAsk = /\b(latest|current|recent|recently|online|web|source|sources|research|competitor|market|verify|check|claim|fact|facts|numbers|price|pricing|paper|study|studies|report|released|launched|who is doing|buy|shopping|shop|compare|options?|deals?|available|availability|near me|tires?|tyres?|retailers?)\b/i.test(text);
    const timedFactAsk = /\b(today|right now|this week|this month|this year|as of)\b/i.test(text)
        && /\b(news|market|price|pricing|competitor|research|source|verif\w*|check|fact|facts|numbers|paper|study|studies|report|released|launched|happened|weather|stock|model|api|buy|shopping|shop|options?|deals?|available|availability|tires?|tyres?|retailers?)\b/i.test(text);

    return explicitSourceAsk || timedFactAsk;
}

function isAnswerFirstAsk(intent) {
    return isSourceHeavyAsk(intent);
}

function makeAnswerFirstSourceResult(intent = '') {
    const clean = String(intent || 'this').replace(/\s+/g, ' ').trim().slice(0, 160) || 'this';
    return {
        kind: 'answer_first_source',
        ok: true,
        mirror: {
            reflection: 'Checking current sources before answering.',
            question: clean,
            move: 'Use the current answer, then decide.',
            receipt: {
                context_used: `Only your request: "${clean}".`,
                context_excluded: 'Private notes, saved memory, and personal history stayed out.',
                memory_decision: 'Nothing saved unless you choose it.',
                route: 'Current-source answer because this asks for current or external information.',
            },
            visual: { kind: 'none', left: '', right: '', note: '' },
        },
        truth_state: {
            status: 'needs_checking',
            label: 'Needs current sources before answering.',
            signals: ['current_or_external_claim'],
        },
    };
}

function isStartHelpAsk(intent = '') {
    return /\b(don'?t know what to ask|do not know what to ask|not sure what to ask|where do i start|how do i start|what should i ask|don'?t know where to start|do not know where to start)\b/i
        .test(String(intent || ''));
}

function makeStartHelpResult(intent = '') {
    const clean = String(intent || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    return {
        kind: 'start_help',
        ok: true,
        mirror: {
            reflection: 'Start with one thing. Make it, decide it, fix it, or understand it.',
            question: '',
            move: 'Pick one below, or type one messy sentence.',
            receipt: {
                context_used: clean ? `Only your request: "${clean}".` : 'Only your request.',
                context_excluded: 'Private notes, saved memory, and personal history stayed out.',
                memory_decision: 'Nothing saved unless you choose it.',
                route: 'Local start helper.',
            },
            visual: null,
        },
    };
}

function artifactKindName(kind = 'draft') {
    if (kind === 'image') return 'image';
    if (kind === 'code') return 'code starter';
    if (kind === 'doc') return 'document';
    return 'draft';
}

function wait(ms = 0) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function artifactHasImageMedia(artifact = {}) {
    const media = artifact?.media || {};
    return Boolean(media.url || media.data_url || media.data);
}

function assistantTextForSession(mirror = {}, mode = 'reflection') {
    if (mode === 'conversation') return String(mirror?.reflection || '').trim();
    return [mirror?.reflection, mirror?.question, mirror?.move]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join('\n');
}

function makeOfflineConversationResult(intent = '', offlineResult = {}, tone = '', language = {}) {
    const cleanIntent = String(intent || '').replace(/\s+/g, ' ').trim();
    const conversationalHint = `${tone} ${cleanIntent}`;
    const languageCode = String(language.reply_language || language.code || '').toLowerCase();
    const localLanguageLine = OFFLINE_CONVERSATION_LINES[languageCode];
    const playful = /\b(?:playful|joke|funny|silly|banter|lighthearted|surprise me|make me laugh)\b/i.test(conversationalHint);
    const justTalk = /\b(?:just talk|talk (?:to|with) me|chat with me|keep me company|no advice|without advice|no exercises?|without exercises?|no homework)\b/i.test(conversationalHint);
    const greeting = /^(?:hey|hi|hello|yo|how are you|what'?s up)[\s.!?]*$/i.test(cleanIntent);
    const reflection = localLanguageLine || (playful
        ? 'A tiny bit of nonsense, then: the serious plan has misplaced its tie and is pretending that was intentional.'
        : justTalk
            ? 'Good. No homework, no timer, and no stealth coaching. We can just talk.'
            : greeting
                ? 'Hey. I am here, paying attention, and not about to turn hello into a productivity exercise.'
                : 'Say it the way it comes. I will keep the thread and stay conversational.');

    return {
        ...offlineResult,
        responseMode: 'conversation',
        route: { ...(offlineResult.route || {}), capability: 'chat' },
        mirror: {
            ...(offlineResult.mirror || {}),
            reflection,
            question: '',
            move: '',
            visual: null,
        },
    };
}

function isConversationResult(result = {}) {
    return result?.responseMode === 'conversation'
        || result?.response_mode === 'conversation'
        || result?.route?.capability === 'chat';
}

function gatewayArtifactIsNotReady(payload = {}) {
    const artifact = payload?.artifact || {};
    const status = String(payload?.status || artifact?.status || '').trim().toLowerCase();
    const note = String(payload?.note || artifact?.note || '').trim();
    return payload?.fallback === true
        || artifact?.fallback === true
        || payload?.ready === false
        || artifact?.ready === false
        || ['degraded', 'fallback', 'not_ready', 'not-ready', 'unready'].includes(status)
        || /\b(?:template fallback|degraded|not ready)\b/i.test(note);
}

function markArtifactNotReady(artifact = {}) {
    const challenge = artifact?.challenge || {};
    return {
        ...artifact,
        fallback: true,
        ready: false,
        status: 'degraded',
        challenge: {
            ...challenge,
            status: 'failed',
            label: ARTIFACT_FALLBACK_LABEL,
            user_note: 'This is a template fallback. Review and replace any generic details before sending.',
            reason: 'The requested output did not return in a send-ready state.',
            promotion: {
                ...(challenge?.promotion || {}),
                can_share: false,
                can_claim_done: false,
                can_remember: false,
                can_deploy: false,
            },
        },
    };
}

function artifactIsNotReady(artifact = {}) {
    const status = String(artifact?.status || '').trim().toLowerCase();
    return artifact?.fallback === true
        || artifact?.ready === false
        || ['degraded', 'fallback', 'not_ready', 'not-ready', 'unready'].includes(status)
        || artifact?.challenge?.label === ARTIFACT_FALLBACK_LABEL;
}

function makeArtifactFirstResult(intent = '', kind = 'draft') {
    const clean = String(intent || 'this').replace(/\s+/g, ' ').trim().slice(0, 160) || 'this';
    const name = artifactKindName(kind);
    return {
        kind: 'artifact_first',
        ok: true,
        mirror: {
            reflection: `The ${name} opens below.`,
            question: '',
            move: 'Copy it if it works. Ask for a sharper version if it does not.',
            receipt: {
                context_used: `Only your request: "${clean}".`,
                context_excluded: 'Private notes, saved memory, and personal history stayed out.',
                memory_decision: 'Nothing saved unless you choose it.',
                route: 'Creation first because you asked for a usable output.',
            },
            visual: { kind: 'none', left: '', right: '', note: '' },
        },
    };
}

function makeEcosystemResult(intent) {
    const text = String(intent || '').toLowerCase();
    const privacy = /\b(private|privacy|save|saved|memory|account|data)\b/.test(text);
    const teams = /\b(team|teams|business|enterprise|company|workflows?|clients?)\b/.test(text);
    const example = /\b(example|show me|try it|demo|what can it do|what can you do)\b/.test(text);

    if (privacy) {
        return {
            kind: 'help',
            intent,
            mirror: {
                reflection: 'Use placeholders for anything private. Keep what helps. Drop the rest.',
                question: 'Do you want to start fresh, import your setup, or just try one sentence?',
                move: 'Type the version you can share. Names, keys, and account details can stay out.',
                receipt: {
                    context_used: 'Your question about privacy.',
                    context_excluded: 'No private details were needed.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    if (teams) {
        return {
            kind: 'help',
            intent,
            mirror: {
                reflection: 'For teams, start with one workflow people already care about.',
                question: 'What would the team want finished: a brief, review, decision, report, or client-ready draft?',
                move: 'Bring one workflow. I will turn it into a smaller test your team can judge.',
                receipt: {
                    context_used: 'Your question about team use.',
                    context_excluded: 'No client or private work was needed.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    if (example) {
        return {
            kind: 'help',
            intent,
            mirror: {
                reflection: 'Example: bring a rough thought, and I turn it into a first useful output.',
                question: 'Do you want the example to be a message, image, page, decision, or quick explanation?',
                move: 'Pick one example type, or send your own messy version.',
                receipt: {
                    context_used: 'Your request for an example.',
                    context_excluded: 'No private details were needed.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    return {
        kind: 'help',
        intent,
        mirror: {
            reflection: 'Think of me as the second pass before the world sees your first draft.',
            question: 'Do you want to make something, choose, fix, or understand?',
            move: 'Send the rough version. I will answer with the smallest useful thing first.',
            receipt: {
                context_used: 'Your question about what this can do.',
                context_excluded: 'No private details were needed.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function makeLearnActiveMirrorFollowUps() {
    return [
        {
            label: 'Try it',
            icon: Sparkles,
            action: 'reflect',
            intent: 'Show me one quick example of how this works.',
        },
        {
            label: 'Make something',
            icon: PenLine,
            action: 'reflect',
            intent: 'I want to make something useful.',
        },
        {
            label: 'Privacy',
            icon: Lock,
            action: 'reflect',
            intent: 'How does Active Mirror handle privacy in plain language?',
        },
        {
            label: 'For teams',
            icon: Check,
            action: 'reflect',
            intent: 'How could a team use Active Mirror?',
        },
    ];
}

function makeSetupReadyResult() {
    return {
        kind: 'setup_ready',
        mirror: {
            reflection: 'You are set. Bring one real thing, messy is fine.',
            question: 'What do you want to work on first?',
            move: 'Type the rough version. I will keep it short.',
            receipt: {
                context_used: 'Your saved choices on this browser.',
                context_excluded: 'Private details and extra history stay out.',
                memory_decision: 'Your choices stay on this browser.',
            },
        },
    };
}

function makeBlockedResult(data = {}) {
    if (data.error === 'rate_limited') {
        return {
            kind: 'cooldown',
            mirror: {
                reflection: 'The answer is cooling down for a moment. Your page is still private, and nothing needs to be re-entered.',
                question: 'Can you send the same sentence again in a minute?',
                move: 'Wait for the short cooldown, then send the same sentence again.',
                receipt: {
                    context_used: 'Only the request limit state was used.',
                    context_excluded: 'Your private context was not expanded or saved.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    if (data.error && !/privacy|secret|redact|sensitive/i.test(data.error)) {
        return {
            kind: 'route_hold',
            mirror: {
                reflection: 'That did not come through cleanly.',
                question: 'Can you send the same thing once more?',
                move: 'Try one short sentence. I will keep a local version ready if the live answer fails.',
                receipt: {
                    context_used: 'Only the service status for this turn.',
                    context_excluded: 'Your prompt was not saved by this page.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    return {
        kind: 'privacy_hold',
        mirror: {
            reflection: 'Leave the exact private details out. I can still help with the useful version.',
            question: 'What should the public version help the reader do?',
            move: 'Replace names, keys, or account details with [name], [secret], or [detail], then send the version you can share.',
            receipt: {
                context_used: 'The current prompt only.',
                context_excluded: 'The secret value was not sent.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function makeLocalPrivacyResult(sense = {}) {
    return {
        kind: 'privacy_hold',
        mirror: {
            reflection: 'Leave the exact private details out. I can still help with the useful version.',
            question: 'What should the public version help the reader do?',
            move: 'Replace names, keys, or account details with [name], [secret], or [detail], then send the version you can share.',
            receipt: {
                context_used: 'Only the local browser privacy check.',
                context_excluded: 'The secret value stayed in this browser.',
                memory_decision: 'Nothing saved.',
            },
        },
        local_sense: sense,
    };
}

function detectArtifactKind(intent = '', mirror = {}) {
    const text = `${intent} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    if (/\b(image|visual|poster|flyer|logo|banner|invitation|illustration|photo|picture|thumbnail|video|ad creative|creative brief|moodboard|social post|instagram post)\b/.test(text)) return 'image';
    if (/\b(code|app|component|script|function|api|html|css|javascript|react|python)\b/.test(text)) return 'code';
    if (/\b(message|email|reply|dm|text|note)\b/.test(text)) return 'draft';
    if (/\b(document|doc|pdf|memo|brief|deck|slide|presentation|report|summary|proposal|outline|post|website|web page|site|page|landing page|homepage|launch page|headline|button label|reassurance line|copy block)\b/.test(text)) return 'doc';
    return 'draft';
}

function artifactActionFor(kind = 'draft') {
    if (kind === 'image') return { label: 'Make image', icon: Image };
    if (kind === 'code') return { label: 'Make code starter', icon: Code2 };
    if (kind === 'doc') return { label: 'Make doc', icon: FileText };
    return { label: 'Draft it', icon: PenLine };
}

function artifactIntentFor(kind = 'draft', mirror = {}, intent = '') {
    const base = String(intent || mirror.question || mirror.move || 'this').replace(/\s+/g, ' ').trim();
    if (kind === 'image') return `Create an image for this, using the reflection and next move: ${base}`;
    if (kind === 'code') return `Create a small code starter for this, using the reflection and next move: ${base}`;
    if (kind === 'doc') return `Create a short working document from this reflection, ready to copy: ${base}`;
    return `Draft the smallest sendable version from this reflection, ready to copy: ${base}`;
}

function shouldOpenWorkSurface(intent = '', mirror = {}) {
    if (isSourceHeavyAsk(intent)) return false;

    const text = `${intent} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    const directAsk = /\b(make it sendable|something i can send|turn (this|it) into|draft it|write it|build it|create it|give me code|make a doc|make a visual|make an image)\b/i.test(text);
    const asksToMake = /\b(make|create|draft|write|generate|build|prepare|compose|turn)\b/i.test(text);
    const asksForThing = /\b(message|email|reply|dm|text|note|memo|doc|document|brief|outline|post|proposal|code|component|script|image|visual|poster|flyer|logo|banner|invitation|creative|pdf|deck|presentation|report|plan|website|web page|site|page|homepage|landing|headline|button|reassurance line|copy block)\b/i.test(text);
    const needThing = /\b(?:i\s+)?(?:need|want|looking for|could use)\b.{0,80}\b(message|email|reply|dm|text|note|memo|doc|document|brief|outline|post|proposal|code|component|script|image|visual|poster|flyer|logo|banner|invitation|creative|pdf|deck|presentation|report|plan|website|web page|site|page|homepage|landing|headline|button|reassurance line|copy block)\b/i.test(text);
    const bareArtifact = text.split(/\s+/).filter(Boolean).length <= 8
        && /\b(poster|flyer|logo|banner|invitation|thumbnail|social post|instagram post|deck|presentation|pdf|website|landing page|homepage)\b/i.test(text);

    return directAsk || bareArtifact || needThing || (asksToMake && asksForThing);
}

function isShortStartResult(result = {}) {
    return Array.isArray(result?.straitjacket) && result.straitjacket.includes('deterministic_short_start');
}

function followUpContext(intent = '', mirror = {}) {
    return [intent, mirror?.reflection, mirror?.question, mirror?.move]
        .map((item) => String(item || ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function isLaunchPageContext(intent = '', mirror = {}) {
    return /\b(launch page|landing page|homepage|home page|site|website|hero|headline|button label|reassurance line|visitor|first action)\b/i
        .test(followUpContext(intent, mirror));
}

function launchPageCopyIntent(mirror = {}, intent = '') {
    return [
        'Create exact launch page first-screen copy from this reflection.',
        'Include a headline, button label, reassurance line, short draft, and concrete next step.',
        'No bracket placeholders.',
        `Original ask: ${intent || 'launch page'}`,
        `Reflection: ${mirror.reflection || ''}`,
        `Question: ${mirror.question || ''}`,
        `Move: ${mirror.move || ''}`,
    ].join(' ');
}

function launchPageTestIntent(mirror = {}, intent = '') {
    return [
        'Create a five-second visitor test for this launch page.',
        'Include the test prompt, what to watch, pass signal, fail signal, and the one copy change to try next.',
        `Original ask: ${intent || 'launch page'}`,
        `Current move: ${mirror.move || ''}`,
    ].join(' ');
}

function isOneDetailIntake(mirror = {}) {
    return /\bmake(?:\s+it)?[,;]\s*decide(?:\s+it)?[,;]\s*fix(?:\s+it)?[,;]?\s*or\s*understand(?:\s+it)?\b/i
        .test(`${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`);
}

function oneDetailTopic(intent = '') {
    return String(intent || 'this')
        .replace(/\s+/g, ' ')
        .replace(/^my\s+/i, '')
        .trim()
        .slice(0, 80) || 'this';
}

function makeOneDetailFollowUps(intent = '') {
    const topic = oneDetailTopic(intent);
    return [
        {
            label: 'Make',
            icon: PenLine,
            action: 'reflect',
            intent: `I want to make ${topic}. Help me turn it into the smallest useful first version.`,
        },
        {
            label: 'Decide',
            icon: Check,
            action: 'reflect',
            intent: `I need to decide what matters first for ${topic}. Give me the smallest choice to make.`,
        },
        {
            label: 'Fix',
            icon: SlidersHorizontal,
            action: 'reflect',
            intent: `I want to fix ${topic}. Help me find the smallest repair to try first.`,
        },
        {
            label: 'Understand',
            icon: Sparkles,
            action: 'reflect',
            intent: `I want to understand ${topic}. Help me find the first useful question.`,
        },
    ];
}

function makeFollowUps(mirror = {}, loopCount = 0, intent = '') {
    if (isLearnActiveMirrorContext(mirror, intent)) {
        return makeLearnActiveMirrorFollowUps();
    }

    const starterKind = resultStarterKind(mirror, intent);
    if (starterKind) {
        return makeLauncherFollowUps(starterKind);
    }

    const artifactKind = detectArtifactKind(intent, mirror);
    const artifactAction = artifactActionFor(artifactKind);
    const artifactIntent = artifactIntentFor(artifactKind, mirror, intent);
    const launchPage = isLaunchPageContext(intent, mirror);

    if (isOneDetailIntake(mirror)) {
        return makeOneDetailFollowUps(intent);
    }

    if (loopCount >= 4) {
        return [
            mirror.move && {
                label: 'Pick the move',
                icon: Check,
                action: 'reflect',
                intent: `Stop expanding. Synthesize this into the one move I should do now: ${mirror.move}`,
            },
            {
                ...(launchPage ? { label: 'Make page copy', icon: FileText } : artifactAction),
                action: 'artifact',
                artifactKind: launchPage ? 'doc' : artifactKind,
                intent: launchPage ? launchPageCopyIntent(mirror, intent) : artifactIntent,
            },
        ].filter(Boolean);
    }

    if (launchPage) {
        return [
            {
                label: 'Make page copy',
                icon: FileText,
                action: 'artifact',
                artifactKind: 'doc',
                intent: launchPageCopyIntent(mirror, intent),
            },
            {
                label: 'Test it',
                icon: Check,
                action: 'artifact',
                artifactKind: 'doc',
                intent: launchPageTestIntent(mirror, intent),
            },
        ];
    }

    return [
        {
            ...artifactAction,
            action: 'artifact',
            artifactKind,
            intent: artifactIntent,
        },
        mirror.move && {
            label: 'Another angle',
            icon: Sparkles,
            action: 'reflect',
            intent: `Give me one different useful angle on this, without repeating yourself. Keep one next move only: ${mirror.move}`,
        },
    ].filter(Boolean);
}

function isLearnActiveMirrorContext(mirror = {}, intent = '') {
    const text = `${intent} ${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    return /\bwhat is active mirror\b|\bhow do i use active mirror\b|\bhow does active mirror\b|\bmeet active mirror\b/.test(text)
        || /\bsecond pass before the world sees your first draft\b/.test(text)
        || /\bquestion about (?:what this can do|privacy|team use)\b/.test(text);
}

function resultStarterKind(mirror = {}, intent = '') {
    const text = `${intent} ${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    if (/\bwhat kind of thing:\s*image,\s*message,\s*page,\s*doc,\s*code,\s*or\s*plan\b/.test(text)) return 'make';
    if (/\bwhat are the two options\b/.test(text)) return 'decide';
    if (/\bwhat feels wrong:\s*unclear,\s*broken,\s*slow,\s*ugly,\s*or\s*blocked\b/.test(text)) return 'fix';
    if (/\bdefinition,\s*example,\s*comparison,\s*source,\s*or\s*next step\b/.test(text)) return 'understand';
    if (/\bwhat kind of fun:\s*image,\s*tiny game,\s*story,\s*surprise idea,\s*playlist,\s*or\s*prompt\b/.test(text)) return 'fun';
    return '';
}

function makeArtifact(mirror = {}, intent = '', kind = 'draft') {
    const question = mirror.question || 'What is the useful thing to try?';
    const move = mirror.move || 'Take the smallest concrete next step.';
    const cleanIntent = String(intent || 'the thing you want').replace(/\s+/g, ' ').trim();

    if (kind === 'image') {
        const posterLike = /\b(poster|flyer|banner|invitation|social post|instagram post|event|launch|offer|sale)\b/i.test(cleanIntent);
        return {
            kind,
            title: posterLike ? 'Poster starter' : 'Image prompt',
            body: [
                posterLike ? 'Poster prompt' : 'Image prompt',
                '',
                `Goal: ${cleanIntent || question}`,
                posterLike ? 'Layout: bold headline at top, one clear focal visual, short supporting line, simple call-to-action at bottom.' : '',
                `Feeling: calm, useful, warm, lightly magical, not busy.`,
                `Main idea: ${question}`,
                `Scene: one clear focal point that shows the outcome, not the machinery.`,
                posterLike ? 'Text treatment: leave clean space for the headline and keep all words large enough to read on a phone.' : '',
                `Avoid: clutter, medical or diagnostic cues, dashboards unless asked, model names, private details.`,
                `Next action: ${move}`,
            ].filter(Boolean).join('\n'),
            checklist: [
                'Use this as the prompt for image generation.',
                posterLike ? 'Replace the headline and call-to-action with the exact event or offer.' : '',
                'Remove anything private before generating it.',
            ].filter(Boolean),
        };
    }

    if (kind === 'code') {
        return {
            kind,
            title: 'Code starter',
            body: [
                'Goal',
                cleanIntent || question,
                '',
                'Acceptance',
                `- ${move}`,
                '- Keep the first version small enough to test in one screen.',
                '- Do not add storage, external calls, or irreversible actions unless approved.',
                '',
                'Starter',
                '```js',
                'export function nextStep(input) {',
                '  const text = String(input || "").trim();',
                '  if (!text) return { ok: false, message: "Add one sentence first." };',
                '  return { ok: true, move: text };',
                '}',
                '```',
            ].join('\n'),
            checklist: [
                'Replace the starter with exact code once the target stack is known.',
                'Keep private inputs out of logs and analytics.',
            ],
        };
    }

    if (kind === 'doc') {
        if (isLaunchPageContext(cleanIntent, mirror)) {
            const testMode = /\bfive-second|visitor test|pass signal|fail signal|what to watch\b/i.test(cleanIntent);
            return testMode ? {
                kind,
                title: 'Five-Second Page Test',
                body: [
                    'Test prompt:',
                    'Look at this first screen for five seconds. What would you click first?',
                    '',
                    'Watch for:',
                    '- Do they name the first action without explanation?',
                    '- Do they hesitate at the button?',
                    '- Do they ask what the product is before trying anything?',
                    '',
                    'Pass signal:',
                    'They can say the first action and the button feels low-risk.',
                    '',
                    'Fail signal:',
                    'They describe the idea but do not know what to do next.',
                    '',
                    `Next copy change: ${move}`,
                ].join('\n'),
                checklist: [
                    'Show only the first screen.',
                    'Do not explain the product first.',
                    'Write down the first action they name.',
                    'Change only one line after the test.',
                ],
            } : {
                kind,
                title: 'Launch Page Starter Copy',
                body: [
                    'Purpose: Get visitors to try the first action quickly so they understand the product by using it.',
                    '',
                    'Headline: Try the first step in seconds.',
                    '',
                    'Button label: Start now',
                    '',
                    'Reassurance line: No setup needed to see how it works.',
                    '',
                    'Short draft:',
                    'Start with the one thing your product does best. Let people try it right away, then explain the rest after they have seen the value.',
                    '',
                    `Concrete ask: ${move}`,
                ].join('\n'),
                checklist: [
                    'Use the headline as the main page title.',
                    'Put the button above the fold.',
                    'Keep the reassurance line close to the button.',
                    'Swap in your real first action where needed.',
                ],
            };
        }

        return {
            kind,
            title: 'Working doc',
            body: [
                cleanIntent || 'Working note',
                '',
                `Question: ${question}`,
                `Next: ${move}`,
                '',
                'Sendable version:',
                `I am working on this: ${cleanIntent || question}`,
                `The next step I am testing is: ${move}`,
                'Can you react to the idea and point out one thing that is unclear?',
            ].join('\n'),
            checklist: [
                'Remove private names or details before sharing.',
                'Keep the ask to one sentence if you send it.',
            ],
        };
    }

    return {
        kind,
        title: 'Message draft',
        body: [
            `I am working on this: ${cleanIntent || question}`,
            '',
            `The next thing I am trying is: ${move}`,
            '',
            'Can you give me one clear reaction?',
        ].filter(Boolean).join('\n'),
        checklist: [
            'Remove anything private.',
            'Keep the ask short if you send it.',
        ],
    };
}

function MirrorLogo() {
    return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="var(--am-primary-marker)" strokeWidth="1.6" />
            <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="var(--am-focus)" strokeWidth="1.6" />
        </svg>
    );
}

function readSavedSeed() {
    const profile = getArchetype();
    const blueprint = getBlueprint();
    if (!profile && !blueprint) return null;
    return { ...(profile || {}), blueprint };
}

function ReflectionGlow({ mirror }) {
    const text = `${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    const urgent = /\b(overwhelmed|stuck|panic|confused|scared|afraid|urgent|pressure|spiral|loop)\b/.test(text);
    const decisive = /\b(decide|choice|ship|send|test|move|start|today)\b/.test(text);
    const tone = urgent ? 'steady' : decisive ? 'clear' : 'open';
    const label = urgent ? 'steady' : decisive ? 'clear' : 'open';

    return (
        <div className="am-witness-line" data-tone={tone} aria-label={`Reflection tone: ${label}`} />
    );
}

function mirrorMemoryKey(mirror = {}) {
    return `${mirror.question || ''}::${mirror.move || ''}`;
}

function memoryItemKey(item = {}) {
    return item.savedAt || mirrorMemoryKey(item);
}

function formatSavedDate(value) {
    if (!value) return 'Saved here';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Saved here';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isActiveMemory(item = {}, activeDefault = null) {
    if (!activeDefault) return false;
    return memoryItemKey(item) === memoryItemKey(activeDefault) || mirrorMemoryKey(item) === mirrorMemoryKey(activeDefault);
}

function savedContextCue({ activeDefault = null, continuity = [] } = {}) {
    const latest = Array.isArray(continuity) ? continuity.find((entry) => entry?.intent || entry?.move) : null;
    const source = latest || activeDefault;
    const preview = source?.move || source?.question || source?.intent || '';
    if (!preview) return null;

    return {
        entry: latest || null,
        preview,
    };
}

function MicroVisual({ visual }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    if (!visual) return null;

    if (visual.kind === 'reframe') {
        return (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-full border px-3 py-1.5 line-through ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 decoration-stone-400' : 'border-white/10 bg-white/[0.04] text-zinc-400 decoration-zinc-600'}`}>{visual.left}</span>
                <span className={isLight ? 'text-cyan-700' : 'text-cyan-200'}>to</span>
                <span className={`rounded-full border px-3 py-1.5 font-semibold ${isLight ? 'border-cyan-500/20 bg-cyan-100/60 text-cyan-800' : 'border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-100'}`}>{visual.right}</span>
            </div>
        );
    }

    if (visual.kind === 'axes') {
        return (
            <div className={`mt-3 rounded-lg border p-3 ${isLight ? 'border-cyan-500/18 bg-cyan-50/70' : 'border-cyan-300/15 bg-cyan-300/[0.055]'}`}>
                <div className="am-witness-line mb-3" data-tone="clear" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span className={isLight ? 'text-stone-600' : 'text-zinc-300'}>{visual.left}</span>
                    <span className={`text-right ${isLight ? 'text-cyan-800' : 'text-cyan-100'}`}>{visual.right}</span>
                </div>
            </div>
        );
    }

    if (visual.kind === 'spectrum') {
        return (
            <div className={`mt-3 rounded-lg border p-3 ${isLight ? 'border-cyan-500/18 bg-cyan-50/70' : 'border-cyan-300/15 bg-cyan-300/[0.055]'}`}>
                <div className="am-witness-line mb-3" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span className={isLight ? 'text-stone-600' : ''}>{visual.left}</span>
                    <span className={`text-right ${isLight ? 'text-cyan-800' : 'text-cyan-100'}`}>{visual.right}</span>
                </div>
            </div>
        );
    }

    return null;
}

function NextMoveSurface({ mirror, onRemember, remembered, allowRemember = true, allowCopy = true }) {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);
    const isLight = theme === 'light';

    async function copyMove() {
        await copyText(mirror.move || '');
        setCopied(true);
        trackEvent('draft_copied', { page: 'home', source: 'next_move' });
        window.setTimeout(() => setCopied(false), 1600);
    }

    return (
        <div className="mt-4 grid gap-3">
            <div className={`rounded-lg border p-3.5 ${isLight ? 'border-stone-300/70 bg-white/65' : 'border-white/[0.075] bg-white/[0.032]'}`}>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                        <div className={`break-words text-[1rem] font-medium leading-7 sm:text-[1.02rem] ${isLight ? 'text-stone-800' : 'text-zinc-100'}`}>{mirror.move}</div>
                    </div>
                    {allowCopy ? (
                        <button
                            type="button"
                            onClick={copyMove}
                            className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${isLight ? 'border-stone-300/80 bg-stone-100/75 text-stone-700 hover:border-emerald-500/35 hover:bg-white hover:text-stone-950' : 'border-white/[0.08] bg-black/[0.14] text-zinc-200 hover:border-emerald-200/30 hover:bg-emerald-200/[0.07] hover:text-white'}`}
                        >
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    ) : null}
                </div>
            </div>
            {allowRemember ? (
            <div className="flex justify-start">
                <button
                    type="button"
                    onClick={() => onRemember?.(mirror)}
                    disabled={remembered}
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/50 text-stone-600 hover:border-blue-400/35 hover:text-stone-950 disabled:border-emerald-500/20 disabled:text-emerald-700' : 'border-white/10 bg-white/[0.028] text-zinc-400 hover:border-blue-300/30 hover:text-white disabled:border-emerald-300/18 disabled:text-emerald-100'}`}
                >
                    {remembered ? <Check size={13} /> : <BookmarkPlus size={13} />}
                    {remembered ? 'Saved' : 'Save'}
                </button>
            </div>
            ) : null}
            <MicroVisual visual={mirror.visual} />
        </div>
    );
}

function MirrorResult({ result, intent, turnSource = 'typed', onPrompt, disabled, onSourceChecked, onRemember, remembered }) {
    const { theme } = useTheme();
    const isLoading = Boolean(disabled && intent && !result);
    const mirror = result?.mirror || (isLoading ? LOADING_MIRROR : SAMPLE_MIRROR);
    const isPrivacyHold = result?.kind === 'privacy_hold';
    const isArtifactFirst = result?.kind === 'artifact_first';
    const isSetupReady = result?.kind === 'setup_ready';
    const isStartHelp = result?.kind === 'start_help';
    const isConversation = isConversationResult(result);
    const truthState = result?.truth_state || mirror.truth_state;
    const canPromptSourceCheck = ['typed', 'follow_up', 'surface', 'saved_context'].includes(turnSource);
    const showSourceCheck = canPromptSourceCheck && truthState?.status === 'needs_checking' && isSourceHeavyAsk(intent);
    const answerFirst = showSourceCheck && isAnswerFirstAsk(intent);
    const resultTrustState = isPrivacyHold
        ? 'rejected'
        : truthState?.status === 'checked'
            ? 'verified'
            : 'proposed';
    const focusText = String(mirror.question || '').trim();
    const moveText = String(mirror.move || '').trim();
    const isLight = theme === 'light';
    const assistantIconClass = isLight
        ? 'mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-blue-400/18 bg-white/65 text-blue-600 md:grid'
        : 'mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-blue-200/15 bg-white/[0.045] text-blue-100 md:grid';
    const panelClass = isLight
        ? 'min-w-0 flex-1 overflow-hidden rounded-lg border border-stone-300/70 bg-white/72 p-4 ring-1 ring-white/80 sm:p-5'
        : 'min-w-0 flex-1 overflow-hidden rounded-lg border border-white/[0.075] bg-white/[0.038] p-4 sm:p-5';
    const reflectionClass = `mt-4 break-words text-[1rem] leading-7 sm:text-[1.08rem] ${isLight ? 'text-stone-800' : 'text-zinc-100'}`;
    const focusClass = isLight
        ? 'mt-4 break-words rounded-lg border border-blue-400/14 bg-blue-50/70 px-3.5 py-3 text-[0.95rem] font-medium leading-7 text-stone-800'
        : 'mt-4 break-words rounded-lg border border-blue-200/10 bg-blue-200/[0.045] px-3.5 py-3 text-[0.95rem] font-medium leading-7 text-blue-50/86';
    const focusLabelClass = `mb-1 text-[10px] font-semibold uppercase tracking-[0.17em] ${isLight ? 'text-blue-700/55' : 'text-blue-100/55'}`;

    if (isLoading) {
        return <LoadingPanel />;
    }

    if (isPrivacyHold) {
        return (
            <div className="grid gap-3">
                <div className="flex items-start gap-3">
                    <div className={assistantIconClass}>
                        <MirrorLogo />
                    </div>
                    <div className={panelClass}>
                        <div className="mb-3"><TrustStateMark state={resultTrustState} /></div>
                        <ReflectionGlow mirror={mirror} />
                        <p className={reflectionClass}>
                            {mirror.reflection}
                        </p>
                        <div className={`mt-4 rounded-lg border px-3.5 py-3 text-[0.98rem] font-semibold leading-7 ${isLight ? 'border-emerald-500/16 bg-emerald-50/75 text-emerald-900' : 'border-emerald-200/12 bg-emerald-200/[0.055] text-emerald-50'}`}>
                            {mirror.move}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (answerFirst) {
        return (
            <div className="grid gap-3">
                <NeedsSources
                    truthState={truthState}
                    intent={intent}
                    mirror={mirror}
                    disabled={disabled}
                    onPrompt={onPrompt}
                    onSourceChecked={onSourceChecked}
                    autoCheck
                    answerFirst
                />
            </div>
        );
    }

    if (isArtifactFirst) {
        return (
            <div className="grid gap-3">
                <div className="flex items-start gap-3">
                    <div className={assistantIconClass}>
                        <MirrorLogo />
                    </div>
                    <div className={panelClass}>
                        <div className="mb-3"><TrustStateMark state={resultTrustState} /></div>
                        <ReflectionGlow mirror={mirror} />
                        <p className={`${reflectionClass} font-medium`}>
                            {mirror.reflection}
                        </p>
                        <div className={`mt-3 break-words text-sm leading-6 ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                            {mirror.move}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            <div className="flex items-start gap-3">
                <div className={assistantIconClass}>
                    <MirrorLogo />
                </div>
                <div className={panelClass}>
                    <div className="mb-3"><TrustStateMark state={resultTrustState} /></div>
                    <ReflectionGlow mirror={mirror} />
                    <p className={reflectionClass}>
                        {mirror.reflection}
                    </p>
                    {!isConversation && focusText ? (
                        <div className={focusClass}>
                            <div className={focusLabelClass}>Start here</div>
                            {focusText}
                        </div>
                    ) : null}
                    {!isConversation && moveText ? (
                        <NextMoveSurface
                            mirror={mirror}
                            onRemember={onRemember}
                            remembered={remembered}
                            allowRemember={!isPrivacyHold && !isSetupReady && !isStartHelp}
                            allowCopy={!isSetupReady && !isStartHelp}
                        />
                    ) : null}
                </div>
            </div>
            {showSourceCheck ? (
                <NeedsSources
                    truthState={truthState}
                    intent={intent}
                    mirror={mirror}
                    disabled={disabled}
                    onPrompt={onPrompt}
                    onSourceChecked={onSourceChecked}
                    autoCheck={false}
                    answerFirst={false}
                />
            ) : null}
        </div>
    );
}

function LoadingPanel() {
    return (
        <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] px-5 py-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <LoaderCircle size={16} className="animate-spin text-cyan-200" aria-hidden="true" />
                Finding the useful move
            </div>
            <div className="grid gap-2">
                <div className="h-3 w-3/4 rounded-full bg-white/10" />
                <div className="h-3 w-1/2 rounded-full bg-white/10" />
                <div className="h-3 w-2/3 rounded-full bg-white/10" />
            </div>
        </div>
    );
}

function WorkSurface({ draft, busyKind, onClose, onRegenerateImage, onSharpenImage }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const working = Boolean(busyKind && !draft);
    if (!draft && !working) return null;

    if (working) {
        const { icon: Icon } = artifactActionFor(busyKind);

        return (
            <section className={`min-w-0 overflow-hidden rounded-lg border px-4 py-4 ${isLight ? 'border-stone-300/70 bg-white/72' : 'border-cyan-300/15 bg-cyan-300/[0.055]'}`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${isLight ? 'border-cyan-500/18 bg-cyan-50 text-cyan-700' : 'border-cyan-200/20 bg-cyan-300/[0.07] text-cyan-100'}`}>
                            <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                            <div className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-cyan-50'}`}>Making it useful</div>
                            <div className={`text-xs ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>Almost there.</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white'}`}
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>
                </div>
                <div className="grid gap-2">
                    <div className={`h-3 w-4/5 rounded-full ${isLight ? 'bg-stone-200/80' : 'bg-white/10'}`} />
                    <div className={`h-3 w-2/3 rounded-full ${isLight ? 'bg-stone-200/70' : 'bg-white/10'}`} />
                    <div className={`h-24 rounded-lg border ${isLight ? 'border-stone-300/65 bg-stone-100/70' : 'border-white/10 bg-black/20'}`} />
                </div>
            </section>
        );
    }

    const note = workSurfaceNote(draft);

    return (
        <div className="relative min-w-0">
            <button
                type="button"
                onClick={onClose}
                className={`absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition ${isLight ? 'border-stone-300/70 bg-white/74 text-stone-600 hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/25 hover:text-white'}`}
                aria-label="Close"
            >
                <X size={15} />
            </button>
            <ArtifactCard
                artifact={draft}
                surface="home"
                dismissInset
                onRegenerate={draft?.kind === 'image' ? onRegenerateImage : undefined}
                onSharpen={draft?.kind === 'image' ? onSharpenImage : undefined}
            />
            <div className={`mt-2 px-1 text-xs leading-5 ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>{note}</div>
        </div>
    );
}

function workSurfaceNote(draft) {
    if (artifactIsNotReady(draft)) return 'Edit the placeholders before using it.';
    if (draft?.kind === 'image' && artifactHasImageMedia(draft)) {
        return 'Ready to download. Try again if you want a different version.';
    }
    if (draft?.kind === 'image') {
        return 'Image generation is busy. Try again or use the prompt.';
    }
    if (draft?.challenge?.status === 'needs_check') return 'Check before relying on it.';
    if (draft?.challenge?.status === 'failed') return 'Edit before using it.';
    return 'Ready to copy. Edit if needed.';
}

function ReflectionField({ awake = false }) {
    return (
        <div className={`reflection-field ${awake ? 'reflection-field--awake' : ''}`} aria-hidden="true">
            <svg className="reflection-field__svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
                <path className="reflection-field__arc reflection-field__arc--a" d="M174 448 C 340 196, 840 122, 1046 390" />
                <path className="reflection-field__arc reflection-field__arc--b" d="M152 520 C 388 330, 788 292, 1070 482" />
                <path className="reflection-field__arc reflection-field__arc--c" d="M276 610 C 492 428, 706 398, 936 576" />
                <ellipse className="reflection-field__lens" cx="600" cy="414" rx="342" ry="118" />
            </svg>
        </div>
    );
}

function LocalSenseLine({ sense }) {
    const cue = sense?.cues?.[0];
    if (!sense?.hasText || !cue) return null;

    const tone = cue.tone === 'block'
        ? 'border-red-300/20 bg-red-300/[0.07] text-red-100'
        : cue.tone === 'caution'
            ? 'border-amber-300/20 bg-amber-300/[0.07] text-amber-100'
            : cue.tone === 'good'
                ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100'
                : 'border-blue-300/20 bg-blue-300/[0.07] text-blue-100';

    return (
        <div className={`inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs leading-5 ${tone}`}>
            <span className="truncate">{cue.label}</span>
        </div>
    );
}

function MemoryDrawer({
    open,
    items,
    continuity = [],
    savedChats = [],
    activeDefault,
    onClose,
    onUse,
    onPause,
    onDelete,
    onEdit,
    onUseSavedChat,
    onDeleteSavedChat,
    onUseContinuity,
    onDeleteContinuity,
    onClearContinuity,
}) {
    const [editingKey, setEditingKey] = useState('');
    const [draft, setDraft] = useState({ question: '', move: '' });
    const [mode, setMode] = useState('list');
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFlipped, setCardFlipped] = useState(false);

    if (!open) return null;

    const activeCardIndex = items.length ? Math.min(cardIndex, items.length - 1) : 0;
    const activeCard = items[activeCardIndex] || null;
    const hasSavedContext = savedChats.length > 0 || items.length > 0 || continuity.length > 0;

    function changeCard(delta) {
        if (!items.length) return;
        setCardIndex((current) => (current + delta + items.length) % items.length);
        setCardFlipped(false);
    }

    function startEdit(item) {
        setMode('list');
        setEditingKey(memoryItemKey(item));
        setDraft({
            question: item.question || '',
            move: item.move || '',
        });
    }

    function saveEdit(item) {
        onEdit?.(memoryItemKey(item), draft);
        setEditingKey('');
        setDraft({ question: '', move: '' });
    }

    return (
        <div className="fixed inset-0 z-30 bg-black/65 px-3 py-4 backdrop-blur-md sm:px-6" role="dialog" aria-modal="true" aria-label="Saved here">
            <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="Close saved"
                onClick={onClose}
            />
            <div className="relative mx-auto flex max-h-[88dvh] max-w-3xl flex-col overflow-hidden rounded-lg border border-white/12 bg-[var(--am-surface)] ring-1 ring-white/[0.04]">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                    <div>
                        <div className="text-lg font-semibold text-white">Saved here</div>
                        <div className="mt-1 text-sm leading-6 text-zinc-400">Only on this browser. Reopen, edit, or remove anything.</div>
                        {items.length ? (
                            <button
                                type="button"
                                onClick={() => setMode((current) => current === 'cards' ? 'list' : 'cards')}
                                className="mt-3 min-h-10 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/35"
                            >
                                {mode === 'cards' ? 'Show list' : 'Show cards'}
                            </button>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-blue-200/30 hover:text-white"
                        aria-label="Close saved"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-4">
                    {!hasSavedContext ? (
                        <div className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-5 text-sm leading-6 text-zinc-400">
                            Nothing saved yet. When an answer is useful, choose Save.
                        </div>
                    ) : mode === 'cards' && activeCard ? (
                        <div className="grid gap-3">
                            <button
                                type="button"
                                onClick={() => setCardFlipped((value) => !value)}
                                className="min-h-[17rem] rounded-lg border border-blue-200/15 bg-white/[0.04] p-5 text-left transition hover:border-blue-200/30"
                            >
                                <div className="mb-5 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                    <span>Card {activeCardIndex + 1} of {items.length}</span>
                                    <span>{cardFlipped ? 'Move' : 'Pattern'}</span>
                                </div>
                                <div className="flex min-h-40 items-center">
                                    <p className={`text-2xl font-semibold leading-tight ${cardFlipped ? 'text-emerald-50' : 'text-white'} sm:text-3xl`}>
                                        {cardFlipped
                                            ? activeCard.move || 'No move saved yet.'
                                            : activeCard.question || 'No question saved yet.'}
                                    </p>
                                </div>
                                <div className="mt-5 text-sm text-zinc-400">
                                    {cardFlipped ? 'Tap to see the pattern again.' : 'Tap to reveal the move.'}
                                </div>
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => changeCard(-1)}
                                    className="min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-200/30 hover:text-white"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUse?.(activeCard);
                                        setCardFlipped(true);
                                    }}
                                    className="min-h-11 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/35"
                                >
                                    Use
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeCard(1)}
                                    className="min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-200/30 hover:text-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {savedChats.length ? (
                                <section className="rounded-lg border border-blue-300/12 bg-blue-300/[0.045] p-3">
                                    <div className="mb-3">
                                        <div className="text-sm font-semibold text-blue-50">Saved chats</div>
                                        <div className="mt-1 text-xs leading-5 text-zinc-400">Only on this browser. Reopen or delete anytime.</div>
                                    </div>
                                    <div className="grid gap-2">
                                        {savedChats.map((entry) => (
                                            <div key={entry.id || entry.savedAt} className="rounded-lg border border-white/10 bg-black/16 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{formatSavedDate(entry.savedAt)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteSavedChat?.(entry.id || entry.savedAt)}
                                                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-red-300/30 hover:text-red-100"
                                                        aria-label="Delete saved chat"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div className="text-sm font-semibold leading-6 text-zinc-100">{entry.title || 'Saved chat'}</div>
                                                {entry.thread?.result?.mirror?.move ? (
                                                    <div className="mt-2 max-h-16 overflow-hidden rounded-lg border border-cyan-300/15 bg-cyan-300/[0.055] px-3 py-2 text-sm leading-6 text-cyan-50">
                                                        {entry.thread.result.mirror.move}
                                                    </div>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => onUseSavedChat?.(entry)}
                                                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-blue-200/18 bg-blue-200/[0.06] px-3.5 text-xs font-semibold text-blue-50 transition hover:border-blue-100/35"
                                                >
                                                    Open chat
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {continuity.length ? (
                                <section className="rounded-lg border border-cyan-300/12 bg-cyan-300/[0.045] p-3">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-cyan-50">Saved by you</div>
                                            <div className="mt-1 text-xs leading-5 text-zinc-400">Only on this browser. Delete it anytime.</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClearContinuity}
                                            className="min-h-10 rounded-full border border-white/10 bg-black/15 px-3.5 text-xs font-semibold text-zinc-400 transition hover:border-red-300/30 hover:text-red-100"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="grid gap-2">
                                        {continuity.map((entry) => (
                                            <div key={entry.savedAt} className="rounded-lg border border-white/10 bg-black/16 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{formatSavedDate(entry.savedAt)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteContinuity?.(entry.savedAt)}
                                                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-red-300/30 hover:text-red-100"
                                                        aria-label="Delete saved item"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div className="text-sm leading-6 text-zinc-300">{entry.intent || 'Saved reflection'}</div>
                                                {entry.move ? (
                                                    <div className="mt-2 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-sm font-semibold leading-6 text-emerald-50">
                                                        {entry.move}
                                                    </div>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => onUseContinuity?.(entry)}
                                                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-cyan-200/30 hover:text-white"
                                                >
                                                    Use this
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {items.map((item) => {
                                const key = memoryItemKey(item);
                                const editing = editingKey === key;
                                const active = isActiveMemory(item, activeDefault);

                                return (
                                    <div key={key} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${active ? 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                                                {active ? 'Using now' : 'Saved'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => active ? onPause?.() : onUse?.(item)}
                                                    className="min-h-10 rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-300/30 hover:text-white"
                                                >
                                                    {active ? 'Pause' : 'Use'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => editing ? setEditingKey('') : startEdit(item)}
                                                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-blue-200/30 hover:text-white"
                                                    aria-label={editing ? 'Cancel edit' : 'Edit saved note'}
                                                >
                                                    {editing ? <X size={15} /> : <Pencil size={15} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(key)}
                                                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-red-300/30 hover:text-red-100"
                                                    aria-label="Delete saved note"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {editing ? (
                                            <div className="grid gap-2">
                                                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                                    Question
                                                    <textarea
                                                        rows={2}
                                                        value={draft.question}
                                                        onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))}
                                                        className="resize-none rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none focus:border-blue-200/35"
                                                    />
                                                </label>
                                                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                                    Move
                                                    <textarea
                                                        rows={2}
                                                        value={draft.move}
                                                        onChange={(event) => setDraft((current) => ({ ...current, move: event.target.value }))}
                                                        className="resize-none rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none focus:border-blue-200/35"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => saveEdit(item)}
                                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/35"
                                                >
                                                    <Save size={15} />
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                <div className="rounded-lg border border-white/10 bg-black/18 px-3 py-3 text-sm leading-6 text-zinc-300">
                                                    {item.question || 'No question saved.'}
                                                </div>
                                                <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-3 text-sm font-semibold leading-6 text-emerald-50">
                                                    {item.move || 'No move saved.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const initialChatRef = useRef(null);
    const initialSessionChatRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const workSurfaceRef = useRef(null);
    const bootPromptRef = useRef(false);
    const privateRecallResumeRef = useRef(false);
    const privateRecallSearchRef = useRef(0);
    if (initialChatRef.current === null) initialChatRef.current = getHomeChatContinuity();
    if (initialSessionChatRef.current === null) initialSessionChatRef.current = getSessionHomeChat();
    const restoredThread = initialChatRef.current?.enabled ? initialChatRef.current.thread : initialSessionChatRef.current;
    const restoredFromSession = !initialChatRef.current?.enabled && Boolean(initialSessionChatRef.current);
    const [seed, setSeed] = useState(() => readSavedSeed());
    const [activeDefault, setActiveDefault] = useState(() => getActiveMirrorDefault());
    const [mirrorDefaults, setMirrorDefaults] = useState(() => getMirrorDefaults());
    const [continuityLedger, setContinuityLedger] = useState(() => getContinuityLedger());
    const [chatMemoryEnabled, setChatMemoryEnabled] = useState(() => Boolean(initialChatRef.current?.enabled));
    const [savedHomeChats, setSavedHomeChats] = useState(() => initialChatRef.current?.savedThreads || []);
    const [chatMemoryFlash, setChatMemoryFlash] = useState(() => {
        if (!restoredThread) return '';
        return restoredFromSession ? 'Picked up where you left.' : 'Chat restored.';
    });
    const [text, setText] = useState(() => restoredThread?.draftText || '');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(() => restoredThread?.result || null);
    const [lastIntent, setLastIntent] = useState(() => restoredThread?.lastIntent || '');
    const [lastSource, setLastSource] = useState(() => restoredThread?.lastSource || 'typed');
    const [lastStarterKind, setLastStarterKind] = useState(() => restoredThread?.lastStarterKind || '');
    const [sessionContextMessages, setSessionContextMessages] = useState(() => initialSessionChatRef.current?.sessionContextMessages || []);
    const [lastSense, setLastSense] = useState(null);
    const [sendableDraft, setSendableDraft] = useState(() => restoredThread?.sendableDraft || null);
    const [artifactBusy, setArtifactBusy] = useState('');
    const [lastArtifactRequest, setLastArtifactRequest] = useState(null);
    const [workSurfaceOpen, setWorkSurfaceOpen] = useState(() => restoredThread ? Boolean(restoredThread.workSurfaceOpen) : true);
    const [rememberedKey, setRememberedKey] = useState('');
    const [memoryOpen, setMemoryOpen] = useState(false);
    const [privateRecallOpen, setPrivateRecallOpen] = useState(false);
    const [privateRecallStatus, setPrivateRecallStatus] = useState(() => getPrivateRecallSnapshot());
    const [privateRecallMatches, setPrivateRecallMatches] = useState([]);
    const [privateRecallDismissedText, setPrivateRecallDismissedText] = useState('');
    const [importStatus, setImportStatus] = useState('');
    const [loopCount, setLoopCount] = useState(0);
    const [processingBoundary, setProcessingBoundary] = useState('local_device');
    const [, setLastSourceCheck] = useState(null);
    const followUps = useMemo(() => makeFollowUps(result?.mirror || SAMPLE_MIRROR, loopCount, lastIntent), [result, loopCount, lastIntent]);
    const typingSense = useMemo(() => assessLocalMirrorSense(text, { activeDefault, mirrorDefaults, seed }), [activeDefault, mirrorDefaults, seed, text]);
    const savedCue = useMemo(() => savedContextCue({ activeDefault, continuity: continuityLedger }), [activeDefault, continuityLedger]);
    const privateRecallItems = useMemo(() => buildPrivateRecallItems({
        savedChats: savedHomeChats,
        continuity: continuityLedger,
        mirrorDefaults,
    }), [continuityLedger, mirrorDefaults, savedHomeChats]);
    const privateRecallFingerprint = useMemo(() => privateRecallItemsFingerprint(privateRecallItems), [privateRecallItems]);
    const privateRecallLanguage = useMemo(
        () => languagePayloadFor(text, { seed }).reply_language,
        [seed, text],
    );

    useEffect(() => {
        trackEvent('home_view', { page: 'home', surface: 'homepage' });
    }, []);

    useEffect(() => {
        const unsubscribe = subscribePrivateRecall(setPrivateRecallStatus);
        restorePrivateRecallPreference().catch(() => {});
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!privateRecallStatus.enabled || privateRecallStatus.ready || privateRecallResumeRef.current) return undefined;
        privateRecallResumeRef.current = true;
        let canceled = false;
        const start = () => {
            resumePrivateRecall()
                .then(() => {
                    if (!canceled) trackEvent('private_recall_resumed', { page: 'home', source: 'browser_local' });
                })
                .catch(() => {
                    if (!canceled) trackEvent('private_recall_resume_failed', { page: 'home', source: 'browser_local' });
                });
        };
        const idleId = window.requestIdleCallback
            ? window.requestIdleCallback(start, { timeout: 1200 })
            : window.setTimeout(start, 320);
        return () => {
            canceled = true;
            if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
            else window.clearTimeout(idleId);
        };
    }, [privateRecallStatus.enabled, privateRecallStatus.ready]);

    useEffect(() => {
        if (!privateRecallStatus.ready) return undefined;
        let canceled = false;
        syncPrivateRecallItems(privateRecallItems)
            .then((next) => {
                if (!canceled) trackEvent('private_recall_synced', { page: 'home', source: 'explicit_saves', count: next.count || 0 });
            })
            .catch(() => {
                if (!canceled) trackEvent('private_recall_sync_failed', { page: 'home', source: 'browser_local' });
            });
        return () => {
            canceled = true;
        };
    }, [privateRecallFingerprint, privateRecallStatus.ready]);

    useEffect(() => {
        const query = text.trim();
        if (!privateRecallStatus.ready || busy || typingSense.hardPrivate || query.length < 6 || query === privateRecallDismissedText) {
            setPrivateRecallMatches([]);
            return undefined;
        }

        const requestKey = ++privateRecallSearchRef.current;
        const timer = window.setTimeout(() => {
            searchPrivateRecall(query)
                .then((matches) => {
                    if (privateRecallSearchRef.current === requestKey) setPrivateRecallMatches(matches);
                })
                .catch(() => {
                    if (privateRecallSearchRef.current === requestKey) setPrivateRecallMatches([]);
                });
        }, 520);
        return () => window.clearTimeout(timer);
    }, [busy, privateRecallDismissedText, privateRecallStatus.ready, text, typingSense.hardPrivate]);

    useEffect(() => {
        if (!chatMemoryFlash) return undefined;
        const timer = window.setTimeout(() => setChatMemoryFlash(''), 2400);
        return () => window.clearTimeout(timer);
    }, [chatMemoryFlash]);

    useEffect(() => {
        const snapshot = currentChatSnapshot({ includeSessionContext: true });
        if (!snapshot.draftText && !snapshot.result && !snapshot.lastIntent && !snapshot.sendableDraft && !snapshot.sessionContextMessages.length) {
            clearSessionHomeChat();
            return;
        }
        saveSessionHomeChat(snapshot);
    }, [lastIntent, lastSource, lastStarterKind, result, sendableDraft, sessionContextMessages, text, workSurfaceOpen]);

    useEffect(() => {
        if (!chatMemoryEnabled) return;
        saveHomeChatContinuity({
            draftText: text,
            result,
            lastIntent,
            lastSource,
            lastStarterKind,
            sendableDraft,
            workSurfaceOpen,
        });
    }, [chatMemoryEnabled, lastIntent, lastSource, lastStarterKind, result, sendableDraft, text, workSurfaceOpen]);

    useEffect(() => {
        if (bootPromptRef.current || !location.state?.mirrorReady) return;
        bootPromptRef.current = true;
        setSeed(readSavedSeed());
        setResult(makeSetupReadyResult());
        setLastIntent('setup ready');
        setLastSource('setup_ready');
        setImportStatus('Ready.');
        window.setTimeout(() => setImportStatus(''), 2800);
        window.setTimeout(() => inputRef.current?.focus(), 60);
        window.history.replaceState({}, document.title, window.location.pathname);
    }, [location.state]);

    useEffect(() => {
        if (!workSurfaceOpen || (!sendableDraft && !artifactBusy)) return;
        if (!window.matchMedia('(max-width: 1023px)').matches) return;

        window.setTimeout(() => {
            workSurfaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }, [artifactBusy, sendableDraft, workSurfaceOpen]);

    async function turnOnPrivateRecall() {
        try {
            const next = await enablePrivateRecall();
            privateRecallResumeRef.current = true;
            trackEvent('private_recall_enabled', { page: 'home', source: 'explicit_approval', accelerator: next.accelerator || 'wasm' });
        } catch {
            trackEvent('private_recall_enable_failed', { page: 'home', source: 'browser_local' });
        }
    }

    async function turnOffPrivateRecallHere() {
        await turnOffPrivateRecall();
        privateRecallResumeRef.current = false;
        setPrivateRecallMatches([]);
        trackEvent('private_recall_disabled', { page: 'home', source: 'explicit_action' });
    }

    async function clearPrivateRecallHere() {
        try {
            await clearPrivateRecall();
            privateRecallResumeRef.current = false;
            setPrivateRecallMatches([]);
            trackEvent('private_recall_cleared', { page: 'home', source: 'explicit_action' });
        } catch {
            trackEvent('private_recall_clear_failed', { page: 'home', source: 'browser_local' });
        }
    }

    function usePrivateRecallMatch(item) {
        const current = text.trim();
        const context = String(item?.text || '').trim().slice(0, 520);
        if (!context) return;
        const contextLabel = RECALL_CONTEXT_LABELS[privateRecallLanguage] || 'Context I chose from this device:';
        const nextText = [current, `${contextLabel}\n${context}`]
            .filter(Boolean)
            .join('\n\n')
            .slice(0, 1000);
        setText(nextText);
        setPrivateRecallMatches([]);
        setPrivateRecallDismissedText(nextText);
        trackEvent('private_recall_used', { page: 'home', source: 'explicit_action', kind: item?.kind || 'saved' });
        window.setTimeout(() => inputRef.current?.focus(), 40);
    }

    async function reflect(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 4 || busy) return;
        const shortStartFollowup = source === 'typed' && isShortStartResult(result);
        const starterFollowupKind = source === 'typed' && result?.kind === 'starter' ? lastStarterKind || 'make' : '';
        const selectedMakeBrief = starterFollowupKind === 'make' ? explicitMakeBrief(cleanIntent) : null;

        const sense = assessLocalMirrorSense(cleanIntent, { activeDefault, mirrorDefaults, seed });
        const gatewayRoute = conversationRouteFor(cleanIntent, { source });
        const responseMode = gatewayRoute === 'chat' ? 'conversation' : 'reflection';
        const stateIntent = sense.blocked
            ? 'privacy check'
            : sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
        setLastIntent(stateIntent);
        setLastSource(source);
        setLastSense(sense);
        setProcessingBoundary('local_device');
        setLoopCount((current) => source === 'follow_up' ? Math.min(current + 1, 6) : 0);
        setSendableDraft(null);
        setArtifactBusy('');
        setWorkSurfaceOpen(false);
        trackEvent('mirror_submit', { page: 'home', source, route: gatewayRoute, status: 'started' });

        if (sense.blocked) {
            setText('');
            setResult(makeLocalPrivacyResult(sense));
            setLastStarterKind('');
            trackEvent('local_privacy_hold', { page: 'home', source, status: 'blocked' });
            return;
        }

        setText('');
        setPrivateRecallMatches([]);
        setPrivateRecallDismissedText('');

        if (selectedMakeBrief) {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            const artifactKind = artifactKindForMakeFormat(selectedMakeBrief.format);
            const artifactResult = makeArtifactFirstResult(safeIntent, artifactKind);
            setLastIntent(safeIntent);
            setResult(artifactResult);
            setLastStarterKind('');
            trackEvent('starter_make_artifact', { page: 'home', source: 'starter', status: 'artifact_first', label: artifactKind });
            createArtifact(artifactKind, {
                mirror: artifactResult.mirror,
                intent: safeIntent,
                source: 'starter_make',
            });
            return;
        }

        if (starterFollowupKind) {
            const safeFollowup = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            const starterResult = makeStarterFollowupResult(starterFollowupKind, safeFollowup);
            setResult(starterResult);
            setLastStarterKind('');
            trackEvent('starter_followup', { page: 'home', source: 'starter', label: starterFollowupKind, status: 'local' });
            return;
        }

        if (isEcosystemAsk(cleanIntent)) {
            setResult(makeEcosystemResult(cleanIntent));
            setLastStarterKind('');
            trackEvent('ecosystem_result', { page: 'home', source, status: 'local' });
            return;
        }

        if (isStartHelpAsk(cleanIntent)) {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            setLastIntent(safeIntent);
            setResult(makeStartHelpResult(safeIntent));
            setLastStarterKind('');
            trackEvent('start_help_result', { page: 'home', source, status: 'local' });
            return;
        }

        setLastStarterKind('');

        if (isAnswerFirstAsk(cleanIntent)) {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            setLastIntent(safeIntent);
            setResult(makeAnswerFirstSourceResult(safeIntent));
            trackEvent('answer_first_source', { page: 'home', source, status: 'source_check_first' });
            return;
        }

        if (source === 'typed' && shouldOpenWorkSurface(cleanIntent, {})) {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            const artifactKind = detectArtifactKind(safeIntent, {});
            const artifactResult = makeArtifactFirstResult(safeIntent, artifactKind);
            setLastIntent(safeIntent);
            setResult(artifactResult);
            trackEvent('artifact_first', { page: 'home', source, status: 'artifact_first', label: artifactKind });
            createArtifact(artifactKind, {
                mirror: artifactResult.mirror,
                intent: safeIntent,
                source: 'artifact_first',
            });
            return;
        }

        const language = languagePayloadFor(cleanIntent, { seed });
        setBusy(true);
        const applyLocalFallback = (reason) => {
            const offlineResult = makeOfflineMirrorResult(cleanIntent, reason, language);
            const fallbackResult = responseMode === 'conversation'
                ? makeOfflineConversationResult(cleanIntent, offlineResult, sense.toneCue, language)
                : offlineResult;
            setResult({ ...fallbackResult, ...language });
            setSessionContextMessages((current) => appendSessionContextMessages(current, [
                { role: 'user', content: cleanIntent },
                { role: 'assistant', content: assistantTextForSession(fallbackResult.mirror, responseMode) },
            ]));

            if (shouldOpenWorkSurface(cleanIntent, {})) {
                createArtifact(detectArtifactKind(cleanIntent, fallbackResult.mirror), {
                    mirror: fallbackResult.mirror,
                    intent: cleanIntent,
                    source: 'auto_local',
                });
            }
        };

        if (!navigator.onLine) {
            trackEvent('mirror_result', { page: 'home', source, route: 'browser_local', status: 'offline' });
            applyLocalFallback('offline');
            setBusy(false);
            return;
        }

        setProcessingBoundary('external_provider');
        try {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            const seededIntent = seed || sense.approvedDefault || sense.drift || sense.softPrivate
                ? buildLocalSenseContext(sense, safeIntent)
                : safeIntent;
            const sessionContext = gatewayRoute === 'chat'
                ? buildSessionContextEnvelope({
                    mode: responseMode,
                    tone: sense.toneCue,
                    messages: sessionContextMessages,
                })
                : null;
            const response = await fetch(MIRROR_CREATE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Active-Mirror-Session': getPrivacySessionId(),
                },
                body: JSON.stringify({
                    intent: seededIntent,
                    boundary: 'personal',
                    route: gatewayRoute,
                    turn: shortStartFollowup
                        ? 2
                        : sessionContextMessages.filter((message) => message.role === 'user').length + 1,
                    mode: shortStartFollowup ? 'short_start_followup' : 'standard',
                    ...(sessionContext ? { session_context: sessionContext } : {}),
                    ...language,
                }),
            });
            const data = await response.json();
            trackEvent('mirror_result', {
                page: 'home',
                source,
                route: data.route?.capability || gatewayRoute,
                status: data.ok ? 'ok' : 'blocked',
                fallback: Boolean(data.fallback),
                visualKind: data.mirror?.visual?.kind || 'none',
            });

            const nextResult = data.ok
                ? {
                    ...data,
                    ...language,
                    responseMode: data.responseMode || data.response_mode || responseMode,
                }
                : { ...makeBlockedResult(data), ...language };
            setResult(nextResult);

            if (data.ok) {
                setSessionContextMessages((current) => appendSessionContextMessages(current, [
                    { role: 'user', content: safeIntent },
                    { role: 'assistant', content: assistantTextForSession(nextResult.mirror, responseMode) },
                ]));
            }

            if (data.ok && shouldOpenWorkSurface(cleanIntent, {})) {
                createArtifact(detectArtifactKind(cleanIntent, nextResult.mirror), {
                    mirror: nextResult.mirror,
                    intent: cleanIntent,
                    source: shortStartFollowup ? 'auto_second_turn' : 'auto',
                });
            }
        } catch {
            trackEvent('gateway_error', { page: 'home', source, route: gatewayRoute, status: 'network' });
            setProcessingBoundary('local_device');
            applyLocalFallback('network');
        } finally {
            setBusy(false);
        }
    }

    function rememberMirror(mirror = {}) {
        const saved = saveMirrorDefault({
            question: mirror.question,
            move: mirror.move,
            source: 'home',
        });
        const nextLedger = saveContinuityEntry({
            intent: lastIntent || mirror.question,
            question: mirror.question,
            move: mirror.move,
            source: 'user_save',
        });
        setActiveDefault(saved);
        setMirrorDefaults(getMirrorDefaults());
        setContinuityLedger(nextLedger);
        setRememberedKey(mirrorMemoryKey(mirror));
        trackEvent('mirror_default_saved', { page: 'home', source: 'explicit_approval' });
    }

    function refreshMemoryState(nextState) {
        setActiveDefault(nextState?.activeDefault ?? getActiveMirrorDefault());
        setMirrorDefaults(nextState?.mirrorDefaults ?? getMirrorDefaults());
        setContinuityLedger(nextState?.continuityLedger ?? getContinuityLedger());
    }

    function useSavedMemory(item) {
        setActiveDefault(useMirrorDefault(item));
        trackEvent('mirror_default_used', { page: 'home', source: 'memory_drawer' });
    }

    function pauseMemory() {
        clearMirrorDefault();
        refreshMemoryState();
        trackEvent('mirror_default_paused', { page: 'home', source: 'memory_drawer' });
    }

    function editMemory(key, updates) {
        refreshMemoryState(updateMirrorDefault(key, updates));
        trackEvent('mirror_default_edited', { page: 'home', source: 'memory_drawer' });
    }

    function removeMemory(key) {
        refreshMemoryState(deleteMirrorDefault(key));
        trackEvent('mirror_default_deleted', { page: 'home', source: 'memory_drawer' });
    }

    function useContinuity(entry, source = 'memory_drawer') {
        const intent = [entry?.intent, entry?.move].filter(Boolean).join(' Next: ');
        setMemoryOpen(false);
        reflect(intent || 'Use what I saved here.', 'saved_context');
        trackEvent('continuity_used', { page: 'home', source });
    }

    function continueSavedContext() {
        if (savedCue?.entry) {
            useContinuity(savedCue.entry, 'home_cue');
            return;
        }

        const intent = [activeDefault?.question, activeDefault?.move].filter(Boolean).join(' Next: ');
        reflect(intent || 'Use what I saved here.', 'saved_context');
        trackEvent('mirror_default_used', { page: 'home', source: 'home_cue' });
    }

    function removeContinuity(key) {
        setContinuityLedger(deleteContinuityEntry(key));
        trackEvent('continuity_deleted', { page: 'home', source: 'memory_drawer' });
    }

    function clearContinuity() {
        setContinuityLedger(clearContinuityLedger());
        trackEvent('continuity_cleared', { page: 'home', source: 'memory_drawer' });
    }

    function currentChatSnapshot({ includeSessionContext = false } = {}) {
        const snapshot = {
            draftText: text,
            result,
            lastIntent,
            lastSource,
            lastStarterKind,
            sendableDraft,
            workSurfaceOpen,
        };
        if (includeSessionContext) snapshot.sessionContextMessages = sessionContextMessages;
        return snapshot;
    }

    function loadChatSnapshot(thread = {}) {
        setText(thread.draftText || '');
        setPrivateRecallMatches([]);
        setPrivateRecallDismissedText('');
        setBusy(false);
        setResult(thread.result || null);
        setLastIntent(thread.lastIntent || '');
        setLastSource(thread.lastSource || 'typed');
        setLastStarterKind(thread.lastStarterKind || '');
        setSessionContextMessages([]);
        setLastSense(null);
        setLoopCount(0);
        setSendableDraft(thread.sendableDraft || null);
        setArtifactBusy('');
        setLastArtifactRequest(null);
        setWorkSurfaceOpen(Boolean(thread.workSurfaceOpen));
    }

    function saveCurrentChat() {
        const snapshot = currentChatSnapshot();
        if (!snapshot.result && !snapshot.lastIntent && !snapshot.sendableDraft) return;
        const saved = saveHomeChatThread(snapshot);
        setSavedHomeChats(saved || []);
        setChatMemoryFlash('Chat saved.');
        trackEvent('home_chat_saved', { page: 'home', source: 'explicit_save' });
    }

    function openSavedChat(entry = {}) {
        const nextHomeChat = restoreHomeChatThread(entry.id || entry.savedAt);
        setChatMemoryEnabled(Boolean(nextHomeChat?.enabled));
        setSavedHomeChats(nextHomeChat?.savedThreads || []);
        loadChatSnapshot(nextHomeChat?.thread || entry.thread || {});
        setMemoryOpen(false);
        setChatMemoryFlash('Chat restored.');
        trackEvent('home_chat_restored', { page: 'home', source: 'saved_chat' });
    }

    function removeSavedChat(key) {
        setSavedHomeChats(deleteHomeChatThread(key) || []);
        trackEvent('home_chat_saved_deleted', { page: 'home', source: 'memory_drawer' });
    }

    function toggleChatMemory() {
        const nextEnabled = !chatMemoryEnabled;
        setChatMemoryEnabled(nextEnabled);
        if (nextEnabled) {
            const nextHomeChat = setHomeChatContinuityEnabled(true, currentChatSnapshot());
            setSavedHomeChats(nextHomeChat?.savedThreads || []);
            setChatMemoryFlash('Chat will stay here.');
            trackEvent('home_chat_memory_enabled', { page: 'home', source: 'toggle' });
            return;
        }

        const nextHomeChat = clearHomeChatContinuity();
        setSavedHomeChats(nextHomeChat?.savedThreads || []);
        setChatMemoryFlash('Chat cleared.');
        trackEvent('home_chat_memory_disabled', { page: 'home', source: 'toggle' });
    }

    function clearCurrentChat() {
        setText('');
        setPrivateRecallMatches([]);
        setPrivateRecallDismissedText('');
        setBusy(false);
        setResult(null);
        setLastIntent('');
        setLastSource('typed');
        setLastStarterKind('');
        setSessionContextMessages([]);
        setLastSense(null);
        setLoopCount(0);
        setSendableDraft(null);
        setArtifactBusy('');
        setLastArtifactRequest(null);
        setWorkSurfaceOpen(true);
        const nextHomeChat = clearHomeChatContinuity({ keepEnabled: chatMemoryEnabled });
        clearSessionHomeChat();
        setSavedHomeChats(nextHomeChat?.savedThreads || []);
        setChatMemoryFlash(chatMemoryEnabled ? 'Cleared here.' : 'Chat cleared.');
        trackEvent('home_chat_cleared', { page: 'home', source: chatMemoryEnabled ? 'kept_enabled' : 'manual' });
        window.setTimeout(() => inputRef.current?.focus(), 60);
    }

    async function uploadSavedChoices(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        try {
            const textFile = await file.text();
            const imported = importMirrorSettings(JSON.parse(textFile));
            setSeed(readSavedSeed());
            setActiveDefault(imported.activeDefault || getActiveMirrorDefault());
            setMirrorDefaults(getMirrorDefaults());
            setContinuityLedger(getContinuityLedger());
            setText('');
            setPrivateRecallMatches([]);
            setPrivateRecallDismissedText('');
            setResult(makeSetupReadyResult());
            setLastIntent('loaded saved choices');
            setLastSource('uploaded_id');
            setLastStarterKind('');
            setSessionContextMessages([]);
            setLastSense(null);
            setLoopCount(0);
            setSendableDraft(null);
            setArtifactBusy('');
            setWorkSurfaceOpen(false);
            setImportStatus('Loaded. What do you want?');
            trackEvent('saved_choices_uploaded', { page: 'home', source: 'file' });
            window.setTimeout(() => setImportStatus(''), 2800);
            window.setTimeout(() => inputRef.current?.focus(), 60);
        } catch {
            setImportStatus('That file did not work.');
            trackEvent('saved_choices_upload_failed', { page: 'home', source: 'file' });
            window.setTimeout(() => setImportStatus(''), 2600);
        }
    }

    function submit(event) {
        event.preventDefault();
        reflect(text, 'typed');
    }

    function startFromStarter(item = {}) {
        setText('');
        setLastIntent(item.intent || item.label || 'starter');
        setLastSource('starter');
        setLastStarterKind(item.kind || 'make');
        setLastSense(null);
        setLoopCount(0);
        setSendableDraft(null);
        setArtifactBusy('');
        setWorkSurfaceOpen(false);
        setResult(makeStarterResult(item.kind));
        trackEvent('starter_clicked', { page: 'home', label: item.label || item.kind || 'starter' });
        window.setTimeout(() => inputRef.current?.focus(), 60);
    }

    function startLearnActiveMirror() {
        const intent = 'What is Active Mirror and how do I use it?';
        setText('');
        setLastIntent(intent);
        setLastSource('learn');
        setLastStarterKind('');
        setLastSense(null);
        setLoopCount(0);
        setSendableDraft(null);
        setArtifactBusy('');
        setWorkSurfaceOpen(false);
        setResult(makeEcosystemResult(intent));
        trackEvent('learn_active_mirror_clicked', { page: 'home', source: 'launcher' });
        window.setTimeout(() => inputRef.current?.focus(), 60);
    }

    function selectMakeFormat(item = {}) {
        const inputPrefix = item.inputPrefix || makeFormatInputPrefix(item.label);
        setText(inputPrefix);
        setLastSense(null);
        trackEvent('make_format_selected', { page: 'home', source: 'follow_up', label: item.label || 'format' });
        window.setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(inputPrefix.length, inputPrefix.length);
        }, 40);
    }

    async function createArtifact(kind = 'draft', options = {}) {
        const mirror = options.mirror || result?.mirror || SAMPLE_MIRROR;
        const artifactIntent = options.intent || lastIntent || mirror.question || mirror.move || 'Create the smallest useful output.';
        const eventSource = options.source || 'artifact_button';
        const artifactKind = kind || detectArtifactKind(artifactIntent, mirror);
        setSendableDraft(null);
        setWorkSurfaceOpen(true);
        setArtifactBusy(artifactKind);
        if (artifactKind === 'image') {
            setLastArtifactRequest({ intent: artifactIntent, mirror, kind: artifactKind });
        }
        trackEvent('sendable_created', { page: 'home', source: eventSource, status: 'started', label: artifactKind });
        setSendableDraft(markArtifactNotReady(attachArtifactChallenge(makeArtifact(mirror, artifactIntent, artifactKind), {
            intent: artifactIntent,
            kind: artifactKind,
            route: 'local_first',
            fallback: true,
            source: eventSource,
        })));

        try {
            const language = languagePayloadFor(artifactIntent, { seed });
            const requestBody = JSON.stringify({
                intent: artifactIntent,
                artifactKind,
                boundary: 'personal',
                ...language,
                mirror: {
                    reflection: mirror.reflection || '',
                    question: mirror.question || '',
                    move: mirror.move || '',
                },
            });
            const maxAttempts = artifactKind === 'image' ? IMAGE_ARTIFACT_MAX_ATTEMPTS : 1;
            let data = null;
            let lastError = null;

            for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
                const response = await fetch(ARTIFACT_CREATE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Active-Mirror-Session': getPrivacySessionId(),
                    },
                    body: requestBody,
                });
                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload?.artifact) {
                    lastError = new Error(payload?.error || 'artifact_failed');
                } else if (artifactKind === 'image' && !artifactHasImageMedia(payload.artifact) && attempt < maxAttempts) {
                    lastError = new Error(payload?.fallback ? 'image_generation_fallback' : 'image_media_missing');
                    trackEvent('sendable_created', {
                        page: 'home',
                        source: 'gateway_retry',
                        status: 'retry',
                        fallback: Boolean(payload?.fallback),
                        label: artifactKind,
                    });
                } else {
                    data = payload;
                    break;
                }

                if (attempt < maxAttempts) {
                    await wait(IMAGE_ARTIFACT_RETRY_DELAY_MS);
                }
            }

            if (!data?.artifact) {
                throw lastError || new Error('artifact_failed');
            }
            const challengedArtifact = attachArtifactChallenge(data.artifact, {
                intent: artifactIntent,
                kind: artifactKind,
                route: gatewayArtifactIsNotReady(data) ? 'gateway_fallback' : 'gateway',
                fallback: gatewayArtifactIsNotReady(data),
                source: eventSource,
            });
            const notReady = gatewayArtifactIsNotReady(data);
            setSendableDraft(notReady ? markArtifactNotReady(challengedArtifact) : challengedArtifact);
            trackEvent('sendable_created', {
                page: 'home',
                source: notReady ? 'gateway_fallback' : 'gateway',
                status: notReady ? 'degraded' : 'ok',
                fallback: notReady,
                label: data.artifact.kind || artifactKind,
            });
        } catch {
            setSendableDraft(markArtifactNotReady(attachArtifactChallenge(makeArtifact(mirror, artifactIntent, artifactKind), {
                intent: artifactIntent,
                kind: artifactKind,
                route: 'local_fallback',
                fallback: true,
                source: eventSource,
            })));
            trackEvent('sendable_created', { page: 'home', source: 'local_fallback', status: 'fallback', label: artifactKind });
        } finally {
            setArtifactBusy('');
        }
    }

    function regenerateImageArtifact(extra = '', source = 'image_retry') {
        const request = lastArtifactRequest || {
            intent: lastIntent || result?.mirror?.question || result?.mirror?.move || 'Make a clean useful image.',
            mirror: result?.mirror || SAMPLE_MIRROR,
            kind: 'image',
        };
        const nextIntent = extra
            ? `${request.intent}\n\n${extra}`
            : request.intent;
        createArtifact('image', {
            mirror: request.mirror,
            intent: nextIntent,
            source,
        });
    }

    const showMirror = Boolean(result || busy || lastIntent);
    const hasWorkSurface = workSurfaceOpen && Boolean(sendableDraft || artifactBusy);
    const canSubmit = text.trim().length >= 4 && !isMakeFormatOnly(text);
    const fieldAwake = showMirror || text.trim().length > 0;
    const savedCount = savedHomeChats.length + mirrorDefaults.length + continuityLedger.length;
    const isLight = theme === 'light';
    const canSaveCurrentChat = showMirror
        && Boolean(result)
        && !busy
        && !['privacy_hold', 'setup_ready', 'start_help'].includes(result?.kind);
    const showKeepChatNudge = showMirror
        && Boolean(result)
        && !busy
        && !chatMemoryEnabled
        && !['privacy_hold', 'setup_ready', 'start_help'].includes(result?.kind);
    const privateRecallPreparing = ['preparing', 'downloading', 'verifying', 'opening', 'indexing'].includes(privateRecallStatus.phase);
    const privateRecallLabel = privateRecallPreparing
        ? `Recall ${Math.round((privateRecallStatus.progress || 0) * 100)}%`
        : privateRecallStatus.ready
            ? 'Recall on'
            : privateRecallStatus.error
                ? 'Recall needs attention'
                : 'Private recall';
    const ctaClass = 'am-primary-action';

    return (
        <div data-product-mode="mirror" className="am-shell relative min-h-dvh overflow-hidden selection:bg-emerald-300/25">
            <ReflectionField awake={fieldAwake} />

            <header className="relative z-10 px-4 py-3 sm:py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex min-h-10 items-center gap-3 rounded-full pr-2">
                        <MirrorLogo />
                        <div className={`text-sm font-semibold tracking-normal ${isLight ? 'text-stone-950' : 'text-white'}`}>Active Mirror</div>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-5">
                        <nav className={`hidden items-center gap-5 text-xs font-semibold sm:flex ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                            <Link to="/research" className={`inline-flex min-h-10 items-center rounded-full px-2 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Research</Link>
                            <Link to="/enterprise" className={`inline-flex min-h-10 items-center rounded-full px-2 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Business</Link>
                        </nav>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs transition ${isLight ? 'border-stone-300/70 bg-white/65 text-stone-600 hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-200/30 hover:text-white'}`}
                            aria-label={isLight ? 'Use dark mode' : 'Use light mode'}
                        >
                            {isLight ? <Moon size={15} /> : <Sun size={15} />}
                        </button>
                        <Link to="/consulting" className={`hidden min-h-10 items-center rounded-full border px-3.5 text-xs font-medium transition sm:inline-flex ${isLight ? 'border-stone-300/70 bg-white/65 text-stone-700 hover:border-emerald-400/50 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-emerald-300/30 hover:text-white'}`}>
                            For teams
                        </Link>
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-6xl px-4">
                <TrustStatusRail
                    processingBoundary={processingBoundary}
                    memoryEnabled={chatMemoryEnabled}
                />
            </div>

            <main className={`relative z-10 mx-auto flex min-h-[calc(100dvh-116px)] w-full flex-col justify-center gap-3 px-4 pb-4 pt-4 sm:min-h-[calc(100dvh-128px)] sm:gap-4 sm:pb-5 sm:pt-8 lg:pb-8 ${hasWorkSurface ? 'max-w-6xl' : 'max-w-3xl'}`}>
                <section className={`relative w-full overflow-hidden ${hasWorkSurface ? 'mx-auto max-w-3xl' : ''} ${showMirror ? 'border-y border-[var(--am-border)] py-3 sm:py-5 lg:py-6' : 'px-0 py-8 sm:py-10'}`}>
                    {showMirror ? (
                        <>
                            <div className="pointer-events-none absolute inset-x-4 top-0 h-0.5 bg-[var(--am-primary)]" />
                        </>
                    ) : null}

                    <div className={`relative z-10 ${showMirror ? '' : 'text-center'}`}>
                        <div className={`${showMirror ? 'mb-4 hidden sm:grid' : 'hidden'} h-14 w-14 place-items-center rounded-lg border border-blue-200/20 bg-white/[0.05]`}>
                            <MirrorLogo />
                        </div>

                        <h1 className={`mx-auto w-full max-w-[18.5rem] break-words font-semibold leading-[1.02] tracking-normal sm:max-w-xl ${isLight ? 'text-[var(--am-ink)]' : 'text-white'} ${showMirror ? 'text-2xl sm:text-[3.1rem] sm:leading-[0.98] lg:text-[3.65rem]' : 'text-[2.45rem] sm:text-[4.85rem] sm:leading-[0.98]'}`}>
                            What do you want?
                        </h1>

                        {!showMirror ? (
                            <div className={`mt-2.5 text-sm font-semibold tracking-normal sm:mt-3 sm:text-base ${isLight ? 'text-stone-600' : 'text-cyan-100/80'}`}>
                                Reflection &gt; Prediction
                            </div>
                        ) : null}

                        {!showMirror ? (
                            <div className="mx-auto mt-4 grid max-w-xl gap-2 sm:mt-5 sm:grid-cols-2">
                                <Link
                                    to="/id"
                                    onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'start_here_action' })}
                                    className="am-primary-action inline-flex min-h-12 items-center justify-center gap-2 px-5 text-[0.98rem] font-bold sm:min-h-14 sm:text-base"
                                >
                                    Start here
                                    <ArrowRight size={17} />
                                </Link>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/json,.json"
                                    onChange={uploadSavedChoices}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="am-secondary-action inline-flex min-h-12 items-center justify-center gap-2 px-5 text-[0.98rem] font-bold sm:min-h-14 sm:text-base"
                                >
                                    <Upload size={17} />
                                    Load saved setup
                                </button>
                            </div>
                        ) : null}

                        <form onSubmit={submit} className={`${showMirror ? 'mt-3 sm:mt-4' : 'mx-auto mt-4 max-w-2xl'} grid gap-2`}>
                            <label htmlFor="active-mirror-intent" className="sr-only">What do you want to talk through or work on?</label>
                            <div className="am-surface grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 p-2">
                                <textarea
                                    id="active-mirror-intent"
                                    ref={inputRef}
                                    rows={1}
                                    value={text}
                                    maxLength={1000}
                                    aria-describedby="active-mirror-intent-help"
                                    placeholder="Type anything: make a poster, decide, fix, understand..."
                                    onChange={(event) => {
                                        setText(event.target.value);
                                        setPrivateRecallDismissedText('');
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            submit(event);
                                        }
                                    }}
                                    className={`h-[5.5rem] min-h-[5.5rem] max-h-36 flex-1 resize-none rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-base leading-6 outline-none transition focus:border-[var(--am-focus)] sm:h-14 sm:min-h-14 sm:py-3 ${isLight ? 'text-stone-950 placeholder:text-stone-600' : 'text-white placeholder:text-zinc-400'}`}
                                    style={{ overflowWrap: 'anywhere' }}
                                />
                                <button
                                    type="submit"
                                    disabled={busy || !canSubmit}
                                    onClick={() => {
                                        if (!canSubmit && !busy) inputRef.current?.focus();
                                    }}
                                    className={`${showMirror ? 'w-11 px-0 sm:w-auto sm:px-5' : 'px-4 sm:px-5'} inline-flex min-h-11 shrink-0 items-center justify-center gap-2 text-sm font-bold disabled:cursor-not-allowed sm:min-h-14 ${ctaClass}`}
                                    aria-label="Send"
                                >
                                    {busy ? (
                                        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                                    ) : (
                                        <>
                                            <span className={showMirror ? 'hidden sm:inline' : ''}>Send</span>
                                            <ArrowUp size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p id="active-mirror-intent-help" className="sr-only">Enter what you want to make, decide, fix, understand, or talk about. Use placeholders for private details.</p>
                        </form>

                        <PrivateRecallSuggestions
                            matches={privateRecallMatches}
                            isLight={isLight}
                            language={privateRecallLanguage}
                            onUse={usePrivateRecallMatch}
                            onDismiss={() => {
                                setPrivateRecallDismissedText(text.trim());
                                setPrivateRecallMatches([]);
                            }}
                        />

                        {!showMirror ? (
                            <div className="mx-auto mt-3 max-w-2xl sm:mt-4">
                                <div className={`mb-2 text-center text-sm font-semibold tracking-normal ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>Try one</div>
                                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                {STARTER_ACTIONS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => {
                                                startFromStarter(item);
                                            }}
                                            className={`group flex min-h-[4.15rem] flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 sm:grid sm:min-h-[5.65rem] sm:content-center sm:justify-items-center sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-3 ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-700 hover:border-cyan-500/30 hover:bg-white hover:text-stone-950' : 'border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:border-cyan-200/30 hover:bg-cyan-200/[0.065] hover:text-white'}`}
                                        >
                                            <span className={`grid h-7 w-7 place-items-center rounded-full border transition sm:h-8 sm:w-8 ${isLight ? 'border-cyan-500/15 bg-cyan-100/60 text-cyan-700 group-hover:border-cyan-600/25 group-hover:bg-cyan-100' : 'border-cyan-200/15 bg-cyan-200/[0.07] text-cyan-100/85 group-hover:border-cyan-100/30 group-hover:bg-cyan-200/[0.1]'}`}>
                                                <Icon size={15} />
                                            </span>
                                            <span className="whitespace-nowrap text-[9px] font-bold leading-4 min-[380px]:text-[10px] sm:text-sm">{item.label}</span>
                                            <span className={`hidden text-[11px] font-medium leading-4 transition sm:block ${isLight ? 'text-stone-600 group-hover:text-cyan-700' : 'text-zinc-400 group-hover:text-cyan-100/75'}`}>{item.caption}</span>
                                        </button>
                                    );
                                })}
                                </div>
                                <div className="mt-1.5 flex justify-center sm:mt-2">
                                    <button
                                        type="button"
                                        onClick={startLearnActiveMirror}
                                        className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition sm:min-h-10 sm:px-3.5 ${isLight ? 'border-stone-300/70 bg-white/52 text-stone-600 hover:border-blue-400/35 hover:bg-white hover:text-stone-950' : 'border-white/[0.08] bg-white/[0.028] text-zinc-400 hover:border-blue-200/30 hover:bg-blue-200/[0.055] hover:text-white'}`}
                                    >
                                        <Sparkles size={15} className={isLight ? 'text-blue-500' : 'text-blue-200'} />
                                        Meet Active Mirror
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {!showMirror && savedCue ? (
                            <div className="mx-auto mt-3 grid max-w-2xl gap-3 rounded-lg border border-emerald-300/14 bg-emerald-300/[0.045] p-3.5 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-50">
                                        <BookmarkPlus size={15} className="text-emerald-200" />
                                        Pick up where you left off
                                    </div>
                                    <div className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-zinc-400">{savedCue.preview}</div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        type="button"
                                        onClick={continueSavedContext}
                                        disabled={busy}
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.085] px-3.5 text-sm font-semibold text-emerald-50 transition hover:border-emerald-100/35 hover:bg-emerald-200/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Continue
                                        <ArrowRight size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMemoryOpen(true)}
                                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-black/15 px-3.5 text-sm font-semibold text-zinc-300 transition hover:border-blue-200/30 hover:text-white"
                                    >
                                        Saved
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className={`mt-3 flex-wrap items-center gap-x-3 gap-y-2 text-xs ${isLight ? 'text-stone-600' : 'text-zinc-400'} ${showMirror ? 'flex' : 'flex justify-center'}`}>
                            <span>Private.</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Lock size={13} />
                                Save only if you choose.
                            </span>
                            {savedCount > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setMemoryOpen(true)}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-400 transition hover:border-blue-200/30 hover:text-white"
                                >
                                    <SlidersHorizontal size={13} />
                                    Saved: {savedCount}
                                </button>
                            ) : null}
                            {canSaveCurrentChat ? (
                                <button
                                    type="button"
                                    onClick={saveCurrentChat}
                                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/50 text-stone-600 hover:border-blue-400/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-blue-200/30 hover:text-white'}`}
                                >
                                    <BookmarkPlus size={13} />
                                    Save chat
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={toggleChatMemory}
                                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/54 text-stone-600 hover:border-cyan-500/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.035] text-zinc-400 hover:border-cyan-200/30 hover:text-white'}`}
                                aria-pressed={chatMemoryEnabled}
                            >
                                {chatMemoryEnabled ? <Check size={13} /> : <Save size={13} />}
                                {chatMemoryEnabled ? 'Chat kept here' : 'Keep chat'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivateRecallOpen(true)}
                                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${privateRecallStatus.ready ? (isLight ? 'border-cyan-600/24 bg-cyan-50 text-cyan-800 hover:border-cyan-600/40' : 'border-cyan-200/20 bg-cyan-200/[0.075] text-cyan-50 hover:border-cyan-100/35') : (isLight ? 'border-stone-300/70 bg-white/50 text-stone-600 hover:border-cyan-500/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-200/30 hover:text-white')}`}
                                aria-pressed={privateRecallStatus.ready}
                            >
                                <BrainCircuit size={13} />
                                {privateRecallLabel}
                            </button>
                            {(showMirror || text.trim()) ? (
                                <button
                                    type="button"
                                    onClick={clearCurrentChat}
                                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/44 text-stone-600 hover:border-stone-400 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.025] text-zinc-400 hover:border-white/25 hover:text-white'}`}
                                >
                                    <X size={13} />
                                    Clear
                                </button>
                            ) : null}
                            {chatMemoryFlash ? <span className="font-semibold text-emerald-100">{chatMemoryFlash}</span> : null}
                            {importStatus ? <span className="font-semibold text-emerald-100">{importStatus}</span> : null}
                            {showMirror ? <LocalSenseLine sense={typingSense} /> : null}
                        </div>

                    </div>
                </section>

                {showMirror ? (
                    <section className={`grid min-w-0 gap-3 ${hasWorkSurface ? 'lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.72fr)] lg:items-start' : ''}`}>
                        <div className="grid min-w-0 gap-3">
                            <div lang={result?.reply_language || 'en'} data-response-language={result?.reply_language || 'en'}>
                                <MirrorResult
                                    result={result}
                                    intent={lastIntent}
                                    turnSource={lastSource}
                                    disabled={busy}
                                    onSourceChecked={setLastSourceCheck}
                                    onRemember={rememberMirror}
                                    remembered={rememberedKey === mirrorMemoryKey(result?.mirror || {})}
                                    onPrompt={(nextIntent, source = 'surface') => {
                                        trackEvent('followup_clicked', { page: 'home', source });
                                        reflect(nextIntent, source);
                                    }}
                                />
                            </div>
                            {showKeepChatNudge ? (
                                <div className={`grid gap-3 rounded-lg border p-3.5 sm:ml-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${isLight ? 'border-cyan-500/18 bg-white/62 text-stone-600' : 'border-cyan-200/14 bg-cyan-200/[0.045] text-zinc-400'}`}>
                                    <div className="min-w-0 text-sm leading-6">
                                        This chat stays until this tab closes. Keep it here for later?
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleChatMemory}
                                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${isLight ? 'border-cyan-500/24 bg-cyan-50 text-cyan-800 hover:border-cyan-500/45 hover:bg-white' : 'border-cyan-200/24 bg-cyan-200/[0.08] text-cyan-50 hover:border-cyan-100/40 hover:bg-cyan-200/[0.12]'}`}
                                    >
                                        <Save size={15} />
                                        Keep it
                                    </button>
                                </div>
                            ) : null}
                            {!busy && result && !isConversationResult(result) && !['privacy_hold', 'setup_ready', 'artifact_first'].includes(result.kind) ? (
                                <div className="grid gap-3 sm:pl-12">
                                    <div className="flex flex-wrap gap-2">
                                        {followUps.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => {
                                                        trackEvent('followup_clicked', { page: 'home', source: 'follow_up' });
                                                        if (item.action === 'set_format') {
                                                            selectMakeFormat(item);
                                                            return;
                                                        }
                                                        if (item.action === 'artifact') {
                                                            createArtifact(item.artifactKind || 'draft', {
                                                                intent: item.intent,
                                                                mirror: result?.mirror,
                                                                source: 'follow_up',
                                                            });
                                                            return;
                                                        }
                                                        reflect(item.intent, 'follow_up');
                                                    }}
                                                    disabled={busy || Boolean(artifactBusy)}
                                                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 hover:border-blue-400/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.048] text-zinc-300 hover:border-blue-200/35 hover:bg-blue-200/[0.07] hover:text-white'}`}
                                                >
                                                    <Icon size={16} className={artifactBusy === item.artifactKind ? 'text-cyan-500' : isLight ? 'text-blue-500' : 'text-teal-200'} />
                                                    {artifactBusy === item.artifactKind ? 'Making...' : item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div ref={workSurfaceRef} className="min-w-0">
                            <WorkSurface
                                draft={sendableDraft}
                                busyKind={artifactBusy}
                                onClose={() => setWorkSurfaceOpen(false)}
                                onRegenerateImage={() => regenerateImageArtifact('', 'image_retry')}
                                onSharpenImage={() => regenerateImageArtifact('Make this version cleaner, simpler, more polished, and easier to read. Keep it warm and not busy.', 'image_sharpen')}
                            />
                        </div>
                    </section>
                ) : null}
            </main>

            <div className={`relative z-10 mx-auto flex max-w-3xl justify-center px-4 pb-6 text-xs sm:justify-end ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
                    <Link to="/about" className={`inline-flex min-h-10 items-center rounded-full px-2.5 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>About</Link>
                    <Link to="/enterprise" className={`inline-flex min-h-10 items-center rounded-full px-2.5 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Enterprise</Link>
                    <Link to="/privacy" className={`inline-flex min-h-10 items-center rounded-full px-2.5 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Privacy</Link>
                    <Link to="/terms" className={`inline-flex min-h-10 items-center rounded-full px-2.5 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Terms</Link>
                </div>
            </div>
            <MemoryDrawer
                open={memoryOpen}
                items={mirrorDefaults}
                continuity={continuityLedger}
                activeDefault={activeDefault}
                savedChats={savedHomeChats}
                onClose={() => setMemoryOpen(false)}
                onUse={useSavedMemory}
                onPause={pauseMemory}
                onDelete={removeMemory}
                onEdit={editMemory}
                onUseSavedChat={openSavedChat}
                onDeleteSavedChat={removeSavedChat}
                onUseContinuity={useContinuity}
                onDeleteContinuity={removeContinuity}
                onClearContinuity={clearContinuity}
            />
            <PrivateRecallPanel
                open={privateRecallOpen}
                status={privateRecallStatus}
                isLight={isLight}
                onClose={() => setPrivateRecallOpen(false)}
                onEnable={turnOnPrivateRecall}
                onTurnOff={turnOffPrivateRecallHere}
                onClear={clearPrivateRecallHere}
            />
        </div>
    );
}
