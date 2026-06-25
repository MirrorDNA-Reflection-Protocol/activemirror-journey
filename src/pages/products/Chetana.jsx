/**
 * ⟡ Chetana Product Page — Digital Awareness for Every Indian
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, ArrowRight, Github, Globe, MessageCircle, Smartphone, Shield, Eye, Radio, Chrome } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Globe, title: 'Web Scanner', desc: 'Full interface at chetana.activemirror.ai — check links, UPI IDs, SMS, phone numbers, and deepfakes from the browser.' },
    { icon: Globe, title: '12 Supported Languages', desc: 'English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, and Assamese.' },
    { icon: Shield, title: 'Scam Detection', desc: 'Links, phone numbers, UPI IDs, investment schemes — verified against live threat intelligence.' },
    { icon: Eye, title: 'Deepfake Analysis', desc: 'Upload photos or voice clips. Multi-model detection identifies AI-generated content.' },
    { icon: Smartphone, title: 'Telegram Bot', desc: '@chetnaShieldBot — paste any message directly. Commands: /check, /weather, /atlas.' },
    { icon: Radio, title: 'Browser Guard', desc: 'Chrome extension with live WhatsApp Web scanning, right-click checks, and offline local gate. No Ollama needed.' },
];

export default function ChetanaPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                            <Heart size={32} className="text-emerald-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Chetana
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium mb-2 text-emerald-400">
                        चेतना — Awareness. Consciousness. Awakening.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Free public trust-checking surface for India. Check scams, detect deepfakes, and verify before you trust —
                        in your language, on your phone, with no login required.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/kavach"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        >
                            <Github size={20} />
                            View Source
                        </a>
                        <a
                            href="https://chetana.activemirror.ai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            Try Chetana <ArrowRight size={18} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-3xl mx-auto text-center">
                    <p className={`text-xl leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Scam pressure shows up as fake payment screenshots, QR requests, urgent links, and impersonation
                        attempts. Chetana gives people and merchants a fast first-pass check before they act.
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What Chetana Does
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-zinc-200 bg-white'}`}>
                                <f.icon size={24} className="text-emerald-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to use */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        4 Ways to Use Chetana
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { title: 'Web', desc: 'Full interface at chetana.activemirror.ai — scan anything, any language, any device.', icon: Globe, href: 'https://chetana.activemirror.ai', label: 'Open' },
                            { title: 'Telegram Bot', desc: '@chetnaShieldBot — paste any message for a quick first-pass review.', icon: Smartphone, href: 'https://t.me/chetnaShieldBot', label: 'Open Bot' },
                            { title: 'Browser Guard', desc: 'Chrome extension — passive page scoring, WhatsApp Web live scan, right-click check.', icon: Chrome, href: 'https://github.com/MirrorDNA-Reflection-Protocol/chetana-browser', label: 'Install' },
                            { title: 'Public API', desc: 'Public scan endpoints for workflow integrations. Start with POST /api/scan/full.', icon: Radio, href: 'https://github.com/MirrorDNA-Reflection-Protocol/kavach', label: 'View Source' },
                        ].map((m, i) => (
                            <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
                                className={`p-6 rounded-xl border text-center group transition-all ${isDark ? 'border-white/10 bg-white/5 hover:border-emerald-500/30' : 'border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-md'}`}>
                                <m.icon size={32} className="text-emerald-400 mx-auto mb-4" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{m.title}</h3>
                                <p className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{m.desc}</p>
                                <span className="text-xs text-emerald-400 group-hover:underline">{m.label} →</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Awareness is the first defense
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Chetana is free to use, does not require login, and keeps its privacy contract explicit on the product itself.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://chetana.activemirror.ai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        >
                            Try Chetana <ArrowRight size={18} />
                        </a>
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/chetana-browser"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Chrome size={18} /> Install Browser Guard
                        </a>
                        <a
                            href="https://t.me/chetnaShieldBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}
                        >
                            <Smartphone size={18} /> Telegram Bot
                        </a>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
