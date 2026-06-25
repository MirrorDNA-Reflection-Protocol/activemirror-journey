import React, { useState, useEffect, useRef, useMemo } from 'react';

// =============================================================================
// SYSTEM MAP — Chaotic Cyberpunk Dashboard
// =============================================================================

const SYSTEMS = [
    { id: 'mirrorgate', name: 'MirrorGate', status: 'online', port: 8097, type: 'security', desc: 'Safety proxy + routing', load: 0.23 },
    { id: 'kavach', name: 'Kavach/Chetana', status: 'online', port: 8790, type: 'security', desc: 'Scam shield · 10 tabs · deepfake', load: 0.41 },
    { id: 'factory', name: 'Sovereign Factory', status: 'online', port: 8401, type: 'infra', desc: 'Multi-agent manufacturing', load: 0.67 },
    { id: 'beacon', name: 'Truth Beacon', status: 'online', port: 8300, type: 'publish', desc: 'Auto-synthesis · 2x daily', load: 0.15 },
    { id: 'dashboard', name: 'Cognitive Dashboard', status: 'online', port: 8099, type: 'infra', desc: 'TUI · 13 panels · 5s refresh', load: 0.33 },
    { id: 'swarm', name: 'MirrorSwarm', status: 'online', port: null, type: 'intelligence', desc: 'Multi-model orchestration', load: 0.52 },
    { id: 'mirrorbrain', name: 'MirrorBrain Mobile', status: 'online', port: null, type: 'product', desc: '12-screen RN app · Pixel + OnePlus', load: 0.28 },
    { id: 'mirrorpublish', name: 'MirrorPublish', status: 'online', port: null, type: 'publish', desc: '6 platforms · 8 commands', load: 0.09 },
    { id: 'radar', name: 'MirrorRadar', status: 'online', port: 8789, type: 'intelligence', desc: 'HN · arXiv · GitHub · RSS', load: 0.19 },
    { id: 'activemirror-os', name: 'ActiveMirrorOS', status: 'online', port: null, type: 'core', desc: '12,096 lines · control plane', load: 0.44 },
    { id: 'continuity', name: 'Continuity Bus', status: 'online', port: null, type: 'core', desc: 'Memory bus · SHIPLOG · heartbeat', load: 0.12 },
    { id: 'self-heal', name: 'Self-Heal v2', status: 'online', port: null, type: 'infra', desc: 'Registry-driven · auto-restart', load: 0.07 },
    { id: 'domain-mon', name: 'Domain Monitor', status: 'online', port: null, type: 'infra', desc: '5 domains · ntfy alerts', load: 0.05 },
    { id: 'phone-sync', name: 'Phone Sync', status: 'online', port: null, type: 'infra', desc: 'ADB pull + auto-triage', load: 0.03 },
    { id: 'drip', name: 'Drip Publisher', status: 'idle', port: null, type: 'publish', desc: 'Queue-based content', load: 0.0 },
    { id: 'research', name: 'Research Watch', status: 'online', port: null, type: 'intelligence', desc: 'arXiv + Semantic Scholar', load: 0.11 },
];

const REPOS = { total: 95, public: 63, private: 32 };
const STATS = {
    shipped: 87, layers: 9, services: 24, scheduled: 5, models: 11,
    devices: 4, domains: 5, ports: 14, vault_notes: 5000, agents: 3,
};

const TYPE_COLORS = {
    security: '#ef4444', infra: '#10b981', publish: '#6366f1',
    intelligence: '#f59e0b', product: '#a855f7', core: '#06b6d4',
};

const GLITCH_CHARS = '⟡◈△⧉⬡⬢⎔⏣⊹✦∴∵⌬⌭';
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトMIRROR01';

// =============================================================================
// MATRIX RAIN
// =============================================================================
function MatrixRain() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const cols = Math.floor(w / 14);
        const drops = Array(cols).fill(0).map(() => Math.random() * -100);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = '12px monospace';

            for (let i = 0; i < drops.length; i++) {
                const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                const alpha = Math.random() * 0.15 + 0.03;
                ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
                ctx.fillText(char, i * 14, drops[i] * 14);

                if (drops[i] * 14 > h && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', handleResize);
        return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />;
}

// =============================================================================
// SCANLINES
// =============================================================================
function Scanlines() {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)',
            pointerEvents: 'none', zIndex: 9999, opacity: 0.3,
        }} />
    );
}

