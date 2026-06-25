import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    Blocks,
    CheckCircle2,
    FileText,
    Fingerprint,
    Landmark,
    Layers3,
    MonitorSmartphone,
    PanelsTopLeft,
    PlayCircle,
    ShieldCheck,
    Sparkles,
    Store,
    Workflow,
} from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';
import {
    chetanaChecks,
    docsTrustTiles,
    platformLayers,
    platformVerbs,
    proofCards,
    trustChips,
    useCases,
} from '../lib/flagshipContent';
import pulseData from '../data/pulse.json';

const accents = {
    blue: {
        border: 'border-[#d7e4ff]',
        bg: 'bg-[#eef5ff]',
        soft: 'bg-[#f6faff]',
        text: 'text-[#2855d9]',
        chip: 'bg-[#eff5ff] text-[#2855d9] border-[#d7e4ff]',
    },
    green: {
        border: 'border-[#d9eee6]',
        bg: 'bg-[#eef9f4]',
        soft: 'bg-[#f6fbf9]',
        text: 'text-[#1c7b5b]',
        chip: 'bg-[#eef9f4] text-[#1c7b5b] border-[#d9eee6]',
    },
    amber: {
        border: 'border-[#f1e2c8]',
        bg: 'bg-[#fcf6ea]',
        soft: 'bg-[#fdf9f1]',
        text: 'text-[#9a6121]',
        chip: 'bg-[#fcf6ea] text-[#9a6121] border-[#f1e2c8]',
    },
    red: {
        border: 'border-[#f2d8d4]',
        bg: 'bg-[#fdf1ef]',
        soft: 'bg-[#fff8f7]',
        text: 'text-[#b54c3f]',
        chip: 'bg-[#fdf1ef] text-[#b54c3f] border-[#f2d8d4]',
    },
};

const proofIcons = [CheckCircle2, Workflow, Fingerprint, ShieldCheck];
const useCaseIcons = [Sparkles, Store, Landmark];
const graphCenter = { x: 170, y: 132 };
const graphForegroundNodes = Array.from({ length: 112 }, (_, index) => {
    const angle = (index / 112) * Math.PI * 2;
    const radius = 46 + (index % 9) * 14 + (Math.floor(index / 9) % 2) * 9;
    return {
        x: graphCenter.x + Math.cos(angle) * radius,
        y: graphCenter.y + Math.sin(angle) * radius,
        r: index % 8 === 0 ? 3.6 : 2.3,
        o: index % 5 === 0 ? 0.95 : 0.78,
    };
});
const graphBackgroundNodes = Array.from({ length: 88 }, (_, index) => ({
    x: 18 + ((index * 47) % 470),
    y: 16 + ((index * 61) % 228),
    r: index % 10 === 0 ? 5.8 : index % 3 === 0 ? 3.2 : 2.4,
    c: index % 4 === 0 ? '#2f8d63' : index % 3 === 0 ? '#2f5fb3' : '#2f8d63',
    o: index % 6 === 0 ? 0.8 : 0.55,
}));
const graphMeshLines = Array.from({ length: 18 }, (_, index) => {
    const start = graphBackgroundNodes[index * 3];
    const end = graphBackgroundNodes[(index * 3 + 19) % graphBackgroundNodes.length];
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
});
const demoProofCards = [
    {
        title: 'Hands-free factory run',
        eyebrow: 'Desktop',
        body: 'A recorded factory pass coordinating sessions, next loops, and operator state without hidden clicks in the middle of the run.',
        src: '/videos/factory-demo.mp4',
        poster: '/images/home/factory-demo-poster.jpg',
        duration: '1m 42s',
        accent: 'blue',
        icon: PlayCircle,
        bullets: ['Hands-free run', 'Live dashboard visible', 'Next loops and receipts stay on screen'],
        className: 'lg:row-span-2',
        frameClassName: 'aspect-[16/10]',
    },
    {
        title: 'Phone to Mac continuity',
        eyebrow: 'Cross-device',
        body: 'The phone surface keeps the same route and state so work can resume instead of restarting from zero.',
        src: '/videos/mobile-continuity-demo.mp4',
        poster: '/images/home/mobile-continuity-poster.jpg',
        duration: '26s',
        accent: 'green',
        icon: MonitorSmartphone,
        bullets: ['Continue where you left off', 'Mirror, Claude, and Codex stay visible', 'State survives device handoff'],
        frameClassName: 'aspect-[9/16] max-h-[31rem]',
    },
];
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@ActiveMirror-1';

