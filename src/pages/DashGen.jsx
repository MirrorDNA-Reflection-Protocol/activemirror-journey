import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// =============================================================================
// DASHGEN — Universal Dashboard Generator
// Describe it → Theme it → Ship it
// =============================================================================

// ─── THEMES ─────────────────────────────────────────────────────────────────

const THEMES = {
    cyberpunk: {
        name: 'Cyberpunk',
        desc: 'Matrix rain, scanlines, neon glow, glitch text',
        bg: '#000000',
        surface: 'rgba(0,0,0,0.7)',
        border: 'rgba(99,102,241,0.25)',
        text: '#e5e7eb',
        dim: '#4b5563',
        accent: '#6366f1',
        accent2: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        font: "'JetBrains Mono', 'Fira Code', monospace",
        effects: ['matrix', 'scanlines', 'glow', 'glitch'],
        borderRadius: '2px',
    },
    terminal: {
        name: 'Terminal',
        desc: 'Phosphor green, CRT curves, amber on black',
        bg: '#0a0a00',
        surface: 'rgba(0,20,0,0.6)',
        border: 'rgba(0,255,65,0.2)',
        text: '#00ff41',
        dim: '#006b1a',
        accent: '#00ff41',
        accent2: '#ffb000',
        success: '#00ff41',
        warning: '#ffb000',
        danger: '#ff0040',
        font: "'Courier New', 'Lucida Console', monospace",
        effects: ['scanlines', 'crt-curve', 'glow'],
        borderRadius: '0px',
    },
    minimal: {
        name: 'Minimal',
        desc: 'Clean white space, subtle borders, zen clarity',
        bg: '#fafafa',
        surface: '#ffffff',
        border: 'rgba(0,0,0,0.08)',
        text: '#1a1a1a',
        dim: '#9ca3af',
        accent: '#6366f1',
        accent2: '#a855f7',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        font: "'Inter', -apple-system, sans-serif",
        effects: [],
        borderRadius: '12px',
    },
    corporate: {
        name: 'Corporate',
        desc: 'Executive dashboard, charts, KPIs, blue steel',
        bg: '#0f172a',
        surface: '#1e293b',
        border: 'rgba(148,163,184,0.15)',
        text: '#e2e8f0',
        dim: '#64748b',
        accent: '#3b82f6',
        accent2: '#06b6d4',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        font: "'Inter', 'Segoe UI', sans-serif",
        effects: [],
        borderRadius: '8px',
    },
    retro: {
        name: 'Retro',
        desc: 'Amber phosphor, 80s mainframe, warm CRT',
        bg: '#1a0f00',
        surface: 'rgba(26,15,0,0.8)',
        border: 'rgba(255,176,0,0.2)',
        text: '#ffb000',
        dim: '#8b6914',
        accent: '#ffb000',
        accent2: '#ff6b00',
        success: '#ffb000',
        warning: '#ff6b00',
        danger: '#ff0040',
        font: "'IBM Plex Mono', 'Courier New', monospace",
        effects: ['scanlines', 'crt-curve', 'glow', 'flicker'],
        borderRadius: '0px',
    },
    vapor: {
        name: 'Vaporwave',
        desc: 'Neon pink, purple gradients, synthwave aesthetic',
        bg: '#0d001a',
        surface: 'rgba(20,0,40,0.7)',
        border: 'rgba(255,0,255,0.2)',
        text: '#ff71ce',
        dim: '#7b2d8e',
        accent: '#ff71ce',
        accent2: '#01cdfe',
        success: '#05ffa1',
        warning: '#fffb96',
        danger: '#ff6e6e',
        font: "'Space Mono', 'JetBrains Mono', monospace",
        effects: ['scanlines', 'glow', 'glitch'],
        borderRadius: '4px',
    },
    // ─── UNIXPORN / RICE THEMES ──────────────────────────────────────────────
    nord: {
        name: 'Nord',
        desc: 'Arctic, icy blue, frost palette — r/unixporn classic',
        bg: '#2e3440',
        surface: '#3b4252',
        border: 'rgba(136,192,208,0.15)',
        text: '#eceff4',
        dim: '#4c566a',
        accent: '#88c0d0',
        accent2: '#81a1c1',
        success: '#a3be8c',
        warning: '#ebcb8b',
        danger: '#bf616a',
        font: "'JetBrains Mono', 'Fira Code', monospace",
        effects: [],
        borderRadius: '6px',
    },
    gruvbox: {
        name: 'Gruvbox',
        desc: 'Warm retro, earthy oranges — cozy terminal vibes',
        bg: '#282828',
        surface: '#3c3836',
        border: 'rgba(214,153,62,0.15)',
        text: '#ebdbb2',
        dim: '#665c54',
        accent: '#d79921',
        accent2: '#458588',
        success: '#98971a',
        warning: '#d79921',
        danger: '#cc241d',
        font: "'IBM Plex Mono', 'JetBrains Mono', monospace",
        effects: [],
        borderRadius: '4px',
    },
    dracula: {
        name: 'Dracula',
        desc: 'Purple-forward, high contrast — the iconic dark theme',
        bg: '#282a36',
        surface: '#44475a',
        border: 'rgba(189,147,249,0.15)',
        text: '#f8f8f2',
        dim: '#6272a4',
        accent: '#bd93f9',
        accent2: '#ff79c6',
        success: '#50fa7b',
        warning: '#f1fa8c',
        danger: '#ff5555',
        font: "'Fira Code', 'JetBrains Mono', monospace",
        effects: ['glow'],
        borderRadius: '6px',
    },
    catppuccin: {
        name: 'Catppuccin',
        desc: 'Pastel perfection, mocha variant — soothing & modern',
        bg: '#1e1e2e',
        surface: '#313244',
        border: 'rgba(137,180,250,0.12)',
        text: '#cdd6f4',
        dim: '#585b70',
        accent: '#89b4fa',
        accent2: '#cba6f7',
        success: '#a6e3a1',
        warning: '#f9e2af',
        danger: '#f38ba8',
        font: "'JetBrains Mono', 'Fira Code', monospace",
        effects: [],
        borderRadius: '8px',
    },
    tokyonight: {
        name: 'Tokyo Night',
        desc: 'Neon city after dark — electric purple & teal',
        bg: '#1a1b26',
        surface: '#24283b',
        border: 'rgba(122,162,247,0.12)',
        text: '#c0caf5',
        dim: '#565f89',
        accent: '#7aa2f7',
        accent2: '#bb9af7',
        success: '#9ece6a',
        warning: '#e0af68',
        danger: '#f7768e',
        font: "'JetBrains Mono', 'Fira Code', monospace",
        effects: ['glow'],
        borderRadius: '6px',
    },
};

