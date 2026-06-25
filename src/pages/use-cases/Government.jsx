/**
 * ⟡ Government Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ArrowRight, Users, FileText, Shield, Server } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: Users, title: 'Citizen Services', desc: 'AI-assisted support that maintains human oversight and auditability' },
    { icon: FileText, title: 'Policy Analysis', desc: 'Reflect on policy implications with structured reasoning trails' },
    { icon: Shield, title: 'Compliance & Audit', desc: 'Every interaction logged with cryptographic accountability' },
    { icon: Server, title: 'Data Sovereignty', desc: 'On-premise deployment keeps citizen data within your jurisdiction' },
];

export default function GovernmentPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                            <Landmark size={32} className="text-cyan-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Government
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-cyan-400`}>
                        Sovereign AI for the public sector.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Government AI needs accountability, auditability, and sovereignty. MirrorDNA was built with these requirements from day one — not bolted on after.
                    </p>
                    <Link to="/about/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white">
                        Request Government Demo <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Government Use Cases</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-cyan-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Why MirrorDNA for Government</h2>
                    <div className={`p-6 rounded-xl border-l-4 border-cyan-500 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                        <ul className={`space-y-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            <li>• <strong>Sovereignty:</strong> Self-hosted within your infrastructure</li>
                            <li>• <strong>Auditability:</strong> Cryptographic traces for every interaction</li>
                            <li>• <strong>Accountability:</strong> Human oversight built into the protocol</li>
                            <li>• <strong>Open Source:</strong> Inspect the code, not just the docs</li>
                        </ul>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
