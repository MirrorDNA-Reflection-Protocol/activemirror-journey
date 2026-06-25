/**
 * ⟡ Education Use Case Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Search, FileText, Eye } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    { icon: BookOpen, title: 'Student Reflection Journals', desc: 'Structured reflection on learning with AI prompts that deepen understanding' },
    { icon: Search, title: 'Research Assistance', desc: 'Explore ideas and synthesize sources with observable reasoning' },
    { icon: FileText, title: 'Curriculum Analysis', desc: 'Reflect on course design and learning objectives' },
    { icon: Eye, title: 'Academic Integrity', desc: 'Transparent AI use with full audit trails — no hidden assistance' },
];

export default function EducationPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-amber-500/20">
                            <GraduationCap size={32} className="text-amber-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        For Education
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-amber-400`}>
                        Learning through reflection.
                    </p>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        AI in education should enhance thinking, not replace it. Active Mirror asks questions that deepen understanding rather than providing answers to copy.
                    </p>
                    <Link to="/about/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-amber-600 hover:bg-amber-500 text-white">
                        Education Pilot Program <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Education Applications</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <uc.icon size={24} className="text-amber-400 mb-3" />
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{uc.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Academic Integrity by Design</h2>
                    <div className={`p-6 rounded-xl border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                            Every interaction is logged with MirrorDNA traces. Students can show their reasoning process. Teachers can see how AI was used. No hidden assistance, no academic dishonesty — just transparent thinking support.
                        </p>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
