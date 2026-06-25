/**
 * ⟡ Architecture Overview
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Layers, Shield, Database, MessageSquare, BarChart3, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const layers = [
    { name: 'Identity Layer', icon: Shield, desc: 'MirrorDNA constitution, Master Citation versioning, GlyphOS symbolic language', color: 'purple' },
    { name: 'Engine Layer', icon: MessageSquare, desc: 'MirrorBrain backend, local model routing, JSON Kernel for structured reasoning', color: 'violet' },
    { name: 'Memory Layer', icon: Database, desc: 'MirrorRecall sessions, profile facts, ChromaDB vault, continuity snapshots', color: 'cyan' },
    { name: 'Governance Layer', icon: Shield, desc: 'MirrorGate policy enforcement, pre-inference validation, audit trails', color: 'emerald' },
    { name: 'Observability Layer', icon: BarChart3, desc: 'GlyphTrail visualization, MirrorDNA traces, cryptographic attestations', color: 'amber' },
    { name: 'Compliance Layer', icon: CheckCircle, desc: 'TrustByDesign framework, GDPR/HIPAA/SOC2, audit reporting', color: 'green' },
];

const principles = [
    { title: 'Vault Supremacy', desc: 'When memory conflicts with the Vault, the Vault wins. Always.' },
    { title: 'Zero Drift', desc: 'Identity enforced through checksums, lineage tracking, and verification.' },
    { title: 'Truth-State Law', desc: 'Every claim classified as Fact, Estimate, or Unknown. No invention.' },
    { title: 'Memory Informs, Never Authorizes', desc: 'High-stakes actions need fresh confirmation.' },
];

export default function ArchitecturePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <BookOpen size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Architecture Overview
                    </h1>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        MirrorDNA spans 116 repositories across multiple architectural layers. Here's how they fit together.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Core Layers</h2>
                    <div className="space-y-4">
                        {layers.map((l, i) => (
                            <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
                                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                            }`}>
                                <div className={`p-2 rounded-lg bg-${l.color}-500/20`}>
                                    <l.icon size={20} className={`text-${l.color}-400`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{l.name}</h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{l.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Core Principles</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {principles.map((p, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{p.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Deep Dive
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Full architectural specifications in the MirrorDNA Docs.
                    </p>
                    <a
                        href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/architecture/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white"
                    >
                        Full Architecture Docs <ArrowRight size={18} />
                    </a>
                </div>
            </section>
        </PageLayout>
    );
}
