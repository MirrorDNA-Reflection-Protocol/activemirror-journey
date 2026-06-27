import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, FileText, Lock, Minimize2, PenLine, Sparkles, Telescope } from 'lucide-react';
import DraftActions from '../components/DraftActions';
import { NeedsSources } from '../components/TruthStateNotice';
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
    "I'm delaying.",
    'I need to decide.',
    'Help me write it.',
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

function isEcosystemAsk(intent) {
    return /\b(ecosystem|what can|how does|vault|brainscan|mirrorseed|receipt|privacy|tools|features)\b/i.test(intent);
}

function makeEcosystemResult(intent) {
    return {
        kind: 'help',
        intent,
        mirror: {
            reflection: 'Active Mirror is for the moment when regular AI gives you more words but you still do not know what to do. Start with one real thing; it will help you find the next move.',
            question: 'What is the one thing you want help moving right now?',
            move: 'Type the stuck point in one sentence. Leave out names, secrets, and private details until they are actually needed.',
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
            action: 'reflect',
            intent: `Go one layer deeper on this question without giving me a long answer: ${mirror.question}`,
        },
        {
            label: 'Smaller',
            icon: Minimize2,
            action: 'reflect',
            intent: `Make this next move smaller and easier to start: ${mirror.move || 'the next move'}`,
        },
        {
            label: 'Draft it',
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

function MirrorResult({ result, intent, onPrompt, disabled, onSourceChecked }) {
    const isLoading = Boolean(disabled && intent && !result);
    const mirror = result?.mirror || (isLoading ? LOADING_MIRROR : SAMPLE_MIRROR);
    const truthState = result?.truth_state || mirror.truth_state;

    if (isLoading) {
        return <LoadingPanel />;
    }

    return (
        <div className="grid gap-3">
            <div className="flex items-start gap-3">
                <div className="mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-2xl border border-violet-200/15 bg-white/[0.045] text-violet-100 shadow-[0_0_28px_rgba(168,85,247,0.12)] sm:grid">
                    <MirrorLogo />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111114]/82 p-4 shadow-[0_0_70px_rgba(124,58,237,0.12)] backdrop-blur-2xl sm:p-5">
                    <ReflectionGlow mirror={mirror} />
                    <p className="mt-5 text-[1.05rem] leading-7 text-zinc-100 sm:text-[1.16rem]">
                        {mirror.reflection}
                    </p>
                    <div className="mt-5 rounded-[1.35rem] border border-violet-200/20 bg-violet-200/[0.075] px-4 py-4 text-white shadow-[0_0_34px_rgba(168,85,247,0.10)]">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100/70">
                            Try this next
                        </div>
                        <div className="text-base font-semibold leading-7 sm:text-lg">{mirror.move}</div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-zinc-400 sm:text-[0.95rem]">
                        {mirror.question}
                    </p>
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
        </div>
    );
}

function LoadingPanel() {
    return (
        <div className="rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/[0.055] px-5 py-5 shadow-[0_0_46px_rgba(34,211,238,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={16} className="animate-pulse text-cyan-200" />
                Looking for the next honest move
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

export default function HomePage() {
    const inputRef = useRef(null);
    const [seed] = useState(() => getArchetype());
    const [activeDefault] = useState(() => getActiveMirrorDefault());
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [lastIntent, setLastIntent] = useState('');
    const [sendableDraft, setSendableDraft] = useState(null);
    const [, setLastSourceCheck] = useState(null);
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
                    reflection: 'I cannot reach the mirror right now. Your text was not saved as memory.',
                    question: 'What is the one sentence version of the thing you are stuck on?',
                    move: 'Try again in a moment with the same sentence.',
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
        <div className="relative min-h-dvh overflow-hidden bg-[#050507] text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(126,87,255,0.18),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.08),transparent_34%),#050507]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <MirrorLogo />
                        <div>
                            <div className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</div>
                            <div className="hidden text-xs text-zinc-500 sm:block">one clearer move</div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/enterprise" className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-emerald-300/30 hover:text-white sm:inline-flex">
                            For teams
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-57px)] max-w-3xl flex-col gap-4 px-4 py-5 lg:py-6">
                <section className={`flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_60px_rgba(168,85,247,0.09)] ring-1 ring-white/[0.035] backdrop-blur-2xl ${showMirror ? 'p-3 sm:p-4' : 'p-5 sm:p-7'}`}>
                    {!showMirror ? (
                        <div>
                            <div className="mb-6 grid h-16 w-16 place-items-center rounded-[1.35rem] border border-violet-200/20 bg-white/[0.045] shadow-[0_0_38px_rgba(168,85,247,0.16)]">
                                <MirrorLogo />
                            </div>
                            <h1 className="max-w-2xl text-[3rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.9rem]">
                                What do you want?
                            </h1>
                            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg">
                                Bring one real thing. Active Mirror gives you the next move.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {STARTERS.map((starter) => (
                                    <button
                                        key={starter}
                                        type="button"
                                        onClick={() => setText(starter)}
                                        className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400 transition hover:border-violet-200/30 hover:bg-white/[0.05] hover:text-white"
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className={showMirror ? '' : 'mt-7'}>
                        <form onSubmit={submit} className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                rows={showMirror ? 1 : 2}
                                value={text}
                                maxLength={1000}
                                placeholder="What's one thing?"
                                onChange={(event) => setText(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        submit(event);
                                    }
                                }}
                                className="max-h-36 min-h-[4.5rem] flex-1 resize-none rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-base leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-200/45"
                            />
                            <button
                                type="submit"
                                disabled={busy || text.trim().length < 4}
                                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_24px_rgba(168,85,247,0.24)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                                aria-label="Reflect"
                            >
                                {busy ? <Sparkles size={18} className="animate-pulse" /> : <ArrowUp size={19} />}
                            </button>
                        </form>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Lock size={13} />
                                No memory unless you choose it.
                            </span>
                        </div>
                    </div>
                </section>

                {showMirror ? (
                    <section className="flex flex-col gap-3">
                        <MirrorResult
                            result={result}
                            intent={lastIntent}
                            disabled={busy}
                            onSourceChecked={setLastSourceCheck}
                            onPrompt={(nextIntent) => {
                                trackEvent('followup_clicked', { page: 'home', source: 'surface' });
                                reflect(nextIntent, 'surface');
                            }}
                        />
                        {!busy && result ? <div className="flex flex-wrap gap-2 pb-1 sm:pl-12">
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
                        </div> : null}
                        <SendableDraft draft={sendableDraft} />
                    </section>
                ) : null}
            </main>

            <div className="relative z-10 mx-auto hidden max-w-3xl flex-col gap-3 px-4 pb-6 text-xs text-zinc-500 sm:flex sm:flex-row sm:items-center sm:justify-between">
                <div>Private by default.</div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
                    <Link to="/terms" className="transition hover:text-white">Terms</Link>
                    <Link
                        to="/start"
                        onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'footer_mirrorseed' })}
                        className="inline-flex items-center gap-1 transition hover:text-white"
                    >
                        Personalize
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
