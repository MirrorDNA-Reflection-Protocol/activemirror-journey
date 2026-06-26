import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, Brain, ChevronDown, FileText, Lock, Network, Search, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import ReflectiveSurface from '../components/ReflectiveSurface';
import { getArchetype } from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

const STARTERS = [
    {
        label: 'Get my next move',
        text: 'When you only know you are stuck.',
        icon: ArrowRight,
        intent: 'I have one thing in front of me. Reflect it and give me one useful next move.',
    },
    {
        label: 'Turn notes into sendable',
        text: 'Shape rough thoughts into an artifact.',
        icon: FileText,
        intent: 'I have messy notes and need to turn them into something I can send.',
    },
    {
        label: 'Check my thinking',
        text: 'Challenge the loop, not your confidence.',
        icon: ShieldCheck,
        intent: 'Challenge my thinking without being agreeable. What am I missing?',
    },
    {
        label: 'Research this',
        text: 'Make the question source-checkable.',
        icon: Search,
        intent: 'I need to research this carefully. Define the question, source route, and next check.',
    },
];

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
            label: 'Help me answer this',
            intent: `Help me answer this real question: ${mirror.question}`,
        },
        {
            label: 'Make it smaller',
            intent: `Make this next move smaller and easier to start: ${mirror.move || 'the next move'}`,
        },
        {
            label: 'Show the ecosystem',
            intent: 'Show me the Active Mirror ecosystem.',
        },
    ].filter(Boolean);
}

