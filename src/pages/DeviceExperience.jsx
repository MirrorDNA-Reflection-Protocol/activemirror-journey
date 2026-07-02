import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUp, BatteryCharging, BookmarkPlus, Camera, ChevronDown, FileText, Keyboard, Lock, Monitor, ShieldCheck, Smartphone, Sparkles, Tablet, Trash2, Wifi } from 'lucide-react';
import ArtifactCard from '../components/ArtifactCard';
import MirrorFeedback from '../components/MirrorFeedback';
import ReflectionCardActions from '../components/ReflectionCardActions';
import { getActiveMirrorDefault, getArchetype, saveMirrorDefault } from '../lib/mirror-state';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

const PHONE_STARTERS = [
    'I am stuck.',
    'Another angle',
    'Make it sendable',
];

const PHONE_THREAD_KEY = 'activeMirror_phoneThread_v1';

const INITIAL_PHONE_TURNS = [
    {
        who: 'mirror',
        mirror: {
            reflection: 'What is one thing you are stuck on?',
            question: 'Say it in one sentence.',
            move: 'Send the smallest useful version.',
            receipt: {
                context_used: 'Nothing yet.',
                context_excluded: 'No private context has been sent.',
                memory_decision: 'Nothing saved.',
            },
        },
    },
];

const PROFILES = {
    phone: {
        label: 'Phone',
        icon: Smartphone,
        headline: 'A pocket mirror for the moment you get stuck.',
        copy: 'Use it for quick capture, one next move, and private continuity later. Keep the screen focused.',
        primary: 'Start quick mirror',
        primaryTo: '/mirror',
        secondary: 'Save preferences',
        secondaryTo: '/id',
        strengths: [
            { icon: Camera, title: 'Capture first', text: 'Use a sentence, screenshot, or file name as the start point.' },
            { icon: Sparkles, title: 'One move only', text: 'Small answers fit the screen and keep you moving.' },
            { icon: ShieldCheck, title: 'Save later', text: 'Do not promote memory until the result is worth keeping.' },
        ],
    },
    tablet: {
        label: 'Tablet',
        icon: Tablet,
        headline: 'A calm side-by-side work surface.',
        copy: 'Use it for notes, reviewing options, and moving between reflection and the thing you are making.',
        primary: 'Open full mirror',
        primaryTo: '/mirror',
        secondary: 'Quick setup',
        secondaryTo: '/id',
        strengths: [
            { icon: FileText, title: 'Review mode', text: 'Read the mirror next to the work without crowding the page.' },
            { icon: Sparkles, title: 'Shape outputs', text: 'Turn rough context into a memo, checklist, or next step.' },
            { icon: ShieldCheck, title: 'Bounded memory', text: 'Keep drafts temporary until you accept the conclusion.' },
        ],
    },
    desktop: {
        label: 'Desktop',
        icon: Monitor,
        headline: 'A workbench for files, research, and decisions.',
        copy: 'Use the larger screen for file review, side-by-side thinking, and deeper turns that still end in one move.',
        primary: 'Use homepage workbench',
        primaryTo: '/',
        secondary: 'Open full mirror',
        secondaryTo: '/mirror',
        strengths: [
            { icon: FileText, title: 'Files beside chat', text: 'Drop local context and decide what needs inspection first.' },
            { icon: Keyboard, title: 'Longer work', text: 'Use the full keyboard for briefs, research plans, and launch copy.' },
            { icon: ShieldCheck, title: 'Receipts stay quiet', text: 'Audit what mattered without turning the page into homework.' },
        ],
    },
};

