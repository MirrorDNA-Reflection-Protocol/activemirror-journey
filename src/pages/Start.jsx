import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Download, RotateCcw, Sparkles } from 'lucide-react';
import MirrorSig from '../components/MirrorSig';
import { FALLBACK_ARCHETYPES } from '../lib/brainFallback';
import { saveBrainScan, saveBlueprint } from '../lib/mirror-state';

const SCAN_QUESTIONS = [
    {
        id: 'q1',
        question: 'What do you want help with first?',
        options: [
            { label: 'Getting unstuck', archetype: 'builder', preference: 'help_with' },
            { label: 'Making a decision', archetype: 'strategist', preference: 'help_with' },
            { label: 'Making something useful', archetype: 'connector', preference: 'help_with' },
            { label: 'Getting a clearer take', archetype: 'analyst', preference: 'help_with' },
        ],
    },
    {
        id: 'q2',
        question: 'How should replies feel?',
        options: [
            { label: 'Gently', archetype: 'connector', preference: 'pushback' },
            { label: 'Directly', archetype: 'analyst', preference: 'pushback' },
            { label: 'Briefly', archetype: 'builder', preference: 'pushback' },
            { label: 'Careful with facts', archetype: 'scholar', preference: 'pushback' },
        ],
    },
    {
        id: 'q3',
        question: 'What should it avoid?',
        options: [
            { label: 'Long answers', archetype: 'builder', preference: 'never_assume' },
            { label: 'Guessing what I mean', archetype: 'strategist', preference: 'never_assume' },
            { label: 'Asking for private details', archetype: 'scholar', preference: 'never_assume' },
            { label: 'Agreeing too quickly', archetype: 'analyst', preference: 'never_assume' },
        ],
    },
    {
        id: 'q4',
        question: 'What helps most?',
        options: [
            { label: 'One clear next step', archetype: 'builder', preference: 'answer_style' },
            { label: 'A better question', archetype: 'strategist', preference: 'answer_style' },
            { label: 'Something I can copy', archetype: 'connector', preference: 'answer_style' },
            { label: 'A simple plan', archetype: 'architect', preference: 'answer_style' },
        ],
    },
];

function MirrorLogo() {
    return (
        <span className="grid h-9 w-9 place-items-center rounded-[1rem] border border-violet-200/20 bg-white/[0.045] text-cyan-100 shadow-[0_0_34px_rgba(168,85,247,0.15)]">
            <Sparkles size={16} />
        </span>
    );
}

