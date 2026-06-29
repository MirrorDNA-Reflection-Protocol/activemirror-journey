import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Download, Lock, MessageCircle, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import MirrorSig from '../components/MirrorSig';
import { FALLBACK_ARCHETYPES } from '../lib/brainFallback';
import { saveBrainScan, saveBlueprint } from '../lib/mirror-state';

const SETUP_STEPS = [
    {
        id: 'help',
        question: 'How should Active Mirror help?',
        helper: 'Pick the kind of help you want first. You can change it later.',
        icon: MessageCircle,
        options: [
            {
                id: 'decide',
                label: 'Help me decide',
                description: 'Show the real tradeoff and the next move.',
                prompt: 'Help me see the real tradeoff and choose one useful next move.',
                archetype: 'strategist',
                strength: 'Decision clarity',
            },
            {
                id: 'move',
                label: 'Help me move',
                description: 'Turn the mess into one small action.',
                prompt: 'Help me turn scattered context into one small action I can do now.',
                archetype: 'builder',
                strength: 'Momentum',
            },
            {
                id: 'honest',
                label: 'Tell me the truth',
                description: 'Challenge the loop without being harsh.',
                prompt: 'Be honest about what I may be avoiding and keep the answer useful.',
                archetype: 'analyst',
                strength: 'Reality check',
            },
        ],
    },
    {
        id: 'boundary',
        question: 'What should it avoid?',
        helper: 'This keeps the first answers safer and less noisy.',
        icon: ShieldCheck,
        options: [
            {
                id: 'private',
                label: 'Do not use private details',
                description: 'Keep names, secrets, and sensitive context out unless I add them.',
                prompt: 'Avoid names, secrets, and sensitive details unless I explicitly add them.',
                strength: 'Privacy first',
            },
            {
                id: 'flattery',
                label: 'Do not just agree with me',
                description: 'Push back when the pattern is weak.',
                prompt: 'Do not flatter me or agree just to be agreeable.',
                strength: 'No easy agreement',
            },
            {
                id: 'too_much',
                label: 'Do not give me too much',
                description: 'Keep it short when I am trying to move.',
                prompt: 'Avoid long explanations when one next move is enough.',
                strength: 'Less overwhelm',
            },
        ],
    },
    {
        id: 'memory',
        question: 'What should it remember?',
        helper: 'You choose what this browser keeps.',
        icon: Lock,
        options: [
            {
                id: 'nothing',
                label: 'Nothing yet',
                description: 'Start fresh until I choose to save something.',
                prompt: 'Do not carry anything forward unless I choose to save it.',
                strength: 'Fresh start',
            },
            {
                id: 'style',
                label: 'How I like help',
                description: 'Remember the kind of answer that helps me move.',
                prompt: 'Remember that I prefer short, honest answers with one concrete next move.',
                strength: 'Useful defaults',
            },
            {
                id: 'patterns',
                label: 'My recurring patterns',
                description: 'Remember loops I approve after a good reflection.',
                prompt: 'Only remember recurring patterns after I explicitly approve them.',
                strength: 'Approved continuity',
            },
        ],
    },
];

