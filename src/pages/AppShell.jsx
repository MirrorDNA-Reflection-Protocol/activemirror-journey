import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Command,
    ExternalLink,
    Fingerprint,
    Radio,
    Search,
    Sparkles,
    Workflow,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { getMirrorMode, getState, hasBrainScan, hasIntake } from '../lib/mirror-state';
import pulseData from '../data/pulse.json';
import { getMirrorBrainPalette, glyphChapters, glyphs } from '../lib/glyph-system';

const APP_STATE_KEY = 'activemirror.app.v1';
const APP_RECENTS_KEY = 'activemirror.app.recents.v1';

const panes = [
    { key: 'pulse', label: 'Pulse', glyph: glyphs.truth, colorKey: 'glyphTruth', icon: Radio, copy: 'Trust visible in seconds.' },
    { key: 'atlas', label: 'Atlas', glyph: glyphs.synthesis, colorKey: 'glyphSynthesis', icon: Workflow, copy: 'Move through the ecosystem by route.' },
    { key: 'memory', label: 'Memory', glyph: glyphs.pattern, colorKey: 'glyphPattern', icon: Fingerprint, copy: 'Carry state and continuity.' },
    { key: 'proof', label: 'Proof', glyph: glyphs.truth, colorKey: 'glyphTruth', icon: CheckCircle2, copy: 'Inspect the evidence layer.' },
    { key: 'actions', label: 'Actions', glyph: glyphs.decision, colorKey: 'glyphDecision', icon: Sparkles, copy: 'Launch the next move directly.' },
];

const operatorSurfaces = [
    {
        key: 'mobile',
        title: 'MirrorBrain Mobile',
        eyebrow: 'Pocket pulse',
        src: '/images/home/operator-floating-dashboard.png',
        colorKey: 'glyphTruth',
        copy: 'A compact pulse surface with trust state, runs, evidence, and device actions.',
        detail: 'This is the calm handheld version of the same system grammar: glass, glyphs, and visible state.',
    },
    {
        key: 'browser',
        title: 'Browser control room',
        eyebrow: 'Wide workspace',
        src: '/images/home/operator-browser-dashboard.png',
        colorKey: 'glyphSynthesis',
        copy: 'The browser layer opens the system into a two-pane control room without losing the mobile DNA.',
        detail: 'It keeps the soft glass and glyph grammar, but stretches into a workspace for orientation and action.',
    },
    {
        key: 'tui',
        title: 'Cognitive dashboard',
        eyebrow: 'Operator view',
        src: '/images/home/operator-tui-dashboard.png',
        colorKey: 'glyphDecision',
        copy: 'The terminal-native layer shows loops, fleet, telemetry, and current work as raw signal.',
        detail: 'This is the dense operator mode: less brochure, more machine room.',
    },
];

const atlasNodes = [
    {
        key: 'mirrorgate',
        title: 'MirrorGate',
        eyebrow: 'Governance',
        description: 'Pre-action policy and approval logic before execution.',
        href: '/products/mirrorgate',
        colorKey: 'glyphTruth',
        x: 18,
        y: 24,
        takeaway: 'Why it matters',
        value: 'Named control organ',
    },
    {
        key: 'architecture',
        title: 'Architecture',
        eyebrow: 'Proof',
        description: 'The blueprint for governance, continuity, orchestration, and public utility.',
        href: '/docs/architecture',
        colorKey: 'glyphSynthesis',
        x: 50,
        y: 12,
        takeaway: 'Best first route',
        value: 'System map before details',
    },
    {
        key: 'brainscan',
        title: 'BrainScan',
        eyebrow: 'Onboarding',
        description: 'A guided entry that makes the system personal instead of distant.',
        href: '/start',
        colorKey: 'glyphPattern',
        x: 82,
        y: 24,
        takeaway: 'What it does',
        value: 'Creates local signature',
    },
    {
        key: 'chetana',
        title: 'Chetana',
        eyebrow: 'Utility',
        description: 'Immediate public help: a live route for scam and trust checking.',
        href: 'https://chetana.activemirror.ai',
        external: true,
        colorKey: 'glyphDecision',
        x: 18,
        y: 76,
        takeaway: 'Fastest value',
        value: 'Real utility in minutes',
    },
    {
        key: 'mirrorrecall',
        title: 'MirrorRecall',
        eyebrow: 'Continuity',
        description: 'Persistent state and identity across sessions, tools, and model changes.',
        href: '/products/mirrorrecall',
        colorKey: 'glyphPattern',
        x: 50,
        y: 86,
        takeaway: 'What it proves',
        value: 'Memory is an organ, not a prompt',
    },
    {
        key: 'research',
        title: 'Research',
        eyebrow: 'Methods',
        description: 'The written layer beneath the products: named methods, protocols, and artifacts.',
        href: '/research',
        colorKey: 'glyphDecision',
        x: 82,
        y: 76,
        takeaway: 'For evaluators',
        value: 'Methods under the surface',
    },
];

const proofRoutes = [
    {
        title: 'Trust center',
        href: '/trust',
        glyph: glyphs.truth,
        colorKey: 'glyphTruth',
        eyebrow: 'Trust',
        copy: 'How verification, consent, proof, and trust policy work.',
    },
    {
        title: 'Builds ledger',
        href: '/builds',
        glyph: glyphs.decision,
        colorKey: 'glyphDecision',
        eyebrow: 'Builds',
        copy: 'A running ledger of shipped capability and visible product progress.',
    },
    {
        title: 'Live Pulse',
        href: '/live',
        glyph: glyphs.synthesis,
        colorKey: 'glyphSynthesis',
        eyebrow: 'Runtime',
        copy: 'Current heartbeat from the local body and active services.',
    },
    {
        title: 'Research',
        href: '/research',
        glyph: glyphs.pattern,
        colorKey: 'glyphPattern',
        eyebrow: 'Methods',
        copy: 'Papers, ideas, and the method layer below the products.',
    },
];

