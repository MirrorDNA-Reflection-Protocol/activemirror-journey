/**
 * ⟡ Navigation Component — With dropdowns for Products, Use Cases, Docs
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, Shield, Brain, MessageSquare, Database,
         BarChart3, CheckCircle, Users, Lock, User, Building2, Landmark,
         Heart, GraduationCap, FileText, BookOpen, Server, Info, Map, Mail,
         Layers, Terminal, Sparkles, Code, Package, Scale, Activity, Radio } from 'lucide-react';
import MirrorLogo from './MirrorLogo';
import { useTheme } from '../contexts/ThemeContext';

const products = [
    { name: 'MirrorGate', href: '/products/mirrorgate', icon: Shield, desc: 'Inference control plane' },
    { name: 'MirrorBrain', href: '/products/mirrorbrain', icon: Brain, desc: 'Cognitive engine API' },
    { name: 'LingOS', href: '/products/lingos', icon: MessageSquare, desc: 'Conversational AI framework' },
    { name: 'MirrorRecall', href: '/products/mirrorrecall', icon: Database, desc: 'Session memory layer' },
    { name: 'GlyphTrail', href: '/products/glyphtrail', icon: BarChart3, desc: 'Trace visualization' },
    { name: 'TrustByDesign', href: '/products/trustbydesign', icon: CheckCircle, desc: 'Compliance framework' },
    { name: 'AgentDNA', href: '/products/agentdna', icon: Users, desc: 'Persona engine' },
    { name: 'Vault Manager', href: '/products/vault', icon: Lock, desc: 'Secure storage' },
    { name: 'MirrorBalance', href: '/products/mirrorbalance', icon: Scale, desc: 'Governance engine' },
    { name: 'Cognitive Dashboard', href: '/products/cognitive-dashboard', icon: Activity, desc: 'Live system intelligence' },
    { name: 'Chetana', href: '/products/chetana', icon: Sparkles, desc: 'Digital awareness platform' },
];

const useCases = [
    { name: 'Individuals', href: '/use-cases/individuals', icon: User, desc: 'Personal reflection' },
    { name: 'Teams', href: '/use-cases/teams', icon: Users, desc: 'Collaboration' },
    { name: 'Enterprise', href: '/use-cases/enterprise', icon: Building2, desc: 'At scale' },
    { name: 'Government', href: '/use-cases/government', icon: Landmark, desc: 'Public sector' },
    { name: 'Healthcare', href: '/use-cases/healthcare', icon: Heart, desc: 'Wellness' },
    { name: 'Education', href: '/use-cases/education', icon: GraduationCap, desc: 'Learning' },
];

const docs = [
    { name: 'Getting Started', href: '/docs', icon: FileText, desc: 'Quick start guide' },
    { name: 'Architecture', href: '/docs/architecture', icon: BookOpen, desc: 'System overview' },
    { name: 'Self-Hosting', href: '/docs/self-hosting', icon: Server, desc: 'Run your own' },
    { name: 'API Reference', href: '/docs/api', icon: Code, desc: 'Developer docs' },
    { name: 'Ecosystem', href: '/ecosystem', icon: Layers, desc: 'Visual architecture' },
    { name: 'Skills', href: '/skills', icon: Terminal, desc: 'Command system' },
    { name: 'Features', href: '/features', icon: Sparkles, desc: 'All experiences' },
    { name: 'Builds', href: '/builds', icon: Package, desc: 'What we shipped' },
    { name: 'Status', href: '/status', icon: Activity, desc: 'System stack' },
    { name: 'Live Pulse', href: '/live', icon: Radio, desc: 'Real-time heartbeat' },
];

const about = [
    { name: 'About Us', href: '/about', icon: Info, desc: 'Our story' },
    { name: 'Beacon', href: 'https://beacon.activemirror.ai', icon: BookOpen, desc: 'Reflections from Paul', external: true },
    { name: 'Roadmap', href: '/about/roadmap', icon: Map, desc: "What's coming" },
    { name: 'Contact', href: '/about/contact', icon: Mail, desc: 'Get in touch' },
];

function Dropdown({ label, items, isOpen, onToggle, isDark }) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark
                        ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
            >
                {label}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-xl z-50 overflow-hidden ${
                    isDark
                        ? 'bg-zinc-900 border-zinc-800'
                        : 'bg-white border-zinc-200'
                }`}>
                    <div className="p-2">
                        {items.map((item) => {
                            const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'
                            }`;
                            const inner = (
                                <>
                                    <item.icon size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                    <div>
                                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {item.name}
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </>
                            );
                            return item.external ? (
                                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                                    {inner}
                                </a>
                            ) : (
                                <Link key={item.name} to={item.href} className={cls}>
                                    {inner}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Nav() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleDropdownToggle = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${
            isDark
                ? 'bg-black/80 border-white/10'
                : 'bg-white/80 border-zinc-200'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <MirrorLogo className="h-8 w-8" alt="Active Mirror trademark icon" />
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Active Mirror™
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 nav-dropdown">
                        <Dropdown
                            label="Products"
                            items={products}
                            isOpen={openDropdown === 'products'}
                            onToggle={() => handleDropdownToggle('products')}
                            isDark={isDark}
                        />
                        <Dropdown
                            label="Use Cases"
                            items={useCases}
                            isOpen={openDropdown === 'usecases'}
                            onToggle={() => handleDropdownToggle('usecases')}
                            isDark={isDark}
                        />
                        <Dropdown
                            label="Docs"
                            items={docs}
                            isOpen={openDropdown === 'docs'}
                            onToggle={() => handleDropdownToggle('docs')}
                            isDark={isDark}
                        />
                        <Link
                            to="/app"
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isDark
                                    ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                            }`}
                        >
                            App
                        </Link>
                        <Dropdown
                            label="About"
                            items={about}
                            isOpen={openDropdown === 'about'}
                            onToggle={() => handleDropdownToggle('about')}
                            isDark={isDark}
                        />
                        <Link
                            to="/pricing"
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isDark
                                    ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                            }`}
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* CTA + Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/app"
                            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                        >
                            Open App
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg ${
                                isDark ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-100'
                            }`}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className={`md:hidden border-t ${
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                    <div className="px-4 py-4 space-y-4">
                        {/* Products */}
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                                isDark ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Products</div>
                            <div className="grid grid-cols-2 gap-2">
                                {products.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                            isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'
                                        }`}
                                    >
                                        <item.icon size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Use Cases */}
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                                isDark ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Use Cases</div>
                            <div className="grid grid-cols-2 gap-2">
                                {useCases.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                            isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'
                                        }`}
                                    >
                                        <item.icon size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                            <Link to="/docs" onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                                Docs
                            </Link>
                            <Link to="/app" onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                                App
                            </Link>
                            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                                Pricing
                            </Link>
                            <Link to="/about" onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                                About
                            </Link>
                            <a href="https://beacon.activemirror.ai" target="_blank" rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                                Beacon
                            </a>
                            <Link to="/start" onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
