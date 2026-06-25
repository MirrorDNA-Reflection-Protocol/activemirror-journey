/**
 * ⟡ MirrorRecall Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight, Github, Clock, User, Layers, AlertTriangle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Clock, title: 'Session Memory', desc: 'Current conversation context: exchanges, decisions, corrections, topics' },
    { icon: User, title: 'Profile Memory', desc: 'Persistent facts about the user that survive across sessions' },
    { icon: Layers, title: 'Context Assembly', desc: 'Intelligent injection that respects token budgets and relevance' },
    { icon: AlertTriangle, title: 'Conflict Detection', desc: 'Contradictions surface for resolution, not silent overwrite' },
];

export default function MirrorRecallPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                            <Database size={32} className="text-cyan-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        MirrorRecall
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-cyan-400`}>
                        Memory that persists.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Session and profile memory for AI that remembers. No more "who are you again?" Every session builds on the last. Context accumulates, but stays bounded.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol/mirrorrecall" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white">
                            <Github size={20} /> View Source
                        </a>
                        <Link to="/docs" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            Documentation <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Core Capabilities</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <f.icon size={24} className="text-cyan-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Key Principle</h2>
                    <div className={`p-6 rounded-xl border-l-4 border-cyan-500 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                        <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            "Memory informs, never authorizes."
                        </p>
                        <p className={`mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            High-stakes actions always need fresh confirmation. Memory provides context, not permission.
                        </p>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