function ToneCard({ tone = 'blue', className = '', children }) {
    return (
        <div className={`rounded-[28px] border ${accents[tone].border} bg-white shadow-[0_24px_80px_rgba(13,21,34,0.06)] ${className}`}>
            {children}
        </div>
    );
}

function CTA({ href, children, external = false, kind = 'primary', className = '' }) {
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

function VisualList({ lines, tone = 'blue' }) {
    return (
        <div className={`rounded-[24px] border p-5 ${accents[tone].border} ${accents[tone].soft}`}>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${accents[tone].text}`}>
                Proof surface
            </div>
            <div className="mt-4 space-y-3">
                {lines.map((line) => (
                    <div key={line} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-3 text-sm text-[#263247]">
                        <span className={`h-2.5 w-2.5 rounded-full ${accents[tone].bg}`} />
                        <span>{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MetricLabel({ label, value }) {
    return (
        <div className="rounded-2xl border border-[#dde3eb] bg-white px-3 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c8795]">{label}</div>
            <div className="mt-1 text-sm font-semibold text-[#152033]">{value}</div>
        </div>
    );
}

function metricPercent(metric) {
    if (!metric || typeof metric.value !== 'number') return 0;

    if (metric.unit === 'fraction') {
        return Math.max(0, Math.min(100, Math.round(metric.value * 100)));
    }

    return Math.max(0, Math.min(100, Math.round(metric.value)));
}

function metricValue(metric) {
    if (!metric || typeof metric.value !== 'number') return '—';
    if (metric.unit === 'fraction') return metric.detail || `${Math.round(metric.value * 100)}%`;
    return metric.unit ? `${metric.value} ${metric.unit}` : String(metric.value);
}

function metricTone(metric) {
    if (!metric) return 'bg-[#d7e4ff]';
    const grade = String(metric.grade || '').toLowerCase();

    if (grade.includes('good') || grade.includes('fast')) return 'bg-[#78d6b6]';
    if (grade.includes('watch') || grade.includes('drift') || grade.includes('high')) return 'bg-[#f4c177]';
    return 'bg-[#9ac3ff]';
}

function RadialGraphSurface() {
    return (
        <div className="overflow-hidden rounded-[28px] border border-[#27324d] bg-[radial-gradient(circle_at_50%_45%,rgba(91,82,239,0.18),rgba(5,10,22,0.96)_55%,rgba(4,8,18,1)_100%)] p-4 text-white shadow-[0_28px_80px_rgba(7,12,28,0.36)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9eabcb]">Live graph view</div>
                    <div className="mt-1 text-sm text-[#d7e0f6]">Relationship map across trust, memory, and control routes.</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9eabcb]">
                    MirrorGraph
                </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,16,34,0.96),rgba(3,7,18,1))]">
                <svg viewBox="0 0 520 264" className="h-[264px] w-full">
                    <defs>
                        <radialGradient id="graphCoreGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(140,128,255,0.95)" />
                            <stop offset="40%" stopColor="rgba(120,110,255,0.45)" />
                            <stop offset="100%" stopColor="rgba(120,110,255,0)" />
                        </radialGradient>
                    </defs>

                    <rect x="0" y="0" width="520" height="264" fill="transparent" />

                    {graphMeshLines.map((line, index) => (
                        <line
                            key={`mesh-${index}`}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke="rgba(86, 110, 182, 0.12)"
                            strokeWidth="0.8"
                        />
                    ))}

                    {graphBackgroundNodes.map((node, index) => (
                        <circle
                            key={`bg-${index}`}
                            cx={node.x}
                            cy={node.y}
                            r={node.r}
                            fill={node.c}
                            opacity={node.o}
                        />
                    ))}

                    {graphForegroundNodes.map((node, index) => (
                        <g key={`fg-${index}`}>
                            <line
                                x1={graphCenter.x}
                                y1={graphCenter.y}
                                x2={node.x}
                                y2={node.y}
                                stroke="rgba(150, 132, 255, 0.72)"
                                strokeWidth={index % 7 === 0 ? '1.4' : '1'}
                            />
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={node.r}
                                fill="rgba(148, 132, 255, 0.95)"
                                opacity={node.o}
                            />
                        </g>
                    ))}

                    <circle cx={graphCenter.x} cy={graphCenter.y} r="78" fill="url(#graphCoreGlow)" />
                    <circle cx={graphCenter.x} cy={graphCenter.y} r="14" fill="rgba(132,119,255,0.95)" stroke="rgba(228,232,255,0.35)" />
                    <text x={graphCenter.x} y={graphCenter.y + 46} textAnchor="middle" fill="rgba(240,243,255,0.95)" fontSize="17" fontWeight="600">
                        Active Mirror
                    </text>
                    <text x={graphCenter.x} y={graphCenter.y + 66} textAnchor="middle" fill="rgba(160,174,206,0.95)" fontSize="11" letterSpacing="2">
                        TRUST • MEMORY • CONTROL
                    </text>
                </svg>

                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8391b3]">
                    <span>Indexing trust routes</span>
                    <span>Live</span>
                </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-[#c0cae5] sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                    <span className="font-semibold text-white">Center:</span> Active Mirror and the main trust surface.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                    <span className="font-semibold text-white">Purple nodes:</span> governed routes, memory links, and proof paths.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                    <span className="font-semibold text-white">Green nodes:</span> live inputs, entities, and surrounding network activity.
                </div>
            </div>
        </div>
    );
}

function DemoVideoCard({ card }) {
    const Icon = card.icon;

    return (
        <ToneCard tone={card.accent} className={`overflow-hidden p-4 sm:p-5 ${card.className || ''}`}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${accents[card.accent].text}`}>
                        {card.eyebrow}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{card.title}</h3>
                </div>
                <div className={`inline-flex rounded-2xl border p-3 ${accents[card.accent].border} ${accents[card.accent].bg}`}>
                    <Icon size={20} className={accents[card.accent].text} />
                </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{card.body}</p>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#dfe6ee] bg-[#0a1020]">
                <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={card.poster}
                    className={`w-full object-cover ${card.frameClassName || 'aspect-video'}`}
                >
                    <source src={card.src} type="video/mp4" />
                </video>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#5b6776]">
                <span className="rounded-full border border-[#d8dfe7] bg-white px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[#4f6787]">
                    {card.duration}
                </span>
                <span>Recorded proof clip</span>
            </div>

            <div className="mt-4 grid gap-2">
                {card.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-3 text-sm text-[#364255]">
                        {bullet}
                    </div>
                ))}
            </div>
        </ToneCard>
    );
}

