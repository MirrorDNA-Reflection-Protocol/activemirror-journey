/**
 * Builds Page — Auto-synced from SHIPLOG.md via site_sync.py
 * Shows all shipped capabilities across the MirrorDNA ecosystem.
 * Data: src/data/builds.json (auto-generated, do not edit manually)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, Layers, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';
import buildsData from '../data/builds.json';

function ModuleCard({ module, index, isDark }) {
    const [expanded, setExpanded] = useState(index === 0);
    const dates = [...new Set(module.entries.map(e => e.shipped).filter(Boolean))].sort().reverse();
    const latest = dates[0] || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-xl border ${
                isDark
                    ? 'border-zinc-800 bg-zinc-900/50'
                    : 'border-zinc-200 bg-white'
            }`}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-between p-5 text-left cursor-pointer ${
                    isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
                } rounded-xl transition-colors`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                        <Package className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {module.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {module.entries.length} capabilities {latest && `\u00b7 latest ${latest}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                        isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                    }`}>
                        {module.entries.length} shipped
                    </span>
                    {expanded
                        ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                        : <ChevronRight className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    }
                </div>
            </button>

            {expanded && (
                <div className={`px-5 pb-5 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <div className="mt-4 space-y-3">
                        {module.entries.map((entry, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                    isDark ? 'bg-zinc-800/40' : 'bg-zinc-50'
                                }`}
                            >
                                <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                    isDark ? 'text-purple-400' : 'text-purple-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-medium text-sm ${
                                            isDark ? 'text-white' : 'text-zinc-900'
                                        }`}>
                                            {entry.name}
                                        </span>
                                        {entry.shipped && (
                                            <span className={`text-xs font-mono ${
                                                isDark ? 'text-zinc-600' : 'text-zinc-400'
                                            }`}>
                                                {entry.shipped}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm mt-0.5 ${
                                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                                    }`}>
                                        {entry.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function Builds() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
                        isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                        What We've Built
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                        Every capability shipped across the MirrorDNA sovereign AI ecosystem.
                        Auto-synced from the build log.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`grid grid-cols-3 gap-4 mb-12 p-6 rounded-xl border ${
                        isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-white'
                    }`}
                >
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {buildsData.total_capabilities}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            Capabilities
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {buildsData.total_modules}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            Modules
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {buildsData.latest_ship}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            Latest Ship
                        </div>
                    </div>
                </motion.div>

                {/* Modules */}
                <div className="space-y-4">
                    {buildsData.modules.map((module, i) => (
                        <ModuleCard key={module.name} module={module} index={i} isDark={isDark} />
                    ))}
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-center text-sm mt-12 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
                >
                    Auto-generated from SHIPLOG &middot; Last synced {buildsData.generated}
                </motion.p>
            </div>
        </PageLayout>
    );
}
