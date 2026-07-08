import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUp, BookmarkPlus, Check, Code2, Copy, FileText, Image, Lock, Moon, PartyPopper, PenLine, Pencil, Save, SlidersHorizontal, Sparkles, Sun, Trash2, Upload, X } from 'lucide-react';
import ArtifactCard from '../components/ArtifactCard';
import { NeedsSources } from '../components/TruthStateNotice';
import { useTheme } from '../contexts/ThemeContext';
import { buildLocalSenseContext, assessLocalMirrorSense, maskSoftPrivateText } from '../lib/local-mirror-sense';
import { makeOfflineMirrorResult } from '../lib/first-turn-fallback';
import { attachArtifactChallenge } from '../lib/challenge-packet';
import { languagePayloadFor } from '../lib/language-preference';
import {
    clearHomeChatContinuity,
    clearContinuityLedger,
    clearMirrorDefault,
    deleteHomeChatThread,
    deleteContinuityEntry,
    deleteMirrorDefault,
    getActiveMirrorDefault,
    getArchetype,
    getBlueprint,
    getContinuityLedger,
    getHomeChatContinuity,
    getMirrorDefaults,
    importMirrorSettings,
    restoreHomeChatThread,
    saveContinuityEntry,
    saveHomeChatContinuity,
    saveHomeChatThread,
    saveMirrorDefault,
    setHomeChatContinuityEnabled,
    updateMirrorDefault,
    useMirrorDefault,
} from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';
import { copyText } from '../lib/sendable-actions';
import { createDisabledSourceAdapterProjection } from '../lib/amos-disabled-source-adapter';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';
const ARTIFACT_GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/artifact';
const IMAGE_ARTIFACT_MAX_ATTEMPTS = 2;
const IMAGE_ARTIFACT_RETRY_DELAY_MS = 900;

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

