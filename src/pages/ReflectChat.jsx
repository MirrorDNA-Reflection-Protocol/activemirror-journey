import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, BookmarkPlus, Check, ChevronDown, ShieldCheck } from 'lucide-react';
import ReflectiveSurface from '../components/ReflectiveSurface';
import MirrorFeedback from '../components/MirrorFeedback';
import ReflectionCardActions from '../components/ReflectionCardActions';
import { NeedsSources, SourceCheckLine } from '../components/TruthStateNotice';
import { getArchetype, saveMirrorDefault } from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

const STARTERS = [
    'I keep asking AI for help, but I still do not know what to do next.',
    'I have a messy idea and need the real question underneath it.',
    'I am stuck between two choices and keep going in circles.',
];

function makeFollowUps(mirror = {}) {
    return [
        mirror.question && {
            label: 'Help me answer this question',
            intent: `Help me answer this real question: ${mirror.question}`,
        },
        {
            label: 'What am I not admitting?',
            intent: 'Reflect what I may not be admitting to myself yet.',
        },
        mirror.move && {
            label: 'Make the next move smaller',
            intent: `Make this next move smaller and easier to start: ${mirror.move}`,
        },
    ].filter(Boolean);
}

function mirrorErrorMessage(error) {
    if (error === 'rate_limited') {
        return 'The mirror is cooling down for a moment. Nothing was saved. Try the same thought again shortly.';
    }
    if (error === 'boundary_violation') {
        return 'I held that one back because it looked like it carried a secret. Nothing was sent.';
    }
    return 'I could not complete that turn. Try again in a moment.';
}

function Visual({ visual }) {
    if (!visual) return null;

    if (visual.kind === 'reframe') {
        return (
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Reframe</div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="text-sm text-zinc-500 line-through decoration-zinc-600">{visual.left}</div>
                    <div className="text-cyan-200">→</div>
                    <div className="text-sm font-semibold text-white">{visual.right}</div>
                </div>
            </div>
        );
    }

    if (visual.kind === 'axes') {
        return (
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    {visual.note || 'Two forces in tension'}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4 text-sm font-semibold">
                    <div className="text-right text-white">{visual.left}</div>
                    <div className="w-px bg-white/15" />
                    <div className="text-cyan-200">{visual.right}</div>
                </div>
            </div>
        );
    }

    if (visual.kind === 'spectrum') {
        return (
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    {visual.note || 'A range, not a binary'}
                </div>
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-purple-300 to-cyan-200" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span>{visual.left}</span>
                    <span className="text-right text-cyan-200">{visual.right}</span>
                </div>
            </div>
        );
    }

    return null;
}

function memoryKey(mirror = {}) {
    return `${mirror.question || ''}::${mirror.move || ''}`;
}

function MirrorTurn({ data, intent, onPrompt, disabled, onSaveDefault, saved, turn }) {
    const mirror = data.mirror || {};
    const keptOut = mirror.receipt?.context_excluded || 'private context kept out';
    const truthState = data.truth_state || mirror.truth_state;

    return (
        <div className="flex flex-col gap-3">
            <div className="max-w-[46rem] rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-[1.05rem] leading-7 tracking-[-0.01em] text-zinc-100 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                {mirror.reflection}
            </div>
            {mirror.question && (
                <div className="max-w-[46rem] rounded-[1.5rem] border border-purple-300/20 bg-purple-300/[0.08] px-5 py-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/75">The real question</div>
                    <div className="text-base font-semibold leading-6 tracking-[-0.01em] text-white">{mirror.question}</div>
                </div>
            )}
            <div className="flex max-w-[46rem] gap-3 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.08] px-5 py-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/75">One thing</div>
                    <div className="mt-1 text-sm leading-6 text-zinc-100">{mirror.move}</div>
                </div>
            </div>
            <NeedsSources truthState={truthState} />
            <Visual visual={mirror.visual} />
            <ReflectiveSurface result={data} intent={intent} onPrompt={onPrompt} disabled={disabled} />
            <MirrorFeedback page="mirror" surface="chat_turn" turn={turn} />
            <ReflectionCardActions mirror={mirror} surface="mirror" />
            <div className="max-w-[46rem] rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-zinc-200">Remember this only if it helps.</div>
                        <div className="mt-1 text-xs leading-5 text-zinc-500">Save the question and next move as your starting point. Nothing else is stored.</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onSaveDefault?.(mirror)}
                        disabled={disabled || saved}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-2 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12] disabled:cursor-not-allowed disabled:border-emerald-300/20 disabled:bg-emerald-300/[0.08] disabled:text-emerald-100"
                    >
                        {saved ? <Check size={14} /> : <BookmarkPlus size={14} />}
                        {saved ? 'Remembered' : 'Remember this'}
                    </button>
                </div>
            </div>
            <details className="group max-w-[46rem] rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-zinc-400">
                <summary className="cursor-pointer list-none font-medium text-zinc-400">
                    Private by default · what stayed out
                    <ChevronDown className="float-right mt-0.5 h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
                    <SourceCheckLine truthState={truthState} />
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Used</div>
                        <div className="mt-1 leading-6">{mirror.receipt?.context_used || 'Only the sentence you typed.'}</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Left out</div>
                        <div className="mt-1 leading-6">{keptOut}</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Memory</div>
                        <div className="mt-1 leading-6">{mirror.receipt?.memory_decision || 'Nothing is saved unless you choose it.'}</div>
                    </div>
                </div>
            </details>
        </div>
    );
}