// ─── PANEL TYPES ─────────────────────────────────────────────────────────────

const PANEL_CATALOG = [
    { type: 'stats', name: 'Stats Grid', desc: 'Key numbers in a grid', icon: '📊', defaultCols: 2 },
    { type: 'services', name: 'Service Mesh', desc: 'Service status with health dots', icon: '🔮', defaultCols: 2 },
    { type: 'log', name: 'Event Log', desc: 'Streaming event feed', icon: '📜', defaultCols: 2 },
    { type: 'topology', name: 'Topology', desc: 'ASCII system architecture', icon: '🗺️', defaultCols: 1 },
    { type: 'agents', name: 'Agent Status', desc: 'AI agent tiers and states', icon: '🤖', defaultCols: 1 },
    { type: 'fleet', name: 'Fleet/Devices', desc: 'Connected device mesh', icon: '📡', defaultCols: 1 },
    { type: 'schedule', name: 'Schedule', desc: 'Cron jobs and timers', icon: '⏰', defaultCols: 1 },
    { type: 'kpi', name: 'KPI Cards', desc: 'Big number hero metrics', icon: '🎯', defaultCols: 2 },
    { type: 'progress', name: 'Progress Bars', desc: 'Task completion tracking', icon: '📈', defaultCols: 1 },
    { type: 'links', name: 'Quick Links', desc: 'Navigation shortcuts', icon: '🔗', defaultCols: 1 },
    { type: 'text', name: 'Text Block', desc: 'Custom text / markdown', icon: '📝', defaultCols: 1 },
    { type: 'clock', name: 'Clock', desc: 'Large time display', icon: '🕐', defaultCols: 1 },
];

// ─── DEMO CONFIGS ────────────────────────────────────────────────────────────

