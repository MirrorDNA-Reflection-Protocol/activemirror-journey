/**
 * ⟡ Individuals Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowRight, Brain, Sparkles, BookOpen, Compass } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: BookOpen, title: 'Daily Journaling', desc: 'AI-assisted reflection that asks the right questions, not just records answers' },
    { icon: Compass, title: 'Decision Support', desc: 'Think through choices with a companion that challenges assumptions' },
    { icon: Sparkles, title: 'Self-Discovery', desc: 'Recognize patterns in your thinking you might miss on your own' },
    { icon: Brain, title: 'Knowledge Management', desc: 'Build a personal knowledge base that remembers and connects ideas' },
];

export default function IndividualsPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <User size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Individuals
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-purple-400`}>
                        Your thoughts, reflected back with clarity.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Active Mirror isn't a chatbot. It's a thinking partner. It asks questions instead of giving answers. It helps you see what you already know but haven't articulated yet.
                    </p>
                    <Link to="/start" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                        Start Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>What You Can Do</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-purple-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>How It Works</h2>
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Take the BrainScan', desc: '8 questions, 60 seconds. Discover your cognitive archetype.' },
                            { step: '2', title: 'Meet Your Twins', desc: 'Four AI companions matched to your thinking style.' },
                            { step: '3', title: 'Start Reflecting', desc: 'Ask questions, explore ideas, build understanding over time.' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                                    {s.step}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{s.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Ready to start reflecting?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Free to start. No credit card required.
                    </p>
                    <Link to="/start" className="px-8 py-4 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white text-lg">
                        Get Started
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