// =============================================================================
// GLITCH TEXT
// =============================================================================
function GlitchText({ text, className = '' }) {
    const [display, setDisplay] = useState(text);
    const [glitching, setGlitching] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.92) {
                setGlitching(true);
                const chars = text.split('');
                const glitched = chars.map(c =>
                    Math.random() > 0.7 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
                ).join('');
                setDisplay(glitched);
                setTimeout(() => { setDisplay(text); setGlitching(false); }, 100 + Math.random() * 150);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span style={{
            textShadow: glitching ? '2px 0 #ef4444, -2px 0 #06b6d4' : 'none',
            transition: 'text-shadow 0.05s',
        }} className={className}>{display}</span>
    );
}

// =============================================================================
// TERMINAL PANEL
// =============================================================================
function Panel({ title, children, color = '#6366f1', wide = false, style: extraStyle = {} }) {
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            if (Math.random() > 0.85) {
                setFlash(true);
                setTimeout(() => setFlash(false), 80);
            }
        }, 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: `1px solid ${flash ? '#fff' : color}40`,
            borderRadius: '2px',
            padding: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontSize: '0.72rem',
            gridColumn: wide ? 'span 2' : 'span 1',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 0 ${flash ? '15' : '8'}px ${color}15, inset 0 0 30px rgba(0,0,0,0.5)`,
            transition: 'box-shadow 0.1s, border-color 0.1s',
            ...extraStyle,
        }}>
            {/* Title bar */}
            <div style={{
                background: `linear-gradient(90deg, ${color}20, transparent)`,
                borderBottom: `1px solid ${color}30`,
                padding: '6px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ color, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    ┌ {title}
                </span>
                <span style={{ color: `${color}80`, fontSize: '0.6rem' }}>
                    [{new Date().toLocaleTimeString('en-US', { hour12: false })}]
                </span>
            </div>
            <div style={{ padding: '8px 10px' }}>
                {children}
            </div>
        </div>
    );
}

// =============================================================================
// SERVICE GRID PANEL
// =============================================================================
function ServiceGrid() {
    const [tick, setTick] = useState(0);
    useEffect(() => { const t = setInterval(() => setTick(k => k + 1), 3000); return () => clearInterval(t); }, []);

    return (
        <Panel title="SERVICE MESH" color="#10b981" wide>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {SYSTEMS.map(sys => {
                    const color = TYPE_COLORS[sys.type];
                    const jitter = sys.status === 'online' ? (Math.sin(tick + sys.id.length) * 0.1 + sys.load) : 0;
                    const barWidth = Math.min(Math.max(jitter * 100, 5), 95);
                    return (
                        <div key={sys.id} style={{
                            background: `${color}08`,
                            border: `1px solid ${color}25`,
                            padding: '6px 8px',
                            borderRadius: '1px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Load bar behind */}
                            <div style={{
                                position: 'absolute', left: 0, bottom: 0,
                                width: `${barWidth}%`, height: '2px',
                                background: `linear-gradient(90deg, ${color}, ${color}40)`,
                                transition: 'width 1s ease',
                            }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ color, fontWeight: 600, fontSize: '0.65rem' }}>{sys.name}</span>
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: sys.status === 'online' ? '#10b981' : sys.status === 'idle' ? '#f59e0b' : '#ef4444',
                                    boxShadow: sys.status === 'online' ? '0 0 6px #10b981' : 'none',
                                    display: 'inline-block',
                                    animation: sys.status === 'online' ? 'pulse 2s infinite' : 'none',
                                }} />
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.55rem', lineHeight: 1.3 }}>{sys.desc}</div>
                            {sys.port && (
                                <div style={{ color: `${color}80`, fontSize: '0.55rem', marginTop: '2px' }}>:{sys.port}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}

// =============================================================================
// VITALS PANEL
// =============================================================================
function VitalsPanel() {
    const [drift, setDrift] = useState(1.12);
    const [metabolism, setMetabolism] = useState(44.1);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            setDrift(d => Math.max(0, d + (Math.random() - 0.52) * 0.3));
            setMetabolism(m => Math.min(100, Math.max(0, m + (Math.random() - 0.48) * 2)));
            setTick(k => k + 1);
        }, 4000);
        return () => clearInterval(t);
    }, []);

    const driftColor = drift < 2 ? '#10b981' : drift < 5 ? '#f59e0b' : '#ef4444';
    const metabColor = metabolism > 60 ? '#10b981' : metabolism > 30 ? '#f59e0b' : '#6b7280';

    return (
        <Panel title="VITALS" color="#06b6d4">
            <div style={{ display: 'grid', gap: '6px' }}>
                <Row label="DRIFT" value={`${drift.toFixed(2)}%`} color={driftColor} bar={drift / 10} />
                <Row label="METABOLISM" value={`${metabolism.toFixed(1)}%`} color={metabColor} bar={metabolism / 100} />
                <Row label="BUS" value="HEALTHY" color="#10b981" />
                <Row label="KILL SWITCH" value="OFF" color="#10b981" />
                <Row label="LOOPS" value="14 open / 56 done" color="#6366f1" bar={56 / 70} />
                <Row label="SHIP RATIO" value="60%" color="#a855f7" bar={0.6} />
                <Row label="HEARTBEAT" value={`${tick}s ago`} color="#06b6d4" />
            </div>
        </Panel>
    );
}

function Row({ label, value, color, bar }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
            <span style={{ color: '#4b5563', width: '85px', fontSize: '0.6rem', flexShrink: 0 }}>{label}</span>
            {bar !== undefined && (
                <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(bar * 100, 100)}%`, height: '100%', background: color, transition: 'width 1s' }} />
                </div>
            )}
            <span style={{ color, fontWeight: 600, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{value}</span>
        </div>
    );
}