const DEMO_CONFIGS = {
    'devops': {
        title: 'DevOps Command Center',
        theme: 'cyberpunk',
        columns: 4,
        panels: [
            { type: 'kpi', title: 'VITALS', cols: 2, data: { items: [
                { label: 'UPTIME', value: '99.97%', color: 'success' },
                { label: 'DEPLOYS', value: '47', color: 'accent' },
                { label: 'ERRORS', value: '3', color: 'danger' },
                { label: 'P95', value: '142ms', color: 'warning' },
            ]}},
            { type: 'services', title: 'SERVICE MESH', cols: 2, data: { items: [
                { name: 'API Gateway', status: 'online', port: 8080 },
                { name: 'Auth Service', status: 'online', port: 3001 },
                { name: 'Database', status: 'online', port: 5432 },
                { name: 'Cache', status: 'online', port: 6379 },
                { name: 'Queue', status: 'online', port: 5672 },
                { name: 'Search', status: 'degraded', port: 9200 },
                { name: 'ML Pipeline', status: 'online', port: 8501 },
                { name: 'CDN', status: 'online', port: 443 },
            ]}},
            { type: 'log', title: 'EVENT STREAM', cols: 2, data: { items: [
                'deploy: frontend v3.2.1 → production',
                'alert: search latency > 200ms',
                'scale: api-gateway replicas 3 → 5',
                'cert: SSL renewed for *.example.com',
                'backup: daily snapshot complete (2.4TB)',
                'health: all 8 services responding',
            ]}},
            { type: 'progress', title: 'SPRINT', cols: 1, data: { items: [
                { label: 'Sprint 47', value: 0.72, color: 'accent' },
                { label: 'Test Coverage', value: 0.89, color: 'success' },
                { label: 'Tech Debt', value: 0.34, color: 'warning' },
            ]}},
            { type: 'clock', title: 'UTC', cols: 1 },
        ],
    },
    'startup': {
        title: 'Startup War Room',
        theme: 'corporate',
        columns: 3,
        panels: [
            { type: 'kpi', title: 'METRICS', cols: 3, data: { items: [
                { label: 'MRR', value: '$24.8k', color: 'success' },
                { label: 'DAU', value: '2,847', color: 'accent' },
                { label: 'CHURN', value: '3.2%', color: 'warning' },
                { label: 'NPS', value: '72', color: 'success' },
                { label: 'CAC', value: '$18', color: 'accent' },
                { label: 'LTV', value: '$340', color: 'success' },
            ]}},
            { type: 'progress', title: 'GOALS', cols: 1, data: { items: [
                { label: 'Q1 Revenue', value: 0.68, color: 'accent' },
                { label: 'User Growth', value: 0.82, color: 'success' },
                { label: 'Feature Ship', value: 0.55, color: 'warning' },
            ]}},
            { type: 'log', title: 'ACTIVITY', cols: 1, data: { items: [
                'signup: 47 new users today',
                'payment: $1,200 MRR added',
                'support: avg response 4m',
                'deploy: v2.8.0 shipped',
                'content: blog post published',
            ]}},
            { type: 'links', title: 'TOOLS', cols: 1, data: { items: [
                { label: 'Analytics', url: '#' },
                { label: 'GitHub', url: '#' },
                { label: 'Stripe', url: '#' },
                { label: 'Slack', url: '#' },
            ]}},
        ],
    },
    'security': {
        title: 'Security Operations Center',
        theme: 'terminal',
        columns: 4,
        panels: [
            { type: 'kpi', title: 'THREAT LEVEL', cols: 2, data: { items: [
                { label: 'THREAT LEVEL', value: 'LOW', color: 'success' },
                { label: 'BLOCKED', value: '1,247', color: 'danger' },
                { label: 'SCANS/HR', value: '892', color: 'accent' },
                { label: 'CERTS VALID', value: '14/14', color: 'success' },
            ]}},
            { type: 'services', title: 'PERIMETER', cols: 2, data: { items: [
                { name: 'Firewall', status: 'online', port: null },
                { name: 'WAF', status: 'online', port: 443 },
                { name: 'IDS/IPS', status: 'online', port: null },
                { name: 'SIEM', status: 'online', port: 9090 },
                { name: 'Vault', status: 'online', port: 8200 },
                { name: 'MFA Gateway', status: 'online', port: 8443 },
            ]}},
            { type: 'log', title: 'THREAT FEED', cols: 2, data: { items: [
                'BLOCK: brute force from 45.33.x.x (Russia)',
                'ALLOW: admin login from trusted IP',
                'SCAN: port sweep detected, auto-blocked',
                'CERT: TLS 1.3 handshake ✓',
                'AUDIT: privilege escalation attempt denied',
                'UPDATE: threat signatures refreshed',
            ]}},
            { type: 'topology', title: 'NETWORK', cols: 1 },
            { type: 'agents', title: 'DEFENSES', cols: 1, data: { items: [
                { name: 'Kavach Shield', tier: 'L1', status: 'active' },
                { name: 'AMGL Guard', tier: 'L2', status: 'active' },
                { name: 'MirrorGate', tier: 'L3', status: 'active' },
            ]}},
        ],
    },
    'creative': {
        title: 'Creative Studio',
        theme: 'vapor',
        columns: 3,
        panels: [
            { type: 'kpi', title: 'VIBES', cols: 3, data: { items: [
                { label: 'PROJECTS', value: '12', color: 'accent' },
                { label: 'RENDERS', value: '847', color: 'accent2' },
                { label: 'EXPORTS', value: '234', color: 'success' },
            ]}},
            { type: 'progress', title: 'ACTIVE', cols: 1, data: { items: [
                { label: 'Album Art', value: 0.9, color: 'accent' },
                { label: 'Music Video', value: 0.45, color: 'accent2' },
                { label: 'Website', value: 0.7, color: 'success' },
            ]}},
            { type: 'schedule', title: 'DEADLINES', cols: 1, data: { items: [
                { name: 'Client Review', time: 'Tomorrow 2pm' },
                { name: 'Final Render', time: 'Friday' },
                { name: 'Launch', time: 'Next Monday' },
            ]}},
            { type: 'links', title: 'TOOLS', cols: 1, data: { items: [
                { label: 'Figma', url: '#' },
                { label: 'Blender', url: '#' },
                { label: 'After Effects', url: '#' },
                { label: 'Midjourney', url: '#' },
            ]}},
        ],
    },
    'homelab': {
        title: 'Homelab Rice',
        theme: 'catppuccin',
        columns: 4,
        panels: [
            { type: 'kpi', title: 'SYSTEM', cols: 2, data: { items: [
                { label: 'CPU', value: '12%', color: 'success' },
                { label: 'RAM', value: '8.2/32G', color: 'accent' },
                { label: 'DISK', value: '847G', color: 'accent2' },
                { label: 'NET', value: '↑2.1 ↓14.7', color: 'success' },
                { label: 'CONTAINERS', value: '23', color: 'accent' },
                { label: 'UPTIME', value: '47d', color: 'success' },
            ]}},
            { type: 'services', title: 'CONTAINERS', cols: 2, data: { items: [
                { name: 'Portainer', status: 'online', port: 9000 },
                { name: 'Traefik', status: 'online', port: 443 },
                { name: 'Jellyfin', status: 'online', port: 8096 },
                { name: 'Nextcloud', status: 'online', port: 8080 },
                { name: 'Pi-hole', status: 'online', port: 53 },
                { name: 'Grafana', status: 'online', port: 3000 },
                { name: 'Prometheus', status: 'online', port: 9090 },
                { name: 'Wireguard', status: 'online', port: 51820 },
            ]}},
            { type: 'progress', title: 'STORAGE', cols: 1, data: { items: [
                { label: 'NVMe Pool', value: 0.42, color: 'accent' },
                { label: 'HDD Array', value: 0.71, color: 'warning' },
                { label: 'Backup', value: 0.28, color: 'success' },
            ]}},
            { type: 'fleet', title: 'NODES', cols: 1, data: { items: [
                { name: 'proxmox-01', status: 'online', ip: '10.0.0.2' },
                { name: 'nas-synology', status: 'online', ip: '10.0.0.5' },
                { name: 'pi-cluster', status: 'online', ip: '10.0.0.10' },
                { name: 'backup-offsite', status: 'online', ip: 'wireguard' },
            ]}},
            { type: 'log', title: 'SYSLOG', cols: 2, data: { items: [
                'docker: jellyfin container healthy',
                'traefik: cert renewed *.home.lab',
                'pihole: 12,847 queries blocked today',
                'backup: nightly snapshot complete',
                'wireguard: 3 peers connected',
                'prometheus: all targets up',
            ]}},
            { type: 'topology', title: 'NETWORK MAP', cols: 1 },
            { type: 'clock', title: 'UPTIME', cols: 1 },
        ],
    },
    'rice': {
        title: 'Desktop Rice',
        theme: 'tokyonight',
        columns: 3,
        panels: [
            { type: 'stats', title: 'FETCH', cols: 1, data: { items: [
                { label: 'WM', value: 'Hyprland' },
                { label: 'Shell', value: 'zsh + starship' },
                { label: 'Term', value: 'kitty' },
                { label: 'Bar', value: 'waybar' },
                { label: 'Font', value: 'JetBrains Mono Nerd' },
                { label: 'GTK', value: 'Catppuccin Mocha' },
            ]}},
            { type: 'kpi', title: 'DOTFILES', cols: 2, data: { items: [
                { label: 'CONFIGS', value: '47', color: 'accent' },
                { label: 'THEMES', value: '12', color: 'accent2' },
                { label: 'STARS', value: '2.4k', color: 'success' },
                { label: 'FORKS', value: '341', color: 'warning' },
            ]}},
            { type: 'services', title: 'DAEMONS', cols: 1, data: { items: [
                { name: 'dunst', status: 'online', port: null },
                { name: 'pipewire', status: 'online', port: null },
                { name: 'waybar', status: 'online', port: null },
                { name: 'swayidle', status: 'online', port: null },
                { name: 'mako', status: 'online', port: null },
            ]}},
            { type: 'progress', title: 'RICE STATUS', cols: 1, data: { items: [
                { label: 'Hyprland config', value: 0.95, color: 'success' },
                { label: 'Waybar modules', value: 0.8, color: 'accent' },
                { label: 'Neovim setup', value: 0.7, color: 'accent2' },
                { label: 'Color consistency', value: 0.6, color: 'warning' },
            ]}},
            { type: 'text', title: 'NEOFETCH', cols: 1, data: { text: '       /\\        user@arch\n      /  \\       os: Arch Linux\n     /\\   \\      kernel: 6.7.4\n    /  .. \\  \\    uptime: 3d 14h\n   /  .  .  \\   packages: 1,247\n  / .      . \\  shell: zsh 5.9' }},
        ],
    },
};

