/**
 * ⟡ AgentDNA Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Github, Fingerprint, GitBranch, FlaskConical, Store } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Fingerprint, title: 'Persona Definitions', desc: 'Define personality, tone, boundaries, and behavior in structured format' },
    { icon: GitBranch, title: 'Version Control', desc: 'Track changes to personas over time. Roll back if needed.' },
    { icon: FlaskConical, title: 'Testing & Validation', desc: 'Test personas against scenarios before deployment' },
    { icon: Store, title: 'Persona Marketplace', desc: 'Share and discover personas from the community (coming soon)' },
];

export default function AgentDNAPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-orange-500/20">
                            <Users size={32} className="text-orange-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">Beta</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        AgentDNA
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-orange-400`}>
                        Personality, versioned.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Define, version, and test AI personalities. Consistent character across all interactions. Because your AI should have identity, not just responses.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol/agentdna" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-orange-600 hover:bg-orange-500 text-white">
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
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Capabilities</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <f.icon size={24} className="text-orange-400 mb-3" />
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