// =============================================================================
// FLEET PANEL
// =============================================================================
function FleetPanel() {
    return (
        <Panel title="FLEET" color="#f59e0b">
            <div style={{ display: 'grid', gap: '4px' }}>
                {[
                    { name: 'Mac Mini M4 Pro', role: 'HUB', status: 'online', ip: '192.168.0.115' },
                    { name: 'Pixel 9 Pro XL', role: 'MOBILE', status: 'online', ip: 'Tailscale' },
                    { name: 'OnePlus CPH2745', role: 'MOBILE', status: 'online', ip: 'USB' },
                    { name: 'Samsung T7 2TB', role: 'BACKUP', status: 'online', ip: 'USB-C' },
                ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                            <span style={{ color: '#e5e7eb', fontSize: '0.65rem', fontWeight: 500 }}>{d.name}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.55rem', marginLeft: '6px' }}>[{d.role}]</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.55rem' }}>{d.ip}</span>
                            <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: d.status === 'online' ? '#10b981' : '#ef4444',
                                boxShadow: d.status === 'online' ? '0 0 4px #10b981' : 'none',
                                display: 'inline-block',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '8px', color: '#4b5563', fontSize: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                OLLAMA: 11 models · deepseek-r1:14b active · 24GB VRAM
            </div>
        </Panel>
    );
}