const actionGroups = [
    {
        title: 'Use',
        colorKey: 'glyphDecision',
        routes: [
            { title: 'Run BrainScan', href: '/start', glyph: glyphs.pattern, colorKey: 'glyphPattern', copy: 'Create your local signature.' },
            { title: 'Use Chetana', href: 'https://chetana.activemirror.ai', external: true, glyph: glyphs.decision, colorKey: 'glyphDecision', copy: 'Open the public trust tool.' },
        ],
    },
    {
        title: 'Inspect',
        colorKey: 'glyphTruth',
        routes: [
            { title: 'Inspect architecture', href: '/docs/architecture', glyph: glyphs.truth, colorKey: 'glyphTruth', copy: 'Open the proof route.' },
            { title: 'Read research', href: '/research', glyph: glyphs.synthesis, colorKey: 'glyphSynthesis', copy: 'Go deeper into methods.' },
        ],
    },
    {
        title: 'Configure',
        colorKey: 'glyphPattern',
        routes: [
            { title: 'Open setup', href: '/setup', glyph: glyphs.pattern, colorKey: 'glyphPattern', copy: 'Turn the signature into a configured mirror.' },
            { title: 'Meet twins', href: '/twins', glyph: glyphs.truth, colorKey: 'glyphTruth', copy: 'See the twin surfaces and companion layer.' },
        ],
    },
];