export default function Home() {
    const [governance, setGovernance] = useState(null);
    const systemPulse = pulseData.alive ? pulseData.uptime_label : 'Needs review';
    const domainPulse = pulseData.domains_up ? 'Domains healthy' : 'Domains degraded';
    const openLoops = typeof pulseData.open_loops === 'number' ? pulseData.open_loops : '—';

    useEffect(() => {
        let active = true;

        fetch('/governance-metrics.json')
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (active && data) setGovernance(data);
            })
            .catch(() => {
                if (active) setGovernance(null);
            });

        return () => {
            active = false;
        };
    }, []);

    const governanceCards = governance?.metrics
        ? [
            ['Integrity', governance.metrics.integrity_index],
            ['Drift', governance.metrics.drift_coefficient],
            ['Recurrence', governance.metrics.recurrence_rate],
            ['Verification', governance.metrics.verification_ratio],
        ]
        : [];

    return (
        <SiteShell>
            <SectionShell className="pb-10 pt-10 sm:pt-16">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap gap-2">
                            {trustChips.slice(0, 3).map((chip) => (
                                <span key={chip} className="rounded-full border border-[#d8dfe7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5a6778]">
                                    {chip}
                                </span>
                            ))}
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="mt-8 max-w-[12ch] text-5xl font-semibold tracking-[-0.07em] text-[#0d1522] sm:text-6xl lg:text-7xl"
                        >
                            Chetana is the front door. Governed AI sits behind it.
                        </motion.h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b6776]">
                            Start with Chetana to check suspicious payment screenshots, QR and UPI requests, links,
                            and messages. Active Mirror is the proof, memory, and control layer behind that public
                            trust surface for teams and regulated deployments.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <CTA href="https://chetana.activemirror.ai" external>
                                Try Chetana
                                <ArrowRight size={16} />
                            </CTA>
                            <CTA href="/pricing" kind="secondary">
                                For teams and regulated orgs
                            </CTA>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5b6776]">
                            <span>Need architecture or control details?</span>
                            <Link to="/platform" className="inline-flex items-center gap-1 font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                See the Platform
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <MetricLabel label="For people" value="Scam and trust checks" />
                            <MetricLabel label="For teams" value="Governed AI workflows" />
                            <MetricLabel label="For regulated use" value="Self-hosted and reviewable" />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.05 }}
                        className="relative"
                    >
                        <ToneCard tone="blue" className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,252,0.98))] p-6 sm:p-7">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <ToneCard tone="amber" className="bg-[#fffaf3] p-5 shadow-none">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6121]">
                                            Chetana verdict
                                        </div>
                                        <span className="rounded-full bg-[#fff2df] px-2.5 py-1 text-[11px] font-semibold text-[#9a6121]">
                                            Needs verification
                                        </span>
                                    </div>
                                    <div className="mt-4 text-lg font-semibold tracking-[-0.04em] text-[#152033]">
                                        QR request shows urgency + collection pattern.
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm text-[#5b6776]">
                                        <div>Why flagged: payout pressure, inconsistent merchant identity, pre-pay request.</div>
                                        <div>Next move: verify merchant and do not pay from the shared screenshot alone.</div>
                                    </div>
                                </ToneCard>

                                <VisualList
                                    tone="green"
                                    lines={['Input checked', 'Signals gathered', 'Reason trace written', 'Action route surfaced']}
                                />

                                <ToneCard tone="blue" className="bg-[#f7fbff] p-5 shadow-none">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2855d9]">
                                        Memory / recall
                                    </div>
                                    <div className="mt-4 grid gap-3">
                                        <div className="rounded-2xl border border-[#d7e4ff] bg-white p-4">
                                            <div className="text-xs uppercase tracking-[0.2em] text-[#7c8795]">Signature</div>
                                            <div className="mt-1 text-sm font-semibold text-[#152033]">Persistent identity route</div>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7e4ff] bg-white p-4">
                                            <div className="text-xs uppercase tracking-[0.2em] text-[#7c8795]">Continuity</div>
                                            <div className="mt-1 text-sm font-semibold text-[#152033]">Prior state stays visible instead of disposable.</div>
                                        </div>
                                    </div>
                                </ToneCard>

                                <ToneCard tone="green" className="bg-[#f7fbf9] p-5 shadow-none">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1c7b5b]">
                                            Live utility strip
                                        </div>
                                        <span className="rounded-full bg-[#ebf8f3] px-2.5 py-1 text-[11px] font-semibold text-[#1c7b5b]">
                                            {systemPulse}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                        <div className="rounded-2xl border border-[#d9eee6] bg-white p-3">
                                            <div className="text-[11px] uppercase tracking-[0.2em] text-[#7c8795]">Radar</div>
                                            <div className="mt-1 font-semibold text-[#152033]">Scam alert</div>
                                        </div>
                                        <div className="rounded-2xl border border-[#d9eee6] bg-white p-3">
                                            <div className="text-[11px] uppercase tracking-[0.2em] text-[#7c8795]">Ops</div>
                                            <div className="mt-1 font-semibold text-[#152033]">{domainPulse}</div>
                                        </div>
                                        <div className="rounded-2xl border border-[#d9eee6] bg-white p-3">
                                            <div className="text-[11px] uppercase tracking-[0.2em] text-[#7c8795]">Open loops</div>
                                            <div className="mt-1 font-semibold text-[#152033]">{openLoops}</div>
                                        </div>
                                    </div>
                                </ToneCard>
                            </div>
                        </ToneCard>
                    </motion.div>
                </div>
            </SectionShell>

            <SectionShell className="py-6">
                <div className="grid gap-3 rounded-[28px] border border-[#e4ddd3] bg-white/80 p-4 shadow-[0_20px_60px_rgba(13,21,34,0.04)] sm:grid-cols-[1.35fr_0.9fr_0.75fr_auto] sm:items-center">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a652c]">Latest scam alert</div>
                        <div className="mt-1 text-sm text-[#263247]">Fake payment screenshots paired with urgency language remain a common trust failure.</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f6787]">System pulse</div>
                        <div className="mt-1 text-sm text-[#263247]">{systemPulse}</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f6787]">Operational signal</div>
                        <div className="mt-1 text-sm text-[#263247]">{domainPulse}</div>
                    </div>
                    <CTA href="/live" kind="secondary" className="justify-center">
                        Open Live Pulse
                    </CTA>
                </div>

                {governanceCards.length > 0 && (
                    <div className="mt-4 rounded-[28px] border border-[#e4ddd3] bg-white/85 p-5 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                            <RadialGraphSurface />

                            <div className="rounded-[24px] border border-[#ebeff4] bg-[#fbfcfd] p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="max-w-3xl">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f6787]">Governance snapshot</div>
                                        <div className="mt-2 text-sm text-[#263247]">
                                            {governance.interpretation || 'Live trust and governance signals from the current system.'}
                                        </div>
                                    </div>
                                    <Link to="/trust" className="inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                        See trust details
                                        <ArrowRight size={15} />
                                    </Link>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    {governanceCards.map(([label, metric]) => (
                                        <div key={label} className="rounded-[22px] border border-[#ebeff4] bg-white p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c8795]">{label}</div>
                                                <div className="text-xs font-semibold text-[#152033]">{metricValue(metric)}</div>
                                            </div>
                                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf2f7]">
                                                <div
                                                    className={`h-full rounded-full ${metricTone(metric)}`}
                                                    style={{ width: `${metricPercent(metric)}%` }}
                                                />
                                            </div>
                                            <div className="mt-3 text-xs text-[#6a7685]">
                                                Grade: <span className="font-semibold uppercase tracking-[0.14em] text-[#364255]">{metric.grade || 'live'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SectionShell>

            <SectionShell
                eyebrow="Watch it work"
                title="See the system run before you read the architecture."
                description="These are real captures from the system: the desktop factory running hands-free, the phone-to-Mac continuity route, and the operator dashboards that stay readable while work is in flight."
            >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <CTA href={YOUTUBE_CHANNEL_URL} external kind="secondary">
                        Watch build logs on YouTube
                        <ArrowUpRight size={16} />
                    </CTA>
                    <span className="text-sm text-[#5b6776]">
                        Longer runs, operator sessions, and build-in-public proof live there.
                    </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
                    <DemoVideoCard card={demoProofCards[0]} />

                    <div className="grid gap-5">
                        <DemoVideoCard card={demoProofCards[1]} />

                        <ToneCard tone="amber" className="p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6121]">
                                        Operator dashboards
                                    </div>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">State, services, and next steps in one glance.</h3>
                                </div>
                                <div className="inline-flex rounded-2xl border border-[#f1e2c8] bg-[#fcf6ea] p-3">
                                    <PanelsTopLeft size={20} className="text-[#9a6121]" />
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">
                                These are live operator surfaces, not design fiction. They expose services, fleet, open loops, vitals, and the active run state while work is still happening.
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="overflow-hidden rounded-[24px] border border-[#ebdcc4] bg-[#0a1020]">
                                    <img
                                        src="/images/home/operator-browser-dashboard.png"
                                        alt="Browser operator dashboard showing services, fleet, vitals, loops, and factory status."
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="overflow-hidden rounded-[24px] border border-[#ebdcc4] bg-[#0a1020]">
                                    <img
                                        src="/images/home/operator-tui-dashboard.png"
                                        alt="Terminal operator dashboard showing services, ports, memory bus, open loops, and next actions."
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2">
                                <div className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-3 text-sm text-[#364255]">
                                    Service health, fleet, and bus state stay visible while agents work.
                                </div>
                                <div className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-3 text-sm text-[#364255]">
                                    Operators can see what is live, what is blocked, what is next, and what still needs human review.
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <CTA href="/platform" kind="secondary">
                                    See the Platform
                                </CTA>
                                <CTA href={YOUTUBE_CHANNEL_URL} external kind="secondary">
                                    Watch more runs
                                    <ArrowUpRight size={16} />
                                </CTA>
                                <CTA href="/about/contact">
                                    Book a walkthrough
                                    <ArrowRight size={16} />
                                </CTA>
                            </div>
                        </ToneCard>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Chetana"
                title="Start with a check people understand instantly."
                description="Chetana helps people in India check suspicious links, UPI IDs, QR payment patterns, phone numbers, messages, and scam-like signals before they lose money."
            >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
                    <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {chetanaChecks.map((item) => (
                                <div key={item} className="rounded-[22px] border border-[#e6ded2] bg-white px-4 py-4 text-sm text-[#364255] shadow-[0_12px_30px_rgba(13,21,34,0.03)]">
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <CTA href="https://chetana.activemirror.ai" external>
                                Check a scam now
                                <ArrowUpRight size={16} />
                            </CTA>
                            <CTA href="/chetana#for-merchants" kind="secondary">
                                For merchants
                            </CTA>
                        </div>
                    </div>

                    <ToneCard tone="amber" className="mx-auto max-w-[26rem] p-4 sm:p-5">
                        <div className="rounded-[32px] border border-[#ebdcc4] bg-[#132033] p-4 text-white shadow-[0_28px_80px_rgba(19,32,51,0.22)]">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#9fb1c7]">
                                <span>Chetana</span>
                                <span className="rounded-full bg-[#1e8d6b] px-2.5 py-1 text-white">Reviewing</span>
                            </div>
                            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#8ea4bf]">Incoming prompt</div>
                                <div className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-[#e7eef8]">
                                    “Merchant sent a QR code and a screenshot saying payment must happen in 2 minutes.”
                                </div>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-[#255b69] bg-[#0f2231] p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs uppercase tracking-[0.22em] text-[#9ed6df]">Verdict</div>
                                    <div className="rounded-full bg-[#163e49] px-2.5 py-1 text-[11px] font-semibold text-[#9ed6df]">
                                        Verify before paying
                                    </div>
                                </div>
                                <div className="mt-3 text-2xl font-semibold tracking-[-0.05em]">Likely collection pattern</div>
                                <div className="mt-4 space-y-3 text-sm text-[#c6d8e6]">
                                    <div>Why flagged: urgency language, image-only proof, and collection behavior around QR/UPI.</div>
                                    <div>Next action: confirm the merchant through an independent channel before sending payment.</div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#dfe8f3]">Signal trace</div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#dfe8f3]">Reason shown</div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#dfe8f3]">Next step given</div>
                            </div>
                        </div>
                    </ToneCard>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="How it works"
                title="Three verbs explain the platform."
                description="The public product stays simple, but the stack beneath it is organized around verification, continuity, and control."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {platformVerbs.map((verb) => (
                        <ToneCard key={verb.key} tone={verb.accent} className="p-6">
                            <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${accents[verb.accent].text}`}>
                                {verb.title}
                            </div>
                            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{verb.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{verb.body}</p>

                            <div className="mt-5">
                                <VisualList tone={verb.accent} lines={verb.visualLines} />
                            </div>

                            <Link to={verb.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                {verb.cta}
                                <ArrowRight size={15} />
                            </Link>
                        </ToneCard>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="How it fits together"
                title="Start with Chetana. Add memory, review, and control when the work gets more serious."
                description="Chetana is the public check. The rest of Active Mirror helps teams remember context, review risky decisions, and control what the system can do."
            >
                <div className="rounded-[32px] border border-[#e7dfd4] bg-white p-5 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                    <div className="grid gap-4">
                        {platformLayers.map((layer, index) => (
                            <div
                                key={layer.title}
                                className="grid gap-4 rounded-[24px] border px-5 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]"
                                style={{ borderColor: ['#d7e4ff', '#d9eee6', '#f1e2c8', '#f2d8d4'][index], backgroundColor: ['#f7fbff', '#f7fbf9', '#fdf9f1', '#fff8f7'][index] }}
                            >
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">Layer {index + 1}</div>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{layer.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#5b6776]">{layer.body}</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {layer.items.map((item) => (
                                        <div key={item} className="rounded-[20px] border border-white/70 bg-white/90 px-4 py-4 text-sm font-medium text-[#263247]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Proof"
                title="Proof, not just promises."
                description="Trust comes from visible artifacts: evidence traces, memory conflict handling, rule firings, and explanations that name the next move."
            >
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                    {proofCards.map((card, index) => {
                        const Icon = proofIcons[index];
                        return (
                            <ToneCard key={card.title} tone={card.accent} className="p-6">
                                <div className={`inline-flex rounded-2xl border p-3 ${accents[card.accent].border} ${accents[card.accent].bg}`}>
                                    <Icon size={20} className={accents[card.accent].text} />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{card.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#5b6776]">{card.body}</p>
                                <div className="mt-5 space-y-3">
                                    {card.lines.map((line) => (
                                        <div key={line} className="rounded-2xl border border-[#e7dfd4] bg-[#fbfaf7] px-4 py-3 text-sm text-[#364255]">
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            </ToneCard>
                        );
                    })}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Use cases"
                title="Three clear routes into Active Mirror."
                description="The same system can serve a quick public check, a safer operational workflow, or a regulated environment with tighter controls."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {useCases.map((useCase, index) => {
                        const Icon = useCaseIcons[index];
                        return (
                            <ToneCard key={useCase.title} tone={index === 0 ? 'blue' : index === 1 ? 'green' : 'amber'} className="p-6">
                                <div className="inline-flex rounded-2xl border border-[#e7dfd4] bg-white p-3">
                                    <Icon size={20} className="text-[#152033]" />
                                </div>
                                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{useCase.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#5b6776]">{useCase.summary}</p>
                                <Link to={useCase.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                    Explore route
                                    <ArrowRight size={15} />
                                </Link>
                            </ToneCard>
                        );
                    })}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Next steps"
                title="Trust, docs, self-hosting, API, and pricing stay one click away."
                description="Start with the route that fits your need. The deeper operating material stays accessible without taking over the first screen."
            >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                    {docsTrustTiles.map((tile) => (
                        <ToneCard key={tile.title} className="p-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">{tile.title}</div>
                            <p className="mt-4 text-sm leading-7 text-[#5b6776]">{tile.body}</p>
                            <Link to={tile.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                Open
                                <ArrowRight size={15} />
                            </Link>
                        </ToneCard>
                    ))}
                </div>
            </SectionShell>

            <SectionShell className="pt-4">
                <ToneCard tone="blue" className="overflow-hidden bg-[linear-gradient(135deg,#132033,#213a61)] px-6 py-8 text-white sm:px-8 sm:py-10">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7c8de]">Final CTA</div>
                            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                                Start with Chetana first, then step up to team, self-hosted, and regulated deployments.
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d3deec] sm:text-base">
                                Chetana should be the obvious entry point. The deeper Active Mirror stack should be ready the moment the work becomes more serious.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <CTA href="https://chetana.activemirror.ai" external className="bg-white text-[#132033] hover:bg-[#eef2f6]">
                                Try Chetana
                                <ArrowUpRight size={16} />
                            </CTA>
                            <CTA href="/about/contact" kind="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                                Talk about deployment
                            </CTA>
                        </div>
                    </div>
                </ToneCard>
            </SectionShell>
        </SiteShell>
    );
}
