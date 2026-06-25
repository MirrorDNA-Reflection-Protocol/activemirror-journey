/**
 * Status Page — Public system status dashboard for Active MirrorOS
 * Shows stack layers, repo health, shipping velocity, and architecture.
 * Data: src/data/builds.json (auto-synced from SHIPLOG)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Cpu, Brain, Layers, Activity, GitBranch,
    Server, Smartphone, Globe, Lock, CheckCircle, ArrowRight,
    Monitor, Map
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';
import buildsData from '../data/builds.json';

const STACK_LAYERS = [
    {
        id: 'L1',
        name: 'Identity Kernel',
        description: 'Sovereign identity core — tone, values, biographical truth. Immutable within session.',
        icon: Lock,
        color: 'purple',
        components: ['MirrorSeed', 'Purpose Declaration', 'Consent Proof', 'Identity Hash Chain'],
    },
    {
        id: 'L2',
        name: 'Protocol Layer',
        description: 'MirrorDNA Standard — behavioral protocols, interaction rules, conformance tests.',
        icon: Layers,
        color: 'blue',
        components: ['MirrorDNA Standard v1.1', 'Intent Envelope', 'Capability Token', 'Ledger Entry', 'Drift Event'],
    },
    {
        id: 'L3',
        name: 'Governance Layer',
        description: 'TrustByDesign — safety controls, audit evidence, compliance mappings.',
        icon: Shield,
        color: 'green',
        components: ['ARIC Controls', 'Code Security (AICS)', 'Mission Control (MC)', 'Audit Pack Generator'],
    },
    {
        id: 'L4',
        name: 'Runtime Substrate',
        description: 'MirrorDNA Lattice — state propagation, layer contracts, anomaly detection.',
        icon: Activity,
        color: 'amber',
        components: ['Layer Contracts', 'Anomaly Detection (L2.5)', 'Code Interceptor (L2.6)', 'Autonomy Gate (L3.2)'],
    },
    {
        id: 'L5',
        name: 'Orchestration',
        description: 'ActiveMirrorOS — purpose-first control plane. Gate, route, infer, synthesize.',
        icon: Brain,
        color: 'rose',
        components: ['MirrorGate', 'Intelligent Router', 'FEU Layer', 'Synthesis', 'Control Plane API'],
    },
    {
        id: 'L6',
        name: 'Products',
        description: 'Consumer and developer products built on the stack.',
        icon: Smartphone,
        color: 'cyan',
        components: ['MirrorBrain Mobile', 'Chetana', 'Cognitive Dashboard', 'MirrorSwarm', 'Kavach'],
    },
];

const REPOS = [
    { name: 'MirrorDNA-Standard', visibility: 'public', description: 'Protocol primitives + conformance' },
    { name: 'TrustByDesign', visibility: 'private', description: 'Safety controls + audit framework' },
    { name: 'MirrorDNA-Lattice', visibility: 'private', description: 'Runtime topology + invariants' },
    { name: 'activemirror-os', visibility: 'private', description: 'Control plane + orchestration' },
    { name: 'MirrorBrain-Mobile', visibility: 'private', description: 'Mobile cognitive companion' },
    { name: 'activemirror-site', visibility: 'public', description: 'This site' },
    { name: 'mirrorswarm', visibility: 'private', description: 'Multi-agent orchestration engine' },
    { name: 'kavach', visibility: 'private', description: 'Scam detection + citizen safety' },
];

const PRINCIPLES = [
    { label: 'Sovereign', detail: 'Your data stays on your hardware. Zero cloud dependencies for core operation.' },
    { label: 'Purpose-First', detail: 'Every inference is gated by declared purpose and human consent.' },
    { label: 'Fail-Closed', detail: 'When uncertain, the system refuses rather than fabricates.' },
    { label: 'Evidence-Based', detail: 'Every control maps to audit evidence. Compliance is mechanical, not narrative.' },
];

function colorClasses(color, isDark) {
    const map = {
        purple: { bg: isDark ? 'bg-purple-500/15' : 'bg-purple-100', text: isDark ? 'text-purple-400' : 'text-purple-600', border: isDark ? 'border-purple-500/30' : 'border-purple-200' },
        blue:   { bg: isDark ? 'bg-blue-500/15' : 'bg-blue-100', text: isDark ? 'text-blue-400' : 'text-blue-600', border: isDark ? 'border-blue-500/30' : 'border-blue-200' },
        green:  { bg: isDark ? 'bg-green-500/15' : 'bg-green-100', text: isDark ? 'text-green-400' : 'text-green-600', border: isDark ? 'border-green-500/30' : 'border-green-200' },
        amber:  { bg: isDark ? 'bg-amber-500/15' : 'bg-amber-100', text: isDark ? 'text-amber-400' : 'text-amber-600', border: isDark ? 'border-amber-500/30' : 'border-amber-200' },
        rose:   { bg: isDark ? 'bg-rose-500/15' : 'bg-rose-100', text: isDark ? 'text-rose-400' : 'text-rose-600', border: isDark ? 'border-rose-500/30' : 'border-rose-200' },
        cyan:   { bg: isDark ? 'bg-cyan-500/15' : 'bg-cyan-100', text: isDark ? 'text-cyan-400' : 'text-cyan-600', border: isDark ? 'border-cyan-500/30' : 'border-cyan-200' },
    };
    return map[color] || map.purple;
}

function StackCard({ layer, index, isDark }) {
    const Icon = layer.icon;
    const c = colorClasses(layer.color, isDark);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
                            {layer.id}
                        </span>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {layer.name}
                        </h3>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {layer.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {layer.components.map((comp, i) => (
                            <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded-md ${
                                    isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                                }`}
                            >
                                {comp}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, sub, icon: Icon, isDark }) {
    return (
        <div className={`rounded-xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-purple-500/15' : 'bg-purple-100'
                }`}>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</div>
                    <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</div>
                </div>
            </div>
            {sub && <div className={`text-xs mt-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{sub}</div>}
        </div>
    );
}

export default function Status() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const totalCapabilities = buildsData.total_capabilities || 0;
    const totalModules = buildsData.total_modules || 0;
    const latestShip = buildsData.latest_ship || '';

    return (
        <PageLayout>
            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Activity className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`text-sm font-mono ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            System Status
                        </span>
                    </div>
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Active MirrorOS Stack
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        A sovereign AI operating system built on a Mac Mini in Goa.
                        Six layers from identity to products. Everything runs locally.
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <StatCard label="Shipped Capabilities" value={totalCapabilities} icon={CheckCircle} isDark={isDark} />
                    <StatCard label="Modules" value={totalModules} icon={Cpu} isDark={isDark} />
                    <StatCard label="Repos" value="116" icon={GitBranch} isDark={isDark} />
                    <StatCard label="Latest Ship" value={latestShip} icon={Activity} isDark={isDark} />
                </div>

                {/* Architecture Stack */}
                <div className="mb-16">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Architecture
                    </h2>
                    <div className="space-y-4">
                        {STACK_LAYERS.map((layer, i) => (
                            <StackCard key={layer.id} layer={layer} index={i} isDark={isDark} />
                        ))}
                    </div>
                </div>

                {/* Dashboards */}
                <div className="mb-16">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Live Dashboards
                    </h2>
                    <div className="space-y-6">
                        {/* Cognitive Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className={`rounded-xl border overflow-hidden ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src="/images/cognitive-dashboard-live.png"
                                    alt="Cognitive Dashboard — live system telemetry"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Monitor className={`w-4 h-4 text-green-400`} />
                                        <span className="text-green-400 text-xs font-mono">LIVE</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Cognitive Dashboard</h3>
                                    <p className="text-zinc-300 text-sm">Infrastructure, sessions, Paul context, CC activity, routing, integrity, transparency, factory, vitals, fleet, automations, loops, and intelligence lanes.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Dual View — Cog Dashboard + System Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                            className={`rounded-xl border overflow-hidden ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src="/images/dashboards-dual-view.png"
                                    alt="Cognitive Dashboard and System Map running side by side"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-bold text-lg">Full Operations View</h3>
                                    <p className="text-zinc-300 text-sm">Cognitive Dashboard + System Map running side by side. Service mesh topology, port registry, fleet status, automations, and the wider operator surface.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* System Map + Evolution Velocity cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className={`rounded-xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-100'}`}>
                                        <Map className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>System Map</h3>
                                        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Full topology view</p>
                                    </div>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    Service mesh topology, port registry, Tailscale network, device fleet, Ollama models, LaunchAgent grid. Single-command system overview.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.85 }}
                                className={`rounded-xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
                                        <Activity className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Evolution Velocity</h3>
                                        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>7-day telemetry</p>
                                    </div>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    Ships per day, factory runs, self-heal events, swarm health, cache freshness, session scores. Tracks the system's own rate of improvement.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Principles */}
                <div className="mb-16">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Design Principles
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {PRINCIPLES.map((p, i) => (
                            <motion.div
                                key={p.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className={`rounded-xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{p.label}</h3>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{p.detail}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Key Repos */}
                <div className="mb-16">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Key Repositories
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {REPOS.map((repo, i) => (
                            <motion.div
                                key={repo.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                                className={`flex items-center gap-3 rounded-lg p-4 border ${
                                    isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-white'
                                }`}
                            >
                                <GitBranch className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {repo.name}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            repo.visibility === 'public'
                                                ? isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-700'
                                                : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-500'
                                        }`}>
                                            {repo.visibility}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{repo.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={`text-center rounded-xl border p-8 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'}`}
                >
                    <Server className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Built by one person. Runs on one machine.
                    </h3>
                    <p className={`text-sm mb-4 max-w-lg mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        116 repositories, 17 local models, zero cloud dependencies.
                        One year of building a sovereign AI operating system from Goa, India.
                    </p>
                    <a
                        href="/builds"
                        className={`inline-flex items-center gap-2 text-sm font-medium ${
                            isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                        }`}
                    >
                        View all shipped capabilities <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </PageLayout>
    );
}
