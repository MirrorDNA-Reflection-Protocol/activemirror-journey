/**
 * Cast — Temporal Messaging Showcase
 *
 * MirrorCast: Send messages across time
 * This is a showcase page — actual usage is through MCP tools
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Clock, Shield, Smartphone, MapPin,
    AlertTriangle, Lock, Zap, ChevronRight,
    Calendar, Bell, Radio, CheckCircle, ArrowRight
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

// Feature cards
const FEATURES = [
    {
        icon: Clock,
        title: 'Temporal Messages',
        description: 'Schedule messages for your future self. Morning reminders, deadline nudges, or reflections to open in a year.',
        color: 'cyan',
        gradient: 'from-cyan-500 to-blue-500',
        example: '"Open this before your presentation tomorrow at 9am"'
    },
    {
        icon: Shield,
        title: 'Dead Man\'s Switch',
        description: 'Emergency messages that send if you don\'t check in. For trusted contacts, final words, or vault access.',
        color: 'red',
        gradient: 'from-red-500 to-orange-500',
        example: '"If I haven\'t checked in for 7 days, send this to..."'
    },
    {
        icon: Smartphone,
        title: 'Device Sync',
        description: 'Messages sync across all your devices via encrypted Tailscale mesh. Write on desktop, receive on phone.',
        color: 'violet',
        gradient: 'from-violet-500 to-purple-500',
        example: '"Synced to 3 devices: MacBook, iPhone, iPad"'
    },
    {
        icon: MapPin,
        title: 'Location Triggers',
        description: 'Deliver messages when you arrive or leave places. Geofenced reminders that find you.',
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
        example: '"When you arrive at the office: Remember to..."'
    }
];

// Demo messages for timeline
const DEMO_MESSAGES = [
    { time: '2 min ago', status: 'delivered', content: 'Don\'t forget: You wanted to call Mom today.', priority: 'normal' },
    { time: 'Tomorrow 9am', status: 'scheduled', content: 'Pre-presentation pep talk: You\'ve got this. Remember the key points...', priority: 'high' },
    { time: 'In 3 days', status: 'scheduled', content: 'Follow up on the proposal you sent Monday.', priority: 'normal' },
    { time: 'Jan 1, 2027', status: 'scheduled', content: 'Open this on New Year\'s Day. A letter from your past self...', priority: 'low' },
];

const STATUS_STYLES = {
    delivered: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle },
    scheduled: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: Clock },
    pending: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', icon: Bell },
};

const PRIORITY_STYLES = {
    low: 'border-l-zinc-500',
    normal: 'border-l-cyan-500',
    high: 'border-l-amber-500',
    critical: 'border-l-red-500',
};

export default function Cast() {
    const [activeFeature, setActiveFeature] = useState(0);
    const [demoTime, setDemoTime] = useState(new Date());

    // Update demo time every second for realism
    useEffect(() => {
        const interval = setInterval(() => setDemoTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-cyan-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black z-0" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/10">
                <div className="flex justify-between items-center py-3 px-4 max-w-4xl mx-auto">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <MirrorLogo className="w-6 h-6" />
                        <span className="text-sm font-medium">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Radio size={14} className="text-cyan-400 animate-pulse" />
                        <span className="hidden sm:inline">Sovereign Messaging</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen pt-20 pb-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Send size={14} />
                            Messages that travel through time
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                            MirrorCast
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
                            Send messages to your future self. Schedule delivery for tomorrow, next month, or years from now.
                            <span className="text-cyan-400"> Encrypted. Sovereign. Yours.</span>
                        </p>
                    </motion.div>

                    {/* Demo Timeline */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <SpotlightCard className="border border-cyan-500/20 bg-black/40 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-cyan-500/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/20">
                                        <Send size={18} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Message Timeline</h3>
                                        <p className="text-xs text-zinc-400">Demo view</p>
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-400 font-mono">
                                    {demoTime.toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 space-y-3">
                                {DEMO_MESSAGES.map((msg, index) => {
                                    const status = STATUS_STYLES[msg.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className={`p-3 rounded-lg border-l-2 ${PRIORITY_STYLES[msg.priority]} ${status.bg} border ${status.border}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <StatusIcon size={16} className={`mt-0.5 ${status.text}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-zinc-200">{msg.content}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs ${status.text}`}>{msg.status}</span>
                                                        <span className="text-xs text-zinc-400">•</span>
                                                        <span className="text-xs text-zinc-400">{msg.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-white/5 bg-white/5">
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Lock size={12} />
                                    <span>End-to-end encrypted • Local-first • Sync via Tailscale</span>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-center mb-6 text-zinc-300">
                            What can you do with MirrorCast?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {FEATURES.map((feature, index) => {
                                const Icon = feature.icon;
                                const isActive = activeFeature === index;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        onClick={() => setActiveFeature(index)}
                                        className="cursor-pointer"
                                    >
                                        <SpotlightCard
                                            className={`h-full transition-all ${
                                                isActive
                                                    ? `border-${feature.color}-500/40 bg-${feature.color}-500/10`
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                                                    <Icon size={24} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                                                    <p className="text-sm text-zinc-400 mb-2">{feature.description}</p>
                                                    <p className="text-xs text-zinc-400 italic">"{feature.example}"</p>
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* How It Works */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <SpotlightCard className="border border-white/10 bg-black/40 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-cyan-400" />
                                How to Use MirrorCast
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-mono text-cyan-400">1</div>
                                    <div>
                                        <h4 className="font-medium text-white">Initialize on your device</h4>
                                        <p className="text-sm text-zinc-400">Use <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">cast_init</code> via Claude to set up encryption keys</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-mono text-cyan-400">2</div>
                                    <div>
                                        <h4 className="font-medium text-white">Send temporal messages</h4>
                                        <p className="text-sm text-zinc-400">Use <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">cast_send</code> with a delivery time</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-mono text-cyan-400">3</div>
                                    <div>
                                        <h4 className="font-medium text-white">Receive when ready</h4>
                                        <p className="text-sm text-zinc-400">Messages appear via <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">cast_receive</code> when their time comes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm text-zinc-400">
                                    <strong className="text-white">Note:</strong> MirrorCast runs locally on your machine via MCP (Model Context Protocol).
                                    All messages are encrypted and never leave your devices unless you enable mesh sync.
                                </p>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* Dead Man's Switch Highlight */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <SpotlightCard className="border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                                    <AlertTriangle size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Dead Man's Switch</h3>
                                    <p className="text-zinc-400 mb-4">
                                        Set up emergency messages that trigger if you don't check in. Perfect for:
                                    </p>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li className="flex items-center gap-2">
                                            <ChevronRight size={14} className="text-red-400" />
                                            Final messages to loved ones
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <ChevronRight size={14} className="text-red-400" />
                                            Vault access for trusted contacts
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <ChevronRight size={14} className="text-red-400" />
                                            Account recovery instructions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <ChevronRight size={14} className="text-red-400" />
                                            Whistleblower dead drops
                                        </li>
                                    </ul>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                                        <Shield size={12} />
                                        Warning cascade: Push → SMS → Email → Trigger
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <p className="text-zinc-400 mb-4">
                            Part of the MirrorDNA sovereign AI stack
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/scan"
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Discover Your Brain <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/"
                                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="mt-12 text-center text-xs text-zinc-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <p>
                            MirrorCast uses age encryption + Ed25519 signatures.
                            <br />
                            Spec: ~/.mirrordna/specs/MIRRORCAST_SPEC_v1.0.md
                        </p>
                    </motion.div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
