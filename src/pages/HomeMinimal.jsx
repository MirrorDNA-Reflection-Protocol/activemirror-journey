import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Brain,
    Building2,
    CheckCircle2,
    Eye,
    ShieldAlert,
} from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';

const entryPoints = [
    {
        eyebrow: 'Urgent',
        title: 'Check something suspicious',
        body: 'Use Chetana for QR codes, UPI requests, payment screenshots, links, phone numbers, or scam-like messages.',
        detail: 'Best when you need an answer right now.',
        href: 'https://chetana.activemirror.ai',
        cta: 'Open Chetana',
        external: true,
        tone: 'amber',
        icon: ShieldAlert,
        bullets: ['No setup', 'Shows why it fired', 'Gives the next safe step'],
    },
    {
        eyebrow: 'Recommended',
        title: 'Try the AI properly',
        body: 'Start with BrainScan if you are new here. It takes about a minute and gives the AI a better route into the rest of the experience.',
        detail: 'Best first visit for friends and first-time users.',
        href: '/start',
        cta: 'Start BrainScan',
        tone: 'blue',
        icon: Brain,
        bullets: ['8 questions', 'Twin recommendation', 'Flows into reflection'],
    },
    {
        eyebrow: 'Direct',
        title: 'Open reflection',
        body: 'Go straight to the reflective chat if you already know what you want and do not need the guided route first.',
        detail: 'Best after BrainScan, but optional.',
        href: '/mirror',
        cta: 'Open Mirror',
        tone: 'green',
        icon: Eye,
        bullets: ['Plain-language chat', 'Reflective instead of generic', 'No product decoding'],
    },
];

const trustPoints = [
    {
        title: 'Plain-language outputs',
        body: 'The public tools should explain what they saw, why it matters, and what to do next.',
    },
    {
        title: 'A guided AI start',
        body: 'BrainScan reduces the blank-chat problem by giving the AI a simple, personal starting point.',
    },
    {
        title: 'Depth stays optional',
        body: 'Docs, control, memory, and self-hosting stay available without taking over the first screen.',
    },
];

function ActionLink({ href, children, external = false, kind = 'primary', className = '' }) {
    const classes = kind === 'primary'
        ? 'bg-[#132033] text-white hover:bg-[#1d2d48]'
        : 'border border-[#d8dfe7] bg-white text-[#152033] hover:border-[#bdc8d7]';

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${classes} ${className}`}
            >
                {children}
            </a>
        );
    }

    return (
        <Link to={href} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${classes} ${className}`}>
            {children}
        </Link>
    );
}

function RouteCard({ route }) {
    const Icon = route.icon;
    const toneClasses = {
        amber: {
            shell: 'border-[#f1e2c8] bg-[#fdf9f1]',
            chip: 'border-[#f1e2c8] bg-[#fcf6ea] text-[#9a6121]',
            icon: 'bg-[#fcf6ea] text-[#9a6121]',
        },
        blue: {
            shell: 'border-[#d7e4ff] bg-[#f7fbff]',
            chip: 'border-[#d7e4ff] bg-[#eef5ff] text-[#2855d9]',
            icon: 'bg-[#eef5ff] text-[#2855d9]',
        },
        green: {
            shell: 'border-[#d9eee6] bg-[#f7fbf9]',
            chip: 'border-[#d9eee6] bg-[#eef9f4] text-[#1c7b5b]',
            icon: 'bg-[#eef9f4] text-[#1c7b5b]',
        },
    };
    const tone = toneClasses[route.tone];

    return (
        <div className={`rounded-[30px] border p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)] ${tone.shell}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${tone.chip}`}>
                        {route.eyebrow}
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#152033]">{route.title}</h3>
                </div>
                <div className={`inline-flex rounded-2xl p-3 ${tone.icon}`}>
                    <Icon size={20} />
                </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#516072]">{route.body}</p>
            <p className="mt-3 text-sm font-medium text-[#152033]">{route.detail}</p>

            <div className="mt-5 grid gap-2">
                {route.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-white/80 bg-white/88 px-4 py-3 text-sm text-[#2f3b4b]">
                        {bullet}
                    </div>
                ))}
            </div>

            <ActionLink href={route.href} external={route.external} className="mt-6">
                {route.cta}
                {route.external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
            </ActionLink>
        </div>
    );
}

