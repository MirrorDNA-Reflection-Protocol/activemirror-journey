import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUp, BookmarkPlus, Check, Copy, FileText, Lock, PenLine, Pencil, Save, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react';
import DraftActions from '../components/DraftActions';
import MirrorFeedback from '../components/MirrorFeedback';
import { NeedsSources } from '../components/TruthStateNotice';
import { buildLocalSenseContext, assessLocalMirrorSense } from '../lib/local-mirror-sense';
import { makeOfflineMirrorResult } from '../lib/first-turn-fallback';
import {
    clearMirrorDefault,
    deleteMirrorDefault,
    getActiveMirrorDefault,
    getArchetype,
    getBlueprint,
    getMirrorDefaults,
    saveMirrorDefault,
    updateMirrorDefault,
    useMirrorDefault,
} from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';
import { copyText } from '../lib/sendable-actions';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

const SAMPLE_MIRROR = {
    reflection: 'The work gets lighter when the next move is small enough to actually start.',
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

const STARTERS = [
    {
        label: 'Get unstuck',
        prompt: 'I feel stuck and need one clear next move.',
        tone: 'steady',
    },
    {
        label: 'Make this sendable',
        prompt: 'I need to turn messy thoughts into something I can send.',
        tone: 'clear',
    },
    {
        label: 'Check my thinking',
        prompt: 'Challenge my thinking and show me the real next move.',
        tone: 'challenge',
    },
];

const STARTER_TONES = {
    steady: {
        dot: 'bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.52)]',
        button: 'hover:border-emerald-200/35 hover:bg-emerald-200/[0.08]',
    },
    clear: {
        dot: 'bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.48)]',
        button: 'hover:border-cyan-200/35 hover:bg-cyan-200/[0.08]',
    },
    challenge: {
        dot: 'bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.50)]',
        button: 'hover:border-violet-200/35 hover:bg-violet-200/[0.08]',
    },
};

const LOADING_MIRROR = {
    reflection: 'Finding the next move.',
    question: 'What matters here?',
    move: 'One moment.',
    receipt: {
        context_used: 'The sentence you just sent.',
        context_excluded: 'Private context stays out unless approved.',
        memory_decision: 'Nothing saved.',
    },
};

function isEcosystemAsk(intent) {
    return /\b(ecosystem|what can|how does|vault|brainscan|mirrorseed|receipt|privacy|tools|features)\b/i.test(intent);
}

function isSourceHeavyAsk(intent) {
    return /\b(today|latest|current|recent|online|web|source|sources|research|competitor|market|verify|check|claim|fact|facts|numbers|price|pricing|paper|study|studies|report|released|launched|who is doing)\b/i.test(intent);
}

function makeEcosystemResult(intent) {
    return {
        kind: 'help',
        intent,
        mirror: {
            reflection: 'Start with the thing in front of you.',
            question: 'What do you want help moving?',
            move: 'Type it in one sentence. Leave private details out for now.',
            receipt: {
                context_used: 'Your question about how Active Mirror helps.',
                context_excluded: 'No private details were needed.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function makeBlockedResult(data = {}) {
    if (data.error === 'rate_limited') {
        return {
            mirror: {
                reflection: 'The answer is cooling down for a moment. Your page is still private, and nothing needs to be re-entered.',
                question: 'Can you hold the same stuck point and try again in a minute?',
                move: 'Wait for the short cooldown, then send the same sentence again.',
                receipt: {
                    context_used: 'Only the request limit state was used.',
                    context_excluded: 'Your private context was not expanded or saved.',
                    memory_decision: 'Nothing saved.',
                },
            },
        };
    }

    return {
        mirror: {
            reflection: 'That looks like it may contain private or sensitive context, so Active Mirror held the turn back.',
            question: 'Can you restate the stuck point without secrets or identifying details?',
            move: 'Remove names, account details, and private facts, then try one sentence again.',
            receipt: {
                context_used: 'The current prompt only.',
                context_excluded: 'Potentially sensitive details were not processed further.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function makeLocalPrivacyResult(sense = {}) {
    return {
        mirror: {
            reflection: 'That looks like it contains a secret, so I held it on this page instead of sending it out.',
            question: 'Can you replace the private detail with a placeholder?',
            move: 'Rewrite the same stuck point with names, keys, passwords, and account details removed.',
            receipt: {
                context_used: 'Only the local browser privacy check.',
                context_excluded: 'The sensitive-looking text was not sent out.',
                memory_decision: 'Nothing saved.',
            },
            visual: {
                kind: 'reframe',
                left: 'Send the whole thing',
                right: 'Send only the shape of the problem',
            },
        },
        local_sense: sense,
    };
}

function makeFollowUps(mirror = {}, loopCount = 0) {
    if (loopCount >= 4) {
        return [
            mirror.move && {
                label: 'Pick the move',
                icon: Check,
                action: 'reflect',
                intent: `Stop expanding. Synthesize this into the one move I should do now: ${mirror.move}`,
            },
            {
                label: 'Make it sendable',
                icon: PenLine,
                action: 'draft',
                intent: 'Create a sendable draft from this reflection.',
            },
        ].filter(Boolean);
    }

    return [
        mirror.move && {
            label: 'What else?',
            icon: Sparkles,
            action: 'reflect',
            intent: `Give me one different useful angle on this, without repeating yourself. Keep one next move only: ${mirror.move}`,
        },
        mirror.question && {
            label: 'Challenge me',
            icon: ArrowRight,
            action: 'reflect',
            intent: `Challenge my premise and name what I may be avoiding. Keep it short: ${mirror.question}`,
        },
        {
            label: 'Make it sendable',
            icon: PenLine,
            action: 'draft',
            intent: 'Create a sendable draft from this reflection.',
        },
    ].filter(Boolean);
}

function makeSendableDraft(mirror = {}) {
    const question = mirror.question || 'What is the useful next move?';
    const move = mirror.move || 'Take the smallest concrete next step.';

    return {
        title: 'Message draft',
        body: [
            `I am using this question: ${question}`,
            `My next move is: ${move}`,
            'I am keeping private details out unless they are needed.',
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

function ReflectionGlow({ mirror }) {
    const text = `${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    const urgent = /\b(overwhelmed|stuck|panic|confused|scared|afraid|urgent|pressure|spiral|loop)\b/.test(text);
    const decisive = /\b(decide|choice|ship|send|test|move|start|today)\b/.test(text);
    const tone = urgent ? 'from-amber-200/24 via-violet-300/12 to-white/5' : decisive ? 'from-violet-200/20 via-fuchsia-200/10 to-white/5' : 'from-violet-300/18 via-white/8 to-white/5';
    const label = urgent ? 'steady' : decisive ? 'clear' : 'open';

    return (
        <div className={`h-2 rounded-full bg-gradient-to-r ${tone}`} aria-label={`Reflection tone: ${label}`} />
    );
}

function mirrorMemoryKey(mirror = {}) {
    return `${mirror.question || ''}::${mirror.move || ''}`;
}

function memoryItemKey(item = {}) {
    return item.savedAt || mirrorMemoryKey(item);
}

function isActiveMemory(item = {}, activeDefault = null) {
    if (!activeDefault) return false;
    return memoryItemKey(item) === memoryItemKey(activeDefault) || mirrorMemoryKey(item) === mirrorMemoryKey(activeDefault);
}

function MicroVisual({ visual }) {
    if (!visual) return null;

    if (visual.kind === 'reframe') {
        return (
            <div className="mt-3 grid gap-2 rounded-[1.35rem] border border-cyan-300/15 bg-cyan-300/[0.055] p-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="text-zinc-500 line-through decoration-zinc-600">{visual.left}</div>
                <div className="hidden text-cyan-200 sm:block">to</div>
                <div className="font-semibold text-cyan-100">{visual.right}</div>
            </div>
        );
    }

    if (visual.kind === 'axes') {
        return (
            <div className="mt-3 rounded-[1.35rem] border border-cyan-300/15 bg-cyan-300/[0.055] p-3">
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-violet-300 via-cyan-200 to-emerald-200" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span className="text-zinc-300">{visual.left}</span>
                    <span className="text-right text-cyan-100">{visual.right}</span>
                </div>
            </div>
        );
    }

    if (visual.kind === 'spectrum') {
        return (
            <div className="mt-3 rounded-[1.35rem] border border-cyan-300/15 bg-cyan-300/[0.055] p-3">
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-purple-300 to-cyan-200" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span>{visual.left}</span>
                    <span className="text-right text-cyan-100">{visual.right}</span>
                </div>
            </div>
        );
    }

    return null;
}

function NextMoveSurface({ mirror, onRemember, remembered }) {
    const [copied, setCopied] = useState(false);

    async function copyMove() {
        await copyText(mirror.move || '');
        setCopied(true);
        trackEvent('draft_copied', { page: 'home', source: 'next_move' });
        window.setTimeout(() => setCopied(false), 1600);
    }

    return (
        <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
                Next move
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="text-[1.05rem] font-semibold leading-7 text-emerald-50 sm:text-lg">{mirror.move}</div>
                <button
                    type="button"
                    onClick={copyMove}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.10] px-4 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/40 hover:bg-emerald-200/[0.16]"
                >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className="mt-3 flex justify-start">
                <button
                    type="button"
                    onClick={() => onRemember?.(mirror)}
                    disabled={remembered}
                    className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition hover:border-violet-300/35 hover:text-white disabled:border-emerald-300/20 disabled:text-emerald-100"
                >
                    {remembered ? <Check size={13} /> : <BookmarkPlus size={13} />}
                    {remembered ? 'Saved for next time' : 'Remember this'}
                </button>
            </div>
            <MicroVisual visual={mirror.visual} />
        </div>
    );
}

function MirrorResult({ result, intent, turnSource = 'typed', onPrompt, disabled, onSourceChecked, onRemember, remembered }) {
    const isLoading = Boolean(disabled && intent && !result);
    const mirror = result?.mirror || (isLoading ? LOADING_MIRROR : SAMPLE_MIRROR);
    const truthState = result?.truth_state || mirror.truth_state;
    const canPromptSourceCheck = ['typed', 'follow_up', 'surface'].includes(turnSource);
    const showSourceCheck = canPromptSourceCheck && truthState?.status === 'needs_checking' && isSourceHeavyAsk(intent);

    if (isLoading) {
        return <LoadingPanel />;
    }

    return (
        <div className="grid gap-3">
            <div className="flex items-start gap-3">
                <div className="mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-2xl border border-violet-200/15 bg-white/[0.045] text-violet-100 shadow-[0_0_28px_rgba(168,85,247,0.12)] md:grid">
                    <MirrorLogo />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#101014]/78 p-4 shadow-[0_0_62px_rgba(124,58,237,0.10)] backdrop-blur-2xl sm:p-5">
                    <ReflectionGlow mirror={mirror} />
                    <p className="mt-4 text-[1.06rem] leading-7 text-zinc-100 sm:text-[1.14rem]">
                        {mirror.reflection}
                    </p>
                    <div className="mt-5 rounded-2xl bg-white/[0.035] px-4 py-3 text-sm leading-6 text-zinc-300 sm:text-[0.95rem]">
                        <span className="font-semibold text-violet-100/85">Real question: </span>
                        {mirror.question}
                    </div>
                    <NextMoveSurface mirror={mirror} onRemember={onRemember} remembered={remembered} />
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

function SendableDraft({ draft }) {
    if (!draft) return null;

    return (
        <div className="rounded-[1.7rem] border border-cyan-300/15 bg-cyan-300/[0.055] px-4 py-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <FileText size={16} />
                {draft.title}
            </div>
            <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-3 text-sm leading-6 text-zinc-100">{draft.body}</pre>
            <DraftActions title={draft.title} text={draft.body} surface="home" />
            <div className="mt-3 grid gap-2">
                {draft.checklist.map((item) => (
                    <div key={item} className="text-xs leading-5 text-zinc-400">{item}</div>
                ))}
            </div>
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
    activeDefault,
    onClose,
    onUse,
    onPause,
    onDelete,
    onEdit,
}) {
    const [editingKey, setEditingKey] = useState('');
    const [draft, setDraft] = useState({ question: '', move: '' });
    const [mode, setMode] = useState('list');
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFlipped, setCardFlipped] = useState(false);

    if (!open) return null;

    const activeCardIndex = items.length ? Math.min(cardIndex, items.length - 1) : 0;
    const activeCard = items[activeCardIndex] || null;

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
        <div className="fixed inset-0 z-30 bg-black/65 px-3 py-4 backdrop-blur-md sm:px-6" role="dialog" aria-modal="true" aria-label="Saved notes">
            <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="Close saved notes"
                onClick={onClose}
            />
            <div className="relative mx-auto flex max-h-[88dvh] max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d0d11]/95 shadow-[0_0_80px_rgba(124,58,237,0.2)] ring-1 ring-white/[0.04]">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                    <div>
                        <div className="text-lg font-semibold tracking-[-0.03em] text-white">Saved notes</div>
                        <div className="mt-1 text-sm leading-6 text-zinc-400">Saved on this browser. Edit or remove anything.</div>
                        {items.length ? (
                            <button
                                type="button"
                                onClick={() => setMode((current) => current === 'cards' ? 'list' : 'cards')}
                                className="mt-3 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/35"
                            >
                                {mode === 'cards' ? 'Show list' : 'Show cards'}
                            </button>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                        aria-label="Close saved notes"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-4">
                    {!items.length ? (
                        <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.035] px-4 py-5 text-sm leading-6 text-zinc-400">
                            Nothing saved yet. When an answer is useful, choose Remember.
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
                                    <span>{cardFlipped ? 'Next move' : 'Pattern'}</span>
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
                                                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-300/30 hover:text-white"
                                                >
                                                    {active ? 'Pause' : 'Use'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => editing ? setEditingKey('') : startEdit(item)}
                                                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-violet-200/30 hover:text-white"
                                                    aria-label={editing ? 'Cancel edit' : 'Edit saved note'}
                                                >
                                                    {editing ? <X size={15} /> : <Pencil size={15} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(key)}
                                                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-rose-300/30 hover:text-rose-100"
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
    const inputRef = useRef(null);
    const bootPromptRef = useRef(false);
    const [seed] = useState(() => {
        const profile = getArchetype();
        const blueprint = getBlueprint();
        if (!profile && !blueprint) return null;
        return { ...(profile || {}), blueprint };
    });
    const [activeDefault, setActiveDefault] = useState(() => getActiveMirrorDefault());
    const [mirrorDefaults, setMirrorDefaults] = useState(() => getMirrorDefaults());
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [lastIntent, setLastIntent] = useState('');
    const [lastSource, setLastSource] = useState('typed');
    const [lastSense, setLastSense] = useState(null);
    const [sendableDraft, setSendableDraft] = useState(null);
    const [rememberedKey, setRememberedKey] = useState('');
    const [memoryOpen, setMemoryOpen] = useState(false);
    const [loopCount, setLoopCount] = useState(0);
    const [, setLastSourceCheck] = useState(null);
    const followUps = useMemo(() => makeFollowUps(result?.mirror || SAMPLE_MIRROR, loopCount), [result, loopCount]);
    const typingSense = useMemo(() => assessLocalMirrorSense(text, { activeDefault, mirrorDefaults, seed }), [activeDefault, mirrorDefaults, seed, text]);

    useEffect(() => {
        trackEvent('home_view', { page: 'home', surface: 'homepage' });
    }, []);

    useEffect(() => {
        const startPrompt = location.state?.startPrompt;
        if (bootPromptRef.current || typeof startPrompt !== 'string' || startPrompt.trim().length < 4) return;
        bootPromptRef.current = true;
        reflect(startPrompt, 'mirror_id');
        window.history.replaceState({}, document.title, window.location.pathname);
    }, [location.state]);

    async function reflect(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 4 || busy) return;

        const sense = assessLocalMirrorSense(cleanIntent, { activeDefault, mirrorDefaults, seed });
        setLastIntent(cleanIntent);
        setLastSource(source);
        setLastSense(sense);
        setLoopCount((current) => source === 'follow_up' ? Math.min(current + 1, 6) : 0);
        setSendableDraft(null);
        trackEvent('mirror_submit', { page: 'home', source, route: 'reflection', status: 'started' });

        if (sense.blocked) {
            setText('');
            setResult(makeLocalPrivacyResult(sense));
            trackEvent('local_privacy_hold', { page: 'home', source, status: 'blocked' });
            return;
        }

        setText('');

        if (isEcosystemAsk(cleanIntent)) {
            setResult(makeEcosystemResult(cleanIntent));
            trackEvent('ecosystem_result', { page: 'home', source, status: 'local' });
            return;
        }

        setBusy(true);
        try {
            const seededIntent = seed || sense.approvedDefault || sense.drift
                ? buildLocalSenseContext(sense, cleanIntent)
                : cleanIntent;
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
                    turn: 1,
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

            setResult(data.ok ? data : makeBlockedResult(data));
        } catch {
            trackEvent('gateway_error', { page: 'home', source, route: 'reflection', status: 'network' });
            setResult(makeOfflineMirrorResult(cleanIntent));
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
        setActiveDefault(saved);
        setMirrorDefaults(getMirrorDefaults());
        setRememberedKey(mirrorMemoryKey(mirror));
        trackEvent('mirror_default_saved', { page: 'home', source: 'explicit_approval' });
    }

    function refreshMemoryState(nextState) {
        setActiveDefault(nextState?.activeDefault ?? getActiveMirrorDefault());
        setMirrorDefaults(nextState?.mirrorDefaults ?? getMirrorDefaults());
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

    function submit(event) {
        event.preventDefault();
        reflect(text, 'typed');
    }

    function chooseStarter(starter) {
        if (busy) return;
        trackEvent('starter_clicked', { page: 'home', source: 'starter' });
        reflect(starter.prompt, 'starter');
    }

    const showMirror = Boolean(result || busy || lastIntent);
    const canSubmit = text.trim().length >= 4;
    const fieldAwake = showMirror || text.trim().length > 0;
    const ctaClass = canSubmit && !busy
        ? 'from-emerald-400 via-cyan-400 to-violet-500 text-white shadow-[0_0_30px_rgba(45,212,191,0.28)] hover:scale-[1.015]'
        : 'from-zinc-800 to-zinc-700 text-zinc-500 shadow-none';

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#050507] text-white selection:bg-emerald-300/25">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_24%_10%,rgba(126,87,255,0.20),transparent_34%),radial-gradient(circle_at_92%_84%,rgba(34,211,238,0.10),transparent_32%),#050507]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:56px_56px] opacity-18" />
            <ReflectionField awake={fieldAwake} />

            <header className="relative z-10 px-4 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <MirrorLogo />
                        <div className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/id" className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-violet-300/30 hover:text-white sm:inline-flex">
                            Personalize
                        </Link>
                        <Link to="/enterprise" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-emerald-300/30 hover:text-white">
                            Teams
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-88px)] w-full max-w-3xl flex-col justify-center gap-4 px-4 pb-5 pt-8 lg:pb-8">
                <section className={`relative overflow-hidden ${showMirror ? 'rounded-[2.15rem] border border-white/10 bg-white/[0.048] p-3 shadow-[0_0_90px_rgba(168,85,247,0.12)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-5 lg:p-6' : 'px-0 py-8 sm:py-10'}`}>
                    {showMirror ? (
                        <>
                            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/45 to-transparent" />
                            <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-16 right-8 h-48 w-48 rounded-full bg-cyan-300/8 blur-3xl" />
                        </>
                    ) : null}

                    <div className={`relative z-10 ${showMirror ? '' : 'text-center'}`}>
                        <div className={`${showMirror ? 'mb-4 hidden sm:grid' : 'mx-auto mb-7 grid'} h-14 w-14 place-items-center rounded-[1.25rem] border border-violet-200/20 bg-white/[0.05] shadow-[0_0_42px_rgba(168,85,247,0.16)]`}>
                            <MirrorLogo />
                        </div>

                        <h1 className={`mx-auto max-w-xl break-words font-semibold leading-[0.98] tracking-normal text-white ${showMirror ? 'text-2xl sm:text-[3.1rem] lg:text-[3.65rem]' : 'text-[3.15rem] sm:text-[4.85rem]'}`}>
                            What do you want?
                        </h1>
                        <p className={`${showMirror ? 'hidden sm:block' : 'block'} mx-auto mt-4 max-w-[35rem] text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8`}>
                            Not sure how to ask? Start here.
                        </p>

                        {!showMirror ? (
                            <div className="mx-auto mt-7 grid max-w-2xl gap-2 sm:grid-cols-3">
                                {STARTERS.map((starter) => {
                                    const tone = STARTER_TONES[starter.tone] || STARTER_TONES.challenge;
                                    return (
                                        <button
                                            key={starter.label}
                                            type="button"
                                            onClick={() => chooseStarter(starter)}
                                            disabled={busy}
                                            className={`group flex min-h-14 items-center gap-3 rounded-[1.15rem] border border-white/10 bg-black/24 px-3 text-left text-sm font-semibold leading-5 text-zinc-300 transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${tone.button}`}
                                        >
                                            <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                                            <span>{starter.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}

                        <form onSubmit={submit} className={`${showMirror ? 'mt-3 sm:mt-4' : 'mx-auto mt-4 max-w-2xl'} grid gap-2`}>
                            <div className="grid gap-2 rounded-[1.6rem] border border-white/10 bg-black/36 p-2 shadow-[0_0_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                <textarea
                                    ref={inputRef}
                                    rows={showMirror ? 1 : 3}
                                    value={text}
                                    maxLength={1000}
                                    placeholder="Message Active Mirror..."
                                    onChange={(event) => setText(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            submit(event);
                                        }
                                    }}
                                    className={`${showMirror ? 'min-h-14' : 'min-h-24'} max-h-36 flex-1 resize-none rounded-[1.25rem] border border-transparent bg-transparent px-3 py-3 text-base leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-200/30`}
                                    style={{ overflowWrap: 'anywhere' }}
                                />
                                <button
                                    type="submit"
                                    disabled={busy || !canSubmit}
                                    onClick={() => {
                                        if (!canSubmit && !busy) inputRef.current?.focus();
                                    }}
                                    className={`${showMirror ? 'sm:min-h-14' : 'sm:min-h-16'} inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-r px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:hover:scale-100 ${ctaClass}`}
                                    aria-label="Get my next move"
                                >
                                    {busy ? (
                                        <Sparkles size={18} className="animate-pulse" />
                                    ) : (
                                        <>
                                            <span>Reflect</span>
                                            <ArrowUp size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 ${showMirror ? '' : 'justify-center'}`}>
                            <span>Your thoughts stay yours.</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Lock size={13} />
                                You choose what carries forward.
                            </span>
                            {mirrorDefaults.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setMemoryOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-violet-200/30 hover:text-white"
                                >
                                    <SlidersHorizontal size={13} />
                                    Saved: {mirrorDefaults.length}
                                </button>
                            ) : null}
                            <LocalSenseLine sense={typingSense} />
                        </div>

                    </div>
                </section>

                {showMirror ? (
                    <section className="grid gap-3">
                        <>
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
                            <div className="sm:pl-12">
                                <LocalSenseLine sense={lastSense} />
                            </div>
                            {!busy && result ? (
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
                                                        if (item.action === 'draft') {
                                                            setSendableDraft(makeSendableDraft(result?.mirror || SAMPLE_MIRROR));
                                                            return;
                                                        }
                                                        reflect(item.intent, 'follow_up');
                                                    }}
                                                    disabled={busy}
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.048] px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:-translate-y-0.5 hover:border-violet-200/35 hover:bg-violet-200/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                                >
                                                    <Icon size={16} className="text-purple-200" />
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                        <Link
                                            to="/id"
                                            onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'personal_setup_chip' })}
                                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3.5 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-200/[0.09]"
                                        >
                                            Make it yours
                                            <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                    <MirrorFeedback page="home" surface="first_turn" turn={1} result={result} onRepair={(nextIntent) => {
                                        trackEvent('followup_clicked', { page: 'home', source: 'feedback_repair' });
                                        reflect(nextIntent, 'feedback_repair');
                                    }} />
                                </div>
                            ) : null}
                            <SendableDraft draft={sendableDraft} />
                        </>
                    </section>
                ) : null}
            </main>

            <div className="relative z-10 mx-auto flex max-w-3xl justify-center px-4 pb-6 text-xs text-zinc-500 sm:justify-end">
                <div className="flex flex-wrap gap-3">
                    <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
                    <Link to="/terms" className="transition hover:text-white">Terms</Link>
                </div>
            </div>
            <MemoryDrawer
                open={memoryOpen}
                items={mirrorDefaults}
                activeDefault={activeDefault}
                onClose={() => setMemoryOpen(false)}
                onUse={useSavedMemory}
                onPause={pauseMemory}
                onDelete={removeMemory}
                onEdit={editMemory}
            />
        </div>
    );
}
