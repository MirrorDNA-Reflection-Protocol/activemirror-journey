/**
 * Cognitive Dashboard Product Page — operator surface for MirrorDNA
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Check,
    Cpu,
    Database,
    Eye,
    Gauge,
    Github,
    GitBranch,
    Layers,
    Zap,
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const surfaceStats = [
    { value: '4', label: 'operator lanes', note: 'cockpit, system map, profiles, intelligence' },
    { value: '5', label: 'desktop profiles', note: 'glass, founder, sysadmin, adhd, teams' },
    { value: '7', label: 'signal stages', note: 'ingest to render from the desktop review pack' },
];

const surfaces = [
    {
        icon: Activity,
        title: 'Core cockpit',
        desc: 'The live terminal surface in `cognitive_dashboard.py`: infrastructure, vitals, sessions, transparency, integrity, loops, automations, and the intelligence lane.',
    },
    {
        icon: Gauge,
        title: 'System map',
        desc: 'Topology view for ports, services, LaunchAgents, health checks, and the broader service mesh running alongside the cockpit.',
    },
    {
        icon: Eye,
        title: 'MirrorDash profiles',
        desc: 'Desktop profile dashboards optimized for different contexts instead of forcing one layout to serve every operator.',
    },
    {
        icon: BarChart3,
        title: 'Intelligence pipeline',
        desc: 'The desktop review pack defines how external signals get translated into ranked cards instead of raw feed noise.',
    },
];

const runtimeInputs = [
    'Service Registry and health evaluators',
    'Bus files such as `cc_events.jsonl` and hook decisions',
    'CONTINUITY.md, substrate state, and memory state',
    'launchctl state, port listeners, and Tailscale mesh',
    'Factory runs, overnight output, and automation status',
];

const profileCards = [
    {
        name: 'Glass Box',
        command: 'python3 mirrordash.py --profile glass',
        desc: 'Hook decisions, integrity score, tool flow, mistake patterns, memory state, and net activity.',
    },
    {
        name: 'Founder OS',
        command: 'python3 mirrordash.py --profile founder',
        desc: 'Revenue, pipeline, focus, loops, energy, and today\'s one thing.',
    },
    {
        name: 'SysAdmin Ops',
        command: 'python3 mirrordash.py --profile sysadmin',
        desc: 'Services, logs, git state, machine vitals, and operational loops.',
    },
    {
        name: 'ADHD Focus',
        command: 'python3 mirrordash.py --profile adhd',
        desc: 'One-task mode with energy, queue, loops, and cognitive load kept visible.',
    },
    {
        name: 'Teams',
        command: 'python3 mirrordash.py --profile teams',
        desc: 'Shared queue, presence, and metrics for collaborative execution.',
    },
];

const intelligenceStages = [
    'Ingest raw signals from feeds and source adapters.',
    'Normalize into a common schema.',
    'Arbitrate duplicates, echoes, and low-trust noise.',
    'Score impact so urgency is explicit.',
    'Bind signals to tracked entities and memory.',
    'Route them into founder, operator, or research actions.',
    'Render ranked cards instead of a noisy feed dump.',
];

const monitorCoverage = [
    'Infrastructure health, ports, devices, and local model state',
    'Agent sessions, tool calls, routing decisions, and integrity checks',
    'Factory runs, overnight output, open loops, and next actions',
    'Profile-specific views for founder work, sysadmin work, and focus work',
    'External intelligence that can be folded into dashboard cards instead of separate inboxes',
];

function SurfaceStat({ value, label, note, isDark }) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-cyan-500/20 bg-white/[0.04]' : 'border-cyan-200 bg-white'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</div>
            <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{label}</div>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{note}</p>
        </div>
    );
}

export default function CognitiveDashboardPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="overflow-hidden py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/20">
                                <Activity size={32} className="text-cyan-400" />
                            </div>
                            <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Live operator surface
                            </span>
                            <span className={`text-sm px-3 py-1 rounded-full border ${isDark ? 'border-white/10 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}>
                                Desktop dashboards wired in
                            </span>
                        </div>

                        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Cognitive Dashboard
                        </h1>
                        <p className="text-xl sm:text-2xl font-medium mb-6 text-cyan-400">
                            One cockpit. Multiple operator modes.
                        </p>
                        <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            The desktop work now resolves into a single story: the core MirrorDNA cockpit, the system map,
                            the profile dashboards in MirrorDash, and the external intelligence pipeline all describe the
                            same operating surface from different angles.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-10">
                            <a
                                href="https://github.com/MirrorDNA-Reflection-Protocol/mirrordna-dashboards"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                            >
                                <Github size={18} />
                                Core Dashboard Repo
                            </a>
                            <a
                                href="https://github.com/MirrorDNA-Reflection-Protocol/mirrordash"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${
                                    isDark ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10' : 'border-cyan-300 text-cyan-700 hover:bg-cyan-50'
                                }`}
                            >
                                <Eye size={18} />
                                MirrorDash Profiles
                            </a>
                            <Link
                                to="/status"
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                                }`}
                            >
                                See Live Status
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {surfaceStats.map((stat) => (
                                <SurfaceStat key={stat.label} {...stat} isDark={isDark} />
                            ))}
                        </div>
                    </div>

                    <div className={`relative rounded-[2rem] border p-4 shadow-2xl ${isDark ? 'border-cyan-500/20 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_48%)] pointer-events-none" />
                        <div className="relative rounded-[1.5rem] overflow-hidden border border-white/10">
                            <img
                                src="/images/cognitive-dashboard-live.png"
                                alt="Cognitive Dashboard running in the browser shell"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
                            <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-zinc-200 bg-zinc-50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers size={16} className="text-cyan-400" />
                                    <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                        Current shape
                                    </span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    The public screenshots show the cockpit in action. The current runtime now also carries
                                    routing, integrity, transparency, and intelligence lanes beyond the earlier captures.
                                </p>
                            </div>
                            <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-zinc-200 bg-zinc-50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={16} className="text-emerald-400" />
                                    <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                        Truthful surface
                                    </span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    This page describes the live operator surface honestly. It does not pretend there is a browser
                                    probe endpoint when the dashboard itself reads local runtime state directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                    <div className={`rounded-[2rem] border p-8 ${isDark ? 'border-white/10 bg-zinc-950/70' : 'border-zinc-200 bg-white'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <Gauge size={20} className="text-cyan-400" />
                            <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                Observed, not simulated
                            </span>
                        </div>
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            What the cockpit actually reads
                        </h2>
                        <p className={`text-base mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            The dashboard is an operator view over the real local system. It watches state that already exists
                            instead of inventing a second monitoring layer for the website.
                        </p>
                        <div className={`rounded-2xl p-5 font-mono text-sm ${isDark ? 'bg-black/40 text-zinc-300' : 'bg-zinc-900 text-zinc-200'}`}>
                            <div className="text-cyan-400 mb-3">runtime inputs</div>
                            {runtimeInputs.map((item) => (
                                <div key={item} className="mb-2">
                                    {'->'} {item}
                                </div>
                            ))}
                            <div className="mt-4 text-emerald-400">rendered via Rich in the terminal, not a fake web probe</div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {surfaces.map((surface) => (
                            <div
                                key={surface.title}
                                className={`rounded-2xl border p-6 ${isDark ? 'border-white/10 bg-zinc-950/70' : 'border-zinc-200 bg-white'}`}
                            >
                                <surface.icon size={22} className="text-cyan-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{surface.title}</h3>
                                <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{surface.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers size={20} className="text-cyan-400" />
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Surface Gallery
                        </h2>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
                        <div className={`rounded-[2rem] overflow-hidden border ${isDark ? 'border-cyan-500/20 bg-zinc-950' : 'border-zinc-200 bg-white'} shadow-xl`}>
                            <img
                                src="/images/cognitive-dashboard-live.png"
                                alt="Cognitive Dashboard in the browser shell"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className={`rounded-[2rem] overflow-hidden border ${isDark ? 'border-cyan-500/20 bg-zinc-950' : 'border-zinc-200 bg-white'} shadow-xl`}>
                            <img
                                src="/images/dashboards-dual-view.png"
                                alt="Cognitive Dashboard and System Map side by side"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                    <p className={`mt-4 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        The desktop family is now represented as a coherent set: cockpit, topology view, profile overlays,
                        and the intelligence feed lane that can drive ranked cards.
                    </p>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Eye size={20} className="text-cyan-400" />
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Desktop Profiles
                        </h2>
                    </div>
                    <p className={`max-w-3xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        MirrorDash on the desktop is now part of the product story. Instead of one overloaded dashboard,
                        different operators get a layout that fits the work in front of them.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {profileCards.map((profile) => (
                            <div
                                key={profile.name}
                                className={`rounded-2xl border p-6 ${isDark ? 'border-white/10 bg-zinc-950/70' : 'border-zinc-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                                        <GitBranch size={18} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{profile.name}</h3>
                                        <div className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{profile.command}</div>
                                    </div>
                                </div>
                                <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{profile.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 size={20} className="text-cyan-400" />
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                External Intelligence Lane
                            </h2>
                        </div>
                        <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            The desktop `Dashboard_Intelligence_Review` pack gave the missing shape for external feeds. The
                            dashboard should not swallow raw feed noise; it should translate outside events into ranked operator cards.
                        </p>
                        <div className="space-y-3">
                            {monitorCoverage.map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border p-6 ${isDark ? 'border-white/10 bg-zinc-950/70' : 'border-zinc-200 bg-white'}`}>
                        <div className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                            Signal translation pipeline
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {intelligenceStages.map((stage, index) => (
                                <div
                                    key={stage}
                                    className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-zinc-200 bg-zinc-50'}`}
                                >
                                    <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                        0{index + 1}
                                    </div>
                                    <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{stage}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Cpu size={20} className="text-cyan-400" />
                        <Database size={20} className="text-emerald-400" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        From dashboard page to operator system
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        The page now reflects what exists on the desktop: not a single screenshot and a fake status box,
                        but a dashboard family with profile views and a real intelligence ingestion story.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrordna-dashboards"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                        >
                            <Github size={18} />
                            Core Repo
                        </a>
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrordash"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${
                                isDark ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10' : 'border-cyan-300 text-cyan-700 hover:bg-cyan-50'
                            }`}
                        >
                            <Github size={18} />
                            MirrorDash Repo
                        </a>
                        <Link
                            to="/ecosystem"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                            }`}
                        >
                            Explore Ecosystem
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
