import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Download, RotateCcw } from 'lucide-react';
import MirrorSig from '../components/MirrorSig';
import { evaluateFallbackAnswers, FALLBACK_ARCHETYPES, FALLBACK_QUESTIONS } from '../lib/brainFallback';
import { saveBrainScan } from '../lib/mirror-state';

const QUESTIONS = FALLBACK_QUESTIONS.slice(0, 6);

const STARTS = [
    {
        id: 'decision',
        label: 'I need a decision',
        prompt: 'Help me see the real question and the next move.',
    },
    {
        id: 'stuck',
        label: 'I feel stuck',
        prompt: 'Help me name what I am avoiding without making it dramatic.',
    },
    {
        id: 'work',
        label: 'I have messy work',
        prompt: 'Help me turn scattered context into one useful next step.',
    },
];

function makeMirrorId(archetype, answers) {
    const raw = `${archetype}:${answers.map((item) => item.answer_index).join('')}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `mirror-${Math.abs(hash).toString(36)}`;
}

function downloadProfile(result) {
    if (!result || typeof window === 'undefined') return;

    const profile = {
        product: 'Active Mirror',
        type: 'local-profile',
        createdAt: new Date().toISOString(),
        name: result.archetype_name,
        description: result.description,
        strengths: result.strengths || [],
        mirrorId: result.mirrorId,
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'active-mirror-profile.json';
    link.click();
    URL.revokeObjectURL(url);
}

export default function Start() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('choose');
    const [start, setStart] = useState(STARTS[0]);
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);

    const progress = useMemo(() => Math.round((answers.length / QUESTIONS.length) * 100), [answers.length]);

    function chooseStart(item) {
        setStart(item);
        setPhase('scan');
    }

    function chooseAnswer(answerIndex) {
        const nextAnswers = [
            ...answers,
            {
                question_id: QUESTIONS[index].id,
                answer_index: answerIndex,
            },
        ];

        if (index < QUESTIONS.length - 1) {
            setAnswers(nextAnswers);
            setIndex((current) => current + 1);
            return;
        }

        const evaluated = evaluateFallbackAnswers(nextAnswers);
        const archetype = FALLBACK_ARCHETYPES[evaluated.archetype];
        const mirrorId = makeMirrorId(evaluated.archetype, nextAnswers);
        const saved = saveBrainScan({
            archetype: evaluated.archetype,
            archetypeName: evaluated.archetype_name,
            strengths: evaluated.strengths,
            blindSpots: archetype?.blindSpots || [],
            mirrorId,
            brainId: evaluated.brain_id,
        });

        const seed = {
            ...evaluated,
            mirrorId,
            startMode: start.id,
            startPrompt: start.prompt,
            savedAt: saved.brainScanCompletedAt,
        };
        localStorage.setItem('mirrorSeed_v1', JSON.stringify(seed));
        setAnswers(nextAnswers);
        setResult(seed);
        setPhase('seed');
    }

    function reset() {
        setPhase('choose');
        setStart(STARTS[0]);
        setIndex(0);
        setAnswers([]);
        setResult(null);
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-black text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.18),transparent_42%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />

            <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
                <Link to="/" className="text-sm font-semibold text-zinc-300 transition hover:text-white">
                    Active Mirror
                </Link>
                <div className="flex items-center gap-3 text-xs">
                    <Link to="/privacy" className="hidden text-zinc-500 transition hover:text-white sm:inline">Privacy</Link>
                    <Link to="/terms" className="hidden text-zinc-500 transition hover:text-white sm:inline">Terms</Link>
                    <Link to="/mirror" className="rounded-full border border-white/10 px-4 py-2 font-semibold text-zinc-300 transition hover:border-purple-400/40 hover:text-white">
                        Open chat
                    </Link>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-78px)] w-full max-w-5xl items-center px-4 pb-10">
                {phase === 'choose' && (
                    <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div>
                            <h1 className="max-w-xl text-5xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                                Make Active Mirror yours.
                            </h1>
                            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200/80">
                                Quick setup
                            </div>
                            <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-400">
                                A better AI session starts when the AI knows how to work with you. Six quick choices, saved on this browser.
                            </p>
                        </div>

                        <div className="rounded-[2rem] border border-purple-500/20 bg-zinc-950/70 p-4 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-2xl sm:p-6">
                            <div className="mb-4 text-sm font-semibold text-zinc-300">What do you want help with first?</div>
                            <div className="grid gap-3">
                                {STARTS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => chooseStart(item)}
                                        className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-400/40 hover:bg-purple-500/10"
                                    >
                                        <span>
                                            <span className="block text-lg font-semibold">{item.label}</span>
                                            <span className="mt-1 block text-sm leading-6 text-zinc-500">{item.prompt}</span>
                                        </span>
                                        <ArrowRight className="shrink-0 text-purple-300 transition group-hover:translate-x-1" size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {phase === 'scan' && (
                    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-purple-500/20 bg-zinc-950/75 p-5 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-2xl sm:p-8">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <div className="mt-2 text-sm text-zinc-500">Question {index + 1} of {QUESTIONS.length}</div>
                            </div>
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
                            {QUESTIONS[index].question}
                        </h2>

                        <div className="mt-7 grid gap-3">
                            {QUESTIONS[index].options.map((option, optionIndex) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => chooseAnswer(optionIndex)}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-base leading-6 text-zinc-200 transition hover:border-purple-400/40 hover:bg-purple-500/10"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {phase === 'seed' && result && (
                    <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div className="rounded-[2rem] border border-purple-500/20 bg-zinc-950/75 p-6 text-center shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-2xl">
                            <div className="flex justify-center">
                                <MirrorSig archetype={result.archetype} seed={result.mirrorId} size={220} />
                            </div>
                            <div className="mt-4 text-sm font-semibold text-zinc-300">Saved in this browser</div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                <Check size={14} />
                                Local only
                            </div>
                            <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                                Active Mirror is ready for you.
                            </h1>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">
                                It will start with your style: {result.description}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {result.strengths.map((strength) => (
                                    <span key={strength} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-zinc-300">
                                        {strength}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => navigate('/mirror', { state: { startPrompt: start.prompt } })}
                                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.34)] transition hover:scale-[1.01]"
                                >
                                    Try it now
                                    <ArrowRight size={19} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadProfile(result)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-4 text-base font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                                >
                                    <Download size={17} />
                                    Download my profile
                                </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-4 text-base font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                                >
                                    <RotateCcw size={17} />
                                    Start over
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