function readLocal(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function readPaneFromLocation() {
    if (typeof window === 'undefined') return null;
    try {
        const params = new URLSearchParams(window.location.search);
        const pane = params.get('pane');
        return panes.some((candidate) => candidate.key === pane) ? pane : null;
    } catch {
        return null;
    }
}

function formatPercent(value) {
    return typeof value === 'number' ? `${value}%` : '—';
}

function formatValue(value) {
    return typeof value === 'number' ? String(value) : value || '—';
}

function formatTimestamp(value) {
    if (!value) return 'No sync yet';
    try {
        return new Date(value).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function GlassPanel({ children, className = '', style = {} }) {
    return (
        <div
            className={`rounded-[28px] border shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}

function SectionLabel({ glyph, label, color }) {
    return (
        <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color }}>
            {glyph} {label}
        </div>
    );
}

function MetricCell({ label, value, color, palette }) {
    return (
        <div
            className="rounded-[18px] border px-4 py-4"
            style={{
                borderColor: palette.border,
                background: palette.surfaceMuted,
            }}
        >
            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color }}>
                {label}
            </div>
            <div className="mt-2 text-lg font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                {value}
            </div>
        </div>
    );
}

function RouteChip({ route, palette, onSelect }) {
    const color = palette[route.colorKey];
    return (
        <button
            type="button"
            onClick={() => onSelect(route)}
            className="w-full rounded-[22px] border px-4 py-4 text-left transition-transform hover:-translate-y-0.5"
            style={{
                borderColor: `${color}44`,
                background: `${color}12`,
            }}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color }}>
                        {route.eyebrow}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <span style={{ color }}>{route.glyph}</span>
                        <span>{route.title}</span>
                    </div>
                </div>
                {route.external ? <ExternalLink size={16} style={{ color }} /> : <ArrowRight size={16} style={{ color }} />}
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                {route.description || route.copy}
            </p>
        </button>
    );
}

export default function AppShell() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const palette = useMemo(() => getMirrorBrainPalette(theme), [theme]);
    const [activePane, setActivePane] = useState(() => readPaneFromLocation() || readLocal(APP_STATE_KEY, 'pulse'));
    const [commandOpen, setCommandOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [recentRoutes, setRecentRoutes] = useState(() => readLocal(APP_RECENTS_KEY, []));
    const [mirrorState, setMirrorState] = useState(() => getState());
    const [activeSurface, setActiveSurface] = useState(operatorSurfaces[0].key);
    const [activeAtlasNodeKey, setActiveAtlasNodeKey] = useState(atlasNodes[0].key);

    useEffect(() => {
        setMirrorState(getState());
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(activePane));
        const url = new URL(window.location.href);
        url.searchParams.set('pane', activePane);
        window.history.replaceState({}, '', url);
    }, [activePane]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(APP_RECENTS_KEY, JSON.stringify(recentRoutes));
    }, [recentRoutes]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setCommandOpen((prev) => !prev);
            }
            if (event.key === 'Escape') {
                setCommandOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const pulseSnapshot = pulseData || {};
    const servicesUp = pulseSnapshot.services?.up;
    const servicesDown = pulseSnapshot.services?.down;
    const online = pulseSnapshot.alive === true;
    const brainScanReady = hasBrainScan();
    const intakeReady = hasIntake();
    const welcomeName = mirrorState.archetypeName || 'No signature stored yet';
    const twinName = mirrorState.twinName || 'Unpaired';
    const mirrorMode = getMirrorMode();
    const snapshotTime = formatTimestamp(pulseSnapshot.timestamp);
    const activeSurfaceCard = operatorSurfaces.find((surface) => surface.key === activeSurface) || operatorSurfaces[0];
    const activeAtlasNode = atlasNodes.find((node) => node.key === activeAtlasNodeKey) || atlasNodes[0];
    const signalMetrics = [
        { label: 'Disk', value: formatPercent(pulseSnapshot.disk_pct), colorKey: 'glyphDecision' },
        { label: 'Memory', value: formatPercent(pulseSnapshot.memory_pct), colorKey: 'glyphPattern' },
        { label: 'Dirty', value: formatValue(pulseSnapshot.git?.dirty), colorKey: 'glyphTruth' },
        { label: 'Loops', value: formatValue(pulseSnapshot.open_loops), colorKey: 'glyphSynthesis' },
    ];

    const commandEntries = useMemo(() => ([
        ...panes.map((pane) => ({
            key: `pane-${pane.key}`,
            title: `Open ${pane.label}`,
            subtitle: pane.copy,
            type: 'pane',
            pane: pane.key,
            glyph: pane.glyph,
            colorKey: pane.colorKey,
        })),
        ...atlasNodes.map((route) => ({
            key: route.key,
            title: route.title,
            subtitle: route.description,
            type: route.external ? 'external' : 'route',
            href: route.href,
            external: route.external,
            glyph: glyphs[route.colorKey.replace('glyph', '').toLowerCase()] || glyphs.truth,
            colorKey: route.colorKey,
        })),
        ...proofRoutes.map((route) => ({
            key: `proof-${route.title}`,
            title: route.title,
            subtitle: route.copy,
            type: 'route',
            href: route.href,
            glyph: route.glyph,
            colorKey: route.colorKey,
        })),
    ]), []);

    const filteredCommands = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return commandEntries;
        return commandEntries.filter((entry) => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(trimmed));
    }, [commandEntries, query]);

    const registerRecent = (entry) => {
        setRecentRoutes((previous) => {
            const next = [
                {
                    title: entry.title,
                    glyph: entry.glyph,
                    href: entry.href || entry.pane,
                    at: new Date().toISOString(),
                },
                ...previous.filter((item) => item.title !== entry.title),
            ];
            return next.slice(0, 6);
        });
    };

    const runEntry = (entry) => {
        if (entry.type === 'pane') {
            setActivePane(entry.pane);
            registerRecent(entry);
            setCommandOpen(false);
            setQuery('');
            return;
        }

        if (entry.external) {
            window.open(entry.href, '_blank', 'noopener,noreferrer');
        } else {
            navigate(entry.href);
        }

        registerRecent(entry);
        setCommandOpen(false);
        setQuery('');
    };

    const renderPulsePane = () => (
        <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
                <GlassPanel
                    className="p-6"
                    style={{
                        borderColor: palette.border,
                        background: `linear-gradient(180deg, ${palette.chromeTop}, ${palette.chromeBottom})`,
                    }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <SectionLabel glyph={glyphs.truth} label="pulse" color={palette.glyphTruth} />
                            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em]" style={{ color: palette.textPrimary }}>
                                Trust visible before interaction.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: palette.textSecondary }}>
                                The browser app uses the same glyph grammar and glass language as MirrorBrain Mobile, but turns it into a wider workspace for orientation, proof, and action.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCommandOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
                            style={{
                                borderColor: `${palette.glyphSynthesis}44`,
                                color: palette.glyphSynthesis,
                                background: `${palette.glyphSynthesis}12`,
                            }}
                        >
                            <Command size={14} />
                            command
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: online ? palette.online : palette.error, boxShadow: `0 0 18px ${online ? palette.online : palette.error}` }} />
                                    <div className="text-xl font-medium tracking-tight" style={{ color: palette.textPrimary }}>
                                        Mirror Online
                                    </div>
                                </div>
                                <div
                                    className="rounded-[12px] border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                    style={{
                                        borderColor: `${online ? palette.online : palette.error}44`,
                                        background: `${online ? palette.online : palette.error}12`,
                                        color: online ? palette.online : palette.error,
                                    }}
                                >
                                    {online ? 'LIVE' : 'OFFLINE'}
                                </div>
                            </div>
                            <div className="mt-2 text-sm" style={{ color: palette.textSecondary }}>
                                {pulseSnapshot.uptime_label || 'Local runtime snapshot'}
                            </div>
                            <div className="mt-1 text-sm" style={{ color: palette.textMuted }}>
                                Snapshot {snapshotTime}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {signalMetrics.map((metric) => (
                                    <MetricCell
                                        key={metric.label}
                                        label={metric.label}
                                        value={metric.value}
                                        color={palette[metric.colorKey]}
                                        palette={palette}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.truth} label="signal" color={palette.glyphTruth} />
                            <div className="mt-4 space-y-3 text-sm" style={{ color: palette.textSecondary }}>
                                <div>Services: <span style={{ color: palette.textPrimary }}>{servicesUp ?? '—'} up</span> / <span style={{ color: palette.textPrimary }}>{servicesDown ?? '—'} down</span></div>
                                <div>Domains: <span style={{ color: palette.textPrimary }}>{pulseSnapshot.domains_up ? 'Up' : 'Check'}</span></div>
                                <div>Ships today: <span style={{ color: palette.textPrimary }}>{pulseSnapshot.ships_today ?? '—'}</span></div>
                                <div>Fact violations: <span style={{ color: palette.textPrimary }}>{pulseSnapshot.fact_violations ?? '—'}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                            { title: 'Open Chetana', copy: 'Use the public trust tool right now.', href: 'https://chetana.activemirror.ai', external: true, glyph: glyphs.decision, colorKey: 'glyphDecision' },
                            { title: 'Open Live Pulse', copy: 'See the runtime heartbeat page.', href: '/live', glyph: glyphs.synthesis, colorKey: 'glyphSynthesis' },
                        ].map((action) => {
                            const color = palette[action.colorKey];
                            return (
                                <button
                                    key={action.title}
                                    type="button"
                                    onClick={() => runEntry({
                                        title: action.title,
                                        href: action.href,
                                        external: action.external,
                                        type: action.external ? 'external' : 'route',
                                        glyph: action.glyph,
                                        colorKey: action.colorKey,
                                    })}
                                    className="rounded-[22px] border px-4 py-4 text-left transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: `${color}44`, background: `${color}12` }}
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                                        <span>{action.glyph}</span>
                                        {action.title}
                                    </div>
                                    <p className="mt-2 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                        {action.copy}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </GlassPanel>

                <GlassPanel
                    className="p-6"
                    style={{
                        borderColor: palette.border,
                        background: `${palette.surface}dd`,
                    }}
                >
                    <SectionLabel glyph={glyphs.pattern} label="continuity" color={palette.glyphPattern} />
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                        {welcomeName}
                    </div>
                    <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                        {brainScanReady
                            ? `Twin ${twinName}. Mirror ID ${mirrorState.mirrorId || 'pending'}. Use the app as a remembered route, not a blank landing page.`
                            : 'Run BrainScan to give the app a persistent sense of who is here.'}
                    </p>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-[18px] border px-4 py-4" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.glyphPattern }}>
                                {glyphs.pattern} state
                            </div>
                            <div className="mt-2 text-sm" style={{ color: palette.textPrimary }}>
                                BrainScan {brainScanReady ? 'complete' : 'not yet run'} · Intake {intakeReady ? 'configured' : 'not configured'}
                            </div>
                        </div>
                        <div className="rounded-[18px] border px-4 py-4" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.glyphTruth }}>
                                {glyphs.truth} mode
                            </div>
                            <div className="mt-2 text-sm" style={{ color: palette.textPrimary }}>
                                {mirrorMode || 'No mirror mode configured yet.'}
                            </div>
                        </div>
                        <div className="rounded-[18px] border px-4 py-4" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.glyphSynthesis }}>
                                {glyphs.synthesis} next move
                            </div>
                            <div className="mt-2 text-sm" style={{ color: palette.textPrimary }}>
                                {brainScanReady ? 'Open Setup or Atlas and route through the system from your current state.' : 'Take BrainScan first, then come back with a real signature.'}
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <GlassPanel
                    className="overflow-hidden p-5"
                    style={{
                        borderColor: palette.border,
                        background: `linear-gradient(180deg, ${palette.surface}ee, ${palette.surfaceMuted})`,
                    }}
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <SectionLabel glyph={glyphs.synthesis} label="surfaces" color={palette.glyphSynthesis} />
                            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                                One system, three visual intensities.
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: palette.textSecondary }}>
                                Mobile, browser, and operator modes should feel like the same organism changing shape, not three unrelated products.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {operatorSurfaces.map((surface) => {
                                const color = palette[surface.colorKey];
                                const active = surface.key === activeSurface;
                                return (
                                    <button
                                        key={surface.key}
                                        type="button"
                                        onClick={() => setActiveSurface(surface.key)}
                                        className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
                                        style={{
                                            borderColor: active ? `${color}66` : palette.border,
                                            background: active ? `${color}12` : `${palette.surfaceElevated}b8`,
                                            color: active ? color : palette.textSecondary,
                                        }}
                                    >
                                        {surface.eyebrow}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
                        <div className="overflow-hidden rounded-[24px] border p-3" style={{ borderColor: palette.border, background: `${palette.background}b5` }}>
                            <motion.img
                                key={activeSurfaceCard.key}
                                src={activeSurfaceCard.src}
                                alt={activeSurfaceCard.title}
                                initial={false}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                className="h-[24rem] w-full rounded-[20px] object-cover object-top"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceElevated}` }}>
                                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: palette[activeSurfaceCard.colorKey] }}>
                                    {activeSurfaceCard.eyebrow}
                                </div>
                                <div className="mt-3 text-2xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                                    {activeSurfaceCard.title}
                                </div>
                                <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                    {activeSurfaceCard.copy}
                                </p>
                                <p className="mt-3 text-sm leading-6" style={{ color: palette.textMuted }}>
                                    {activeSurfaceCard.detail}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[22px] border p-4" style={{ borderColor: palette.border, background: `${palette.surfaceElevated}` }}>
                                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.glyphTruth }}>
                                        {glyphs.truth} signature
                                    </div>
                                    <div className="mt-2 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                        The glyph system stays stable across surfaces so users learn one language instead of re-learning every page.
                                    </div>
                                </div>
                                <div className="rounded-[22px] border p-4" style={{ borderColor: palette.border, background: `${palette.surfaceElevated}` }}>
                                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette.glyphDecision }}>
                                        {glyphs.decision} device feel
                                    </div>
                                    <div className="mt-2 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                        The browser app is wide, but it still feels like it could fold down into a phone surface without losing its grammar.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassPanel>

                <GlassPanel
                    className="p-5"
                    style={{
                        borderColor: palette.border,
                        background: `${palette.surface}dd`,
                    }}
                >
                    <SectionLabel glyph={glyphs.decision} label="return loops" color={palette.glyphDecision} />
                    <div className="mt-4 space-y-3">
                        {[
                            'Open Pulse to verify state before acting.',
                            'Use Atlas when you know the intent but not the route.',
                            'Use Proof when you need sources, not atmosphere.',
                            'Use Actions when you already know the destination.',
                        ].map((line) => (
                            <div key={line} className="rounded-[18px] border px-4 py-4 text-sm leading-6" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}`, color: palette.textSecondary }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );

    const renderAtlasPane = () => (
        <div className="space-y-4">
            <GlassPanel
                className="p-6"
                style={{
                    borderColor: palette.border,
                    background: `linear-gradient(180deg, ${palette.chromeTop}, ${palette.chromeBottom})`,
                }}
            >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <SectionLabel glyph={glyphs.synthesis} label="atlas" color={palette.glyphSynthesis} />
                        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                            Route through the ecosystem by organ, not by menu sprawl.
                        </h1>
                    </div>
                    <div className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: `${palette.glyphTruth}36`, color: palette.glyphTruth }}>
                        Browser workspace
                    </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_21rem]">
                    <div className="relative min-h-[32rem] overflow-hidden rounded-[28px] border p-5" style={{ borderColor: palette.border, background: `${palette.surface}e8` }}>
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(circle at center, ${palette.glyphSynthesis}20 0%, transparent 34%), linear-gradient(${palette.border}22 1px, transparent 1px), linear-gradient(90deg, ${palette.border}22 1px, transparent 1px)`,
                                backgroundSize: '100% 100%, 2rem 2rem, 2rem 2rem',
                            }}
                        />
                        <div className="absolute inset-[11%] rounded-full border" style={{ borderColor: `${palette.glyphSynthesis}28` }} />
                        <div className="absolute inset-[21%] rounded-full border" style={{ borderColor: `${palette.glyphDecision}22` }} />
                        <div className="absolute inset-[31%] rounded-full border" style={{ borderColor: `${palette.glyphPattern}22` }} />

                        <div
                            className="absolute left-1/2 top-1/2 grid h-48 w-48 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center"
                            style={{
                                borderColor: `${palette[activeAtlasNode.colorKey]}66`,
                                background: `radial-gradient(circle, ${palette[activeAtlasNode.colorKey]}30 0%, ${palette.surfaceElevated} 72%)`,
                                boxShadow: `0 0 80px ${palette[activeAtlasNode.colorKey]}26`,
                            }}
                        >
                            <div className="px-6">
                                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: palette.textMuted }}>
                                    Active Mirror
                                </div>
                                <div className="mt-3 text-4xl font-semibold tracking-[-0.07em]" style={{ color: palette.textPrimary }}>
                                    {activeAtlasNode.title}
                                </div>
                                <div className="mt-2 text-sm" style={{ color: palette.textSecondary }}>
                                    {activeAtlasNode.eyebrow}
                                </div>
                            </div>
                        </div>

                        {atlasNodes.map((node) => {
                            const color = palette[node.colorKey];
                            const active = node.key === activeAtlasNodeKey;
                            return (
                                <motion.button
                                    key={node.key}
                                    type="button"
                                    onClick={() => setActiveAtlasNodeKey(node.key)}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-[20px] border px-4 py-3 text-left"
                                    style={{
                                        left: `${node.x}%`,
                                        top: `${node.y}%`,
                                        borderColor: active ? `${color}66` : `${color}30`,
                                        background: active ? `${color}18` : `${palette.surfaceElevated}dd`,
                                        boxShadow: active ? `0 0 32px ${color}22` : 'none',
                                    }}
                                >
                                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color }}>
                                        {node.eyebrow}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold leading-5" style={{ color: palette.textPrimary }}>
                                        {node.title}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <GlassPanel
                            className="p-5"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dd`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.truth} label="selected route" color={palette.glyphTruth} />
                            <div className="mt-3 text-2xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                                {activeAtlasNode.title}
                            </div>
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                {activeAtlasNode.description}
                            </p>
                            <div className="mt-4 rounded-[20px] border px-4 py-4" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                                <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: palette[activeAtlasNode.colorKey] }}>
                                    {activeAtlasNode.takeaway}
                                </div>
                                <div className="mt-2 text-sm leading-6" style={{ color: palette.textPrimary }}>
                                    {activeAtlasNode.value}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => runEntry({
                                    title: activeAtlasNode.title,
                                    href: activeAtlasNode.href,
                                    external: activeAtlasNode.external,
                                    type: activeAtlasNode.external ? 'external' : 'route',
                                    glyph: glyphs[activeAtlasNode.colorKey.replace('glyph', '').toLowerCase()] || glyphs.truth,
                                    colorKey: activeAtlasNode.colorKey,
                                })}
                                className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                                style={{
                                    borderColor: `${palette[activeAtlasNode.colorKey]}44`,
                                    color: palette[activeAtlasNode.colorKey],
                                    background: `${palette[activeAtlasNode.colorKey]}12`,
                                }}
                            >
                                Open route
                                {activeAtlasNode.external ? <ExternalLink size={15} /> : <ArrowRight size={15} />}
                            </button>
                        </GlassPanel>

                        <GlassPanel
                            className="p-5"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dd`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.synthesis} label="orientation" color={palette.glyphSynthesis} />
                            <div className="mt-4 space-y-3">
                                {[
                                    'Start with Architecture if you need shape.',
                                    'Start with Chetana if you want immediate value.',
                                    'Start with BrainScan if you want a personal route.',
                                    'Use Research when you need the named method layer.',
                                ].map((line) => (
                                    <div key={line} className="rounded-[18px] border px-4 py-4 text-sm leading-6" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}`, color: palette.textSecondary }}>
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </GlassPanel>

            <GlassPanel
                className="p-6"
                style={{
                    borderColor: palette.border,
                    background: `${palette.surface}dd`,
                }}
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {atlasNodes.map((route) => (
                        <RouteChip
                            key={route.key}
                            route={{
                                title: route.title,
                                eyebrow: route.eyebrow,
                                description: route.description,
                                glyph: glyphs[route.colorKey.replace('glyph', '').toLowerCase()] || glyphs.truth,
                                colorKey: route.colorKey,
                                href: route.href,
                                external: route.external,
                            }}
                            palette={palette}
                            onSelect={(entry) => runEntry({
                                title: entry.title,
                                subtitle: entry.description,
                                href: entry.href,
                                external: entry.external,
                                type: entry.external ? 'external' : 'route',
                                glyph: entry.glyph,
                                colorKey: entry.colorKey,
                            })}
                        />
                    ))}
                </div>
            </GlassPanel>
        </div>
    );

    const renderMemoryPane = () => (
        <div className="space-y-4">
            <GlassPanel
                className="p-6"
                style={{
                    borderColor: palette.border,
                    background: `${palette.surface}e8`,
                }}
            >
                <SectionLabel glyph={glyphs.pattern} label="memory" color={palette.glyphPattern} />
                <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                    Continuity should feel cumulative, not disposable.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: palette.textSecondary }}>
                    The app reads the same local state used by BrainScan and setup. That turns this browser surface into a remembered route instead of a blank page every time.
                </p>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.pattern} label="signature" color={palette.glyphPattern} />
                            <div className="mt-3 text-2xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                                {mirrorState.archetypeName || 'Not set'}
                            </div>
                            <div className="mt-3 space-y-2 text-sm" style={{ color: palette.textSecondary }}>
                                <div>Twin: <span style={{ color: palette.textPrimary }}>{mirrorState.twinName || 'Not set'}</span></div>
                                <div>Mirror ID: <span style={{ color: palette.textPrimary }}>{mirrorState.mirrorId || 'Not set'}</span></div>
                                <div>Mode: <span style={{ color: palette.textPrimary }}>{mirrorMode || 'Not set'}</span></div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.decision} label="intake" color={palette.glyphDecision} />
                            <div className="mt-3 text-2xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                                {intakeReady ? 'Configured' : 'Not configured'}
                            </div>
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                {intakeReady
                                    ? 'Blueprint and intake state are present, so the mirror can hold more than a one-off result.'
                                    : 'Run setup after BrainScan if you want the app to carry more than a signature.'}
                            </p>
                        </div>

                        <div className="rounded-[24px] border p-5 md:col-span-2" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.pattern} label="strengths" color={palette.glyphPattern} />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {mirrorState.strengths?.length ? mirrorState.strengths.map((strength) => (
                                    <span
                                        key={strength}
                                        className="rounded-full border px-3 py-1.5 text-sm"
                                        style={{
                                            borderColor: `${palette.glyphPattern}44`,
                                            color: palette.glyphPattern,
                                            background: `${palette.glyphPattern}12`,
                                        }}
                                    >
                                        {strength}
                                    </span>
                                )) : (
                                    <span className="text-sm" style={{ color: palette.textSecondary }}>
                                        Run BrainScan to populate strengths.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.truth} label="blind spots" color={palette.glyphTruth} />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {mirrorState.blindSpots?.length ? mirrorState.blindSpots.map((spot) => (
                                    <span
                                        key={spot}
                                        className="rounded-full border px-3 py-1.5 text-sm"
                                        style={{
                                            borderColor: `${palette.glyphTruth}44`,
                                            color: palette.glyphTruth,
                                            background: `${palette.glyphTruth}12`,
                                        }}
                                    >
                                        {spot}
                                    </span>
                                )) : (
                                    <span className="text-sm" style={{ color: palette.textSecondary }}>
                                        No blind spots stored yet.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.decision} label="next action" color={palette.glyphDecision} />
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                {brainScanReady
                                    ? 'You already have a signature. Configure the mirror or open routes that match it.'
                                    : 'The first move is still BrainScan. This pane becomes useful after that.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => runEntry({
                                    title: brainScanReady ? 'Open Setup' : 'Take BrainScan',
                                    href: brainScanReady ? '/setup' : '/start',
                                    type: 'route',
                                    glyph: brainScanReady ? glyphs.decision : glyphs.pattern,
                                    colorKey: brainScanReady ? 'glyphDecision' : 'glyphPattern',
                                })}
                                className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                                style={{
                                    borderColor: `${palette.glyphDecision}44`,
                                    color: palette.glyphDecision,
                                    background: `${palette.glyphDecision}12`,
                                }}
                            >
                                {brainScanReady ? 'Configure the mirror' : 'Take BrainScan'}
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );

    const renderProofPane = () => (
        <div className="space-y-4">
            <GlassPanel
                className="p-6"
                style={{
                    borderColor: palette.border,
                    background: `${palette.surface}e8`,
                }}
            >
                <SectionLabel glyph={glyphs.truth} label="proof tray" color={palette.glyphTruth} />
                <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                    Every memorable surface should terminate in evidence.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: palette.textSecondary }}>
                    The app can afford atmosphere because every serious claim here has somewhere concrete to land: trust docs, architecture, research, or live runtime.
                </p>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_minmax(18rem,0.94fr)]">
                    <div className="grid gap-4 md:grid-cols-2">
                        {proofRoutes.map((route) => (
                            <RouteChip
                                key={route.title}
                                route={route}
                                palette={palette}
                                onSelect={(entry) => runEntry({
                                    title: entry.title,
                                    subtitle: entry.copy,
                                    href: entry.href,
                                    type: 'route',
                                    glyph: entry.glyph,
                                    colorKey: entry.colorKey,
                                })}
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.truth} label="truth contract" color={palette.glyphTruth} />
                            <div className="mt-4 space-y-3">
                                {[
                                    'Use architecture when you need system shape.',
                                    'Use trust center when you need policy, verification, or consent.',
                                    'Use live pulse when you need current runtime state.',
                                    'Use research when you need named methods and deeper reasoning.',
                                ].map((line) => (
                                    <div key={line} className="rounded-[18px] border px-4 py-4 text-sm leading-6" style={{ borderColor: palette.border, background: `${palette.surfaceElevated}`, color: palette.textSecondary }}>
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.synthesis} label="what proof means" color={palette.glyphSynthesis} />
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                Proof is not just a visual badge. It means a user can move from the interface into a concrete route that explains, verifies, or demonstrates what the system claims.
                            </p>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );

    const renderActionsPane = () => (
        <div className="space-y-4">
            <GlassPanel
                className="p-6"
                style={{
                    borderColor: palette.border,
                    background: `${palette.surface}e8`,
                }}
            >
                <SectionLabel glyph={glyphs.decision} label="actions" color={palette.glyphDecision} />
                <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em]" style={{ color: palette.textPrimary }}>
                    Launch the next route directly.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: palette.textSecondary }}>
                    This is where the site stops explaining and starts handing you real surfaces.
                </p>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="space-y-4">
                        {actionGroups.map((group) => (
                            <div key={group.title} className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                                <SectionLabel
                                    glyph={glyphs[group.colorKey.replace('glyph', '').toLowerCase()] || glyphs.decision}
                                    label={group.title}
                                    color={palette[group.colorKey]}
                                />
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {group.routes.map((route) => (
                                        <RouteChip
                                            key={route.title}
                                            route={{ ...route, eyebrow: group.title }}
                                            palette={palette}
                                            onSelect={(entry) => runEntry({
                                                title: entry.title,
                                                subtitle: entry.copy,
                                                href: entry.href,
                                                external: entry.external,
                                                type: entry.external ? 'external' : 'route',
                                                glyph: entry.glyph,
                                                colorKey: entry.colorKey,
                                            })}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.synthesis} label="command palette" color={palette.glyphSynthesis} />
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                Use the palette when you know the intent but do not want to hunt through routes.
                            </p>
                            <button
                                type="button"
                                onClick={() => setCommandOpen(true)}
                                className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                                style={{
                                    borderColor: `${palette.glyphSynthesis}44`,
                                    color: palette.glyphSynthesis,
                                    background: `${palette.glyphSynthesis}12`,
                                }}
                            >
                                <Search size={15} />
                                Open palette
                            </button>
                        </div>

                        <div className="rounded-[24px] border p-5" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <SectionLabel glyph={glyphs.truth} label="recent context" color={palette.glyphTruth} />
                            <p className="mt-3 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                Use the recent-launch rail on the right to keep the app feeling cumulative instead of stateless.
                            </p>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );

    const renderPane = () => {
        if (activePane === 'pulse') return renderPulsePane();
        if (activePane === 'atlas') return renderAtlasPane();
        if (activePane === 'memory') return renderMemoryPane();
        if (activePane === 'proof') return renderProofPane();
        return renderActionsPane();
    };

    return (
        <div
            className="min-h-screen"
            style={{
                background: `radial-gradient(circle at top left, ${palette.glyphSynthesis}14 0%, transparent 24%), radial-gradient(circle at top right, ${palette.glyphDecision}12 0%, transparent 20%), linear-gradient(180deg, ${palette.background} 0%, ${palette.surfaceMuted} 100%)`,
                color: palette.textPrimary,
            }}
        >
            <div className="mx-auto w-full max-w-[92rem] px-4 pb-24 pt-4 sm:px-6 lg:px-8">
                <header
                    className="sticky top-4 z-40 rounded-[28px] border px-4 py-3 backdrop-blur-2xl sm:px-5"
                    style={{
                        borderColor: `${palette.border}`,
                        background: theme === 'dark' ? 'rgba(7,20,31,0.82)' : 'rgba(255,255,255,0.84)',
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="grid h-11 w-11 place-items-center rounded-2xl border text-xl" style={{ borderColor: `${palette.glyphTruth}44`, color: palette.glyphTruth, background: `${palette.glyphTruth}10` }}>
                                {glyphs.truth}
                            </Link>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: palette.textMuted }}>
                                    Active Mirror App
                                </div>
                                <div className="text-sm font-medium" style={{ color: palette.textPrimary }}>
                                    Browser workspace in the MirrorBrain language
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setCommandOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                                style={{
                                    borderColor: `${palette.border}`,
                                    background: `${palette.surfaceElevated}aa`,
                                    color: palette.textSecondary,
                                }}
                            >
                                <Search size={15} />
                                Search or jump
                                <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]" style={{ borderColor: `${palette.glyphSynthesis}44`, color: palette.glyphSynthesis }}>
                                    {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl K'}
                                </span>
                            </button>
                            <Link
                                to="/docs/architecture"
                                className="hidden rounded-full border px-4 py-2 text-sm font-medium sm:inline-flex"
                                style={{
                                    borderColor: `${palette.glyphTruth}44`,
                                    color: palette.glyphTruth,
                                    background: `${palette.glyphTruth}12`,
                                }}
                            >
                                Proof
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <div className="mt-6 grid gap-4 lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem] xl:gap-5">
                    <aside className="hidden lg:block">
                        <GlassPanel
                            className="sticky top-28 p-4"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dc`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.synthesis} label="dock" color={palette.glyphSynthesis} />
                            <div className="mt-4 space-y-2">
                                {panes.map((pane) => {
                                    const Icon = pane.icon;
                                    const active = pane.key === activePane;
                                    const color = palette[pane.colorKey];
                                    return (
                                        <button
                                            key={pane.key}
                                            type="button"
                                            onClick={() => setActivePane(pane.key)}
                                            className="w-full rounded-[20px] border px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                                            style={{
                                                borderColor: active ? `${color}66` : palette.border,
                                                background: active ? `${color}14` : `${palette.surfaceMuted}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-9 w-9 place-items-center rounded-2xl" style={{ background: `${color}16`, color }}>
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color }}>
                                                        {pane.glyph} {pane.label}
                                                    </div>
                                                    <div className="mt-1 text-sm leading-5" style={{ color: palette.textSecondary }}>
                                                        {pane.copy}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </GlassPanel>
                    </aside>

                    <div>{renderPane()}</div>

                    <aside className="space-y-4">
                        <GlassPanel
                            className="p-5"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dc`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.truth} label="signature" color={palette.glyphTruth} />
                            <div className="mt-4 grid gap-3">
                                {glyphChapters.map((chapter) => {
                                    const colorKey = `glyph${chapter.label}`;
                                    const color = palette[colorKey];
                                    return (
                                        <div key={chapter.key} className="rounded-[18px] border px-4 py-3" style={{ borderColor: `${color}33`, background: `${color}10` }}>
                                            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                                                <span>{chapter.glyph}</span>
                                                {chapter.label}
                                            </div>
                                            <p className="mt-2 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                                {chapter.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassPanel>

                        <GlassPanel
                            className="p-5"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dc`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.pattern} label="identity" color={palette.glyphPattern} />
                            <div className="mt-3 text-xl font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                                {brainScanReady ? welcomeName : 'No signature yet'}
                            </div>
                            <p className="mt-2 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                {brainScanReady
                                    ? `Twin ${twinName}. Use the app as a remembered route rather than a blank landing page.`
                                    : 'Run BrainScan to make the app personal and stateful.'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => runEntry({
                                        title: brainScanReady ? 'Open Setup' : 'Take BrainScan',
                                        href: brainScanReady ? '/setup' : '/start',
                                        type: 'route',
                                        glyph: brainScanReady ? glyphs.decision : glyphs.pattern,
                                        colorKey: brainScanReady ? 'glyphDecision' : 'glyphPattern',
                                    })}
                                    className="rounded-full border px-4 py-2 text-sm font-medium"
                                    style={{
                                        borderColor: `${palette.glyphPattern}44`,
                                        color: palette.glyphPattern,
                                        background: `${palette.glyphPattern}12`,
                                    }}
                                >
                                    {brainScanReady ? 'Configure' : 'Take BrainScan'}
                                </button>
                                <Link
                                    to="/twins"
                                    className="rounded-full border px-4 py-2 text-sm font-medium"
                                    style={{
                                        borderColor: `${palette.glyphTruth}44`,
                                        color: palette.glyphTruth,
                                        background: `${palette.glyphTruth}12`,
                                    }}
                                >
                                    Meet twins
                                </Link>
                            </div>
                        </GlassPanel>

                        <GlassPanel
                            className="p-5"
                            style={{
                                borderColor: palette.border,
                                background: `${palette.surface}dc`,
                            }}
                        >
                            <SectionLabel glyph={glyphs.decision} label="recent launches" color={palette.glyphDecision} />
                            <div className="mt-4 space-y-3">
                                {recentRoutes.length ? recentRoutes.map((item) => (
                                    <div key={`${item.title}-${item.at}`} className="rounded-[18px] border px-4 py-3" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: palette.textPrimary }}>
                                            <span style={{ color: palette.glyphDecision }}>{item.glyph || glyphs.decision}</span>
                                            {item.title}
                                        </div>
                                        <div className="mt-1 text-xs uppercase tracking-[0.14em]" style={{ color: palette.textMuted }}>
                                            {formatTimestamp(item.at)}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="rounded-[18px] border px-4 py-4 text-sm" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}`, color: palette.textSecondary }}>
                                        Nothing launched yet from this app shell.
                                    </div>
                                )}
                            </div>
                        </GlassPanel>
                    </aside>
                </div>
            </div>

            <div className="fixed bottom-4 left-1/2 z-40 w-[min(94vw,38rem)] -translate-x-1/2 px-3 lg:hidden">
                <div className="grid grid-cols-5 gap-2 rounded-[26px] border p-2 backdrop-blur-2xl" style={{ borderColor: palette.border, background: `${palette.surface}e8` }}>
                    {panes.map((pane) => {
                        const Icon = pane.icon;
                        const active = pane.key === activePane;
                        const color = palette[pane.colorKey];
                        return (
                            <button
                                key={pane.key}
                                type="button"
                                onClick={() => setActivePane(pane.key)}
                                className="flex flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-center"
                                style={{ background: active ? `${color}18` : 'transparent' }}
                            >
                                <div className="grid h-9 w-9 place-items-center rounded-2xl" style={{ background: `${color}14`, color }}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: active ? color : palette.textSecondary }}>
                                    {pane.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {commandOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pb-10 pt-24 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
                    <div
                        className="w-full max-w-2xl rounded-[28px] border p-4"
                        style={{ borderColor: palette.border, background: `${palette.surface}f2` }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 rounded-[22px] border px-4 py-3" style={{ borderColor: palette.border, background: `${palette.surfaceMuted}` }}>
                            <Search size={18} style={{ color: palette.glyphSynthesis }} />
                            <input
                                autoFocus
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search routes, proof surfaces, or app panes"
                                className="w-full bg-transparent text-sm outline-none"
                                style={{ color: palette.textPrimary }}
                            />
                        </div>

                        <div className="mt-3 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                            {filteredCommands.map((entry) => {
                                const color = palette[entry.colorKey];
                                return (
                                    <button
                                        key={entry.key}
                                        type="button"
                                        onClick={() => runEntry(entry)}
                                        className="w-full rounded-[20px] border px-4 py-3 text-left"
                                        style={{ borderColor: palette.border, background: `${color}10` }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                                                    <span>{entry.glyph}</span>
                                                    {entry.title}
                                                </div>
                                                <div className="mt-1 text-sm leading-6" style={{ color: palette.textSecondary }}>
                                                    {entry.subtitle}
                                                </div>
                                            </div>
                                            {entry.external ? <ExternalLink size={16} style={{ color }} /> : <ArrowRight size={16} style={{ color }} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