// ─── EFFECTS ─────────────────────────────────────────────────────────────────

function MatrixEffect({ theme }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const chars = 'アイウエオカキクケコ01MIRROR⟡◈';
        const cols = Math.floor(w / 14);
        const drops = Array(cols).fill(0).map(() => Math.random() * -100);
        const color = theme.accent;
        const draw = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = '12px monospace';
            for (let i = 0; i < drops.length; i++) {
                ctx.fillStyle = color + '18';
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, drops[i] * 14);
                if (drops[i] * 14 > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 50);
        const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { clearInterval(interval); window.removeEventListener('resize', onResize); };
    }, [theme]);
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.5 }} />;
}

function ScanlineEffect() {
    return <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.3,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)',
    }} />;
}

function CrtCurve() {
    return <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998,
        background: 'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.4) 100%)',
        borderRadius: '20px',
    }} />;
}

// ─── PANEL RENDERERS ─────────────────────────────────────────────────────────

function PanelShell({ title, theme, children, cols = 1 }) {
    return (
        <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
            gridColumn: `span ${cols}`,
            boxShadow: theme.effects?.includes('glow') ? `0 0 8px ${theme.accent}10` : 'none',
        }}>
            <div style={{
                background: `linear-gradient(90deg, ${theme.accent}15, transparent)`,
                borderBottom: `1px solid ${theme.border}`,
                padding: '6px 10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ color: theme.accent, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: theme.font }}>
                    {title}
                </span>
                <span style={{ color: theme.dim, fontSize: '0.55rem', fontFamily: theme.font }}>
                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </span>
            </div>
            <div style={{ padding: '8px 10px', fontFamily: theme.font }}>{children}</div>
        </div>
    );
}

