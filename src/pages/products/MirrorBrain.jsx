/**
 * ⟡ MirrorBrain Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Check, ArrowRight, Github, Cpu, Users, Sparkles, BarChart } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Cpu, title: 'BrainScan Engine', desc: '8-question cognitive assessment that maps your thinking style to an archetype' },
    { icon: Users, title: 'AI Twins', desc: 'Four cognitive companions: Guardian, Scout, Synthesizer, Mirror' },
    { icon: Sparkles, title: 'Resonance Matching', desc: 'Compare brains and find cognitive alignment between users' },
    { icon: BarChart, title: 'Five Dimensions', desc: 'Topology, Velocity, Depth, Entropy, Evolution — your cognitive fingerprint' },
];

const endpoints = [
    { method: 'GET', path: '/api/quiz/questions', desc: 'Get BrainScan questions' },
    { method: 'POST', path: '/api/quiz/submit', desc: 'Submit answers, get brain analysis' },
    { method: 'POST', path: '/api/brain/:id/twin/:type', desc: 'Invoke an AI Twin' },
    { method: 'GET', path: '/api/brain/:id/compare/:id2', desc: 'Calculate resonance' },
];

export default function MirrorBrainPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-violet-500/20">
                            <Brain size={32} className="text-violet-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        MirrorBrain
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-violet-400`}>
                        Cognitive engine for reflective AI.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        FastAPI backend powering BrainScan, AI Twins, and Resonance. The thinking layer of the MirrorDNA protocol — OpenAI-compatible API with identity-aware transforms.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrorbrain-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all"
                        >
                            <Github size={20} />
                            View Source
                        </a>
                        <Link
                            to="/start"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                            }`}
                        >
                            Try BrainScan
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
                                <f.icon size={24} className="text-violet-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* API Reference Preview */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        API Endpoints
                    </h2>
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                        <div className={`p-4 font-mono text-sm ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
                            {endpoints.map((ep, i) => (
                                <div key={i} className={`flex items-center gap-4 py-2 ${i > 0 ? 'border-t border-zinc-800' : ''}`}>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>{ep.method}</span>
                                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{ep.path}</span>
                                    <span className={`ml-auto text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{ep.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className={`mt-4 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        Full API documentation available at <code className="text-violet-400">/docs</code> endpoint when running.
                    </p>
                </div>
            </section>

            {/* Archetypes */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Brain Archetypes
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { emoji: '🔷', name: 'Architect', desc: 'Systems thinker' },
                            { emoji: '🟣', name: 'Explorer', desc: 'Curiosity-driven' },
                            { emoji: '🟢', name: 'Builder', desc: 'Ships fast' },
                            { emoji: '🟡', name: 'Analyst', desc: 'Deep diver' },
                            { emoji: '🔵', name: 'Connector', desc: 'Bridges ideas' },
                            { emoji: '🟠', name: 'Creative', desc: 'Unexpected links' },
                            { emoji: '⚪', name: 'Scholar', desc: 'Knowledge seeker' },
                            { emoji: '🔴', name: 'Strategist', desc: 'Big picture' },
                        ].map((a, i) => (
                            <div key={i} className={`p-4 rounded-xl text-center ${
                                isDark ? 'bg-white/5' : 'bg-white border border-zinc-200'
                            }`}>
                                <div className="text-2xl mb-2">{a.emoji}</div>
                                <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{a.name}</div>
                                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{a.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Discover your cognitive archetype
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Take the 60-second BrainScan and meet your AI Twins.
                    </p>
                    <Link to="/start" className="px-8 py-4 rounded-xl font-medium bg-violet-600 hover:bg-violet-500 text-white text-lg">
                        Start BrainScan
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
