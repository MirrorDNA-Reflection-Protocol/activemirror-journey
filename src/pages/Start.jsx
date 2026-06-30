import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Download, Lock, RotateCcw, Sparkles } from 'lucide-react';
import MirrorSig from '../components/MirrorSig';
import { FALLBACK_ARCHETYPES } from '../lib/brainFallback';
import { saveBrainScan, saveBlueprint } from '../lib/mirror-state';

const ENTRY_CHOICES = [
    {
        id: 'stuck',
        label: 'I feel stuck',
        prompt: 'Help me name the real stuck point and choose one useful next move.',
    },
    {
        id: 'decision',
        label: 'I need a decision',
        prompt: 'Help me see the tradeoff clearly and choose one useful next move.',
    },
    {
        id: 'make',
        label: 'I need to make something',
        prompt: 'Help me turn messy context into something clear I can use.',
    },
    {
        id: 'pushback',
        label: 'I need pushback',
        prompt: 'Challenge the weak part of my thinking without over-explaining.',
    },
];

const SCAN_QUESTIONS = [
    {
        id: 'q1',
        question: 'What do you want from the first answer?',
        options: [
            { label: 'One next step', archetype: 'builder', preference: 'first_answer' },
            { label: 'A sharper question', archetype: 'strategist', preference: 'first_answer' },
            { label: 'A calm reality check', archetype: 'analyst', preference: 'first_answer' },
            { label: 'Better words for the thought', archetype: 'connector', preference: 'first_answer' },
        ],
    },
    {
        id: 'q2',
        question: 'What should it avoid?',
        options: [
            { label: 'Too much text', archetype: 'builder', preference: 'avoid' },
            { label: 'Easy agreement', archetype: 'analyst', preference: 'avoid' },
            { label: 'Using private details too soon', archetype: 'scholar', preference: 'avoid' },
            { label: 'Generic advice', archetype: 'connector', preference: 'avoid' },
        ],
    },
    {
        id: 'q3',
        question: 'How should pushback feel?',
        options: [
            { label: 'Gentle', archetype: 'connector', preference: 'pushback' },
            { label: 'Balanced', archetype: 'scholar', preference: 'pushback' },
            { label: 'Direct', archetype: 'analyst', preference: 'pushback' },
            { label: 'Fast and practical', archetype: 'builder', preference: 'pushback' },
        ],
    },
    {
        id: 'q4',
        question: 'What can it remember if you approve it?',
        options: [
            { label: 'How I like answers', archetype: 'builder', preference: 'memory' },
            { label: 'My current goals', archetype: 'strategist', preference: 'memory' },
            { label: 'My recurring patterns', archetype: 'architect', preference: 'memory' },
            { label: 'Ask me first', archetype: 'analyst', preference: 'memory' },
        ],
    },
    {
        id: 'q5',
        question: 'When should it slow you down?',
        options: [
            { label: 'When I am spiraling', archetype: 'builder', preference: 'slow_down' },
            { label: 'When the claim needs evidence', archetype: 'analyst', preference: 'slow_down' },
            { label: 'When priorities are scattered', archetype: 'strategist', preference: 'slow_down' },
            { label: 'When the bigger picture is missing', archetype: 'architect', preference: 'slow_down' },
        ],
    },
    {
        id: 'q6',
        question: 'What makes you trust an answer?',
        options: [
            { label: 'It is short and useful', archetype: 'builder', preference: 'trust' },
            { label: 'It names uncertainty', archetype: 'analyst', preference: 'trust' },
            { label: 'It shows the tradeoff', archetype: 'strategist', preference: 'trust' },
            { label: 'It sounds like something I would actually say', archetype: 'connector', preference: 'trust' },
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

function makeMirrorSeed({ mirrorId, brainId, archetype, archetypeName, entryChoice, preferences, startPrompt }) {
    return {
        schema: 'active-mirror-id/v1',
        id: mirrorId,
        brainId,
        createdBy: 'Active Mirror BrainScan',
        createdAt: null,
        entry: entryChoice ? {
            id: entryChoice.id,
            label: entryChoice.label,
        } : null,
        preferences,
        styleHint: {
            archetype,
            label: archetypeName,
        },
        firstReflection: startPrompt,
        storage: {
            default: 'browser',
            portable: true,
        },
    };
}

function evaluateScan(answers, entryChoice) {
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
    const brainId = `brainscan-${Date.now().toString(36)}`;
    const startPrompt = entryChoice?.prompt || ENTRY_CHOICES[0].prompt;
    const mirrorSeed = makeMirrorSeed({
        mirrorId,
        brainId,
        archetype,
        archetypeName: meta.name,
        entryChoice,
        preferences,
        startPrompt,
    });

    return {
        archetype,
        archetypeName: meta.name,
        description: meta.description,
        strengths: meta.strengths,
        mirrorId,
        brainId,
        entry: entryChoice,
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
        type: 'mirror-id',
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

function ChoiceCard({ choice, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-16 items-center justify-between gap-4 rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-200/[0.07]"
        >
            <span className="text-base font-semibold tracking-[-0.02em] text-white">{choice.label}</span>
            <ArrowRight className="shrink-0 text-emerald-200 transition group-hover:translate-x-1" size={18} />
        </button>
    );
}

export default function Start() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('intro');
    const [entryChoice, setEntryChoice] = useState(ENTRY_CHOICES[0]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);

    const activeQuestion = SCAN_QUESTIONS[questionIndex];
    const progress = useMemo(() => Math.round((answers.length / SCAN_QUESTIONS.length) * 100), [answers.length]);

    function begin(choice) {
        setEntryChoice(choice);
        setPhase('scan');
    }

    function chooseAnswer(answerIndex) {
        const nextAnswers = [...answers, { questionIndex, answerIndex }];
        if (questionIndex < SCAN_QUESTIONS.length - 1) {
            setAnswers(nextAnswers);
            setQuestionIndex((current) => current + 1);
            return;
        }

        const nextResult = evaluateScan(nextAnswers, entryChoice);
        setAnswers(nextAnswers);
        setResult(nextResult);
        setPhase('result');
    }

    function saveAndReflect() {
        if (!result) return;
        const savedState = saveBrainScan({
            archetype: result.archetype,
            archetypeName: result.archetypeName,
            strengths: result.strengths,
            blindSpots: [result.entry?.label, ...result.avoid].filter(Boolean).slice(0, 4),
            mirrorId: result.mirrorId,
            brainId: result.brainId,
            preferences: result.preferences,
            mirrorSeed: {
                ...result.mirrorSeed,
                createdAt: new Date().toISOString(),
            },
        });

        saveBlueprint({
            kind: 'mirror-id',
            firstUse: result.entry,
            startingStyle: result.archetypeName,
            preferences: result.preferences,
            mirrorSeed: {
                ...result.mirrorSeed,
                createdAt: savedState.brainScanCompletedAt,
            },
            startPrompt: result.startPrompt,
            completedAt: savedState.brainScanCompletedAt,
        });

        setSaved(true);
        setResult({ ...result, savedAt: savedState.brainScanCompletedAt });
        navigate('/', { state: { startPrompt: result.startPrompt } });
    }

    function reset() {
        setPhase('intro');
        setEntryChoice(ENTRY_CHOICES[0]);
        setQuestionIndex(0);
        setAnswers([]);
        setResult(null);
        setSaved(false);
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-[#030303] text-white selection:bg-emerald-300/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_95%_82%,rgba(168,85,247,0.12),transparent_30%),#030303]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />

            <header className="relative z-10 border-b border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <MirrorLogo />
                        <span className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-3 text-xs">
                        <Link to="/privacy" className="hidden text-zinc-500 transition hover:text-white sm:inline">Privacy</Link>
                        <Link to="/terms" className="hidden text-zinc-500 transition hover:text-white sm:inline">Terms</Link>
                        <Link to="/" className="rounded-full border border-white/10 px-4 py-2 font-semibold text-zinc-300 transition hover:border-emerald-200/35 hover:text-white">
                            Open chat
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-57px)] w-full max-w-5xl items-center px-4 py-6 sm:py-10">
                {phase === 'intro' ? (
                    <section className="grid w-full gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                            <div className="mx-auto mb-5 flex justify-center lg:mx-0 lg:justify-start">
                                <MirrorLogo />
                            </div>
                            <h1 className="text-[3.1rem] font-semibold leading-[0.96] tracking-normal text-white sm:text-[5.2rem]">
                                Start with you.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                                Six quick choices. Better answers. Nothing saved until you choose.
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-2 text-xs font-semibold text-emerald-100">
                                <Lock size={14} />
                                Nothing is saved until you choose.
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/10 bg-[#101012]/76 p-4 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6">
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/80">BrainScan</p>
                                <h2 className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                                    What are you bringing first?
                                </h2>
                            </div>
                            <div className="grid gap-3">
                                {ENTRY_CHOICES.map((choice) => (
                                    <ChoiceCard key={choice.id} choice={choice} onClick={() => begin(choice)} />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                {phase === 'scan' ? (
                    <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-white/10 bg-[#101012]/78 p-5 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:rounded-[2rem] sm:p-8">
                        <div className="mb-6">
                            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                <span>{questionIndex + 1} of {SCAN_QUESTIONS.length}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-violet-300 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                        <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
                            {activeQuestion.question}
                        </h1>
                        <div className="mt-7 grid gap-3">
                            {activeQuestion.options.map((option, index) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => chooseAnswer(index)}
                                    className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-4 text-left text-base font-semibold leading-6 text-zinc-200 transition hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-200/[0.07] hover:text-white"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={reset}
                            className="mt-5 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
                        >
                            Start over
                        </button>
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
                                {saved ? 'Saved in this browser' : 'Ready when you are'}
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h1 className="max-w-2xl text-[2.85rem] font-semibold leading-[0.98] tracking-normal text-white sm:text-[4.7rem]">
                                You're set.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                                This is a preference file, not a personality test. Keep it in this browser or download it and bring it with you.
                            </p>

                            <div className="mt-6 grid gap-2">
                                {result.preferences.slice(0, 4).map((item) => (
                                    <span key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-zinc-300">
                                        {item.answer}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={saveAndReflect}
                                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-violet-500 px-6 text-base font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.28)] transition hover:scale-[1.01]"
                                >
                                    Save and reflect
                                    <ArrowRight size={19} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadSettings(result)}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-base font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                                >
                                    <Download size={17} />
                                    Download Mirror ID
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