export default function HomeMinimal() {
    return (
        <SiteShell>
            <SectionShell className="pb-8 pt-10 sm:pt-16">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
                    <div className="max-w-2xl">
                        <div className="inline-flex rounded-full border border-[#d8dfe7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5a6778]">
                            New here
                        </div>

                        <h1 className="mt-8 max-w-[11ch] text-5xl font-semibold tracking-[-0.07em] text-[#0d1522] sm:text-6xl lg:text-7xl">
                            One site. Three clear ways in.
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b6776]">
                            Use Chetana to check something suspicious. Use BrainScan to start the AI route properly.
                            Use Mirror if you want the reflective chat directly. If you are not sure, start with BrainScan.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <ActionLink href="/start">
                                Start BrainScan
                                <ArrowRight size={16} />
                            </ActionLink>
                            <ActionLink href="https://chetana.activemirror.ai" external kind="secondary">
                                Open Chetana
                                <ArrowUpRight size={16} />
                            </ActionLink>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5b6776]">
                            <span>Already know what you want?</span>
                            <Link to="/mirror" className="inline-flex items-center gap-1 font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                Go straight to Mirror
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.06)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">
                            Recommended first visit
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="rounded-[24px] border border-[#d7e4ff] bg-[#f7fbff] p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#4f6787]">Step 1</div>
                                <div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#152033]">Take BrainScan</div>
                                <p className="mt-2 text-sm leading-7 text-[#5b6776]">Get a simple cognitive read instead of landing in a blank chat.</p>
                            </div>
                            <div className="rounded-[24px] border border-[#d9eee6] bg-[#f7fbf9] p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#4f6787]">Step 2</div>
                                <div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#152033]">Meet your twin</div>
                                <p className="mt-2 text-sm leading-7 text-[#5b6776]">The system gives you a clearer companion style and next route.</p>
                            </div>
                            <div className="rounded-[24px] border border-[#f1e2c8] bg-[#fdf9f1] p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#4f6787]">Step 3</div>
                                <div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#152033]">Open reflection</div>
                                <p className="mt-2 text-sm leading-7 text-[#5b6776]">Continue into the mirror with a better starting point than a generic prompt box.</p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-[#ebeff4] bg-[#fbfcfd] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-[#7c8795]">Need immediate scam help?</div>
                            <div className="mt-2 text-sm leading-7 text-[#516072]">
                                Skip the AI route and open Chetana directly if the problem is urgent.
                            </div>
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Pick a route"
                title="You should not have to decode product names."
                description="These are the three entry points most people actually need."
                className="pt-6"
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {entryPoints.map((route) => (
                        <RouteCard key={route.title} route={route} />
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Why it works"
                title="Minimal on the surface. Serious underneath."
                description="The first experience stays simple, but the system still shows its work and leaves the deeper layers available."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {trustPoints.map((point) => (
                        <div key={point.title} className="rounded-[28px] border border-[#e7dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                            <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f7fbff] p-3 text-[#2855d9]">
                                <CheckCircle2 size={20} />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{point.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{point.body}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="For teams"
                title="When the work gets serious, the deeper platform is ready."
                description="Active Mirror also exposes the proof, memory, review, and control layers behind the public surfaces."
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="inline-flex rounded-full border border-[#d8dfe7] bg-[#f7fbff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f6787]">
                            Platform route
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#152033]">
                            Reviewable AI for teams, operators, and regulated deployments.
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5b6776]">
                            The public side stays easy. The deeper side adds governance, memory, trust policy, self-hosting, and operator visibility when that matters.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-4 text-sm text-[#364255]">Platform overview</div>
                            <div className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-4 text-sm text-[#364255]">Docs and architecture</div>
                            <div className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-4 text-sm text-[#364255]">Pricing and deployment</div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ActionLink href="/platform">
                                See the platform
                                <ArrowRight size={16} />
                            </ActionLink>
                            <ActionLink href="/docs" kind="secondary">
                                Read docs
                                <BookOpen size={16} />
                            </ActionLink>
                            <ActionLink href="/pricing" kind="secondary">
                                Pricing
                                <ArrowRight size={16} />
                            </ActionLink>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#e7dfd4] bg-[#fdf9f1] p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="inline-flex rounded-2xl bg-[#fcf6ea] p-3 text-[#9a6121]">
                            <Building2 size={20} />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">One clean front door. Deeper layers only when needed.</h2>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-[#5b6776]">
                            <p>People should be able to solve the immediate problem without learning the whole stack.</p>
                            <p>Teams should be able to go deeper without losing trust, proof, or control.</p>
                            <p>That is the shape this site should keep.</p>
                        </div>
                    </div>
                </div>
            </SectionShell>
        </SiteShell>
    );
}
