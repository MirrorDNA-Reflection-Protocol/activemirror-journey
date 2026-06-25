/**
 * ⟡ MirrorGate Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Check, ArrowRight, Github, Lock, Eye, AlertTriangle, Zap } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Lock, title: 'Pre-Inference Policy', desc: 'Enforce rules before AI executes, not after damage is done' },
    { icon: Eye, title: 'Cryptographic Audit', desc: 'Every request signed and logged for full accountability' },
    { icon: AlertTriangle, title: 'Fail-Closed Design', desc: 'If policy check fails, request is blocked. No bypass.' },
    { icon: Zap, title: 'Real-Time Enforcement', desc: 'Sub-millisecond policy evaluation at inference time' },
];

const useCases = [
    'Block prompt injection attempts before they reach the model',
    'Enforce data residency and compliance boundaries',
    'Rate limit by user, team, or cost center',
    'Audit all AI interactions for regulatory compliance',
    'Prevent unauthorized model access or capability use',
];

export default function MirrorGatePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Shield size={32} className="text-purple-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        MirrorGate
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-purple-400`}>
                        Governance before generation.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Policy-driven proxy that governs AI requests <strong>before</strong> they execute.
                        Safety by design, not by hope. Infrastructure-level control for organizations that refuse to gamble on AI behavior.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrorgate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all"
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

            {/* What it's NOT */}
            <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What MirrorGate is NOT
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            'Not prompt engineering — This is infrastructure-level control',
                            'Not content moderation — This is pre-inference policy enforcement',
                            'Not an AI wrapper — This is a cryptographically auditable control plane',
                            'Not optional safety — Fail-closed by default, no bypass',
                        ].map((item, i) => (
                            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${
                                isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                            }`}>
                                <span className="text-red-400">✕</span>
                                <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Core Capabilities
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${
                                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                            }`}>
                                <f.icon size={24} className="text-purple-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What You Can Do
                    </h2>
                    <ul className="space-y-4">
                        {useCases.map((uc, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <Check size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{uc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Ready to govern your AI?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        MirrorGate is open source and ready for self-hosting.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/docs/self-hosting" className="px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                            Self-Host Guide
                        </Link>
                        <Link to="/about/contact" className={`px-6 py-3 rounded-xl font-medium ${
                            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                        }`}>
                            Enterprise Inquiry
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
