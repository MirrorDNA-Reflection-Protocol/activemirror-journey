/**
 * ⟡ LingOS Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Check, ArrowRight, Github, Layers, Eye, Zap, Shield } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Layers, title: 'Structured Conversations', desc: 'Build AI dialogues with clear turn-taking, context windows, and memory' },
    { icon: Eye, title: 'Native Observability', desc: 'MirrorDNA traces built-in. See every decision, every token, every state change.' },
    { icon: Zap, title: 'Lite & Pro Versions', desc: 'Open source Lite for developers. Pro for enterprise with Vault Manager.' },
    { icon: Shield, title: 'Compliance Ready', desc: 'GDPR, HIPAA logging patterns. Audit trails by default.' },
];

const comparison = [
    { feature: 'Core Framework', lite: '✓', pro: '✓' },
    { feature: 'MirrorDNA Traces', lite: '✓', pro: '✓' },
    { feature: 'Basic Memory', lite: '✓', pro: '✓' },
    { feature: 'Vault Manager', lite: '—', pro: '✓' },
    { feature: 'Enterprise SSO', lite: '—', pro: '✓' },
    { feature: 'Priority Support', lite: '—', pro: '✓' },
];

export default function LingOSPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                            <MessageSquare size={32} className="text-blue-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        LingOS
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-blue-400`}>
                        Conversational AI, observable by design.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Framework for building AI conversations with built-in tracing. Every message logged, every decision tracked, every interaction auditable. Transparency isn't optional.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/LingOS"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all"
                        >
                            <Github size={20} />
                            LingOS Lite
                        </a>
                        <Link
                            to="/about/contact"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                            }`}
                        >
                            LingOS Pro Inquiry
                            <ArrowRight size={18} />
                        </Link>
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
                                <f.icon size={24} className="text-blue-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Lite vs Pro
                    </h2>
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                        <table className="w-full">
                            <thead className={isDark ? 'bg-zinc-900' : 'bg-zinc-50'}>
                                <tr>
                                    <th className={`text-left p-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Feature</th>
                                    <th className={`text-center p-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Lite (Free)</th>
                                    <th className={`text-center p-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Pro</th>
                                </tr>
                            </thead>
                            <tbody className={isDark ? 'bg-zinc-900/50' : 'bg-white'}>
                                {comparison.map((row, i) => (
                                    <tr key={i} className={i > 0 ? (isDark ? 'border-t border-zinc-800' : 'border-t border-zinc-200') : ''}>
                                        <td className={`p-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{row.feature}</td>
                                        <td className="p-4 text-center text-emerald-400">{row.lite}</td>
                                        <td className="p-4 text-center text-emerald-400">{row.pro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Build observable AI conversations
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Start with Lite. Upgrade to Pro when you need enterprise features.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol/LingOS" className="px-6 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white">
                            Get LingOS Lite
                        </a>
                        <Link to="/pricing" className={`px-6 py-3 rounded-xl font-medium ${
                            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                        }`}>
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
