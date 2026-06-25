/**
 * ⟡ GlyphTrail Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight, Github, Clock, GitBranch, Play, Search } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Clock, title: 'Timeline View', desc: 'Chronological view of every event, decision, and state change' },
    { icon: GitBranch, title: 'Graph Visualization', desc: 'See the branching paths of AI reasoning and decision trees' },
    { icon: Play, title: 'Replay Mode', desc: 'Step through traces frame-by-frame to understand what happened' },
    { icon: Search, title: 'Trace Comparison', desc: 'Diff two traces to see what changed between runs' },
];

export default function GlyphTrailPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                            <BarChart3 size={32} className="text-emerald-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">Beta</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        GlyphTrail
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-emerald-400`}>
                        See what AI sees.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Interactive visualization for MirrorDNA traces. Timeline, graph, and table views. Perfect for auditors, researchers, and anyone who wants to understand AI behavior.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol/glyphtrail" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white">
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
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Views</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <f.icon size={24} className="text-emerald-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