function KpiPanel({ panel, theme }) {
    const items = panel.data?.items || [];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 6)}, 1fr)`, gap: '8px' }}>
                {items.map((item, i) => {
                    const color = theme[item.color] || theme.accent;
                    return (
                        <div key={i} style={{
                            textAlign: 'center', padding: '10px 6px',
                            background: `${color}08`, border: `1px solid ${color}20`,
                            borderRadius: theme.borderRadius,
                        }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color, textShadow: theme.effects?.includes('glow') ? `0 0 10px ${color}40` : 'none' }}>
                                {item.value}
                            </div>
                            <div style={{ fontSize: '0.5rem', color: theme.dim, letterSpacing: '1px', marginTop: '3px' }}>{item.label}</div>
                        </div>
                    );
                })}
            </div>
        </PanelShell>
    );
}

function StatsPanel({ panel, theme }) {
    return <KpiPanel panel={panel} theme={theme} />;
}

function ServicesPanel({ panel, theme }) {
    const items = panel.data?.items || [];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '4px' }}>
                {items.map((svc, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '4px 6px', background: `${theme.accent}05`, border: `1px solid ${theme.border}`,
                        borderRadius: theme.borderRadius, fontSize: '0.62rem',
                    }}>
                        <span style={{ color: theme.text }}>{svc.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {svc.port && <span style={{ color: theme.dim, fontSize: '0.5rem' }}>:{svc.port}</span>}
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                                background: svc.status === 'online' ? theme.success : svc.status === 'degraded' ? theme.warning : theme.danger,
                                boxShadow: svc.status === 'online' && theme.effects?.includes('glow') ? `0 0 4px ${theme.success}` : 'none',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </PanelShell>
    );
}

function LogPanel({ panel, theme }) {
    const items = panel.data?.items || [];
    const [logs, setLogs] = useState(items.map((msg, i) => ({
        t: new Date(Date.now() - i * 60000).toLocaleTimeString('en-US', { hour12: false }),
        msg,
    })));
    useEffect(() => {
        const t = setInterval(() => {
            const msg = items[Math.floor(Math.random() * items.length)];
            setLogs(prev => [{ t: new Date().toLocaleTimeString('en-US', { hour12: false }), msg }, ...prev.slice(0, 8)]);
        }, 6000);
        return () => clearInterval(t);
    }, [items]);
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {logs.map((l, i) => (
                <div key={i} style={{
                    display: 'flex', gap: '8px', padding: '2px 0', fontSize: '0.6rem',
                    opacity: 1 - i * 0.08, borderBottom: `1px solid ${theme.border}`,
                }}>
                    <span style={{ color: theme.dim, flexShrink: 0, width: '55px' }}>{l.t}</span>
                    <span style={{ color: i === 0 ? theme.accent : theme.text }}>{l.msg}</span>
                </div>
            ))}
        </PanelShell>
    );
}

function ProgressPanel({ panel, theme }) {
    const items = panel.data?.items || [];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {items.map((item, i) => {
                const color = theme[item.color] || theme.accent;
                return (
                    <div key={i} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '3px' }}>
                            <span style={{ color: theme.text }}>{item.label}</span>
                            <span style={{ color }}>{Math.round(item.value * 100)}%</span>
                        </div>
                        <div style={{ height: '4px', background: `${theme.border}`, borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${item.value * 100}%`, height: '100%', background: color,
                                borderRadius: '2px', transition: 'width 1s',
                                boxShadow: theme.effects?.includes('glow') ? `0 0 6px ${color}60` : 'none',
                            }} />
                        </div>
                    </div>
                );
            })}
        </PanelShell>
    );
}

function TopologyPanel({ panel, theme }) {
    return (
        <PanelShell title={panel.title || 'TOPOLOGY'} theme={theme} cols={panel.cols}>
            <pre style={{ color: theme.dim, fontSize: '0.5rem', lineHeight: 1.5, margin: 0, fontFamily: theme.font }}>
{`  ┌────────────┐
  │  Gateway   │
  └─────┬──────┘
    ┌───┴───┐
    ▼       ▼
 ┌─────┐ ┌─────┐
 │ App │ │ API │
 └──┬──┘ └──┬──┘
    └───┬────┘
        ▼
    ┌───────┐
    │  DB   │
    └───────┘`}
            </pre>
        </PanelShell>
    );
}

