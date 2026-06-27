import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, BookmarkPlus, Brain, ChevronDown, FileText, Lock, Minimize2, Network, PenLine, ShieldCheck, Sparkles, Telescope } from 'lucide-react';
import ReflectiveSurface from '../components/ReflectiveSurface';
import DraftActions from '../components/DraftActions';
import MirrorFeedback from '../components/MirrorFeedback';
import ReflectionCardActions from '../components/ReflectionCardActions';
import { NeedsSources, SourceCheckLine } from '../components/TruthStateNotice';
import { getActiveMirrorDefault, getArchetype } from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

const SAMPLE_MIRROR = {
    reflection: 'You may not need more ideas. You may need one small action that turns the loop into evidence.',
    question: 'What is the next choice you are avoiding because it would make the work real?',
    move: 'Write the smallest version of the decision in one sentence, then test it once today.',
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
    'I need a clearer next move.',
    'I need honest pushback.',
    'Turn this into something I can send.',
];

const LOADING_MIRROR = {
    reflection: 'Reading the stuck point once. Active Mirror is looking for the real question underneath it.',
    question: 'What is the real question here?',
    move: 'Hold the thread for a moment; the mirror is shaping one move.',
    receipt: {
        context_used: 'The sentence you just sent.',
        context_excluded: 'Private context stays out unless approved.',
        memory_decision: 'Nothing saved.',
    },
};

const ECOSYSTEM = [
    {
        title: 'BrainScan',
        text: 'A short intake that creates a local MirrorSeed so the mirror starts with your thinking style, not a blank personality.',
    },
    {
        title: 'MirrorSeed',
        text: 'A browser-held starting point. It helps continuity without turning every private detail into memory.',
    },
    {
        title: 'Receipts',
        text: 'Plain-language proof of what was used, what stayed out, and why the next move was suggested.',
    },
    {
        title: 'Vault',
        text: 'Continuity only grows when you accept it. Rough work can stay temporary.',
    },
    {
        title: 'Tools',
        text: 'Files, web, images, documents, and research can be added later through approval gates.',
    },
];

function isEcosystemAsk(intent) {
    return /\b(ecosystem|what can|how does|vault|brainscan|mirrorseed|receipt|privacy|tools|features)\b/i.test(intent);
}

function makeEcosystemResult(intent) {
    return {
        kind: 'ecosystem',
        intent,
        mirror: {
            reflection: 'Active Mirror starts as a private reflection surface, then adds memory, files, research, and tools only when they help the work.',
            question: 'Do you want to move one thing now, or understand the system before you use it?',
            move: 'Start with one real stuck point. The ecosystem becomes useful after the first reflection.',
            receipt: {
                context_used: 'Your request to understand the Active Mirror ecosystem.',
                context_excluded: 'No private user context was needed.',
                memory_decision: 'Nothing saved.',
            },
        },
    };
}

