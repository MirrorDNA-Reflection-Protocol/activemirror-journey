/**
 * ⟡ TrustByDesign Product Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Github, Shield, FileText, Eye, Award } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const frameworks = [
    { name: 'GDPR', desc: 'EU data protection', status: 'Supported' },
    { name: 'HIPAA', desc: 'US healthcare', status: 'Supported' },
    { name: 'SOC2', desc: 'Service organization', status: 'Supported' },
    { name: 'ISO 27001', desc: 'Information security', status: 'Roadmap' },
];

const features = [
    { icon: Shield, title: 'Automated Checks', desc: 'Continuous compliance verification against your chosen frameworks' },
    { icon: FileText, title: 'Audit Reports', desc: 'Generate compliance reports for regulators and auditors' },
    { icon: Eye, title: 'Data Lineage', desc: 'Track where data came from and where it went' },
    { icon: Award, title: 'Certification Paths', desc: 'Clear steps to achieve and maintain compliance certifications' },
];

export default function TrustByDesignPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        TrustByDesign
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-green-400`}>
                        Compliance built in, not bolted on.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Framework for GDPR, HIPAA, SOC2 compliance. Automated checking, audit reporting, and clear certification paths. Because trust is earned through transparency.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol/trustbydesign" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-600 hover:bg-green-500 text-white">
                            <Github size={20} /> View Source
                        </a>
                        <Link to="/trust" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            Trust Center <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Supported Frameworks</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {frameworks.map((f, i) => (
                            <div key={i} className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'}`}>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.name}</div>
                                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{f.desc}</div>
                                <div className={`text-xs mt-2 ${f.status === 'Supported' ? 'text-emerald-400' : 'text-amber-400'}`}>{f.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Capabilities</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <f.icon size={24} className="text-green-400 mb-3" />
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