function makeMirrorId(archetype, answers) {
    const raw = `${archetype}:${Object.values(answers).map((item) => item.id).join(':')}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `mirror-${Math.abs(hash).toString(36)}`;
}

function buildSetupResult(answers) {
    const help = answers.help || SETUP_STEPS[0].options[0];
    const boundary = answers.boundary || SETUP_STEPS[1].options[0];
    const memory = answers.memory || SETUP_STEPS[2].options[0];
    const archetype = help.archetype || 'builder';
    const meta = FALLBACK_ARCHETYPES[archetype] || FALLBACK_ARCHETYPES.builder;
    const mirrorId = makeMirrorId(archetype, answers);
    const strengths = [help.strength, boundary.strength, memory.strength].filter(Boolean);

    return {
        archetype,
        archetypeName: meta.name,
        description: `${help.label}. ${boundary.label}. ${memory.label}.`,
        help,
        boundary,
        memory,
        strengths,
        mirrorId,
        startPrompt: [help.prompt, boundary.prompt, memory.prompt].join(' '),
        savedAt: new Date().toISOString(),
    };
}

function downloadSettings(result) {
    if (!result || typeof window === 'undefined') return;

    const settings = {
        product: 'Active Mirror',
        type: 'browser-settings',
        createdAt: result.savedAt,
        help: result.help?.label,
        boundary: result.boundary?.label,
        memory: result.memory?.label,
        strengths: result.strengths || [],
        id: result.mirrorId,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'active-mirror-settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

function ChoiceButton({ option, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-[4.85rem] items-center justify-between gap-4 rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-3 text-left transition hover:-translate-y-0.5 hover:border-purple-300/35 hover:bg-purple-300/[0.08] sm:min-h-[6.75rem] sm:rounded-[1.35rem] sm:p-4"
        >
            <span>
                <span className="block text-base font-semibold tracking-[-0.02em] text-white sm:text-lg">{option.label}</span>
                <span className="mt-1 block text-sm leading-5 text-zinc-500 sm:leading-6">{option.description}</span>
            </span>
            <ArrowRight className="shrink-0 text-purple-200 transition group-hover:translate-x-1" size={19} />
        </button>
    );
}

export default function Start() {
    const navigate = useNavigate();
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const activeStep = SETUP_STEPS[stepIndex];
    const StepIcon = activeStep.icon;
    const progress = useMemo(() => Math.round(((stepIndex + 1) / SETUP_STEPS.length) * 100), [stepIndex]);
    const ready = Boolean(result);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, [stepIndex, ready]);

    function chooseOption(option) {
        const nextAnswers = {
            ...answers,
            [activeStep.id]: option,
        };

        if (stepIndex < SETUP_STEPS.length - 1) {
            setAnswers(nextAnswers);
            setStepIndex((current) => current + 1);
            return;
        }

        const setup = buildSetupResult(nextAnswers);
        const saved = saveBrainScan({
            archetype: setup.archetype,
            archetypeName: setup.archetypeName,
            strengths: setup.strengths,
            blindSpots: [setup.boundary?.label].filter(Boolean),
            mirrorId: setup.mirrorId,
            brainId: `setup-${Date.now().toString(36)}`,
        });

        saveBlueprint({
            kind: 'starter-preferences',
            help: setup.help,
            boundary: setup.boundary,
            memory: setup.memory,
            startPrompt: setup.startPrompt,
            completedAt: saved.brainScanCompletedAt,
        });

        setAnswers(nextAnswers);
        setResult({ ...setup, savedAt: saved.brainScanCompletedAt });
    }

    function reset() {
        setStepIndex(0);
        setAnswers({});
        setResult(null);
    }

    function goToChat() {
        navigate('/', { state: { startPrompt: result?.startPrompt } });
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-[#050507] text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(126,87,255,0.18),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.08),transparent_34%),#050507]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-xl border border-violet-200/20 bg-white/[0.045] text-cyan-100">
                            <Sparkles size={16} />
                        </span>
                        <span className="text-sm font-semibold tracking-[-0.01em] text-white">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-3 text-xs">
                        <Link to="/privacy" className="hidden text-zinc-500 transition hover:text-white sm:inline">Privacy</Link>
                        <Link to="/terms" className="hidden text-zinc-500 transition hover:text-white sm:inline">Terms</Link>
                        <Link to="/" className="rounded-full border border-white/10 px-4 py-2 font-semibold text-zinc-300 transition hover:border-purple-300/35 hover:text-white">
                            Open chat
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-57px)] w-full max-w-5xl items-center px-4 py-4 sm:py-10">
                {!ready ? (
                    <section className="grid w-full gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[1.1rem] border border-violet-200/20 bg-white/[0.05] shadow-[0_0_42px_rgba(168,85,247,0.18)] sm:mb-6 sm:h-16 sm:w-16 sm:rounded-[1.35rem] lg:mx-0">
                                <StepIcon size={20} className="text-cyan-100 sm:size-6" />
                            </div>
                            <h1 className="text-[2.12rem] font-semibold leading-[0.98] tracking-normal text-white sm:text-[4.6rem]">
                                Make it feel like yours.
                            </h1>
                            <p className="mt-3 text-[0.95rem] leading-6 text-zinc-400 sm:mt-5 sm:text-lg sm:leading-8">
                                Three quick choices. No account. Saved on this browser.
                            </p>
                            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.035] p-3 text-left sm:mt-7 sm:rounded-[1.4rem]">
                                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    <span>{stepIndex + 1} of {SETUP_STEPS.length}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-200 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.55rem] border border-white/10 bg-[#111114]/72 p-3 shadow-[0_0_70px_rgba(124,58,237,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
                            <div className="mb-3 sm:mb-5">
                                <h2 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                                    {activeStep.question}
                                </h2>
                                <p className="mt-2 text-sm leading-5 text-zinc-500 sm:leading-6">{activeStep.helper}</p>
                            </div>
                            <div className="grid gap-3">
                                {activeStep.options.map((option) => (
                                    <ChoiceButton
                                        key={option.id}
                                        option={option}
                                        onClick={() => chooseOption(option)}
                                    />
                                ))}
                            </div>
                            {stepIndex > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                                    className="mt-4 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
                                >
                                    Back
                                </button>
                            ) : null}
                        </div>
                    </section>
                ) : (
                    <section className="grid w-full gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div className="order-2 rounded-[2rem] border border-white/10 bg-[#111114]/72 p-6 text-center shadow-[0_0_70px_rgba(124,58,237,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl lg:order-1">
                            <div className="flex justify-center">
                                <MirrorSig archetype={result.archetype} seed={result.mirrorId} size={210} />
                            </div>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-100">
                                <Check size={14} />
                                Saved on this browser
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[0.98] tracking-normal text-white sm:text-[4.6rem]">
                                You're set.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                                Active Mirror will start with the way you want help, what it should avoid, and what it should remember.
                            </p>

                            <div className="mt-6 grid gap-3">
                                {[
                                    ['Help', result.help?.label],
                                    ['Avoid', result.boundary?.label],
                                    ['Remember', result.memory?.label],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                                        <div className="mt-1 text-base font-semibold text-white">{value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={goToChat}
                                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-base font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.34)] transition hover:scale-[1.01]"
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
                                    Download settings
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
                )}
            </main>
        </div>
    );
}