function makeMirrorId(archetype, answers) {
    const raw = `${archetype}:${answers.map((item) => item.answerIndex).join('')}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `mirror-${Math.abs(hash).toString(36)}`;
}

function selectedPreferences(answers) {
    return answers.map((answer) => {
        const question = SCAN_QUESTIONS[answer.questionIndex];
        const option = question?.options?.[answer.answerIndex];
        if (!question || !option) return null;
        return {
            id: question.id,
            preference: option.preference || question.id,
            question: question.question,
            answer: option.label,
        };
    }).filter(Boolean);
}

function preferenceLabel(preference) {
    if (preference === 'help_with') return 'Help with';
    if (preference === 'pushback') return 'Directness';
    if (preference === 'never_assume') return 'Avoid assuming';
    if (preference === 'answer_style') return 'Give me';
    return 'Choice';
}

function makeStartPrompt(preferences = []) {
    const helpWith = preferences.find((item) => item.preference === 'help_with')?.answer || 'something useful';
    const pushback = preferences.find((item) => item.preference === 'pushback')?.answer || 'when needed';
    const avoidAssuming = preferences.find((item) => item.preference === 'never_assume')?.answer || 'what I have not said';
    const answerStyle = preferences.find((item) => item.preference === 'answer_style')?.answer || 'one clear next step';

    return [
        `I set up my Active Mirror. I usually need help with: ${helpWith}.`,
        `Directness: ${pushback}.`,
        `Avoid assuming: ${avoidAssuming}.`,
        `Give me: ${answerStyle}.`,
        'Start by asking what I want to work on.',
    ].join(' ');
}

function makeMirrorSeed({ mirrorId, setupId, archetype, archetypeName, preferences, startPrompt, createdAt = null }) {
    return {
        schema: 'active-mirror-id/v1',
        id: mirrorId,
        setupId,
        brainId: setupId,
        createdBy: 'Active Mirror',
        createdAt,
        entry: null,
        preferences,
        styleHint: {
            archetype,
            label: archetypeName,
        },
        firstReflection: startPrompt,
        storage: { default: 'browser', portable: true },
    };
}

function evaluateScan(answers) {
    const tally = Object.keys(FALLBACK_ARCHETYPES).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

    answers.forEach((answer) => {
        const option = SCAN_QUESTIONS[answer.questionIndex]?.options?.[answer.answerIndex];
        if (option?.archetype && tally[option.archetype] !== undefined) {
            tally[option.archetype] += 1;
        }
    });

    const archetype = Object.entries(tally).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
    })[0]?.[0] || 'builder';

    const meta = FALLBACK_ARCHETYPES[archetype] || FALLBACK_ARCHETYPES.builder;
    const preferences = selectedPreferences(answers);
    const avoid = preferences.map((item) => item.answer).filter(Boolean);
    const mirrorId = makeMirrorId(archetype, answers);
    const setupId = `setup-${Date.now().toString(36)}`;
    const startPrompt = makeStartPrompt(preferences);
    const mirrorSeed = makeMirrorSeed({
        mirrorId,
        setupId,
        archetype,
        archetypeName: meta.name,
        preferences,
        startPrompt,
    });

    return {
        archetype,
        archetypeName: meta.name,
        description: meta.description,
        strengths: meta.strengths,
        mirrorId,
        brainId: setupId,
        setupId,
        entry: null,
        answers,
        avoid,
        preferences,
        mirrorSeed,
        startPrompt,
        savedAt: null,
    };
}

function downloadSettings(result) {
    if (!result || typeof window === 'undefined') return;

    const settings = {
        product: 'Active Mirror',
        type: 'active-mirror-id',
        ...result.mirrorSeed,
        createdAt: result.savedAt || new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'active-mirror-id.json';
    link.click();
    URL.revokeObjectURL(url);
}

export default function Start() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('scan');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);

    const activeQuestion = SCAN_QUESTIONS[questionIndex];
    const progress = useMemo(() => Math.round((answers.length / SCAN_QUESTIONS.length) * 100), [answers.length]);
    const currentStep = questionIndex + 1;

    function chooseAnswer(answerIndex) {
        const nextAnswers = [...answers, { questionIndex, answerIndex }];
        if (questionIndex < SCAN_QUESTIONS.length - 1) {
            setAnswers(nextAnswers);
            setQuestionIndex((current) => current + 1);
            return;
        }

        const nextResult = evaluateScan(nextAnswers);
        const createdAt = new Date().toISOString();
        const mirrorSeed = {
            ...nextResult.mirrorSeed,
            createdAt,
        };
        const savedState = saveBrainScan({
            archetype: nextResult.archetype,
            archetypeName: nextResult.archetypeName,
            strengths: nextResult.strengths,
            blindSpots: nextResult.preferences.map((item) => item.answer).filter(Boolean).slice(0, 4),
            mirrorId: nextResult.mirrorId,
            brainId: nextResult.brainId,
            preferences: nextResult.preferences,
            mirrorSeed,
        });

        saveBlueprint({
            kind: 'active-mirror-id',
            preferences: nextResult.preferences,
            mirrorSeed,
            startPrompt: nextResult.startPrompt,
            completedAt: savedState.brainScanCompletedAt,
        });

        setAnswers(nextAnswers);
        setResult({
            ...nextResult,
            mirrorSeed,
            savedAt: savedState.brainScanCompletedAt,
        });
        setPhase('result');
    }

    function startChat() {
        if (!result) return;
        navigate('/', { state: { mirrorReady: true } });
    }

    function reset() {
        setPhase('scan');
        setQuestionIndex(0);
        setAnswers([]);
        setResult(null);
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-[#030303] text-white selection:bg-emerald-300/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_95%_82%,rgba(168,85,247,0.12),transparent_30%),#030303]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />

            <header className="relative z-10 px-4 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <MirrorLogo />
                        <span className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-3 text-xs">
                        <Link to="/privacy" className="hidden text-zinc-500 transition hover:text-white sm:inline">Privacy</Link>
                        <Link to="/terms" className="hidden text-zinc-500 transition hover:text-white sm:inline">Terms</Link>
                        <Link to="/" className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 font-semibold text-zinc-300 transition hover:border-emerald-200/35 hover:text-white">
                            Chat
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-5xl items-center px-4 py-6 sm:py-10">
                {phase === 'scan' ? (
                    <section className="mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-[0.78fr_1fr] lg:items-center">
                        <div className="px-1 text-center lg:text-left">
                            <h1 className="mx-auto max-w-lg text-[3.2rem] font-semibold leading-[0.96] tracking-normal text-white sm:text-[4.8rem] lg:mx-0">
                                Make it yours.
                            </h1>
                            <p className="mt-4 text-base font-medium text-zinc-400 sm:text-lg">
                                Four taps. No account.
                            </p>
                            <div className="mt-7 flex justify-center gap-2 lg:justify-start" aria-label={`Step ${currentStep} of ${SCAN_QUESTIONS.length}`}>
                                {SCAN_QUESTIONS.map((question, index) => {
                                    const done = index < answers.length;
                                    const active = index === questionIndex;
                                    return (
                                        <span
                                            key={question.id}
                                            className={`h-2.5 rounded-full transition-all ${active ? 'w-9 bg-emerald-200 shadow-[0_0_18px_rgba(110,231,183,0.34)]' : done ? 'w-2.5 bg-cyan-200/80' : 'w-2.5 bg-white/14'}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/10 bg-[#101012]/78 p-5 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7">
                            <div className="mb-5 flex items-center justify-between gap-3 text-xs font-semibold text-zinc-500">
                                <span>{currentStep}/{SCAN_QUESTIONS.length}</span>
                                <span>{progress}%</span>
                            </div>
                            <h2 className="text-[1.9rem] font-semibold leading-tight tracking-normal text-white sm:text-4xl">
                                {activeQuestion.question}
                            </h2>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {activeQuestion.options.map((option, index) => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => chooseAnswer(index)}
                                        className="min-h-20 rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-4 text-left text-base font-semibold leading-6 text-zinc-200 transition hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-200/[0.07] hover:text-white"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {answers.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="mt-5 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
                                >
                                    Start over
                                </button>
                            ) : null}
                        </div>
                    </section>
                ) : null}

                {phase === 'result' && result ? (
                    <section className="grid w-full gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div className="order-2 rounded-[2rem] border border-white/10 bg-[#101012]/76 p-6 text-center shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl lg:order-1">
                            <div className="flex justify-center">
                                <MirrorSig archetype={result.archetype} seed={result.mirrorId} size={210} />
                            </div>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-100">
                                <Check size={14} />
                                Saved in this browser
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h1 className="max-w-2xl text-[2.85rem] font-semibold leading-[0.98] tracking-normal text-white sm:text-[4.7rem]">
                                Ready.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                                Start with anything. You can keep a copy too.
                            </p>

                            <div className="mt-6 grid gap-2">
                                {result.preferences.slice(0, 4).map((item) => (
                                    <span key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-zinc-300">
                                        <span className="text-zinc-500">{preferenceLabel(item.preference)}:</span> {item.answer}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={startChat}
                                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-violet-500 px-6 text-base font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.28)] transition hover:scale-[1.01]"
                                >
                                    Start chat
                                    <ArrowRight size={19} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadSettings(result)}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-base font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                                >
                                    <Download size={17} />
                                    Keep a copy
                                </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-base font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                                >
                                    <RotateCcw size={17} />
                                    Start over
                                </button>
                            </div>
                        </div>
                    </section>
                ) : null}
            </main>
        </div>
    );
}
