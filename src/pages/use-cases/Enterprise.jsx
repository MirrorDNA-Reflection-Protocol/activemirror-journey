/**
 * ⟡ Enterprise Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Shield, Brain, Database, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: Brain, title: 'Employee Wellness', desc: 'Non-clinical reflection tools for mental fitness and resilience (not therapy)' },
    { icon: Database, title: 'Knowledge Management', desc: 'Capture institutional knowledge in observable, auditable systems' },
    { icon: Shield, title: 'AI Governance', desc: 'MirrorGate policy enforcement for all AI interactions across the org' },
    { icon: CheckCircle, title: 'Compliance', desc: 'GDPR, SOC2, HIPAA ready with TrustByDesign framework' },
];

const features = [
    'Self-hosted deployment option',
    'SSO integration (SAML, OIDC)',
    'Audit logs and compliance reporting',
    'Custom persona development',
    'Dedicated support',
    'SLA guarantees',
];

export default function EnterprisePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-violet-500/20">
                            <Building2 size={32} className="text-violet-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Enterprise
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-violet-400`}>
                        AI governance at scale.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Deploy reflective AI across your organization with the controls, compliance, and sovereignty you need. Self-hosted options available.
                    </p>
                    <Link to="/about/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-violet-600 hover:bg-violet-500 text-white">
                        Talk to Enterprise Sales <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Enterprise Use Cases</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-violet-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Enterprise Features</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-emerald-400" />
                                <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Ready to deploy at scale?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Let's discuss your requirements and build a deployment plan.
                    </p>
                    <Link to="/about/contact" className="px-8 py-4 rounded-xl font-medium bg-violet-600 hover:bg-violet-500 text-white text-lg">
                        Schedule a Call
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
