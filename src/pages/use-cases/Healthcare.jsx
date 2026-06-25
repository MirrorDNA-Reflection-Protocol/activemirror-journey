/**
 * ⟡ Healthcare Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, BookOpen, Users, Shield, AlertTriangle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: BookOpen, title: 'Patient Journaling', desc: 'Reflective tools for wellness journeys (non-diagnostic, non-clinical)' },
    { icon: Users, title: 'Care Team Collaboration', desc: 'Shared context for multidisciplinary care coordination' },
    { icon: Shield, title: 'HIPAA Compliance', desc: 'TrustByDesign framework with healthcare-specific controls' },
];

export default function HealthcarePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-red-500/20">
                            <Heart size={32} className="text-red-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Healthcare
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-red-400`}>
                        Reflective AI for wellness journeys.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Support patient reflection and care team collaboration with HIPAA-compliant, observable AI. Wellness support, not diagnosis.
                    </p>

                    {/* Important Disclaimer */}
                    <div className={`p-4 rounded-xl border mb-8 ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-300'}`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Important Disclaimer</p>
                                <p className={`text-sm ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
                                    Active Mirror is <strong>NOT</strong> a medical device, diagnostic tool, or substitute for professional healthcare. It is a reflection tool for wellness support only. All clinical decisions must be made by licensed healthcare professionals.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link to="/about/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-500 text-white">
                        Healthcare Partnership Inquiry <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Healthcare Applications</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-red-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