function formatBytes(bytes = 0) {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function summarizeFiles(files) {
    return files
        .map((file) => `"${file.name}" (${file.type || 'unknown type'}, ${formatBytes(file.size)})`)
        .join('; ');
}

function makeFileIntent(files) {
    const summary = summarizeFiles(files);
    return `I have local file context to work with: ${summary}. Do not assume the contents. Help me decide what to inspect, what to extract, what to leave private, and the next action to take.`;
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

function MirrorResult({ result, intent, onPrompt, disabled }) {
    const isLoading = Boolean(disabled && intent && !result);
    const mirror = result?.mirror || (isLoading ? LOADING_MIRROR : SAMPLE_MIRROR);

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
                    {isLoading ? (
                        <LoadingPanel />
                    ) : result?.kind === 'ecosystem' ? (
                        <EcosystemPanel />
                    ) : (
                        <>
                            <Visual visual={mirror.visual} />
                            <ReflectiveSurface result={result || { mirror }} intent={intent} onPrompt={onPrompt} disabled={disabled} />
                        </>
                    )}
                    <details className="group rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                        <summary className="cursor-pointer list-none font-medium">
                            What stayed private
                            <ChevronDown className="float-right mt-0.5 h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
                        </summary>
                        <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
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

export default function HomePage() {
    const [seed] = useState(() => getArchetype());
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [lastIntent, setLastIntent] = useState('');
    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const followUps = useMemo(() => makeFollowUps(result?.mirror || SAMPLE_MIRROR), [result]);

    useEffect(() => {
        trackEvent('home_view', { page: 'home', surface: 'homepage' });
    }, []);

    async function reflect(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 4 || busy) return;

        setText('');
        setLastIntent(cleanIntent);
        trackEvent('mirror_submit', { page: 'home', source, route: 'reflection', status: 'started' });

        if (isEcosystemAsk(cleanIntent)) {
            setResult(makeEcosystemResult(cleanIntent));
            trackEvent('ecosystem_result', { page: 'home', source, status: 'local' });
            return;
        }

        setBusy(true);
        try {
            const seededIntent = seed
                ? `MirrorSeed: ${seed.archetypeName || seed.archetype}. Strengths: ${(seed.strengths || []).join(', ') || 'unknown'}. User intent: ${cleanIntent}`
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

    function addFiles(fileList) {
        const nextFiles = Array.from(fileList || []).slice(0, 3);
        if (!nextFiles.length) return;

        setFiles(nextFiles);
        trackEvent('file_added', {
            page: 'home',
            count: nextFiles.length,
            totalBytes: nextFiles.reduce((total, file) => total + file.size, 0),
            types: nextFiles.map((file) => file.type || 'unknown').slice(0, 3).join(','),
        });
    }

    function reflectOnFiles() {
        if (!files.length || busy) return;
        reflect(makeFileIntent(files), 'file_drop');
    }

    return (
        <div className="relative min-h-dvh overflow-hidden bg-black text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.13),transparent_32%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
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
                        <Link to="/device" className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-cyan-300/30 hover:text-white sm:inline-flex">
                            This device
                        </Link>
                        <Link to="/mirror" className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12]">
                            Full mirror
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-57px)] max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)] lg:items-stretch lg:px-6 lg:py-6">
                <section className="flex min-h-[36rem] flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_60px_rgba(168,85,247,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-7">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                            <ShieldCheck size={14} />
                            Private first
                        </div>
                        <h1 className="max-w-[11ch] text-[3rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[4.4rem]">
                            Stop circling.
                            <span className="block bg-gradient-to-r from-purple-200 via-white to-cyan-200 bg-clip-text text-transparent">
                                Make one move.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
                            Bring one thing you are stuck on. Active Mirror reflects the real question, gives you one next move, and shows what stayed private.
                        </p>

                        <div className="mt-7 grid gap-2 sm:grid-cols-2">
                            {STARTERS.map((starter) => (
                                <button
                                    key={starter.label}
                                    type="button"
                                    onClick={() => {
                                        trackEvent('starter_clicked', { page: 'home', source: 'starter', label: starter.label });
                                        reflect(starter.intent, 'starter');
                                    }}
                                    disabled={busy}
                                    className="group flex min-h-[5.5rem] items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left transition hover:border-purple-300/30 hover:bg-purple-300/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-100 transition group-hover:border-cyan-200/25">
                                        <starter.icon size={17} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-zinc-100">{starter.label}</span>
                                        <span className="mt-1 block text-xs leading-5 text-zinc-500">{starter.text}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-7">
                        <div
                            onDrop={(event) => {
                                event.preventDefault();
                                setDragging(false);
                                addFiles(event.dataTransfer.files);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={(event) => {
                                if (event.currentTarget.contains(event.relatedTarget)) return;
                                setDragging(false);
                            }}
                            className={`mb-3 rounded-3xl border border-dashed px-4 py-3 transition ${
                                dragging
                                    ? 'border-cyan-200/60 bg-cyan-300/[0.08]'
                                    : 'border-white/10 bg-black/20 hover:border-cyan-200/30 hover:bg-cyan-300/[0.045]'
                            }`}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex min-w-0 cursor-pointer items-center gap-3">
                                    <input
                                        type="file"
                                        multiple
                                        className="sr-only"
                                        onChange={(event) => addFiles(event.target.files)}
                                    />
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                                        <UploadCloud size={18} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-zinc-100">
                                            {files.length ? `${files.length} file${files.length > 1 ? 's' : ''} ready` : 'Drop a file here'}
                                        </span>
                                        <span className="block truncate text-xs leading-5 text-zinc-500">
                                            {files.length ? summarizeFiles(files) : 'PDF, notes, screenshot, sheet, or deck. Contents stay local.'}
                                        </span>
                                        {files.length ? (
                                            <span className="block text-xs leading-5 text-zinc-500">
                                                Contents stay local.
                                            </span>
                                        ) : null}
                                    </span>
                                </label>
                                <div className="flex shrink-0 items-center gap-2">
                                    {files.length ? (
                                        <button
                                            type="button"
                                            onClick={() => setFiles([])}
                                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
                                        >
                                            Clear
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={reflectOnFiles}
                                        disabled={busy || !files.length}
                                        className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Reflect on file
                                    </button>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="flex items-end gap-2">
                            <textarea
                                rows={2}
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
                        </div>
                    </div>
                </section>

                <section className="flex min-h-[36rem] flex-col gap-3 lg:min-h-0">
                    {lastIntent ? (
                        <div className="rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-zinc-400">
                            You asked: <span className="text-zinc-200">{lastIntent}</span>
                        </div>
                    ) : null}
                    <MirrorResult
                        result={result}
                        intent={lastIntent}
                        disabled={busy}
                        onPrompt={(nextIntent) => {
                            trackEvent('followup_clicked', { page: 'home', source: 'surface' });
                            reflect(nextIntent, 'surface');
                        }}
                    />
                    <div className="flex flex-wrap gap-2 pb-1">
                        {followUps.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => {
                                    trackEvent('followup_clicked', { page: 'home', source: 'follow_up' });
                                    reflect(item.intent, 'follow_up');
                                }}
                                disabled={busy}
                                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {result ? (
                        <div className="rounded-3xl border border-white/10 bg-black/25 px-4 py-3">
                            <div className="text-sm font-semibold text-white">Want it to fit you better?</div>
                            <div className="mt-1 text-xs leading-5 text-zinc-500">
                                Build a local MirrorSeed, or keep using the full mirror.
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                    to="/start"
                                    onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'mirrorseed' })}
                                    className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-cyan-100"
                                >
                                    Build MirrorSeed
                                </Link>
                                <Link
                                    to="/mirror"
                                    onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'full_mirror' })}
                                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-purple-300/30 hover:text-white"
                                >
                                    Open full mirror
                                </Link>
                            </div>
                        </div>
                    ) : null}
                </section>
            </main>

            <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
                <div>Reflection first. Ecosystem when useful.</div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
                    <Link to="/terms" className="transition hover:text-white">Terms</Link>
                    <Link to="/device" className="transition hover:text-white">This device</Link>
                    <Link
                        to="/start"
                        onClick={() => trackEvent('cta_clicked', { page: 'home', target: 'footer_mirrorseed' })}
                        className="inline-flex items-center gap-1 transition hover:text-white"
                    >
                        Build your MirrorSeed
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