function makeBlockedResult(data = {}) {
    if (data.error === 'rate_limited') {
        return {
            mirror: {
                reflection: 'The mirror route is cooling down for a moment. Your page is still private, and nothing needs to be re-entered.',
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

function makeFollowUps(mirror = {}) {
    return [
        mirror.question && {
            label: 'Go deeper',
            icon: Telescope,
            intent: `Reflect one layer deeper on this question without giving me a long answer: ${mirror.question}`,
        },
        {
            label: 'Make it smaller',
            icon: Minimize2,
            intent: `Make this next move smaller and easier to start: ${mirror.move || 'the next move'}`,
        },
        {
            label: 'Draft the message',
            icon: PenLine,
            intent: `Turn this into a short message I could send: ${mirror.move || mirror.question || 'the next move'}`,
        },
    ].filter(Boolean);
}

function summarizeVisibleAsk(intent) {
    return intent.length > 220 ? `${intent.slice(0, 220).trim()}...` : intent;
}

function makeSendableDraft(mirror = {}) {
    const question = mirror.question || 'What is the useful next move?';
    const move = mirror.move || 'Take the smallest concrete next step.';

    return {
        title: 'Sendable draft',
        body: [
            'Quick update:',
            '',
            `I narrowed this to one question: ${question}`,
            '',
            `Next move: ${move}`,
            '',
            'Private context removed. Add only what the recipient needs.',
        ].filter(Boolean).join('\n'),
        checklist: [
            'Remove anything private before sending.',
            'Keep the ask to one sentence.',
            'Send it, then watch what changes.',
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

function Visual({ visual }) {
    if (!visual) return null;

    if (visual.kind === 'reframe') {
        return (
            <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Reframe</div>
                <div className="grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="text-zinc-500 line-through decoration-zinc-600">{visual.left}</div>
                    <div className="text-cyan-200">→</div>
                    <div className="font-semibold leading-6 text-white">{visual.right}</div>
                </div>
            </div>
        );
    }

    return null;
}

function ReflectionGlow({ mirror }) {
    const text = `${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`.toLowerCase();
    const urgent = /\b(overwhelmed|stuck|panic|confused|scared|afraid|urgent|pressure|spiral|loop)\b/.test(text);
    const decisive = /\b(decide|choice|ship|send|test|move|start|today)\b/.test(text);
    const tone = urgent ? 'from-amber-300/20 via-purple-300/12 to-cyan-300/10' : decisive ? 'from-emerald-300/18 via-cyan-300/12 to-purple-300/10' : 'from-purple-300/18 via-cyan-300/10 to-white/5';
    const label = urgent ? 'steady' : decisive ? 'clear' : 'open';

    return (
        <div className={`h-2 rounded-full bg-gradient-to-r ${tone}`} aria-label={`Reflection tone: ${label}`} />
    );
}

function MirrorResult({ result, intent, onPrompt, disabled, sourceCheck, onSourceChecked }) {
    const isLoading = Boolean(disabled && intent && !result);
    const mirror = result?.mirror || (isLoading ? LOADING_MIRROR : SAMPLE_MIRROR);
    const truthState = result?.truth_state || mirror.truth_state;

    return (
        <div className="flex h-full min-h-0 flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_0_70px_rgba(124,58,237,0.14)] ring-1 ring-white/[0.04] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles size={16} className={isLoading ? 'animate-pulse text-cyan-200' : 'text-cyan-200'} />
                    {isLoading ? 'Reflecting' : 'Live mirror'}
                </div>
                <div className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    private first
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
                <div className="grid gap-3">
                    <ReflectionGlow mirror={mirror} />
                    <div className="rounded-3xl border border-white/10 bg-black/25 px-4 py-4 text-[1.02rem] leading-7 text-zinc-100">
                        {mirror.reflection}
                    </div>
                    <div className="rounded-3xl border border-purple-300/20 bg-purple-300/[0.08] px-4 py-4">
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/75">The real question</div>
                        <div className="text-base font-semibold leading-6 text-white">{mirror.question}</div>
                    </div>
                    <div className="flex gap-3 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.08] px-4 py-4">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/75">One thing</div>
                            <div className="mt-1 text-sm leading-6 text-zinc-100">{mirror.move}</div>
                        </div>
                    </div>
                    <NeedsSources
                        truthState={truthState}
                        intent={intent}
                        mirror={mirror}
                        disabled={disabled}
                        onPrompt={onPrompt}
                        onSourceChecked={onSourceChecked}
                    />
                    {isLoading ? <LoadingPanel /> : null}
                    {!isLoading && result?.kind === 'ecosystem' ? <EcosystemPanel /> : null}
                    {!isLoading && result?.kind !== 'ecosystem' ? (
                        <details className="group rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] px-4 py-3 text-sm text-zinc-400">
                            <summary className="cursor-pointer list-none font-medium text-cyan-100">
                                Show more
                                <ChevronDown className="float-right mt-0.5 h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
                            </summary>
                            <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
                                <Visual visual={mirror.visual} />
                                <ReflectiveSurface result={result || { mirror }} intent={intent} onPrompt={onPrompt} disabled={disabled} />
                                <MirrorFeedback page="home" surface="homepage_result" turn={1} />
                                <ReflectionCardActions mirror={mirror} surface="home" />
                            </div>
                        </details>
                    ) : null}
                    <details className="group rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                        <summary className="cursor-pointer list-none font-medium">
                            What stayed private
                            <ChevronDown className="float-right mt-0.5 h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
                        </summary>
                        <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
                            <SourceCheckLine truthState={truthState} sourceCheck={sourceCheck} onClearSourceCheck={onSourceChecked ? () => onSourceChecked(null) : undefined} />
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Used</div>
                                <div className="mt-1 leading-6">{mirror.receipt?.context_used}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Left out</div>
                                <div className="mt-1 leading-6">{mirror.receipt?.context_excluded}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Memory</div>
                                <div className="mt-1 leading-6">{mirror.receipt?.memory_decision}</div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}

function EcosystemPanel() {
    return (
        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75">
                <Network size={14} />
                Ecosystem
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {ECOSYSTEM.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <div className="mt-1 text-xs leading-5 text-zinc-400">{item.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LoadingPanel() {
    return (
        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={16} className="animate-pulse text-cyan-200" />
                Reflecting
            </div>
            <div className="grid gap-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
            </div>
        </div>
    );
}

function SendableDraft({ draft }) {
    if (!draft) return null;

    return (
        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] px-4 py-4">
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

export default function HomePage() {
    const inputRef = useRef(null);
    const [seed] = useState(() => getArchetype());
    const [activeDefault] = useState(() => getActiveMirrorDefault());
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [lastIntent, setLastIntent] = useState('');
    const [sendableDraft, setSendableDraft] = useState(null);
    const [lastSourceCheck, setLastSourceCheck] = useState(null);
    const followUps = useMemo(() => makeFollowUps(result?.mirror || SAMPLE_MIRROR), [result]);

    useEffect(() => {
        trackEvent('home_view', { page: 'home', surface: 'homepage' });
    }, []);

    async function reflect(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 4 || busy) return;

        setText('');
        setLastIntent(cleanIntent);
        setSendableDraft(null);
        trackEvent('mirror_submit', { page: 'home', source, route: 'reflection', status: 'started' });

        if (isEcosystemAsk(cleanIntent)) {
            setResult(makeEcosystemResult(cleanIntent));
            trackEvent('ecosystem_result', { page: 'home', source, status: 'local' });
            return;
        }

        setBusy(true);
        try {
            const context = [
                seed ? `MirrorSeed: ${seed.archetypeName || seed.archetype}. Strengths: ${(seed.strengths || []).join(', ') || 'unknown'}.` : '',
                activeDefault ? `User-approved default: real question "${activeDefault.question || 'not set'}"; preferred next move "${activeDefault.move || 'not set'}".` : '',
                `User intent: ${cleanIntent}`,
            ].filter(Boolean).join('\n');
            const seededIntent = seed || activeDefault ? context : cleanIntent;
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
            setResult({
                mirror: {
                    reflection: 'The mirror route is not reachable right now, but the page is still private by default.',
                    question: 'What is the one sentence version of the thing you are stuck on?',
                    move: 'Try again in a moment, or open the full mirror workspace.',
                    receipt: {
                        context_used: 'No hosted model response was returned.',
                        context_excluded: 'Nothing was saved or promoted.',
                        memory_decision: 'Nothing saved.',
                    },
                },
            });
        } finally {
            setBusy(false);
        }
    }

    function submit(event) {
        event.preventDefault();
        reflect(text);
    }

    const showMirror = Boolean(result || busy || lastIntent);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-black text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.13),transparent_32%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <MirrorLogo />
                        <div>
                            <div className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</div>
                            <div className="hidden text-xs text-zinc-500 sm:block">one thing in, one move out</div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/start" className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-purple-300/30 hover:text-white sm:inline-flex">
                            BrainScan
                        </Link>
                        <Link to="/enterprise" className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-emerald-300/30 hover:text-white sm:inline-flex">
                            Enterprise
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-57px)] max-w-3xl flex-col gap-4 px-4 py-5 lg:py-6">
                <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_60px_rgba(168,85,247,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-7">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                            <ShieldCheck size={14} />
                            Private first
                        </div>
                        <h1 className="text-[2.7rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[4rem]">
                            What are you stuck on?
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
                            Say the thing. Get the next move.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {STARTERS.map((starter) => (
                                <button
                                    key={starter}
                                    type="button"
                                    onClick={() => setText(starter)}
                                    className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-400 transition hover:border-purple-300/30 hover:text-white"
                                >
                                    {starter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-7">
                        <form onSubmit={submit} className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                rows={2}
                                value={text}
                                maxLength={1000}
                                placeholder="Tell me one thing you're stuck on."
                                onChange={(event) => setText(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        submit(event);
                                    }
                                }}
                                className="max-h-36 min-h-[4.5rem] flex-1 resize-none rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-base leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-purple-300/45"
                            />
                            <button
                                type="submit"
                                disabled={busy || text.trim().length < 4}
                                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-[0_0_24px_rgba(168,85,247,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                                aria-label="Reflect"
                            >
                                {busy ? <Sparkles size={18} className="animate-pulse" /> : <ArrowUp size={19} />}
                            </button>
                        </form>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Lock size={13} />
                                Nothing is saved from this page.
                            </span>
                            {seed ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <Brain size={13} />
                                    Local seed available.
                                </span>
                            ) : null}
                            {activeDefault ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <BookmarkPlus size={13} />
                                    Using your default.
                                </span>
                            ) : null}
                        </div>
                    </div>
                </section>

                {showMirror ? (
                    <section className="flex flex-col gap-3">
                        {lastIntent ? (
                            <div className="rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-zinc-400">
                                You asked: <span className="text-zinc-200">{summarizeVisibleAsk(lastIntent)}</span>
                            </div>
                        ) : null}
                        <MirrorResult
                            result={result}
                            intent={lastIntent}
                            disabled={busy}
                            sourceCheck={lastSourceCheck}
                            onSourceChecked={setLastSourceCheck}
                            onPrompt={(nextIntent) => {
                                trackEvent('followup_clicked', { page: 'home', source: 'surface' });
                                reflect(nextIntent, 'surface');
                            }}
                        />
                        <div className="grid gap-2 pb-1 sm:grid-cols-3">
                            {followUps.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                            trackEvent('followup_clicked', { page: 'home', source: 'follow_up' });
                                            reflect(item.intent, 'follow_up');
                                        }}
                                        disabled={busy}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-left text-sm font-semibold text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Icon size={16} className="text-purple-200" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                        <SendableDraft draft={sendableDraft} />
                    </section>
                ) : null}
            </main>

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                <div>One thing at a time. Nothing saved unless you choose.</div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
                    <Link to="/terms" className="transition hover:text-white">Terms</Link>
                    <Link
                        to="/start"
                        onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'footer_mirrorseed' })}
                        className="inline-flex items-center gap-1 transition hover:text-white"
                    >
                        Take BrainScan
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
