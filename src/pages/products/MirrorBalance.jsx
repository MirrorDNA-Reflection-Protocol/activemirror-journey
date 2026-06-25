/**
 * MirrorBalance Product Page — Sovereign Governance Engine
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Check, ArrowRight, Github, Shield, Activity, Layers, BarChart3 } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Shield, title: 'Policy DSL', desc: 'Define governance rules as structured policies — not prompts. Deterministic evaluation at runtime.' },
    { icon: Activity, title: 'Sovereign Control Plane', desc: 'Autonomy layer, drift firewall, entropy engine, replay, economic policy. Full v3 architecture.' },
    { icon: Layers, title: 'Multi-Layer Defense', desc: 'PDM, AIPL, MTA, MCC, ARR — five defense modules that work at different enforcement levels.' },
    { icon: BarChart3, title: 'Evidence & Audit', desc: 'Every governance decision logged with evidence chains. Cryptographic verification of policy compliance.' },
];

const capabilities = [
    'ALLOW / ASK / BLOCK decisions on every agent action',
    'Maturity-level scoring (L0-L5) for organizational AI readiness',
    'Drift detection and automatic policy tightening',
    'Economic policy enforcement — cost limits, budget allocation',
    'Replay engine — re-run past decisions under new policies',
    'WebMCP gateway for browser-based governance control',
    '189 tests passing — production-grade reliability',
];

export default function MirrorBalancePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-amber-500/20">
                            <Scale size={32} className="text-amber-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">v1.0.0</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        MirrorBalance
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-amber-400`}>
                        Governance you can prove.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Sovereign governance engine for AI systems. Policy DSL, multi-layer defense,
                        evidence chains, and a full Sovereign Control Plane.
                        Every decision auditable. Every action evaluated. No trust required.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrorbalance"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-amber-600 hover:bg-amber-500 text-white transition-all"
                        >
                            <Github size={20} />
                            View Source
                        </a>
                        <Link
                            to="/docs"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                            }`}
                        >
                            Documentation
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Architecture
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map(f => (
                            <div key={f.title} className={`p-5 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                                <f.icon size={24} className="text-amber-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What It Does
                    </h2>
                    <div className="space-y-3">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{cap}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        How It Fits
                    </h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        MirrorBalance evaluates every action before execution. MirrorGate enforces the decision.
                        Together, they form the governance stack — policy (Balance) + enforcement (Gate).
                    </p>
                    <div className={`p-6 rounded-xl font-mono text-sm ${isDark ? 'bg-black/40 text-zinc-300' : 'bg-zinc-800 text-zinc-200'}`}>
                        <div className="text-amber-400">Agent Action Request</div>
                        <div className="ml-4">{"→ MirrorBalance /evaluate (policy check)"}</div>
                        <div className="ml-8 text-green-400">{"→ ALLOW → MirrorGate (enforcement)"}</div>
                        <div className="ml-8 text-yellow-400">{"→ ASK → log warning, proceed"}</div>
                        <div className="ml-8 text-red-400">{"→ BLOCK → action denied, evidence logged"}</div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
