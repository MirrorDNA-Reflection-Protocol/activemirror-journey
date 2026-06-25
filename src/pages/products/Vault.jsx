/**
 * ⟡ Vault Manager Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Key, Shield, Users, Server } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    { icon: Key, title: 'End-to-End Encryption', desc: 'Your data encrypted at rest and in transit. You hold the keys.' },
    { icon: Shield, title: 'Access Control', desc: 'Fine-grained permissions. Who can see what, when, and why.' },
    { icon: Users, title: 'Team Management', desc: 'Shared vaults with role-based access for teams' },
    { icon: Server, title: 'Self-Hosted Option', desc: 'Run Vault Manager on your own infrastructure for full sovereignty' },
];

export default function VaultPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-red-500/20">
                            <Lock size={32} className="text-red-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">Pro</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Vault Manager
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-red-400`}>
                        Your data, your keys.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Enterprise-grade encrypted storage for MirrorDNA data. End-to-end encryption, key management, and access control. Part of LingOS Pro.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/about/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-500 text-white">
                            Contact Sales
                        </Link>
                        <Link to="/pricing" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            View Pricing <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Security Features</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <f.icon size={24} className="text-red-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Included with LingOS Pro
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Vault Manager is part of the LingOS Pro package. Contact us for enterprise pricing.
                    </p>
                    <Link to="/pricing" className="px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                        View Pricing
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
