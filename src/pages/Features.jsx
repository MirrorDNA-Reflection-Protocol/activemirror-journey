/**
 * ⟡ Features Page — Showcase all MirrorDNA capabilities
 * The complete experience catalog
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Brain, Users, Eye, MessageSquare, Send, Clock, Sparkles,
    Shield, Compass, Layers, Target, Fingerprint, Zap,
    ArrowRight, Play, Star, CheckCircle
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';

const mainFeatures = [
    {
        id: 'brainscan',
        name: 'BrainScan',
        tagline: 'Discover your cognitive archetype',
        description: 'Answer 8 questions to map your cognitive architecture across 5 dimensions: Topology, Velocity, Depth, Entropy, and Evolution. Discover which of 8 archetypes matches your thinking style.',
        icon: Brain,
        href: '/scan',
        color: 'purple',
        gradient: 'from-purple-500 to-violet-500',
        stats: ['8 questions', '5 dimensions', '8 archetypes'],
        cta: 'Take the Scan',
    },
    {
        id: 'twins',
        name: 'AI Twins',
        tagline: 'Cognitive companions matched to you',
        description: 'Four AI personalities designed to complement your thinking: Guardian protects focus, Scout explores possibilities, Synthesizer connects dots, Mirror reveals blind spots.',
        icon: Users,
        href: '/twins',
        color: 'cyan',
        gradient: 'from-cyan-500 to-blue-500',
        stats: ['4 twins', 'Cloud + Local', 'Context-aware'],
        cta: 'Meet Your Twin',
        twins: [
            { name: 'Guardian', icon: Shield, desc: 'Protects focus', color: 'blue' },
            { name: 'Scout', icon: Compass, desc: 'Explores possibilities', color: 'emerald' },
            { name: 'Synthesizer', icon: Layers, desc: 'Connects dots', color: 'violet' },
            { name: 'Mirror', icon: Eye, desc: 'Reveals blind spots', color: 'amber' },
        ]
    },
    {
        id: 'mirror',
        name: 'Mirror Reflection',
        tagline: 'Think with sovereign AI',
        description: 'The core reflection experience. Talk through ideas, explore thoughts, receive insights. All with ambient mode for immersive thinking.',
        icon: Eye,
        href: '/mirror',
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500',
        stats: ['Ambient mode', 'Voice ready', 'Session memory'],
        cta: 'Start Reflecting',
    },
    {
        id: 'brief',
        name: 'Brief',
        tagline: 'Temporal intelligence',
        description: 'AI-powered briefings that scan news, tech, and signals relevant to your work. Morning context, delivered sovereignly.',
        icon: Clock,
        href: '/brief',
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
        stats: ['Daily digest', 'Tech + crypto', 'Personalized'],
        cta: 'Get Briefed',
    },
    {
        id: 'cast',
        name: 'Cast',
        tagline: 'Messages through time',
        description: 'Send messages to your future self. Schedule reflections, reminders, and insights to arrive when you need them most.',
        icon: Send,
        href: '/cast',
        color: 'pink',
        gradient: 'from-pink-500 to-rose-500',
        stats: ['Time-shifted', 'Self-addressed', 'Encrypted'],
        cta: 'Cast a Message',
    },
    {
        id: 'seed',
        name: 'Mirror Seed',
        tagline: 'Portable AI identity',
        description: 'Your cognitive profile as a downloadable file. Carry your context across any AI platform. Your identity, owned by you.',
        icon: Fingerprint,
        href: 'https://id.activemirror.ai',
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-500',
        stats: ['.ami format', 'Cross-platform', 'Self-sovereign'],
        cta: 'Create Seed',
        external: true,
    },
];

const archetypes = [
    { name: 'Architect', desc: 'Systems thinker', color: 'blue' },
    { name: 'Explorer', desc: 'Boundary pusher', color: 'purple' },
    { name: 'Builder', desc: 'Shipping machine', color: 'emerald' },
    { name: 'Analyst', desc: 'Truth finder', color: 'amber' },
    { name: 'Connector', desc: 'Network weaver', color: 'indigo' },
    { name: 'Creative', desc: 'Pattern breaker', color: 'orange' },
    { name: 'Scholar', desc: 'Deep diver', color: 'gray' },
    { name: 'Strategist', desc: 'Future seer', color: 'red' },
];

function FeatureCard({ feature, index, isDark }) {
    const Icon = feature.icon;
    const isExternal = feature.external;

    const CardWrapper = isExternal ? 'a' : Link;
    const cardProps = isExternal
        ? { href: feature.href, target: '_blank', rel: 'noopener noreferrer' }
        : { to: feature.href };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <CardWrapper
                {...cardProps}
                className={`group block p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                    isDark
                        ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-xl'
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                        <Icon size={28} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                        {feature.stats.map((stat, i) => (
                            <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded-full ${
                                    isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                                }`}
                            >
                                {stat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {feature.name}
                </h3>
                <p className={`text-sm font-medium mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.tagline}
                </p>
                <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {feature.description}
                </p>

                {/* Twins preview if applicable */}
                {feature.twins && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {feature.twins.map((twin) => (
                            <div
                                key={twin.name}
                                className={`text-center p-2 rounded-lg ${
                                    isDark ? 'bg-white/5' : 'bg-zinc-50'
                                }`}
                            >
                                <twin.icon size={16} className={`mx-auto mb-1 text-${twin.color}-400`} />
                                <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {twin.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className={`flex items-center gap-2 text-sm font-medium ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                } group-hover:gap-3 transition-all`}>
                    <Play size={16} className="fill-current" />
                    {feature.cta}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </CardWrapper>
        </motion.div>
    );
}

export default function Features() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
                    >
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-sm text-purple-400 font-medium">Experience Catalog</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl sm:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                    >
                        Features & Experiences
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg max-w-2xl mx-auto mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                    >
                        From cognitive discovery to sovereign reflection — everything you need for AI that understands you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <Link
                            to="/start"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <Zap size={18} />
                            Start BrainScan
                        </Link>
                        <Link
                            to="/ecosystem"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
                                isDark
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                            }`}
                        >
                            View Architecture
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mainFeatures.map((feature, i) => (
                            <FeatureCard
                                key={feature.id}
                                feature={feature}
                                index={i}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Archetypes Section */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            8 Cognitive Archetypes
                        </h2>
                        <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                            Discovered through BrainScan, matched to your AI Twin
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {archetypes.map((arch, i) => (
                            <motion.div
                                key={arch.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-4 rounded-xl text-center ${
                                    isDark
                                        ? 'bg-zinc-900/50 border border-white/10'
                                        : 'bg-white border border-zinc-200'
                                }`}
                            >
                                <div className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {arch.name}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {arch.desc}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            to="/scan"
                            className={`inline-flex items-center gap-2 text-sm font-medium ${
                                isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                            }`}
                        >
                            <Brain size={16} />
                            Discover yours with BrainScan
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        How it works
                    </h2>

                    <div className="grid sm:grid-cols-4 gap-6">
                        {[
                            { step: 1, title: 'Scan', desc: 'Discover your archetype', icon: Brain },
                            { step: 2, title: 'Seed', desc: 'Create your identity', icon: Fingerprint },
                            { step: 3, title: 'Twin', desc: 'Meet your companion', icon: Users },
                            { step: 4, title: 'Reflect', desc: 'Think sovereignly', icon: Eye },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                    <item.icon size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                </div>
                                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                    Step {item.step}
                                </div>
                                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {item.title}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-3xl mx-auto text-center p-8 rounded-2xl ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20'
                        : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Ready to begin?
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Start with BrainScan. 60 seconds to discover your cognitive architecture.
                    </p>
                    <Link
                        to="/start"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                        <Sparkles size={20} />
                        Get Started
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