function AgentsPanel({ panel, theme }) {
    const items = panel.data?.items || [
        { name: 'Primary', tier: 'T1', status: 'active' },
        { name: 'Secondary', tier: 'T2', status: 'standby' },
        { name: 'Local', tier: 'T3', status: 'ready' },
    ];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {items.map((a, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 6px', marginBottom: '4px',
                    background: `${theme.accent}05`, border: `1px solid ${theme.border}`,
                    borderRadius: theme.borderRadius, fontSize: '0.62rem',
                }}>
                    <span style={{ color: theme.accent }}>{a.name} <span style={{ color: theme.dim }}>[{a.tier}]</span></span>
                    <span style={{ color: a.status === 'active' ? theme.success : theme.dim, fontSize: '0.55rem' }}>
                        {a.status.toUpperCase()}
                    </span>
                </div>
            ))}
        </PanelShell>
    );
}

function FleetPanel({ panel, theme }) {
    const items = panel.data?.items || [
        { name: 'Server', role: 'HUB', status: 'online' },
        { name: 'Mobile', role: 'CLIENT', status: 'online' },
    ];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {items.map((d, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '3px 0', borderBottom: `1px solid ${theme.border}`, fontSize: '0.62rem',
                }}>
                    <span style={{ color: theme.text }}>{d.name} <span style={{ color: theme.dim }}>[{d.role}]</span></span>
                    <span style={{
                        width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
                        background: d.status === 'online' ? theme.success : theme.danger,
                    }} />
                </div>
            ))}
        </PanelShell>
    );
}

function SchedulePanel({ panel, theme }) {
    const items = panel.data?.items || [];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {items.map((s, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '3px 0',
                    borderBottom: `1px solid ${theme.border}`, fontSize: '0.6rem',
                }}>
                    <span style={{ color: theme.text }}>{s.name}</span>
                    <span style={{ color: theme.dim }}>{s.time}</span>
                </div>
            ))}
        </PanelShell>
    );
}

function LinksPanel({ panel, theme }) {
    const items = panel.data?.items || [];
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            {items.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', padding: '4px 6px', marginBottom: '3px',
                    background: `${theme.accent}08`, border: `1px solid ${theme.border}`,
                    borderRadius: theme.borderRadius, textDecoration: 'none',
                    color: theme.accent, fontSize: '0.62rem',
                }}>
                    {l.label} →
                </a>
            ))}
        </PanelShell>
    );
}

function TextPanel({ panel, theme }) {
    return (
        <PanelShell title={panel.title} theme={theme} cols={panel.cols}>
            <div style={{ color: theme.text, fontSize: '0.7rem', lineHeight: 1.6 }}>
                {panel.data?.text || 'Custom content goes here.'}
            </div>
        </PanelShell>
    );
}