function readDevice() {
    if (typeof window === 'undefined') {
        return {
            width: 0,
            height: 0,
            touch: false,
            coarse: false,
            connection: 'unknown',
            memory: null,
            profile: 'desktop',
        };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const touch = navigator.maxTouchPoints > 0;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const connection = navigator.onLine ? 'Online' : 'Offline';
    const profile = width <= 680 || (coarse && width < 760)
        ? 'phone'
        : width <= 1100 || touch
            ? 'tablet'
            : 'desktop';

    return { width, height, touch, coarse, connection, profile };
}

function DeviceCard({ profile, active, onClick }) {
    const Icon = profile.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group rounded-3xl border p-4 text-left transition ${
                active
                    ? 'border-cyan-200/45 bg-cyan-300/[0.09] shadow-[0_0_34px_rgba(34,211,238,0.10)]'
                    : 'border-white/10 bg-black/25 hover:border-purple-300/30 hover:bg-purple-300/[0.06]'
            }`}
        >
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                    <Icon size={18} />
                </span>
                <span>
                    <span className="block text-sm font-semibold text-white">{profile.label}</span>
                    <span className="block text-xs text-zinc-500">{active ? 'Recommended here' : 'Preview mode'}</span>
                </span>
            </div>
        </button>
    );
}

function loadPhoneTurns() {
    if (typeof window === 'undefined') return INITIAL_PHONE_TURNS;

    try {
        const raw = localStorage.getItem(PHONE_THREAD_KEY);
        if (!raw) return INITIAL_PHONE_TURNS;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_PHONE_TURNS;
    } catch {
        return INITIAL_PHONE_TURNS;
    }
}

function makeSendableArtifact(mirror = {}) {
    const question = mirror.question || 'What is the useful next move?';
    const move = mirror.move || 'Take the smallest concrete next step.';

    return {
        kind: 'draft',
        title: 'Sendable draft',
        body: [
            'Quick update:',
            '',
            `I narrowed this to: ${question}`,
            '',
            `Next move: ${move}`,
        ].join('\n'),
        checks: [
            'Remove anything private before sending.',
            'Keep the ask to one sentence.',
            'Send it, then watch what changes.',
        ],
    };
}

function phoneBlocked(error) {
    if (error === 'rate_limited') {
        return {
            reflection: 'The mirror is cooling down for a moment.',
            question: 'Can you hold the same thought and try again shortly?',
            move: 'Wait a minute, then send the same sentence again.',
            receipt: {
                context_used: 'Only the request limit state.',
                context_excluded: 'No private context was expanded.',
                memory_decision: 'Nothing saved.',
            },
        };
    }

    return {
        reflection: 'Keep the private part with you. A placeholder is enough.',
        question: 'What is the same ask with the private part replaced?',
        move: 'Swap the private part for [something] and send one sentence.',
        receipt: {
            context_used: 'The current message only.',
            context_excluded: 'Potentially sensitive details were not processed further.',
            memory_decision: 'Nothing saved.',
        },
    };
}

function PhoneMirrorTurn({ mirror, onSendable, onRemember, remembered, showSendable = true, turn = 1 }) {
    return (
        <div className="space-y-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.98rem] leading-7 text-zinc-100">
                {mirror.reflection}
            </div>
            {mirror.question ? (
                <div className="rounded-[1.35rem] border border-purple-300/20 bg-purple-300/[0.08] px-4 py-3">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-purple-200/70">Question</div>
                    <div className="text-sm font-semibold leading-6 text-white">{mirror.question}</div>
                </div>
            ) : null}
            {mirror.move ? (
                <div className="rounded-[1.35rem] border border-emerald-300/15 bg-emerald-300/[0.08] px-4 py-3">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-200/75">One move</div>
                    <div className="text-sm leading-6 text-zinc-100">{mirror.move}</div>
                </div>
            ) : null}
            <details className="group rounded-[1.35rem] border border-white/10 bg-black/25 px-4 py-3 text-xs text-zinc-500">
                <summary className="cursor-pointer list-none font-semibold text-zinc-400">
                    Private by default
                    <ChevronDown className="float-right mt-0.5 h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3 leading-5">
                    <div><span className="text-zinc-300">Used:</span> {mirror.receipt?.context_used || 'Only this message.'}</div>
                    <div><span className="text-zinc-300">Left out:</span> {mirror.receipt?.context_excluded || 'Private context stayed out.'}</div>
                    <div><span className="text-zinc-300">Saved:</span> {mirror.receipt?.memory_decision || 'Nothing saved.'}</div>
                </div>
            </details>
            {showSendable ? (
                <>
                    <MirrorFeedback page="device" surface="phone_chat" turn={turn} className="max-w-none rounded-[1.35rem]" />
                    <ReflectionCardActions mirror={mirror} surface="device" className="max-w-none rounded-[1.35rem]" />
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => onSendable?.(mirror)}
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-semibold text-cyan-100"
                        >
                            <FileText size={13} />
                            Make this sendable
                        </button>
                        <button
                            type="button"
                            onClick={() => onRemember?.(mirror)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300"
                        >
                            <BookmarkPlus size={13} />
                            {remembered ? 'Default saved' : 'Use as default'}
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function PhoneArtifactTurn({ artifact }) {
    return <ArtifactCard artifact={artifact} surface="device" />;
}

export default function DeviceExperience() {
    const [seed] = useState(() => getArchetype());
    const [activeDefault, setActiveDefault] = useState(() => getActiveMirrorDefault());
    const [rememberedKey, setRememberedKey] = useState('');
    const [device, setDevice] = useState(() => readDevice());
    const [selected, setSelected] = useState(() => readDevice().profile);
    const [phoneTurns, setPhoneTurns] = useState(() => loadPhoneTurns());
    const [phoneText, setPhoneText] = useState('');
    const [phoneBusy, setPhoneBusy] = useState(false);
    const phoneMainRef = useRef(null);
    const phoneTurnRef = useRef(0);

    useEffect(() => {
        function update() {
            const next = readDevice();
            setDevice(next);
            setSelected((current) => current || next.profile);
        }

        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const profile = PROFILES[selected] || PROFILES.desktop;
    const ProfileIcon = profile.icon;
    const status = useMemo(() => ([
        { icon: Monitor, label: 'Screen', value: device.width ? `${device.width} x ${device.height}` : 'Checking' },
        { icon: device.touch ? Smartphone : Keyboard, label: 'Input', value: device.touch ? 'Touch ready' : 'Keyboard ready' },
        { icon: Wifi, label: 'Connection', value: device.connection },
        { icon: BatteryCharging, label: 'Mode', value: profile.label },
    ]), [device, profile.label]);
    const isPhoneView = selected === 'phone';

    useEffect(() => {
        if (!isPhoneView) return;
        trackEvent('device_phone_chat_view', { page: 'device', surface: 'phone_chat' });
    }, [isPhoneView]);

    useEffect(() => {
        if (!isPhoneView) return;
        try {
            localStorage.setItem(PHONE_THREAD_KEY, JSON.stringify(phoneTurns.slice(-30)));
        } catch {
            // The chat still works if the browser refuses local storage.
        }
    }, [isPhoneView, phoneTurns]);

    useEffect(() => {
        if (!isPhoneView || !phoneMainRef.current) return;
        requestAnimationFrame(() => {
            phoneMainRef.current?.scrollTo({ top: phoneMainRef.current.scrollHeight, behavior: 'smooth' });
        });
    }, [isPhoneView, phoneTurns, phoneBusy]);

    async function askPhone(intent, source = 'typed') {
        const cleanIntent = intent.trim();
        if (cleanIntent.length < 3 || phoneBusy) return;

        setPhoneText('');
        setPhoneTurns((current) => [...current, { who: 'you', text: cleanIntent }]);
        setPhoneBusy(true);
        trackEvent('mirror_submit', { page: 'device', surface: 'phone_chat', source, route: 'reflection', status: 'started' });

        try {
            phoneTurnRef.current += 1;
            const context = [
                seed ? `User profile: ${seed.archetypeName || seed.archetype}. Strengths: ${(seed.strengths || []).join(', ') || 'unknown'}.` : '',
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
                    turn: phoneTurnRef.current,
                }),
            });
            const data = await response.json();
            const mirror = data.ok ? data.mirror : phoneBlocked(data.error);
            trackEvent('mirror_result', {
                page: 'device',
                surface: 'phone_chat',
                source,
                route: data.route?.capability || 'reflection',
                status: data.ok ? 'ok' : 'blocked',
                fallback: Boolean(data.fallback),
            });
            setPhoneTurns((current) => [...current, { who: 'mirror', mirror }]);
        } catch {
            trackEvent('gateway_error', { page: 'device', surface: 'phone_chat', source, route: 'reflection', status: 'network' });
            setPhoneTurns((current) => [
                ...current,
                {
                    who: 'mirror',
                    mirror: {
                        reflection: 'I could not reach the live answer just now.',
                        question: 'Can you keep the thought here and try again?',
                        move: 'Send the same sentence in a moment.',
                        receipt: {
                            context_used: 'No hosted response was returned.',
                            context_excluded: 'Nothing was saved.',
                            memory_decision: 'Nothing saved.',
                        },
                    },
                },
            ]);
        } finally {
            setPhoneBusy(false);
        }
    }

    function makePhoneSendable(mirror) {
        setPhoneTurns((current) => [
            ...current,
            {
                who: 'mirror',
                artifact: makeSendableArtifact(mirror),
            },
        ]);
        trackEvent('sendable_created', { page: 'device', surface: 'phone_chat', source: 'local_draft' });
    }

    function rememberPhoneDefault(mirror) {
        const next = saveMirrorDefault({
            question: mirror?.question,
            move: mirror?.move,
            source: 'phone',
        });
        setActiveDefault(next);
        setRememberedKey(`${mirror?.question || ''}|${mirror?.move || ''}`);
        trackEvent('mirror_default_saved', { page: 'device', surface: 'phone_chat', source: 'reflection' });
        window.setTimeout(() => setRememberedKey(''), 2200);
    }

    function clearPhoneThread() {
        setPhoneTurns(INITIAL_PHONE_TURNS);
        try {
            localStorage.removeItem(PHONE_THREAD_KEY);
        } catch {
            // Nothing to clear if the browser blocks local storage.
        }
        phoneTurnRef.current = 0;
        trackEvent('phone_thread_cleared', { page: 'device', surface: 'phone_chat' });
    }

    if (isPhoneView) {
        return (
            <div className="min-h-dvh overflow-x-hidden bg-black text-white">
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.24),transparent_34%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.12),transparent_32%),#000]" />
                <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/75 px-4 py-3 backdrop-blur-xl">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <ArrowLeft size={16} />
                        Active Mirror
                    </Link>
                    <div className="flex items-center gap-2">
                        {phoneTurns.length > INITIAL_PHONE_TURNS.length ? (
                            <button
                                type="button"
                                onClick={clearPhoneThread}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-400"
                            >
                                <Trash2 size={12} />
                                Clear
                            </button>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                            <Lock size={12} />
                            private
                        </span>
                    </div>
                </header>

                <main ref={phoneMainRef} className="relative z-10 h-dvh overflow-y-auto px-3 pb-32 pt-16">
                    <div className="mx-auto flex max-w-md flex-col gap-4">
                        {phoneTurns.map((turn, index) => (
                            <div key={`${turn.who}-${index}`} className={turn.who === 'you' ? 'flex justify-end' : 'flex justify-start'}>
                                {turn.who === 'you' ? (
                                    <div className="max-w-[82%] rounded-[1.25rem] bg-white px-4 py-3 text-sm leading-6 text-black">
                                        {turn.text}
                                    </div>
                                ) : turn.artifact ? (
                                    <div className="w-full max-w-md">
                                        <PhoneArtifactTurn artifact={turn.artifact} />
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md">
                                        <PhoneMirrorTurn
                                            mirror={turn.mirror}
                                            onSendable={makePhoneSendable}
                                            onRemember={rememberPhoneDefault}
                                            remembered={rememberedKey === `${turn.mirror?.question || ''}|${turn.mirror?.move || ''}`}
                                            showSendable={index > 0}
                                            turn={index}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {phoneBusy ? (
                            <div className="flex justify-start">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-zinc-300">
                                    <Sparkles size={15} className="animate-pulse text-cyan-200" />
                                    Reflecting
                                </div>
                            </div>
                        ) : null}
                    </div>
                </main>

                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/80 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
                    <div className="mx-auto max-w-md">
                        {phoneTurns.length <= INITIAL_PHONE_TURNS.length ? (
                            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {PHONE_STARTERS.map((starter) => (
                                    <button
                                        key={starter}
                                        type="button"
                                        onClick={() => askPhone(starter, 'starter')}
                                        disabled={phoneBusy}
                                        className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-zinc-300 disabled:opacity-50"
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                askPhone(phoneText);
                            }}
                            className="flex items-end gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-2"
                        >
                            <textarea
                                rows={1}
                                value={phoneText}
                                maxLength={1000}
                                placeholder="Message Active Mirror"
                                onChange={(event) => setPhoneText(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        askPhone(phoneText);
                                    }
                                }}
                                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-base leading-6 text-white outline-none placeholder:text-zinc-500"
                            />
                            <button
                                type="submit"
                                disabled={phoneBusy || phoneText.trim().length < 3}
                                aria-label="Send"
                                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 text-white disabled:opacity-40"
                            >
                                <ArrowUp size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-black text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),transparent_34%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Active Mirror
                    </Link>
                    <Link to="/mirror" className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12]">
                        Full mirror
                    </Link>
                </div>
            </header>

            <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-57px)] max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(420px,1fr)] lg:items-stretch lg:px-6 lg:py-6">
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_60px_rgba(168,85,247,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                        <ShieldCheck size={14} />
                        Tuned locally
                    </div>
                    <h1 className="mt-6 max-w-[10ch] text-[3.2rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[4.7rem]">
                        Best on this device.
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
                        Active Mirror should feel different on a phone, tablet, and desktop. This page chooses the cleanest way to start from the screen you are using.
                    </p>

                    <div className="mt-7 grid gap-2 sm:grid-cols-3">
                        {Object.entries(PROFILES).map(([key, item]) => (
                            <DeviceCard
                                key={key}
                                profile={item}
                                active={selected === key}
                                onClick={() => setSelected(key)}
                            />
                        ))}
                    </div>

                    <div className="mt-7 grid gap-2 sm:grid-cols-2">
                        {status.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    <item.icon size={13} />
                                    {item.label}
                                </div>
                                <div className="text-sm font-semibold text-zinc-100">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex min-h-[36rem] flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_0_70px_rgba(124,58,237,0.14)] ring-1 ring-white/[0.04] backdrop-blur-2xl">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                            <ProfileIcon size={17} className="text-cyan-200" />
                            {profile.label} setup
                        </div>
                        <div className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                            private first
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-5 p-4 sm:p-5">
                        <div>
                            <div className="rounded-3xl border border-white/10 bg-black/25 px-5 py-5">
                                <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                                    {profile.headline}
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                                    {profile.copy}
                                </p>
                                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                    <Link
                                        to={profile.primaryTo}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.28)] transition hover:scale-[1.01]"
                                    >
                                        {profile.primary}
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to={profile.secondaryTo}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-purple-300/30 hover:text-white"
                                    >
                                        {profile.secondary}
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3">
                                {profile.strengths.map((item) => (
                                    <div key={item.title} className="flex gap-3 rounded-3xl border border-white/10 bg-black/22 p-4">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                                            <item.icon size={18} />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-white">{item.title}</span>
                                            <span className="mt-1 block text-sm leading-6 text-zinc-400">{item.text}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75">
                                What changes
                            </div>
                            <div className="grid gap-2 text-sm leading-6 text-zinc-300 sm:grid-cols-3">
                                <div>Layout fits the screen.</div>
                                <div>Actions match the input style.</div>
                                <div>Saving stays your choice.</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