const STARTER_ACTIONS = [
    {
        kind: 'make',
        label: 'Make',
        caption: 'Make a thing',
        icon: PenLine,
        intent: 'I want to make something useful.',
    },
    {
        kind: 'decide',
        label: 'Decide',
        caption: 'Choose clearly',
        icon: Check,
        intent: 'I need to make a decision.',
    },
    {
        kind: 'fix',
        label: 'Fix',
        caption: 'Clear the snag',
        icon: SlidersHorizontal,
        intent: 'Something is not working.',
    },
    {
        kind: 'understand',
        label: 'Understand',
        caption: 'Plain English',
        icon: Sparkles,
        intent: 'I need to understand this better.',
    },
    {
        kind: 'fun',
        label: 'Fun',
        caption: "Let's do something fun",
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
            action: 'reflect',
            intent: item.prompt,
        };
    });
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
    if (/\b(image|visual|poster|flyer|illustration|photo|picture|thumbnail|video|ad creative|creative brief|moodboard)\b/.test(text)) return 'image';
    if (/\b(code|app|component|script|function|api|html|css|javascript|react|python)\b/.test(text)) return 'code';
    if (/\b(message|email|reply|dm|text|note)\b/.test(text)) return 'draft';
    if (/\b(document|doc|pdf|memo|brief|deck|slide|report|summary|proposal|outline|post|website|web page|site|page|landing page|homepage|launch page|headline|button label|reassurance line|copy block)\b/.test(text)) return 'doc';
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
    const asksForThing = /\b(message|email|reply|dm|text|note|memo|doc|document|brief|outline|post|proposal|code|component|script|image|visual|poster|flyer|creative|pdf|deck|report|plan|website|web page|site|page|homepage|landing|headline|button|reassurance line|copy block)\b/i.test(text);
    const needThing = /\b(?:i\s+)?(?:need|want|looking for|could use)\b.{0,80}\b(message|email|reply|dm|text|note|memo|doc|document|brief|outline|post|proposal|code|component|script|image|visual|poster|flyer|creative|pdf|deck|report|plan|website|web page|site|page|homepage|landing|headline|button|reassurance line|copy block)\b/i.test(text);

    return directAsk || needThing || (asksToMake && asksForThing);
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
        return {
            kind,
            title: 'Image prompt',
            body: [
                'Image prompt',
                '',
                `Goal: ${cleanIntent || question}`,
                `Feeling: calm, useful, warm, lightly magical, not busy.`,
                `Main idea: ${question}`,
                `Scene: one clear focal point that shows the outcome, not the machinery.`,
                `Avoid: clutter, medical or diagnostic cues, dashboards unless asked, model names, private details.`,
                `Next action: ${move}`,
            ].join('\n'),
            checklist: [
                'Use this as the prompt for image generation.',
                'Remove anything private before generating it.',
            ],
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
            <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
            <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
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
    const tone = urgent ? 'from-amber-200/24 via-violet-300/12 to-white/5' : decisive ? 'from-violet-200/20 via-fuchsia-200/10 to-white/5' : 'from-violet-300/18 via-white/8 to-white/5';
    const label = urgent ? 'steady' : decisive ? 'clear' : 'open';

    return (
        <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${tone}`} aria-label={`Reflection tone: ${label}`} />
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
                <span className={`rounded-full border px-3 py-1.5 line-through ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-500 decoration-stone-400' : 'border-white/10 bg-white/[0.04] text-zinc-500 decoration-zinc-600'}`}>{visual.left}</span>
                <span className={isLight ? 'text-cyan-700' : 'text-cyan-200'}>to</span>
                <span className={`rounded-full border px-3 py-1.5 font-semibold ${isLight ? 'border-cyan-500/20 bg-cyan-100/60 text-cyan-800' : 'border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-100'}`}>{visual.right}</span>
            </div>
        );
    }

    if (visual.kind === 'axes') {
        return (
            <div className={`mt-3 rounded-[1.35rem] border p-3 ${isLight ? 'border-cyan-500/18 bg-cyan-50/70' : 'border-cyan-300/15 bg-cyan-300/[0.055]'}`}>
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-violet-300 via-cyan-200 to-emerald-200" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span className={isLight ? 'text-stone-600' : 'text-zinc-300'}>{visual.left}</span>
                    <span className={`text-right ${isLight ? 'text-cyan-800' : 'text-cyan-100'}`}>{visual.right}</span>
                </div>
            </div>
        );
    }

    if (visual.kind === 'spectrum') {
        return (
            <div className={`mt-3 rounded-[1.35rem] border p-3 ${isLight ? 'border-cyan-500/18 bg-cyan-50/70' : 'border-cyan-300/15 bg-cyan-300/[0.055]'}`}>
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-purple-300 to-cyan-200" />
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
            <div className={`rounded-[1.35rem] border p-3.5 ${isLight ? 'border-stone-300/70 bg-white/65 shadow-[0_14px_34px_rgba(77,65,50,0.08)]' : 'border-white/[0.075] bg-white/[0.032] shadow-[0_0_22px_rgba(16,185,129,0.025)]'}`}>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.36)]" />
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
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/50 text-stone-500 hover:border-violet-400/35 hover:text-stone-950 disabled:border-emerald-500/20 disabled:text-emerald-700' : 'border-white/10 bg-white/[0.028] text-zinc-400 hover:border-violet-300/30 hover:text-white disabled:border-emerald-300/18 disabled:text-emerald-100'}`}
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
    const truthState = result?.truth_state || mirror.truth_state;
    const canPromptSourceCheck = ['typed', 'follow_up', 'surface', 'saved_context'].includes(turnSource);
    const showSourceCheck = canPromptSourceCheck && truthState?.status === 'needs_checking' && isSourceHeavyAsk(intent);
    const answerFirst = showSourceCheck && isAnswerFirstAsk(intent);
    const focusText = String(mirror.question || '').trim();
    const isLight = theme === 'light';
    const assistantIconClass = isLight
        ? 'mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-2xl border border-violet-400/18 bg-white/65 text-violet-600 shadow-[0_14px_28px_rgba(77,65,50,0.08)] md:grid'
        : 'mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-2xl border border-violet-200/15 bg-white/[0.045] text-violet-100 shadow-[0_0_28px_rgba(168,85,247,0.12)] md:grid';
    const panelClass = isLight
        ? 'min-w-0 flex-1 overflow-hidden rounded-[1.55rem] border border-stone-300/70 bg-white/72 p-4 shadow-[0_24px_70px_rgba(77,65,50,0.12)] ring-1 ring-white/80 backdrop-blur-2xl sm:p-5'
        : 'min-w-0 flex-1 overflow-hidden rounded-[1.55rem] border border-white/[0.075] bg-white/[0.038] p-4 shadow-[0_0_42px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:p-5';
    const reflectionClass = `mt-4 break-words text-[1rem] leading-7 sm:text-[1.08rem] ${isLight ? 'text-stone-800' : 'text-zinc-100'}`;
    const focusClass = isLight
        ? 'mt-4 break-words rounded-[1.15rem] border border-violet-400/14 bg-violet-50/70 px-3.5 py-3 text-[0.95rem] font-medium leading-7 text-stone-800'
        : 'mt-4 break-words rounded-[1.15rem] border border-violet-200/10 bg-violet-200/[0.045] px-3.5 py-3 text-[0.95rem] font-medium leading-7 text-violet-50/86';
    const focusLabelClass = `mb-1 text-[10px] font-semibold uppercase tracking-[0.17em] ${isLight ? 'text-violet-700/55' : 'text-violet-100/55'}`;

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
                        <ReflectionGlow mirror={mirror} />
                        <p className={reflectionClass}>
                            {mirror.reflection}
                        </p>
                        <div className={`mt-4 rounded-[1.2rem] border px-3.5 py-3 text-[0.98rem] font-semibold leading-7 ${isLight ? 'border-emerald-500/16 bg-emerald-50/75 text-emerald-900' : 'border-emerald-200/12 bg-emerald-200/[0.055] text-emerald-50'}`}>
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
                        <ReflectionGlow mirror={mirror} />
                        <p className={`${reflectionClass} font-medium`}>
                            {mirror.reflection}
                        </p>
                        <div className={`mt-3 break-words text-sm leading-6 ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
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
                    <ReflectionGlow mirror={mirror} />
                    <p className={reflectionClass}>
                        {mirror.reflection}
                    </p>
                    {focusText ? (
                        <div className={focusClass}>
                            <div className={focusLabelClass}>Start here</div>
                            {focusText}
                        </div>
                    ) : null}
                    <NextMoveSurface
                        mirror={mirror}
                        onRemember={onRemember}
                        remembered={remembered}
                        allowRemember={!isPrivacyHold && !isSetupReady && !isStartHelp}
                        allowCopy={!isSetupReady && !isStartHelp}
                    />
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
        <div className="rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/[0.045] px-5 py-5 shadow-[0_0_46px_rgba(34,211,238,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={16} className="animate-pulse text-cyan-200" />
                Finding the useful move
            </div>
            <div className="grid gap-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
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
            <section className={`min-w-0 overflow-hidden rounded-[1.7rem] border px-4 py-4 ${isLight ? 'border-stone-300/70 bg-white/72 shadow-[0_20px_50px_rgba(77,65,50,0.10)]' : 'border-cyan-300/15 bg-cyan-300/[0.055] shadow-[0_0_40px_rgba(34,211,238,0.08)]'}`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-2xl border ${isLight ? 'border-cyan-500/18 bg-cyan-50 text-cyan-700' : 'border-cyan-200/20 bg-cyan-300/[0.07] text-cyan-100'}`}>
                            <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                            <div className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-cyan-50'}`}>Making it useful</div>
                            <div className={`text-xs ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>Almost there.</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-500 hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white'}`}
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>
                </div>
                <div className="grid gap-2">
                    <div className={`h-3 w-4/5 animate-pulse rounded-full ${isLight ? 'bg-stone-200/80' : 'bg-white/10'}`} />
                    <div className={`h-3 w-2/3 animate-pulse rounded-full ${isLight ? 'bg-stone-200/70' : 'bg-white/10'}`} />
                    <div className={`h-24 animate-pulse rounded-2xl border ${isLight ? 'border-stone-300/65 bg-stone-100/70' : 'border-white/10 bg-black/20'}`} />
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
                className={`absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition ${isLight ? 'border-stone-300/70 bg-white/74 text-stone-500 shadow-[0_10px_24px_rgba(77,65,50,0.08)] hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/25 hover:text-white'}`}
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
            <div className={`mt-2 px-1 text-xs leading-5 ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>{note}</div>
        </div>
    );
}

function workSurfaceNote(draft) {
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
                <defs>
                    <linearGradient id="mirror-line-a" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34,211,238,0)" />
                        <stop offset="42%" stopColor="rgba(34,211,238,0.38)" />
                        <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                    </linearGradient>
                    <linearGradient id="mirror-line-b" x1="1" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="48%" stopColor="rgba(232,221,255,0.28)" />
                        <stop offset="100%" stopColor="rgba(110,231,183,0)" />
                    </linearGradient>
                </defs>
                <path className="reflection-field__arc reflection-field__arc--a" d="M174 448 C 340 196, 840 122, 1046 390" />
                <path className="reflection-field__arc reflection-field__arc--b" d="M152 520 C 388 330, 788 292, 1070 482" />
                <path className="reflection-field__arc reflection-field__arc--c" d="M276 610 C 492 428, 706 398, 936 576" />
                <ellipse className="reflection-field__lens" cx="600" cy="414" rx="342" ry="118" />
            </svg>
            <div className="reflection-field__sheen" />
        </div>
    );
}

function LocalSenseLine({ sense }) {
    const cue = sense?.cues?.[0];
    if (!sense?.hasText || !cue) return null;

    const tone = cue.tone === 'block'
        ? 'border-rose-300/20 bg-rose-300/[0.07] text-rose-100'
        : cue.tone === 'caution'
            ? 'border-amber-300/20 bg-amber-300/[0.07] text-amber-100'
            : cue.tone === 'good'
                ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100'
                : 'border-violet-300/20 bg-violet-300/[0.07] text-violet-100';

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
            <div className="relative mx-auto flex max-h-[88dvh] max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d0d11]/95 shadow-[0_0_80px_rgba(124,58,237,0.2)] ring-1 ring-white/[0.04]">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                    <div>
                        <div className="text-lg font-semibold tracking-[-0.03em] text-white">Saved here</div>
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
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                        aria-label="Close saved"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-4">
                    {!hasSavedContext ? (
                        <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.035] px-4 py-5 text-sm leading-6 text-zinc-400">
                            Nothing saved yet. When an answer is useful, choose Save.
                        </div>
                    ) : mode === 'cards' && activeCard ? (
                        <div className="grid gap-3">
                            <button
                                type="button"
                                onClick={() => setCardFlipped((value) => !value)}
                                className="min-h-[17rem] rounded-[1.75rem] border border-violet-200/15 bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.14),transparent_55%),rgba(255,255,255,0.04)] p-5 text-left shadow-[0_0_50px_rgba(124,58,237,0.12)] transition hover:border-violet-200/30"
                            >
                                <div className="mb-5 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    <span>Card {activeCardIndex + 1} of {items.length}</span>
                                    <span>{cardFlipped ? 'Move' : 'Pattern'}</span>
                                </div>
                                <div className="flex min-h-40 items-center">
                                    <p className={`text-2xl font-semibold leading-tight tracking-[-0.04em] ${cardFlipped ? 'text-emerald-50' : 'text-white'} sm:text-3xl`}>
                                        {cardFlipped
                                            ? activeCard.move || 'No move saved yet.'
                                            : activeCard.question || 'No question saved yet.'}
                                    </p>
                                </div>
                                <div className="mt-5 text-sm text-zinc-500">
                                    {cardFlipped ? 'Tap to see the pattern again.' : 'Tap to reveal the move.'}
                                </div>
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => changeCard(-1)}
                                    className="min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
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
                                    className="min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {savedChats.length ? (
                                <section className="rounded-[1.45rem] border border-violet-300/12 bg-violet-300/[0.045] p-3">
                                    <div className="mb-3">
                                        <div className="text-sm font-semibold text-violet-50">Saved chats</div>
                                        <div className="mt-1 text-xs leading-5 text-zinc-500">Only on this browser. Reopen or delete anytime.</div>
                                    </div>
                                    <div className="grid gap-2">
                                        {savedChats.map((entry) => (
                                            <div key={entry.id || entry.savedAt} className="rounded-[1.15rem] border border-white/10 bg-black/16 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{formatSavedDate(entry.savedAt)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteSavedChat?.(entry.id || entry.savedAt)}
                                                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-rose-300/30 hover:text-rose-100"
                                                        aria-label="Delete saved chat"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div className="text-sm font-semibold leading-6 text-zinc-100">{entry.title || 'Saved chat'}</div>
                                                {entry.thread?.result?.mirror?.move ? (
                                                    <div className="mt-2 max-h-16 overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] px-3 py-2 text-sm leading-6 text-cyan-50">
                                                        {entry.thread.result.mirror.move}
                                                    </div>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => onUseSavedChat?.(entry)}
                                                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-violet-200/18 bg-violet-200/[0.06] px-3.5 text-xs font-semibold text-violet-50 transition hover:border-violet-100/35"
                                                >
                                                    Open chat
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {continuity.length ? (
                                <section className="rounded-[1.45rem] border border-cyan-300/12 bg-cyan-300/[0.045] p-3">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-cyan-50">Saved by you</div>
                                            <div className="mt-1 text-xs leading-5 text-zinc-500">Only on this browser. Delete it anytime.</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClearContinuity}
                                            className="min-h-10 rounded-full border border-white/10 bg-black/15 px-3.5 text-xs font-semibold text-zinc-400 transition hover:border-rose-300/30 hover:text-rose-100"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="grid gap-2">
                                        {continuity.map((entry) => (
                                            <div key={entry.savedAt} className="rounded-[1.15rem] border border-white/10 bg-black/16 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{formatSavedDate(entry.savedAt)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteContinuity?.(entry.savedAt)}
                                                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-rose-300/30 hover:text-rose-100"
                                                        aria-label="Delete saved item"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div className="text-sm leading-6 text-zinc-300">{entry.intent || 'Saved reflection'}</div>
                                                {entry.move ? (
                                                    <div className="mt-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-sm font-semibold leading-6 text-emerald-50">
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
                                    <div key={key} className="rounded-[1.45rem] border border-white/10 bg-white/[0.035] p-3">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${active ? 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100' : 'border-white/10 bg-black/20 text-zinc-500'}`}>
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
                                                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                                                    aria-label={editing ? 'Cancel edit' : 'Edit saved note'}
                                                >
                                                    {editing ? <X size={15} /> : <Pencil size={15} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(key)}
                                                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-rose-300/30 hover:text-rose-100"
                                                    aria-label="Delete saved note"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {editing ? (
                                            <div className="grid gap-2">
                                                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                    Question
                                                    <textarea
                                                        rows={2}
                                                        value={draft.question}
                                                        onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))}
                                                        className="resize-none rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none focus:border-violet-200/35"
                                                    />
                                                </label>
                                                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                    Move
                                                    <textarea
                                                        rows={2}
                                                        value={draft.move}
                                                        onChange={(event) => setDraft((current) => ({ ...current, move: event.target.value }))}
                                                        className="resize-none rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none focus:border-violet-200/35"
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
                                                <div className="rounded-2xl border border-white/10 bg-black/18 px-3 py-3 text-sm leading-6 text-zinc-300">
                                                    {item.question || 'No question saved.'}
                                                </div>
                                                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-3 text-sm font-semibold leading-6 text-emerald-50">
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
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const workSurfaceRef = useRef(null);
    const bootPromptRef = useRef(false);
    if (initialChatRef.current === null) initialChatRef.current = getHomeChatContinuity();
    const restoredThread = initialChatRef.current?.enabled ? initialChatRef.current.thread : null;
    const [seed, setSeed] = useState(() => readSavedSeed());
    const [activeDefault, setActiveDefault] = useState(() => getActiveMirrorDefault());
    const [mirrorDefaults, setMirrorDefaults] = useState(() => getMirrorDefaults());
    const [continuityLedger, setContinuityLedger] = useState(() => getContinuityLedger());
    const [chatMemoryEnabled, setChatMemoryEnabled] = useState(() => Boolean(initialChatRef.current?.enabled));
    const [savedHomeChats, setSavedHomeChats] = useState(() => initialChatRef.current?.savedThreads || []);
    const [chatMemoryFlash, setChatMemoryFlash] = useState(() => restoredThread ? 'Chat restored.' : '');
    const [text, setText] = useState(() => restoredThread?.draftText || '');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(() => restoredThread?.result || null);
    const [lastIntent, setLastIntent] = useState(() => restoredThread?.lastIntent || '');
    const [lastSource, setLastSource] = useState(() => restoredThread?.lastSource || 'typed');
    const [lastStarterKind, setLastStarterKind] = useState(() => restoredThread?.lastStarterKind || '');
    const [lastSense, setLastSense] = useState(null);
    const [sendableDraft, setSendableDraft] = useState(() => restoredThread?.sendableDraft || null);
    const [artifactBusy, setArtifactBusy] = useState('');
    const [lastArtifactRequest, setLastArtifactRequest] = useState(null);
    const [workSurfaceOpen, setWorkSurfaceOpen] = useState(() => restoredThread ? Boolean(restoredThread.workSurfaceOpen) : true);
    const [rememberedKey, setRememberedKey] = useState('');
    const [memoryOpen, setMemoryOpen] = useState(false);
    const [importStatus, setImportStatus] = useState('');
    const [loopCount, setLoopCount] = useState(0);
    const [, setLastSourceCheck] = useState(null);
    const followUps = useMemo(() => makeFollowUps(result?.mirror || SAMPLE_MIRROR, loopCount, lastIntent), [result, loopCount, lastIntent]);
    const typingSense = useMemo(() => assessLocalMirrorSense(text, { activeDefault, mirrorDefaults, seed }), [activeDefault, mirrorDefaults, seed, text]);
    const savedCue = useMemo(() => savedContextCue({ activeDefault, continuity: continuityLedger }), [activeDefault, continuityLedger]);

    useEffect(() => {
        trackEvent('home_view', { page: 'home', surface: 'homepage' });
    }, []);

    useEffect(() => {
        if (!chatMemoryFlash) return undefined;
        const timer = window.setTimeout(() => setChatMemoryFlash(''), 2400);
        return () => window.clearTimeout(timer);
    }, [chatMemoryFlash]);

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

    async function reflect(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 4 || busy) return;
        const shortStartFollowup = source === 'typed' && isShortStartResult(result);
        const starterFollowupKind = source === 'typed' && result?.kind === 'starter' ? lastStarterKind || 'make' : '';

        const sense = assessLocalMirrorSense(cleanIntent, { activeDefault, mirrorDefaults, seed });
        const stateIntent = sense.blocked
            ? 'privacy check'
            : sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
        setLastIntent(stateIntent);
        setLastSource(source);
        setLastSense(sense);
        setLoopCount((current) => source === 'follow_up' ? Math.min(current + 1, 6) : 0);
        setSendableDraft(null);
        setArtifactBusy('');
        setWorkSurfaceOpen(false);
        trackEvent('mirror_submit', { page: 'home', source, route: 'reflection', status: 'started' });

        if (sense.blocked) {
            setText('');
            setResult(makeLocalPrivacyResult(sense));
            setLastStarterKind('');
            trackEvent('local_privacy_hold', { page: 'home', source, status: 'blocked' });
            return;
        }

        setText('');

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

        setBusy(true);
        try {
            const safeIntent = sense.softPrivate ? maskSoftPrivateText(cleanIntent) : cleanIntent;
            const seededIntent = seed || sense.approvedDefault || sense.drift || sense.softPrivate
                ? buildLocalSenseContext(sense, safeIntent)
                : safeIntent;
            const language = languagePayloadFor(cleanIntent, { seed });
            const response = await fetch(GATEWAY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Active-Mirror-Session': getPrivacySessionId(),
                },
                body: JSON.stringify({
                    intent: seededIntent,
                    boundary: 'personal',
                    route: 'reflection',
                    turn: shortStartFollowup ? 2 : 1,
                    mode: shortStartFollowup ? 'short_start_followup' : 'standard',
                    ...language,
                }),
            });
            const data = await response.json();
            trackEvent('mirror_result', {
                page: 'home',
                source,
                route: data.route?.capability || 'reflection',
                status: data.ok ? 'ok' : 'blocked',
                fallback: Boolean(data.fallback),
                visualKind: data.mirror?.visual?.kind || 'none',
            });

            const nextResult = data.ok ? data : makeBlockedResult(data);
            setResult(nextResult);

            if (data.ok && shouldOpenWorkSurface(cleanIntent, {})) {
                createArtifact(detectArtifactKind(cleanIntent, nextResult.mirror), {
                    mirror: nextResult.mirror,
                    intent: cleanIntent,
                    source: shortStartFollowup ? 'auto_second_turn' : 'auto',
                });
            }
        } catch {
            trackEvent('gateway_error', { page: 'home', source, route: 'reflection', status: 'network' });
            const fallbackResult = makeOfflineMirrorResult(cleanIntent, 'network', languagePayloadFor(cleanIntent, { seed }));
            setResult(fallbackResult);

            if (shouldOpenWorkSurface(cleanIntent, {})) {
                createArtifact(detectArtifactKind(cleanIntent, fallbackResult.mirror), {
                    mirror: fallbackResult.mirror,
                    intent: cleanIntent,
                    source: 'auto_local',
                });
            }
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

    function currentChatSnapshot() {
        return {
            draftText: text,
            result,
            lastIntent,
            lastSource,
            lastStarterKind,
            sendableDraft,
            workSurfaceOpen,
        };
    }

    function loadChatSnapshot(thread = {}) {
        setText(thread.draftText || '');
        setBusy(false);
        setResult(thread.result || null);
        setLastIntent(thread.lastIntent || '');
        setLastSource(thread.lastSource || 'typed');
        setLastStarterKind(thread.lastStarterKind || '');
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
        setBusy(false);
        setResult(null);
        setLastIntent('');
        setLastSource('typed');
        setLastStarterKind('');
        setLastSense(null);
        setLoopCount(0);
        setSendableDraft(null);
        setArtifactBusy('');
        setLastArtifactRequest(null);
        setWorkSurfaceOpen(true);
        const nextHomeChat = clearHomeChatContinuity({ keepEnabled: chatMemoryEnabled });
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
            setResult(makeSetupReadyResult());
            setLastIntent('loaded saved choices');
            setLastSource('uploaded_id');
            setLastStarterKind('');
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
                const response = await fetch(ARTIFACT_GATEWAY, {
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
            setSendableDraft(attachArtifactChallenge(data.artifact, {
                intent: artifactIntent,
                kind: artifactKind,
                route: data.fallback ? 'gateway_fallback' : 'gateway',
                fallback: Boolean(data.fallback),
                source: eventSource,
            }));
            trackEvent('sendable_created', {
                page: 'home',
                source: data.fallback ? 'gateway_fallback' : 'gateway',
                status: 'ok',
                fallback: Boolean(data.fallback),
                label: data.artifact.kind || artifactKind,
            });
        } catch {
            setSendableDraft(attachArtifactChallenge(makeArtifact(mirror, artifactIntent, artifactKind), {
                intent: artifactIntent,
                kind: artifactKind,
                route: 'local_fallback',
                fallback: true,
                source: eventSource,
            }));
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
    const canSubmit = text.trim().length >= 4;
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
    const ctaClass = canSubmit && !busy
        ? 'from-emerald-400 via-cyan-400 to-violet-500 text-white shadow-[0_0_30px_rgba(45,212,191,0.28)] hover:scale-[1.015]'
        : isLight
            ? 'from-stone-200 to-stone-300 text-stone-500 shadow-none'
            : 'from-zinc-800 to-zinc-700 text-zinc-500 shadow-none';

    return (
        <div className={`relative min-h-dvh overflow-hidden selection:bg-emerald-300/25 ${isLight ? 'bg-[#f7f3ec] text-[#1f1b16]' : 'bg-[#050507] text-white'}`}>
            <div className={`fixed inset-0 ${isLight ? 'bg-[radial-gradient(circle_at_24%_10%,rgba(255,255,255,0.92),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(196,181,253,0.18),transparent_30%),radial-gradient(circle_at_88%_86%,rgba(34,211,238,0.12),transparent_32%),#f7f3ec]' : 'bg-[radial-gradient(circle_at_24%_10%,rgba(126,87,255,0.20),transparent_34%),radial-gradient(circle_at_92%_84%,rgba(34,211,238,0.10),transparent_32%),#050507]'}`} />
            <div className={`fixed inset-0 bg-[linear-gradient(rgba(30,24,18,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(30,24,18,0.035)_1px,transparent_1px)] bg-[size:56px_56px] ${isLight ? 'opacity-30' : 'opacity-0'}`} />
            <div className={`fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:56px_56px] ${isLight ? 'opacity-0' : 'opacity-18'}`} />
            <ReflectionField awake={fieldAwake} />

            <header className="relative z-10 px-4 py-3 sm:py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex min-h-10 items-center gap-3 rounded-full pr-2">
                        <MirrorLogo />
                        <div className={`text-sm font-semibold tracking-[-0.01em] ${isLight ? 'text-stone-950' : 'text-white'}`}>Active Mirror</div>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-5">
                        <nav className={`hidden items-center gap-5 text-xs font-semibold sm:flex ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>
                            <Link to="/research" className={`inline-flex min-h-10 items-center rounded-full px-2 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Research</Link>
                            <Link to="/enterprise" className={`inline-flex min-h-10 items-center rounded-full px-2 transition ${isLight ? 'hover:bg-stone-200/45 hover:text-stone-950' : 'hover:bg-white/[0.055] hover:text-white'}`}>Business</Link>
                        </nav>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs transition ${isLight ? 'border-stone-300/70 bg-white/65 text-stone-600 shadow-[0_10px_24px_rgba(77,65,50,0.08)] hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-200/30 hover:text-white'}`}
                            aria-label={isLight ? 'Use dark mode' : 'Use light mode'}
                        >
                            {isLight ? <Moon size={15} /> : <Sun size={15} />}
                        </button>
                        <Link to="/consulting" className={`hidden min-h-10 items-center rounded-full border px-3.5 text-xs font-medium transition sm:inline-flex ${isLight ? 'border-stone-300/70 bg-white/65 text-stone-700 shadow-[0_10px_24px_rgba(77,65,50,0.08)] hover:border-emerald-400/50 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-emerald-300/30 hover:text-white'}`}>
                            For teams
                        </Link>
                    </div>
                </div>
            </header>

            <main className={`relative z-10 mx-auto flex min-h-[calc(100dvh-76px)] w-full flex-col justify-center gap-3 px-4 pb-4 pt-4 sm:min-h-[calc(100dvh-88px)] sm:gap-4 sm:pb-5 sm:pt-8 lg:pb-8 ${hasWorkSurface ? 'max-w-6xl' : 'max-w-3xl'}`}>
                <section className={`relative w-full overflow-hidden ${hasWorkSurface ? 'mx-auto max-w-3xl' : ''} ${showMirror ? 'rounded-[2.15rem] border border-white/10 bg-white/[0.048] p-3 shadow-[0_0_90px_rgba(168,85,247,0.12)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-5 lg:p-6' : 'px-0 py-8 sm:py-10'}`}>
                    {showMirror ? (
                        <>
                            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/45 to-transparent" />
                            <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl" aria-hidden="true" />
                            <div className="pointer-events-none absolute -bottom-16 right-8 h-48 w-48 rounded-full bg-cyan-300/8 blur-3xl" aria-hidden="true" />
                        </>
                    ) : null}

                    <div className={`relative z-10 ${showMirror ? '' : 'text-center'}`}>
                        <div className={`${showMirror ? 'mb-4 hidden sm:grid' : 'hidden'} h-14 w-14 place-items-center rounded-[1.25rem] border border-violet-200/20 bg-white/[0.05] shadow-[0_0_42px_rgba(168,85,247,0.16)]`}>
                            <MirrorLogo />
                        </div>

                        <h1 className={`mx-auto w-full max-w-[18.5rem] break-words font-semibold leading-[1.02] tracking-normal sm:max-w-xl ${isLight ? 'text-[#201b16]' : 'text-white'} ${showMirror ? 'text-2xl sm:text-[3.1rem] sm:leading-[0.98] lg:text-[3.65rem]' : 'text-[2.45rem] sm:text-[4.85rem] sm:leading-[0.98]'}`}>
                            What do you want?
                        </h1>

                        {!showMirror ? (
                            <div className={`mt-2.5 text-sm font-semibold tracking-normal sm:mt-3 sm:text-base ${isLight ? 'text-stone-500' : 'text-cyan-100/80'}`}>
                                Reflection &gt; Prediction
                            </div>
                        ) : null}

                        {!showMirror ? (
                            <div className="mx-auto mt-4 grid max-w-xl gap-2 sm:mt-5 sm:grid-cols-2">
                                <Link
                                    to="/id"
                                    onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'start_here_action' })}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.05rem] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 text-[0.98rem] font-bold text-white shadow-[0_0_42px_rgba(168,85,247,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_0_54px_rgba(34,211,238,0.24)] sm:min-h-14 sm:rounded-[1.2rem] sm:text-base"
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
                                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.05rem] border px-5 text-[0.98rem] font-bold transition hover:-translate-y-0.5 sm:min-h-14 sm:rounded-[1.2rem] sm:text-base ${isLight ? 'border-stone-300/70 bg-white/65 text-stone-700 shadow-[0_14px_36px_rgba(77,65,50,0.08)] hover:border-cyan-500/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.045] text-zinc-200 hover:border-cyan-200/35 hover:bg-cyan-200/[0.07] hover:text-white'}`}
                                >
                                    <Upload size={17} />
                                    Already have one?
                                </button>
                            </div>
                        ) : null}

                        <form onSubmit={submit} className={`${showMirror ? 'mt-3 sm:mt-4' : 'mx-auto mt-4 max-w-2xl'} grid gap-2`}>
                            <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-[1.6rem] border p-2 backdrop-blur-xl ${isLight ? 'border-stone-300/70 bg-white/74 shadow-[0_24px_70px_rgba(77,65,50,0.10)]' : 'border-white/10 bg-black/36 shadow-[0_0_50px_rgba(0,0,0,0.22)]'}`}>
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={text}
                                    maxLength={1000}
                                    placeholder="Or type what you want..."
                                    onChange={(event) => setText(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            submit(event);
                                        }
                                    }}
                                    className={`min-h-11 max-h-36 flex-1 resize-none rounded-[1.15rem] border border-transparent bg-transparent px-3 py-2.5 text-base leading-6 outline-none transition focus:border-violet-200/30 sm:min-h-14 sm:rounded-[1.25rem] sm:py-3 ${isLight ? 'text-stone-950 placeholder:text-stone-400' : 'text-white placeholder:text-zinc-500'}`}
                                    style={{ overflowWrap: 'anywhere' }}
                                />
                                <button
                                    type="submit"
                                    disabled={busy || !canSubmit}
                                    onClick={() => {
                                        if (!canSubmit && !busy) inputRef.current?.focus();
                                    }}
                                    className={`${showMirror ? 'w-11 px-0 sm:w-auto sm:px-5' : 'px-4 sm:px-5'} inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[1.05rem] bg-gradient-to-r text-sm font-bold transition disabled:cursor-not-allowed disabled:hover:scale-100 sm:min-h-14 sm:rounded-[1.15rem] ${ctaClass}`}
                                    aria-label="Send"
                                >
                                    {busy ? (
                                        <Sparkles size={18} className="animate-pulse" />
                                    ) : (
                                        <>
                                            <span className={showMirror ? 'hidden sm:inline' : ''}>Send</span>
                                            <ArrowUp size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {!showMirror ? (
                            <div className="mx-auto mt-3 max-w-2xl sm:mt-4">
                                <div className={`mb-2 text-center text-sm font-semibold tracking-normal ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>Or pick one</div>
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
                                            className={`group flex min-h-[4.15rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border px-1.5 py-2 text-center shadow-[0_0_28px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 sm:grid sm:min-h-[5.65rem] sm:content-center sm:justify-items-center sm:gap-1.5 sm:rounded-[1.25rem] sm:px-3 sm:py-3 ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-700 hover:border-cyan-500/30 hover:bg-white hover:text-stone-950' : 'border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:border-cyan-200/30 hover:bg-cyan-200/[0.065] hover:text-white'}`}
                                        >
                                            <span className={`grid h-7 w-7 place-items-center rounded-full border transition sm:h-8 sm:w-8 ${isLight ? 'border-cyan-500/15 bg-cyan-100/60 text-cyan-700 group-hover:border-cyan-600/25 group-hover:bg-cyan-100' : 'border-cyan-200/15 bg-cyan-200/[0.07] text-cyan-100/85 group-hover:border-cyan-100/30 group-hover:bg-cyan-200/[0.1]'}`}>
                                                <Icon size={15} />
                                            </span>
                                            <span className="whitespace-nowrap text-[9px] font-bold leading-4 min-[380px]:text-[10px] sm:text-sm">{item.label}</span>
                                            <span className={`hidden text-[11px] font-medium leading-4 transition sm:block ${isLight ? 'text-stone-500 group-hover:text-cyan-700' : 'text-zinc-500 group-hover:text-cyan-100/75'}`}>{item.caption}</span>
                                        </button>
                                    );
                                })}
                                </div>
                                <div className="mt-1.5 flex justify-center sm:mt-2">
                                    <button
                                        type="button"
                                        onClick={startLearnActiveMirror}
                                        className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition hover:-translate-y-0.5 sm:min-h-10 sm:px-3.5 ${isLight ? 'border-stone-300/70 bg-white/52 text-stone-600 hover:border-violet-400/35 hover:bg-white hover:text-stone-950' : 'border-white/[0.08] bg-white/[0.028] text-zinc-400 hover:border-violet-200/30 hover:bg-violet-200/[0.055] hover:text-white'}`}
                                    >
                                        <Sparkles size={15} className={isLight ? 'text-violet-500' : 'text-violet-200'} />
                                        Meet Active Mirror
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {!showMirror && savedCue ? (
                            <div className="mx-auto mt-3 grid max-w-2xl gap-3 rounded-[1.45rem] border border-emerald-300/14 bg-emerald-300/[0.045] p-3.5 text-left shadow-[0_0_32px_rgba(16,185,129,0.055)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
                                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-black/15 px-3.5 text-sm font-semibold text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                                    >
                                        Saved
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className={`mt-3 flex-wrap items-center gap-x-3 gap-y-2 text-xs ${isLight ? 'text-stone-500' : 'text-zinc-500'} ${showMirror ? 'flex' : 'flex justify-center'}`}>
                            <span>Private by default.</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Lock size={13} />
                                Saved only if you choose.
                            </span>
                            {savedCount > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setMemoryOpen(true)}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-400 transition hover:border-violet-200/30 hover:text-white"
                                >
                                    <SlidersHorizontal size={13} />
                                    Saved: {savedCount}
                                </button>
                            ) : null}
                            {canSaveCurrentChat ? (
                                <button
                                    type="button"
                                    onClick={saveCurrentChat}
                                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/50 text-stone-500 hover:border-violet-400/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-violet-200/30 hover:text-white'}`}
                                >
                                    <BookmarkPlus size={13} />
                                    Save chat
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={toggleChatMemory}
                                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/54 text-stone-500 hover:border-cyan-500/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.035] text-zinc-400 hover:border-cyan-200/30 hover:text-white'}`}
                                aria-pressed={chatMemoryEnabled}
                            >
                                {chatMemoryEnabled ? <Check size={13} /> : <Save size={13} />}
                                {chatMemoryEnabled ? 'Chat kept here' : 'Keep chat'}
                            </button>
                            {(showMirror || text.trim()) ? (
                                <button
                                    type="button"
                                    onClick={clearCurrentChat}
                                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/44 text-stone-500 hover:border-stone-400 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/25 hover:text-white'}`}
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
                            {showKeepChatNudge ? (
                                <div className={`grid gap-3 rounded-[1.35rem] border p-3.5 sm:ml-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${isLight ? 'border-cyan-500/18 bg-white/62 text-stone-600 shadow-[0_16px_34px_rgba(77,65,50,0.08)]' : 'border-cyan-200/14 bg-cyan-200/[0.045] text-zinc-400 shadow-[0_0_30px_rgba(34,211,238,0.05)]'}`}>
                                    <div className="min-w-0 text-sm leading-6">
                                        Leaving for a bit? Keep this chat on this browser.
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleChatMemory}
                                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition hover:-translate-y-0.5 ${isLight ? 'border-cyan-500/24 bg-cyan-50 text-cyan-800 hover:border-cyan-500/45 hover:bg-white' : 'border-cyan-200/24 bg-cyan-200/[0.08] text-cyan-50 hover:border-cyan-100/40 hover:bg-cyan-200/[0.12]'}`}
                                    >
                                        <Save size={15} />
                                        Keep it
                                    </button>
                                </div>
                            ) : null}
                            {!busy && result && !['privacy_hold', 'setup_ready', 'artifact_first'].includes(result.kind) ? (
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
                                                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 shadow-[0_10px_24px_rgba(77,65,50,0.06)] hover:border-violet-400/35 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.048] text-zinc-300 hover:border-violet-200/35 hover:bg-violet-200/[0.07] hover:text-white'}`}
                                                >
                                                    <Icon size={16} className={artifactBusy === item.artifactKind ? 'animate-pulse text-cyan-500' : isLight ? 'text-violet-500' : 'text-purple-200'} />
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

            <div className={`relative z-10 mx-auto flex max-w-3xl justify-center px-4 pb-6 text-xs sm:justify-end ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>
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
        </div>
    );
}
