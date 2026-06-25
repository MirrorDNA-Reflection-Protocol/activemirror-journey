/**
 * ⟡ Contact Page
 */

import React from 'react';
import { Mail, Building2, Users, GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const contacts = [
    { type: 'Enterprise Sales', email: 'paul@activemirror.ai', icon: Building2, desc: 'For organizations deploying at scale' },
    { type: 'Partnerships', email: 'paul@activemirror.ai', icon: Users, desc: 'Integration and strategic partnerships' },
    { type: 'Research & Academia', email: 'paul@activemirror.ai', icon: GraduationCap, desc: 'Research collaborations and academic use' },
    { type: 'General Inquiries', email: 'paul@activemirror.ai', icon: Mail, desc: 'Everything else' },
];

export default function ContactPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Mail size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Contact Us
                    </h1>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Whether you're exploring enterprise deployment, partnership opportunities, or just curious about reflective AI — we'd love to hear from you.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {contacts.map((c, i) => (
                            <a
                                key={i}
                                href={`mailto:${c.email}`}
                                className={`group p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                                    isDark
                                        ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                                        : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-lg'
                                }`}
                            >
                                <c.icon size={24} className="text-purple-400 mb-3" />
                                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {c.type}
                                </h3>
                                <p className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {c.desc}
                                </p>
                                <span className="text-purple-400 text-sm font-medium group-hover:underline">
                                    {c.email}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Other Ways to Connect
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${
                                isDark ? 'bg-zinc-900/50 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200'
                            }`}
                        >
                            <Github size={20} />
                            <div className="text-left">
                                <div className="font-medium">GitHub</div>
                                <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Issues, PRs, Discussions</div>
                            </div>
                        </a>
                        <a
                            href="https://x.com/pauldesai123"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${
                                isDark ? 'bg-zinc-900/50 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200'
                            }`}
                        >
                            <Twitter size={20} />
                            <div className="text-left">
                                <div className="font-medium">Twitter/X</div>
                                <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>@pauldesai123</div>
                            </div>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/pauldesai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${
                                isDark ? 'bg-zinc-900/50 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200'
                            }`}
                        >
                            <Linkedin size={20} />
                            <div className="text-left">
                                <div className="font-medium">LinkedIn</div>
                                <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Paul Desai</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-2xl mx-auto text-center p-8 rounded-2xl ${
                    isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
                }`}>
                    <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Response Time
                    </h2>
                    <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                        We typically respond within 24-48 hours for general inquiries, faster for enterprise and partnership discussions.
                    </p>
                </div>
            </section>
        </PageLayout>
    );
}
