/**
 * ⟡ EcosystemVisual — Animated MirrorDNA Architecture
 * A stunning visual representation of the sovereign AI ecosystem
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import {
    Brain, Shield, Database, Cpu, Network, Lock,
    Fingerprint, Eye, MessageSquare, Layers, Zap,
    ArrowRight, Activity, Globe, User, Server
} from 'lucide-react';

// Public-facing products only (no internal infrastructure)
const ecosystemLayers = [
    {
        id: 'user',
        name: 'You',
        icon: User,
        color: '#22c55e',
        description: 'Your thoughts, your data, your sovereignty',
        items: ['Browser', 'Mobile', 'Desktop', 'CLI']
    },
    {
        id: 'interface',
        name: 'Interface Layer',
        icon: Globe,
        color: '#3b82f6',
        description: 'Where you interact with reflective AI',
        items: ['Mirror', 'BrainScan', 'AI Twins', 'Cast']
    },
    {
        id: 'cognition',
        name: 'Cognitive Layer',
        icon: Brain,
        color: '#a855f7',
        description: 'Intelligence that understands context',
        items: ['MirrorBrain', 'LingOS', 'AgentDNA', 'Prism']
    },
    {
        id: 'trust',
        name: 'Trust Layer',
        icon: Shield,
        color: '#f59e0b',
        description: 'Security and compliance by design',
        items: ['MirrorGate', 'TrustByDesign', 'Consent Proofs', 'Audit Trail']
    },
    {
        id: 'memory',
        name: 'Memory Layer',
        icon: Database,
        color: '#ec4899',
        description: 'Persistent context across sessions',
        items: ['MirrorRecall', 'GlyphTrail', 'Vault', 'Identity Seed']
    }
];

const connections = [
    { from: 'user', to: 'interface', label: 'Interact' },
    { from: 'interface', to: 'cognition', label: 'Process' },
    { from: 'cognition', to: 'trust', label: 'Validate' },
    { from: 'trust', to: 'memory', label: 'Persist' },
    { from: 'memory', to: 'cognition', label: 'Recall' },
];

const DataParticle = ({ delay, from, to }) => (
    <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{ background: 'linear-gradient(135deg, #00ff94, #a855f7)' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            x: [0, 100],
            y: [0, 50]
        }}
        transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            repeatDelay: 3
        }}
    />
);

const LayerNode = ({ layer, index, isActive, onClick, isDark }) => {
    const Icon = layer.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className={`relative cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                isActive
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : isDark
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-zinc-200 hover:border-zinc-300'
            } ${isDark ? 'bg-zinc-900/50' : 'bg-white'}`}
        >
            {/* Glow effect when active */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        background: `radial-gradient(circle at center, ${layer.color}20, transparent 70%)`
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative z-10">
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${layer.color}20` }}
                >
                    <Icon size={28} style={{ color: layer.color }} />
                </div>

                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {layer.name}
                </h3>

                <p className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {layer.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {layer.items.map((item, i) => (
                        <motion.span
                            key={item}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.15 + i * 0.05 }}
                            className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-white/5 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                            }`}
                        >
                            {item}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Connection line to next */}
            {index < ecosystemLayers.length - 1 && (
                <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ArrowRight
                        size={20}
                        className="rotate-90"
                        style={{ color: layer.color }}
                    />
                </motion.div>
            )}
        </motion.div>
    );
};

const FlowDiagram = ({ isDark }) => {
    const [activeFlow, setActiveFlow] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFlow(f => (f + 1) % 5);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative py-8">
            {/* Central flow visualization */}
            <svg className="w-full h-32" viewBox="0 0 800 120">
                <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="25%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="75%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Main flow line */}
                <motion.path
                    d="M 50 60 Q 200 20 400 60 Q 600 100 750 60"
                    fill="none"
                    stroke="url(#flowGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Animated particle along path */}
                <motion.circle
                    r="6"
                    fill="#fff"
                    filter="url(#glow)"
                    animate={{
                        offsetDistance: ['0%', '100%'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        offsetPath: 'path("M 50 60 Q 200 20 400 60 Q 600 100 750 60")'
                    }}
                />

                {/* Layer nodes */}
                {ecosystemLayers.map((layer, i) => {
                    const x = 50 + (i * 175);
                    const y = 60 + (i % 2 === 0 ? -20 : 20);
                    return (
                        <g key={layer.id}>
                            <motion.circle
                                cx={x}
                                cy={y}
                                r={activeFlow === i ? 18 : 14}
                                fill={layer.color}
                                opacity={activeFlow === i ? 1 : 0.6}
                                animate={{
                                    scale: activeFlow === i ? [1, 1.2, 1] : 1
                                }}
                                transition={{ duration: 0.5 }}
                            />
                            <text
                                x={x}
                                y={y + 35}
                                textAnchor="middle"
                                fill={isDark ? '#fff' : '#18181b'}
                                fontSize="11"
                                fontWeight="500"
                            >
                                {layer.name.split(' ')[0]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default function EcosystemVisual({ compact = false }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeLayer, setActiveLayer] = useState(null);
    const [isAnimating, setIsAnimating] = useState(true);

    // Auto-cycle through layers
    useEffect(() => {
        if (!isAnimating) return;
        const interval = setInterval(() => {
            setActiveLayer(current => {
                if (current === null) return 0;
                return (current + 1) % ecosystemLayers.length;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [isAnimating]);

    if (compact) {
        return (
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-zinc-900/50 border border-white/10' : 'bg-white border border-zinc-200'}`}>
                <FlowDiagram isDark={isDark} />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-3xl ${isDark ? 'bg-zinc-900/30' : 'bg-zinc-50'}`}>
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)'
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,148,0.1) 0%, transparent 70%)'
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            <div className="relative z-10 p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4"
                    >
                        <Activity size={16} className="text-purple-400" />
                        <span className="text-sm text-purple-400 font-medium">Live Architecture</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                    >
                        The MirrorDNA Ecosystem
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                    >
                        Five layers working in harmony to deliver sovereign, reflective AI that you own
                    </motion.p>
                </div>

                {/* Flow diagram */}
                <FlowDiagram isDark={isDark} />

                {/* Layer cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-8">
                    {ecosystemLayers.map((layer, i) => (
                        <LayerNode
                            key={layer.id}
                            layer={layer}
                            index={i}
                            isActive={activeLayer === i}
                            onClick={() => {
                                setIsAnimating(false);
                                setActiveLayer(i);
                            }}
                            isDark={isDark}
                        />
                    ))}
                </div>

                {/* Data flow indicators */}
                <div className="mt-12 flex justify-center gap-8 flex-wrap">
                    {connections.slice(0, 4).map((conn, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 + i * 0.1 }}
                            className={`flex items-center gap-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                        >
                            <motion.div
                                className="w-2 h-2 rounded-full bg-purple-500"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                            />
                            {conn.from} → {conn.to}
                        </motion.div>
                    ))}
                </div>

                {/* Live sites indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-12 text-center"
                >
                    <p className={`text-sm mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Live endpoints
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {[
                            { name: 'activemirror.ai', status: 'live' },
                            { name: 'id.activemirror.ai', status: 'live' },
                            { name: 'brain.activemirror.ai', status: 'live' },
                            { name: 'mirror.activemirror.ai', status: 'live' },
                            { name: 'beacon.activemirror.ai', status: 'live' }
                        ].map((site, i) => (
                            <a
                                key={site.name}
                                href={`https://${site.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    isDark
                                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {site.name}
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
