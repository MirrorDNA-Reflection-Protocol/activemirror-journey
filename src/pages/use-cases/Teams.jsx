/**
 * ⟡ Teams Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, MessageSquare, Lightbulb, FileText, Network } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: MessageSquare, title: 'Team Retrospectives', desc: 'Structured reflection sessions that surface what worked and what didn\'t' },
    { icon: Lightbulb, title: 'Brainstorming Facilitation', desc: 'AI-guided ideation that builds on everyone\'s contributions' },
    { icon: FileText, title: 'Meeting Synthesis', desc: 'Turn discussions into actionable insights and decisions' },
    { icon: Network, title: 'Shared Knowledge Base', desc: 'Team memory that persists and grows with every interaction' },
];

export default function TeamsPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                            <Users size={32} className="text-blue-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Teams
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-blue-400`}>
                        Collaborative intelligence for better decisions.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Teams think differently than individuals. Active Mirror helps groups synthesize perspectives, challenge assumptions together, and build shared understanding.
                    </p>
                    <Link to="/about/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white">
                        Contact for Team Pricing <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Team Use Cases</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-blue-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Get team pricing
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Volume discounts available for teams of 5+.
                    </p>
                    <Link to="/about/contact" className="px-8 py-4 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white text-lg">
                        Contact Sales
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
