/**
 * ⟡ Products Index — Showcase the MirrorDNA ecosystem
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, MessageSquare, Database, BarChart3, CheckCircle, Users, Lock, ArrowRight, Github, Layers, Scale, Activity, Heart } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import EcosystemVisual from '../../components/EcosystemVisual';
import { useTheme } from '../../contexts/ThemeContext';

const products = [
    {
        name: 'MirrorGate',
        tagline: 'Governance before generation',
        description: 'Policy-driven proxy that governs AI requests before they execute. Infrastructure-level control for organizations that need safety by design.',
        icon: Shield,
        href: '/products/mirrorgate',
        color: 'purple',
        status: 'Live',
    },
    {
        name: 'MirrorBrain',
        tagline: 'Cognitive engine API',
        description: 'FastAPI backend powering BrainScan, AI Twins, and Resonance matching. The thinking layer of the MirrorDNA protocol.',
        icon: Brain,
        href: '/products/mirrorbrain',
        color: 'violet',
        status: 'Live',
    },
    {
        name: 'LingOS',
        tagline: 'Conversational AI framework',
        description: 'Build AI conversations with built-in observability. Lite (open source) and Pro versions available.',
        icon: MessageSquare,
        href: '/products/lingos',
        color: 'blue',
        status: 'Live',
    },
    {
        name: 'MirrorRecall',
        tagline: 'Session memory layer',
        description: 'Memory that persists across sessions. Profile facts, session context, and intelligent assembly.',
        icon: Database,
        href: '/products/mirrorrecall',
        color: 'cyan',
        status: 'Live',
    },
    {
        name: 'GlyphTrail',
        tagline: 'Trace visualization',
        description: 'See what AI sees. Interactive timeline and graph views for MirrorDNA traces.',
        icon: BarChart3,
        href: '/products/glyphtrail',
        color: 'emerald',
        status: 'Beta',
    },
    {
        name: 'TrustByDesign',
        tagline: 'Compliance framework',
        description: 'GDPR, HIPAA, SOC2 compliance built in. Automated checking, audit reporting, and certification paths.',
        icon: CheckCircle,
        href: '/products/trustbydesign',
        color: 'green',
        status: 'Live',
    },
    {
        name: 'AgentDNA',
        tagline: 'Persona engine',
        description: 'Define, version, and test AI personalities. Consistent character across all interactions.',
        icon: Users,
        href: '/products/agentdna',
        color: 'orange',
        status: 'Beta',
    },
    {
        name: 'Vault Manager',
        tagline: 'Secure storage',
        description: 'Your data, your keys. End-to-end encryption, key management, and access control.',
        icon: Lock,
        href: '/products/vault',
        color: 'red',
        status: 'Pro',
    },
    {
        name: 'MirrorBalance',
        tagline: 'Governance engine',
        description: 'Sovereign governance with policy DSL, multi-layer defense, evidence chains, and a full Sovereign Control Plane. 189 tests. Every decision auditable.',
        icon: Scale,
        href: '/products/mirrorbalance',
        color: 'amber',
        status: 'v1.0',
    },
    {
        name: 'Cognitive Dashboard',
        tagline: 'Live system intelligence',
        description: 'Multi-surface operator cockpit for the full MirrorDNA stack. Core terminal dashboard, system map, profile dashboards, and intelligence lanes wired into one observability story.',
        icon: Activity,
        href: '/products/cognitive-dashboard',
        color: 'cyan',
        status: 'Live',
    },
    {
        name: 'Chetana',
        tagline: 'AI scam & deepfake shield for India',
        description: 'AI-powered scam detection in 12 supported languages. Check links, verify UPI IDs, and review suspicious media through the web app, Telegram bot (@chetnaShieldBot), and Browser Guard extension.',
        icon: Shield,
        href: '/products/chetana',
        color: 'red',
        status: 'Live',
    },
    {
        name: 'Chetana Browser Guard',
        tagline: 'Chrome extension — trust on every page',
        description: 'Passive trust scoring on every page you visit. Live WhatsApp Web scam detection. Right-click any text or link to check. Offline-capable local gate. Cloud fallback via Chetana API.',
        icon: Shield,
        href: '/products/chetana',
        color: 'emerald',
        status: 'Beta',
    },
];

const colorMap = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', hover: 'hover:border-purple-500/40' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/40' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', hover: 'hover:border-blue-500/40' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'hover:border-cyan-500/40' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'hover:border-emerald-500/40' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', hover: 'hover:border-green-500/40' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', hover: 'hover:border-orange-500/40' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', hover: 'hover:border-red-500/40' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/40' },
};

const statusColors = {
    'Live': 'bg-emerald-500/20 text-emerald-400',
    'Beta': 'bg-amber-500/20 text-amber-400',
    'Pro': 'bg-purple-500/20 text-purple-400',
    'v1.0': 'bg-emerald-500/20 text-emerald-400',
};

export default function ProductsIndex() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
                        isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                        The MirrorDNA Ecosystem
                    </h1>
                    <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-8 ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                        116 repositories. 17 local models. One unified protocol for reflective, observable, sovereign AI.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                            }`}
                        >
                            <Github size={20} />
                            View on GitHub
                        </a>
                        <Link
                            to="/docs"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all"
                        >
                            Read the Docs
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/ecosystem"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                isDark
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
                                    : 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100'
                            }`}
                        >
                            <Layers size={18} />
                            View Architecture
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ecosystem Visual */}
            <section className="py-8 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <EcosystemVisual compact />
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {products.map((product) => {
                            const colors = colorMap[product.color];
                            return (
                                <Link
                                    key={product.name}
                                    to={product.href}
                                    className={`group relative p-6 rounded-2xl border transition-all ${
                                        isDark
                                            ? `${colors.bg} ${colors.border} ${colors.hover} hover:scale-[1.02]`
                                            : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                                            <product.icon size={24} className={colors.text} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                                    {product.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>
                                                    {product.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-medium mb-2 ${colors.text}`}>
                                                {product.tagline}
                                            </p>
                                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                {product.description}
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className={`${isDark ? 'text-zinc-600' : 'text-zinc-400'} group-hover:translate-x-1 transition-transform`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                    }`}>
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>116</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Repositories</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>9</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Architecture Layers</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>11</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Products</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>1</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Builder</div>
                        </div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
