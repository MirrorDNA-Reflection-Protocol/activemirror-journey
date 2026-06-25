/**
 * ⟡ Docs Index — Getting Started
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, BookOpen, Server, Github, ExternalLink } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const guides = [
    { title: 'Architecture Overview', desc: 'Understand how MirrorDNA components fit together', href: '/docs/architecture', icon: BookOpen },
    { title: 'Self-Hosting Guide', desc: 'Deploy Active Mirror on your own infrastructure', href: '/docs/self-hosting', icon: Server },
    { title: 'Full Documentation', desc: 'Complete technical docs on GitHub Pages', href: 'https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/', icon: ExternalLink, external: true },
];

const quickStart = [
    { step: '1', title: 'Try the Demo', desc: 'Experience Active Mirror at activemirror.ai/start', link: '/start' },
    { step: '2', title: 'Explore the Ecosystem', desc: 'Browse 116 repos at github.com/MirrorDNA-Reflection-Protocol', link: 'https://github.com/MirrorDNA-Reflection-Protocol' },
    { step: '3', title: 'Read the Spec', desc: 'Understand MirrorDNA protocol in the docs', link: 'https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/' },
];

export default function DocsIndex() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <FileText size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Documentation
                    </h1>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Everything you need to understand, deploy, and build on the MirrorDNA protocol.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Quick Start</h2>
                    <div className="space-y-4">
                        {quickStart.map((s, i) => (
                            <a
                                key={i}
                                href={s.link}
                                target={s.link.startsWith('http') ? '_blank' : undefined}
                                rel={s.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                                    isDark ? 'bg-white/5 border-white/10 hover:border-purple-500/30' : 'bg-white border-zinc-200 hover:border-purple-300'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                                    {s.step}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{s.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{s.desc}</p>
                                </div>
                                <ArrowRight size={20} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Guides</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {guides.map((g, i) => (
                            g.external ? (
                                <a
                                    key={i}
                                    href={g.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                                        isDark ? 'bg-zinc-900/50 border-white/10 hover:border-purple-500/30' : 'bg-white border-zinc-200 hover:border-purple-300'
                                    }`}
                                >
                                    <g.icon size={24} className="text-purple-400 mb-3" />
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{g.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{g.desc}</p>
                                </a>
                            ) : (
                                <Link
                                    key={i}
                                    to={g.href}
                                    className={`group p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                                        isDark ? 'bg-zinc-900/50 border-white/10 hover:border-purple-500/30' : 'bg-white border-zinc-200 hover:border-purple-300'
                                    }`}
                                >
                                    <g.icon size={24} className="text-purple-400 mb-3" />
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{g.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{g.desc}</p>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Full Technical Documentation
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Complete API references, protocol specs, and integration guides.
                    </p>
                    <a
                        href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white"
                    >
                        <Github size={20} />
                        View Full Docs
                    </a>
                </div>
            </section>
        </PageLayout>
    );
}
