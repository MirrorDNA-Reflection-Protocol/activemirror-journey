/**
 * ⟡ Use Cases Index — Audience-specific landing pages
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Building2, Landmark, Heart, GraduationCap, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const useCases = [
    {
        name: 'Individuals',
        tagline: 'Your thoughts, reflected back with clarity',
        description: 'Daily journaling, decision support, self-discovery, and personal knowledge management.',
        icon: User,
        href: '/use-cases/individuals',
        color: 'purple',
        cta: 'Start free',
    },
    {
        name: 'Teams',
        tagline: 'Collaborative intelligence for better decisions',
        description: 'Team retrospectives, brainstorming facilitation, meeting synthesis, and shared knowledge.',
        icon: Users,
        href: '/use-cases/teams',
        color: 'blue',
        cta: 'Team pricing',
    },
    {
        name: 'Enterprise',
        tagline: 'AI governance at scale',
        description: 'Employee wellness, knowledge management, decision support, and policy enforcement.',
        icon: Building2,
        href: '/use-cases/enterprise',
        color: 'violet',
        cta: 'Talk to sales',
    },
    {
        name: 'Government',
        tagline: 'Sovereign AI for the public sector',
        description: 'Citizen services, policy analysis, internal knowledge management, compliance and audit.',
        icon: Landmark,
        href: '/use-cases/government',
        color: 'cyan',
        cta: 'Request demo',
    },
    {
        name: 'Healthcare',
        tagline: 'Reflective AI for wellness journeys',
        description: 'Patient journaling (non-diagnostic), care team collaboration, HIPAA-compliant deployment.',
        icon: Heart,
        href: '/use-cases/healthcare',
        color: 'red',
        cta: 'Partnership inquiry',
    },
    {
        name: 'Education',
        tagline: 'Learning through reflection',
        description: 'Student journals, research assistance, curriculum analysis, academic integrity.',
        icon: GraduationCap,
        href: '/use-cases/education',
        color: 'amber',
        cta: 'Pilot program',
    },
];

const colorMap = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', hover: 'hover:border-purple-500/40' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', hover: 'hover:border-blue-500/40' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/40' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'hover:border-cyan-500/40' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', hover: 'hover:border-red-500/40' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/40' },
};

export default function UseCasesIndex() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Built for How You Think
                    </h1>
                    <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Reflective AI adapts to your context. Whether you're an individual seeking clarity, a team making decisions, or an enterprise governing AI at scale.
                    </p>
                </div>
            </section>

            {/* Use Cases Grid */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useCases.map((uc) => {
                            const colors = colorMap[uc.color];
                            return (
                                <Link
                                    key={uc.name}
                                    to={uc.href}
                                    className={`group relative p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                                        isDark
                                            ? `${colors.bg} ${colors.border} ${colors.hover}`
                                            : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-lg'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${colors.bg} w-fit mb-4`}>
                                        <uc.icon size={24} className={colors.text} />
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {uc.name}
                                    </h3>
                                    <p className={`text-sm font-medium mb-3 ${colors.text}`}>
                                        {uc.tagline}
                                    </p>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        {uc.description}
                                    </p>
                                    <div className={`flex items-center gap-2 text-sm font-medium ${colors.text}`}>
                                        {uc.cta}
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Not sure where to start?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Try our free BrainScan to discover your cognitive archetype, then explore from there.
                    </p>
                    <Link to="/start" className="px-8 py-4 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white text-lg">
                        Get Started Free
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