// =============================================================================
// STATS PANEL
// =============================================================================
function StatsPanel() {
    return (
        <Panel title="INFRASTRUCTURE" color="#a855f7">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                    { v: STATS.shipped, l: 'SHIPPED', c: '#6366f1' },
                    { v: REPOS.total, l: 'REPOS', c: '#a855f7' },
                    { v: STATS.services, l: 'SERVICES', c: '#10b981' },
                    { v: STATS.layers, l: 'LAYERS', c: '#06b6d4' },
                    { v: STATS.models, l: 'MODELS', c: '#f59e0b' },
                    { v: STATS.devices, l: 'DEVICES', c: '#ef4444' },
                    { v: STATS.domains, l: 'DOMAINS', c: '#6366f1' },
                    { v: STATS.ports, l: 'PORTS', c: '#10b981' },
                    { v: `${(STATS.vault_notes / 1000).toFixed(0)}k`, l: 'VAULT', c: '#a855f7' },
                ].map((s, i) => (
                    <div key={i} style={{
                        textAlign: 'center', padding: '8px 4px',
                        background: `${s.c}08`, border: `1px solid ${s.c}15`,
                        borderRadius: '1px',
                    }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.c, textShadow: `0 0 10px ${s.c}40` }}>{s.v}</div>
                        <div style={{ fontSize: '0.5rem', color: '#6b7280', letterSpacing: '1px', marginTop: '2px' }}>{s.l}</div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// =============================================================================
// ACTIVITY LOG
// =============================================================================
function ActivityLog() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const initial = [
            { t: '14:35:35', msg: 'doc_sync_agent: docs current', type: 'info' },
            { t: '14:33:21', msg: 'factory_trigger: manifest validated', type: 'success' },
            { t: '14:31:07', msg: 'self_heal: all 24 services healthy', type: 'success' },
            { t: '14:28:45', msg: 'beacon: synthesis complete (2 posts)', type: 'info' },
            { t: '14:25:12', msg: 'swarm_watcher: 5min tier — 0 triggers', type: 'dim' },
            { t: '14:22:00', msg: 'domain_monitor: 5/5 domains OK', type: 'success' },
            { t: '14:19:33', msg: 'kavach: 3 scans in last hour', type: 'info' },
            { t: '14:15:00', msg: 'continuity: heartbeat OK · drift 1.12%', type: 'dim' },
            { t: '14:12:44', msg: 'phone_sync: OnePlus connected', type: 'info' },
            { t: '14:10:00', msg: 'backup: vault rsync complete (2.1GB)', type: 'success' },
        ];
        setLogs(initial);

        const msgs = [
            'continuity: bus write · entry #251',
            'self_heal: port 8097 responding',
            'radar: 3 new HN matches',
            'swarm_watcher: fswatch idle',
            'dashboard: 5s refresh · 13 panels',
            'factory: idle — no pending manifests',
            'beacon_chat: 0 active sessions',
            'kavach: lattice updated · 71 threats',
        ];

        const t = setInterval(() => {
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            const now = new Date().toLocaleTimeString('en-US', { hour12: false });
            setLogs(prev => [{ t: now, msg, type: Math.random() > 0.5 ? 'dim' : 'info' }, ...prev.slice(0, 12)]);
        }, 8000);
        return () => clearInterval(t);
    }, []);

    const colors = { success: '#10b981', info: '#6366f1', dim: '#4b5563', warn: '#f59e0b' };

    return (
        <Panel title="EVENT LOG" color="#6366f1" wide>
            <div style={{ maxHeight: '180px', overflow: 'hidden' }}>
                {logs.map((l, i) => (
                    <div key={i} style={{
                        display: 'flex', gap: '8px', padding: '2px 0',
                        opacity: i > 7 ? 0.4 : 1 - i * 0.06,
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}>
                        <span style={{ color: '#4b5563', fontSize: '0.6rem', fontFamily: 'monospace', flexShrink: 0, width: '60px' }}>{l.t}</span>
                        <span style={{ color: colors[l.type], fontSize: '0.62rem' }}>{l.msg}</span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// =============================================================================
// AGENT STATUS
// =============================================================================
function AgentPanel() {
    const [cursor, setCursor] = useState(true);
    useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);

    return (
        <Panel title="AGENTS" color="#ef4444">
            <div style={{ display: 'grid', gap: '6px' }}>
                {[
                    { name: 'Claude Code', tier: 'T1', model: 'opus-4.6', status: 'active', color: '#6366f1' },
                    { name: 'Antigravity', tier: 'T2', model: 'gemini-2.5', status: 'standby', color: '#f59e0b' },
                    { name: 'Ollama Local', tier: 'T3', model: 'deepseek-r1', status: 'ready', color: '#10b981' },
                ].map((a, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 8px', background: `${a.color}08`, border: `1px solid ${a.color}20`,
                        borderRadius: '1px',
                    }}>
                        <div>
                            <span style={{ color: a.color, fontWeight: 600, fontSize: '0.65rem' }}>{a.name}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.55rem', marginLeft: '6px' }}>[{a.tier}] {a.model}</span>
                        </div>
                        <span style={{
                            fontSize: '0.55rem', fontWeight: 600, padding: '1px 6px', borderRadius: '1px',
                            background: a.status === 'active' ? '#10b98120' : 'transparent',
                            color: a.status === 'active' ? '#10b981' : '#6b7280',
                        }}>
                            {a.status === 'active' ? `ACTIVE${cursor ? '█' : ''}` : a.status.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// =============================================================================
// QUICK LINKS
// =============================================================================
function LinksPanel() {
    const links = [
        { l: 'activemirror.ai', u: '/', c: '#a855f7' },
        { l: 'chetana.activemirror.ai', u: 'https://chetana.activemirror.ai', c: '#ef4444' },
        { l: 'beacon.activemirror.ai', u: 'https://beacon.activemirror.ai', c: '#6366f1' },
        { l: 'docs.activemirror.ai', u: 'https://docs.activemirror.ai', c: '#10b981' },
        { l: 'brief.activemirror.ai', u: 'https://brief.activemirror.ai', c: '#f59e0b' },
    ];

    return (
        <Panel title="DOMAINS" color="#06b6d4">
            {links.map((l, i) => (
                <a key={i} href={l.u} target={l.u.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '4px 0', textDecoration: 'none', color: l.c,
                        fontSize: '0.62rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                    <span style={{ color: '#10b981', fontSize: '0.5rem' }}>●</span>
                    <span>{l.l}</span>
                    <span style={{ marginLeft: 'auto', color: '#4b5563', fontSize: '0.5rem' }}>→</span>
                </a>
            ))}
        </Panel>
    );
}

// =============================================================================
// ASCII HEADER
// =============================================================================
function AsciiHeader() {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    return (
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            padding: '12px 16px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontSize: '1.4rem',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        letterSpacing: '2px',
                    }}>
                        ⟡ MIRRORDNA
                    </span>
                    <span style={{ color: '#4b5563', fontSize: '0.65rem' }}>SYSTEM MAP v2.0</span>
                    <span style={{
                        padding: '2px 8px', borderRadius: '1px', fontSize: '0.55rem',
                        background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600,
                    }}>OPERATIONAL</span>
                </div>
                <div style={{ color: '#4b5563', fontSize: '0.6rem', marginTop: '3px', letterSpacing: '0.5px' }}>
                    N1 Intelligence · Sovereign AI Infrastructure · One Person · No Funding · Running in Production
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{
                    fontSize: '1.2rem', fontWeight: 700, color: '#6366f1',
                    fontFamily: "'JetBrains Mono', monospace",
                    textShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
                }}>
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.6rem' }}>
                    {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// TOPOLOGY (connection lines between systems)
// =============================================================================
function TopologyPanel() {
    return (
        <Panel title="TOPOLOGY" color="#6366f1">
            <pre style={{ color: '#4b5563', fontSize: '0.55rem', lineHeight: 1.5, margin: 0 }}>
{`    ┌──────────────┐
    │ ActiveMirrorOS│◄── AMGL Guard (23 rules)
    │  Control Plane│◄── Consent Ledger
    └──────┬───────┘
           │
    ┌──────┴───────┐
    │  MirrorGate  │◄── Safety Proxy
    │    :8097     │◄── Model Routing
    └──┬────┬──┬───┘
       │    │  │
  ┌────┘  ┌─┘  └────┐
  ▼       ▼         ▼
┌────┐ ┌──────┐ ┌──────┐
│Opus│ │Gemini│ │Ollama│
│ T1 │ │  T2  │ │  T3  │
└────┘ └──────┘ └──────┘
  │       │         │
  └───┬───┘    ┌────┘
      ▼        ▼
  ┌──────────────┐
  │ Continuity   │
  │   Bus v250   │
  └──────────────┘`}
            </pre>
        </Panel>
    );
}

// =============================================================================
// SCHEDULE PANEL
// =============================================================================
function SchedulePanel() {
    return (
        <Panel title="SCHEDULED" color="#f59e0b">
            <div style={{ display: 'grid', gap: '3px' }}>
                {[
                    { name: 'beacon-synthesis', time: '06:00 + 18:00', status: 'ok' },
                    { name: 'memory-loop', time: 'every 5m', status: 'ok' },
                    { name: 'system-snapshot', time: 'every 30m', status: 'ok' },
                    { name: 'doc-sync', time: '07:00 + 19:00 + watch', status: 'ok' },
                    { name: 'swarm-watcher', time: '5m/30m/2h/3AM', status: 'ok' },
                    { name: 'intelligence-bot', time: '08:00 + 18:00', status: 'ok' },
                ].map((s, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '2px 0', fontSize: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                        <span style={{ color: '#e5e7eb' }}>{s.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.55rem' }}>{s.time}</span>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================
export default function Hub() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            color: '#e5e7eb',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            position: 'relative',
            overflow: 'hidden',
        }}>
            <MatrixRain />
            <Scanlines />

            <div style={{ position: 'relative', zIndex: 10 }}>
                <AsciiHeader />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    padding: '8px 12px',
                    maxWidth: '1600px',
                    margin: '0 auto',
                }}>
                    {/* Row 1: Service mesh (wide) + Vitals + Agents */}
                    <ServiceGrid />
                    <VitalsPanel />
                    <AgentPanel />

                    {/* Row 2: Activity log (wide) + Fleet + Stats */}
                    <ActivityLog />
                    <FleetPanel />
                    <StatsPanel />

                    {/* Row 3: Topology + Links + Schedule */}
                    <TopologyPanel />
                    <LinksPanel />
                    <SchedulePanel />
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center', padding: '12px',
                    color: '#4b5563', fontSize: '0.55rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '2px',
                    position: 'relative', zIndex: 10,
                }}>
                    <GlitchText text="⟡ MIRRORDNA · N1 INTELLIGENCE · SOVEREIGN · 2026" />
                </div>
            </div>

            {/* Global animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @media (max-width: 1200px) {
                    .hub-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 768px) {
                    .hub-grid { grid-template-columns: 1fr !important; }
                }
                * { scrollbar-width: thin; scrollbar-color: #6366f1 #000; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: #6366f1; }
                ::-webkit-scrollbar-track { background: #000; }
            `}</style>
        </div>
    );
}