function ClockPanel({ panel, theme }) {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return (
        <PanelShell title={panel.title || 'CLOCK'} theme={theme} cols={panel.cols}>
            <div style={{
                textAlign: 'center', padding: '12px 0',
                fontSize: '1.8rem', fontWeight: 700, color: theme.accent,
                textShadow: theme.effects?.includes('glow') ? `0 0 15px ${theme.accent}40` : 'none',
                fontFamily: theme.font,
            }}>
                {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div style={{ textAlign: 'center', color: theme.dim, fontSize: '0.6rem' }}>
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </PanelShell>
    );
}

const RENDERERS = {
    stats: StatsPanel, kpi: KpiPanel, services: ServicesPanel, log: LogPanel,
    topology: TopologyPanel, agents: AgentsPanel, fleet: FleetPanel,
    schedule: SchedulePanel, progress: ProgressPanel, links: LinksPanel,
    text: TextPanel, clock: ClockPanel,
};

// ─── DASHBOARD RENDERER ──────────────────────────────────────────────────────

function DashboardRenderer({ config }) {
    const theme = THEMES[config.theme] || THEMES.cyberpunk;
    const effects = theme.effects || [];

    return (
        <div style={{
            minHeight: '100vh', background: theme.bg, color: theme.text,
            fontFamily: theme.font, position: 'relative', overflow: 'hidden',
        }}>
            {effects.includes('matrix') && <MatrixEffect theme={theme} />}
            {effects.includes('scanlines') && <ScanlineEffect />}
            {effects.includes('crt-curve') && <CrtCurve />}

            <div style={{ position: 'relative', zIndex: 10, padding: '12px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', marginBottom: '12px',
                    borderBottom: `1px solid ${theme.border}`,
                }}>
                    <div>
                        <div style={{
                            fontSize: '1.1rem', fontWeight: 800, color: theme.accent,
                            letterSpacing: '2px',
                            textShadow: effects.includes('glow') ? `0 0 10px ${theme.accent}40` : 'none',
                        }}>
                            ⟡ {config.title || 'DASHBOARD'}
                        </div>
                        <div style={{ color: theme.dim, fontSize: '0.6rem', marginTop: '2px' }}>
                            Powered by DashGen · Theme: {theme.name}
                        </div>
                    </div>
                    <div style={{
                        padding: '3px 10px', borderRadius: theme.borderRadius,
                        background: `${theme.success}15`, color: theme.success,
                        fontSize: '0.6rem', fontWeight: 600,
                    }}>LIVE</div>
                </div>

                {/* Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)`,
                    gap: '8px',
                    maxWidth: '1600px',
                    margin: '0 auto',
                }}>
                    {(config.panels || []).map((panel, i) => {
                        const Renderer = RENDERERS[panel.type];
                        if (!Renderer) return null;
                        return <Renderer key={i} panel={panel} theme={theme} />;
                    })}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                ${effects.includes('flicker') ? '@keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:0.8}94%{opacity:1}} body{animation:flicker 6s infinite}' : ''}
            `}</style>
        </div>
    );
}

// ─── CONFIG EDITOR ───────────────────────────────────────────────────────────

function ConfigEditor({ config, setConfig, onPreview }) {
    const [jsonMode, setJsonMode] = useState(false);
    const [jsonText, setJsonText] = useState('');

    const updateField = (field, value) => setConfig(c => ({ ...c, [field]: value }));

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0a0f', color: '#e5e7eb',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Top bar */}
            <div style={{
                padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⟡ DashGen</span>
                        <span style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: 400 }}>Universal Dashboard Generator</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                        setJsonMode(!jsonMode);
                        if (!jsonMode) setJsonText(JSON.stringify(config, null, 2));
                    }} style={btnStyle('#6366f1')}>
                        {jsonMode ? 'Visual' : 'JSON'}
                    </button>
                    <button onClick={onPreview} style={btnStyle('#10b981')}>
                        Preview →
                    </button>
                    <ExportDropdown config={config} />
                </div>
            </div>

            <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Sidebar: Theme + presets */}
                <div style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '16px', flexShrink: 0 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Dashboard Title</label>
                        <input
                            value={config.title || ''}
                            onChange={e => updateField('title', e.target.value)}
                            style={inputStyle}
                            placeholder="My Dashboard"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Columns</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => updateField('columns', n)}
                                    style={{
                                        ...btnSmall,
                                        background: config.columns === n ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                        color: config.columns === n ? '#fff' : '#9ca3af',
                                    }}>{n}</button>
                            ))}
                        </div>
                    </div>

                    <label style={labelStyle}>Theme</label>
                    <div style={{ display: 'grid', gap: '6px', marginBottom: '20px' }}>
                        {Object.entries(THEMES).map(([key, t]) => (
                            <button key={key} onClick={() => updateField('theme', key)} style={{
                                padding: '10px 12px', borderRadius: '8px', border: '1px solid',
                                borderColor: config.theme === key ? t.accent : 'rgba(255,255,255,0.08)',
                                background: config.theme === key ? `${t.accent}15` : 'rgba(255,255,255,0.03)',
                                color: '#e5e7eb', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem',
                            }}>
                                <div style={{ fontWeight: 600, color: t.accent }}>{t.name}</div>
                                <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '2px' }}>{t.desc}</div>
                            </button>
                        ))}
                    </div>

                    <label style={labelStyle}>Presets</label>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {Object.entries(DEMO_CONFIGS).map(([key, demo]) => (
                            <button key={key} onClick={() => setConfig(demo)} style={{
                                padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.03)', color: '#e5e7eb',
                                textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem',
                            }}>
                                {demo.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main: Panel editor or JSON */}
                <div style={{ flex: 1, padding: '16px' }}>
                    {jsonMode ? (
                        <div>
                            <textarea
                                value={jsonText}
                                onChange={e => {
                                    setJsonText(e.target.value);
                                    try { setConfig(JSON.parse(e.target.value)); } catch {}
                                }}
                                style={{
                                    width: '100%', height: 'calc(100vh - 140px)',
                                    background: '#12121a', color: '#a6e3a1', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', padding: '16px', fontSize: '0.8rem',
                                    fontFamily: "'JetBrains Mono', monospace", resize: 'none',
                                }}
                            />
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={labelStyle}>Panels ({(config.panels || []).length})</label>
                                <div style={{ position: 'relative' }}>
                                    <AddPanelDropdown config={config} setConfig={setConfig} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {(config.panels || []).map((panel, i) => (
                                    <div key={i} style={{
                                        padding: '12px', borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.03)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div>
                                            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8rem' }}>{panel.title || panel.type}</span>
                                            <span style={{ color: '#6b7280', fontSize: '0.65rem', marginLeft: '8px' }}>{panel.type} · span {panel.cols || 1}</span>
                                        </div>
                                        <button onClick={() => {
                                            setConfig(c => ({ ...c, panels: c.panels.filter((_, j) => j !== i) }));
                                        }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AddPanelDropdown({ config, setConfig }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(!open)} style={btnStyle('#6366f1')}>+ Add Panel</button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                    background: '#1a1a25', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '8px', width: '240px', zIndex: 100,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                }}>
                    {PANEL_CATALOG.map(p => (
                        <button key={p.type} onClick={() => {
                            setConfig(c => ({
                                ...c,
                                panels: [...(c.panels || []), {
                                    type: p.type, title: p.name.toUpperCase(), cols: p.defaultCols,
                                    data: p.type === 'kpi' ? { items: [{ label: 'METRIC', value: '0', color: 'accent' }] } :
                                          p.type === 'clock' ? {} : { items: [] },
                                }],
                            }));
                            setOpen(false);
                        }} style={{
                            display: 'block', width: '100%', padding: '8px 10px',
                            background: 'transparent', border: 'none', color: '#e5e7eb',
                            textAlign: 'left', cursor: 'pointer', borderRadius: '4px',
                            fontSize: '0.8rem',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(99,102,241,0.1)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                            {p.icon} {p.name} <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>— {p.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

function themeToAlacritty(theme) {
    return `# DashGen — ${theme.name} for Alacritty
[colors.primary]
background = "${theme.bg}"
foreground = "${theme.text}"

[colors.normal]
black = "${theme.bg}"
red = "${theme.danger}"
green = "${theme.success}"
yellow = "${theme.warning}"
blue = "${theme.accent}"
magenta = "${theme.accent2}"
cyan = "${theme.accent}"
white = "${theme.text}"

[colors.bright]
black = "${theme.dim}"
red = "${theme.danger}"
green = "${theme.success}"
yellow = "${theme.warning}"
blue = "${theme.accent}"
magenta = "${theme.accent2}"
cyan = "${theme.accent}"
white = "${theme.text}"

[font]
size = 13.0

[font.normal]
family = "${(theme.font.split("'")[1] || 'JetBrains Mono')}"
`;
}

function themeToKitty(theme) {
    return `# DashGen — ${theme.name} for Kitty
background ${theme.bg}
foreground ${theme.text}
selection_background ${theme.accent}
selection_foreground ${theme.bg}
cursor ${theme.accent}
color0 ${theme.bg}
color1 ${theme.danger}
color2 ${theme.success}
color3 ${theme.warning}
color4 ${theme.accent}
color5 ${theme.accent2}
color6 ${theme.accent}
color7 ${theme.text}
color8 ${theme.dim}
color9 ${theme.danger}
color10 ${theme.success}
color11 ${theme.warning}
color12 ${theme.accent}
color13 ${theme.accent2}
color14 ${theme.accent}
color15 ${theme.text}
font_family ${(theme.font.split("'")[1] || 'JetBrains Mono')}
font_size 13.0
`;
}

function themeToCSS(theme) {
    return `/* DashGen — ${theme.name} CSS Variables */
:root {
  --bg: ${theme.bg};
  --surface: ${theme.surface};
  --border: ${theme.border};
  --text: ${theme.text};
  --dim: ${theme.dim};
  --accent: ${theme.accent};
  --accent2: ${theme.accent2};
  --success: ${theme.success};
  --warning: ${theme.warning};
  --danger: ${theme.danger};
  --font: ${theme.font};
  --radius: ${theme.borderRadius};
}
`;
}

function downloadBlob(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

function ExportDropdown({ config }) {
    const [open, setOpen] = useState(false);
    const theme = THEMES[config.theme] || THEMES.cyberpunk;
    const formats = [
        { label: 'Dashboard JSON', ext: 'json', fn: () => downloadBlob(JSON.stringify(config, null, 2), 'dashboard.json', 'application/json') },
        { label: 'Alacritty Config', ext: 'toml', fn: () => downloadBlob(themeToAlacritty(theme), `${config.theme}-alacritty.toml`) },
        { label: 'Kitty Config', ext: 'conf', fn: () => downloadBlob(themeToKitty(theme), `${config.theme}-kitty.conf`) },
        { label: 'CSS Variables', ext: 'css', fn: () => downloadBlob(themeToCSS(theme), `${config.theme}-theme.css`) },
    ];
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={btnStyle('#f59e0b')}>Export ▾</button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                    background: '#1a1a25', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '4px', width: '200px', zIndex: 100,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                }}>
                    {formats.map(f => (
                        <button key={f.label} onClick={() => { f.fn(); setOpen(false); }} style={{
                            display: 'block', width: '100%', padding: '8px 10px',
                            background: 'transparent', border: 'none', color: '#e5e7eb',
                            textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(245,158,11,0.1)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                            {f.label} <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>.{f.ext}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────

const btnStyle = (color) => ({
    padding: '8px 16px', borderRadius: '6px', border: `1px solid ${color}40`,
    background: `${color}15`, color, cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, fontFamily: 'inherit',
});

const btnSmall = {
    padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
};

const labelStyle = {
    display: 'block', fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '1px', marginBottom: '6px', fontWeight: 600,
};

const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit',
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function DashGen() {
    const [mode, setMode] = useState('editor'); // 'editor' | 'preview'
    const [config, setConfig] = useState(DEMO_CONFIGS.devops);

    if (mode === 'preview') {
        return (
            <div>
                <div style={{
                    position: 'fixed', top: 10, right: 10, zIndex: 10000,
                    display: 'flex', gap: '6px',
                }}>
                    <button onClick={() => setMode('editor')} style={{
                        ...btnStyle('#6366f1'),
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    }}>← Editor</button>
                </div>
                <DashboardRenderer config={config} />
            </div>
        );
    }

    return <ConfigEditor config={config} setConfig={setConfig} onPreview={() => setMode('preview')} />;
}