export default function ReflectChat() {
    const location = useLocation();
    const startPrompt = typeof location.state?.startPrompt === 'string' ? location.state.startPrompt : '';
    const [seed] = useState(() => getArchetype());
    const [turns, setTurns] = useState([{ who: 'mirror', intro: true }]);
    const [text, setText] = useState(startPrompt);
    const [busy, setBusy] = useState(false);
    const [savedDefaults, setSavedDefaults] = useState({});
    const turnNum = useRef(0);
    const mainRef = useRef(null);
    const latestTurnRef = useRef(null);
    const latestMirror = [...turns].reverse().find((turn) => turn.data?.mirror)?.data?.mirror;
    const latestFollowUps = latestMirror ? makeFollowUps(latestMirror) : [];

    useEffect(() => {
        trackEvent('mirror_view', { page: 'mirror', surface: 'chat' });
    }, []);

    useEffect(() => {
        const main = mainRef.current;
        if (!main) return;

        if (busy) {
            requestAnimationFrame(() => {
                main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
            });
            return;
        }

        const target = latestTurnRef.current;
        if (!target) return;

        requestAnimationFrame(() => {
            const mainBox = main.getBoundingClientRect();
            const targetBox = target.getBoundingClientRect();
            const top = main.scrollTop + targetBox.top - mainBox.top - 20;
            main.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
    }, [turns, busy]);

    async function ask(intent, source = 'typed') {
        setTurns((current) => [...current, { who: 'you', text: intent }]);
        setBusy(true);
        trackEvent('mirror_submit', { page: 'mirror', source, route: 'reflection', status: 'started' });

        try {
            turnNum.current += 1;
            const seededIntent = seed
                ? `MirrorSeed: ${seed.archetypeName || seed.archetype}. Strengths: ${(seed.strengths || []).join(', ') || 'unknown'}. User intent: ${intent}`
                : intent;
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
                    turn: turnNum.current,
                }),
            });
            const data = await response.json();
            trackEvent('mirror_result', {
                page: 'mirror',
                source,
                route: data.route?.capability || 'reflection',
                status: data.ok ? 'ok' : 'blocked',
                fallback: Boolean(data.fallback),
                visualKind: data.mirror?.visual?.kind || 'none',
                turn: turnNum.current,
            });

            setTurns((current) => [
                ...current,
                data.ok
                    ? { who: 'mirror', data, intent }
                    : { who: 'mirror', error: mirrorErrorMessage(data.error) },
            ]);
        } catch {
            trackEvent('gateway_error', { page: 'mirror', source, route: 'reflection', status: 'network', turn: turnNum.current });
            setTurns((current) => [
                ...current,
                { who: 'mirror', error: "Couldn't reach the mirror just now. Try again in a moment." },
            ]);
        } finally {
            setBusy(false);
        }
    }

    function useStarter(intent, source = 'starter') {
        if (busy) return;
        trackEvent(source === 'follow_up' ? 'followup_clicked' : 'starter_clicked', { page: 'mirror', source });
        ask(intent, source);
    }

    function rememberMirror(mirror = {}) {
        saveMirrorDefault({
            question: mirror.question,
            move: mirror.move,
            source: 'mirror',
        });
        setSavedDefaults((current) => ({ ...current, [memoryKey(mirror)]: true }));
        trackEvent('mirror_default_saved', { page: 'mirror', source: 'explicit_approval' });
    }

    function submit(event) {
        event.preventDefault();
        const intent = text.trim();
        if (intent.length < 12 || busy) return;
        setText('');
        ask(intent, 'typed');
    }

    return (
        <div className="relative flex h-dvh flex-col overflow-hidden bg-black text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.20),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),transparent_36%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

            <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
                <Link to="/" className="inline-flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                        <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
                        <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
                    </svg>
                    <div>
                        <div className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</div>
                        <div className="hidden text-xs text-zinc-500 sm:block">one thing in, one move out</div>
                    </div>
                </Link>
                <Link to="/start" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-purple-300/30 hover:text-white">
                    BrainScan
                </Link>
            </header>

            <main ref={mainRef} className="relative z-10 min-h-0 flex-1 overflow-auto">
                <div className="mx-auto flex max-w-[48rem] flex-col gap-7 px-4 pt-7 pb-44 sm:pb-36">
                    {turns.map((turn, index) => {
                        const isLatest = index === turns.length - 1;

                        if (turn.who === 'you') {
                            return (
                                <div key={index} ref={isLatest ? latestTurnRef : null} className="flex scroll-mt-6 justify-end">
                                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white">
                                        {turn.text}
                                    </div>
                                </div>
                            );
                        }

                        if (turn.intro) {
                            return (
                                <div key={index} ref={isLatest ? latestTurnRef : null} className="max-w-[44rem] scroll-mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 text-[1.08rem] leading-7 tracking-[-0.01em] shadow-[0_0_50px_rgba(168,85,247,0.10)] backdrop-blur-2xl sm:p-6">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1 text-xs font-semibold text-emerald-200">
                                        <ShieldCheck size={14} />
                                        Private first
                                    </div>
                                    <div className="text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">
                                        Bring one real thing you are stuck on.
                                    </div>
                                    <div className="mt-3 text-base leading-7 text-zinc-400">
                                        Active Mirror reflects the real question, makes one useful output, and lets you decide what gets remembered.
                                    </div>
                                    {seed && (
                                        <div className="mt-4 inline-flex rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1 text-xs font-semibold text-purple-200">
                                            Using your local seed: {seed.archetypeName || seed.archetype}
                                        </div>
                                    )}
                                    <div className="mt-6 grid gap-2">
                                        {STARTERS.map((starter) => (
                                            <button
                                                key={starter}
                                                type="button"
                                                onClick={() => useStarter(starter, 'starter')}
                                                disabled={busy}
                                                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm leading-6 text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {starter}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        if (turn.error) {
                            return <div key={index} ref={isLatest ? latestTurnRef : null} className="max-w-[44rem] scroll-mt-6 rounded-[1.5rem] border border-red-300/15 bg-red-300/[0.08] px-5 py-4 text-[1.05rem] leading-7 text-red-100">{turn.error}</div>;
                        }

                        return (
                            <div key={index} ref={isLatest ? latestTurnRef : null} className="scroll-mt-6">
                                <MirrorTurn
                                    data={turn.data}
                                    intent={turn.intent || ''}
                                    disabled={busy}
                                    onPrompt={(nextIntent) => useStarter(nextIntent, 'surface')}
                                    onSaveDefault={rememberMirror}
                                    saved={Boolean(savedDefaults[memoryKey(turn.data?.mirror)])}
                                    turn={index}
                                />
                            </div>
                        );
                    })}
                    {busy && <div className="text-zinc-500">reflecting...</div>}
                </div>
            </main>

            <footer className="relative z-10 border-t border-white/10 bg-black/70 px-3 py-3 backdrop-blur-xl">
                {latestFollowUps.length > 0 && (
                    <div className="mx-auto mb-3 flex max-w-[48rem] flex-wrap gap-2 pb-1">
                        {latestFollowUps.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => useStarter(item.intent, 'follow_up')}
                                disabled={busy}
                                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
                {!seed && latestMirror && (
                    <div className="mx-auto mb-3 flex max-w-[48rem] flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-zinc-500">
                        <span>Want the mirror to adapt to you?</span>
                        <Link
                            to="/start"
                            onClick={() => trackEvent('cta_clicked', { page: 'mirror', target: 'brainscan' })}
                            className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 font-semibold text-purple-100 transition hover:border-purple-300/40 hover:text-white"
                        >
                            Take BrainScan
                        </Link>
                    </div>
                )}
                <form className="mx-auto flex max-w-[48rem] items-end gap-2" onSubmit={submit}>
                    <textarea
                        rows={1}
                        value={text}
                        maxLength={1000}
                        placeholder="What's one thing you're stuck on?"
                        onChange={(event) => setText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                submit(event);
                            }
                        }}
                        className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-purple-300/45"
                    />
                    <button
                        type="submit"
                        disabled={busy || text.trim().length < 12}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-[0_0_24px_rgba(168,85,247,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                        aria-label="Send"
                    >
                        <ArrowUp size={19} />
                    </button>
                </form>
                <div className="mx-auto mt-2 max-w-[48rem] text-center text-xs text-zinc-500">One sentence is enough. Nothing is saved.</div>
            </footer>
        </div>
    );
}
