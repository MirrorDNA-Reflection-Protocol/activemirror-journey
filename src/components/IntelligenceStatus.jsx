import React from 'react';
import { Cloud, Lock, Brain, Download, Check, Wifi, WifiOff } from 'lucide-react';

/**
 * Intelligence Status Component
 * Shows current inference mode and background download progress
 */
export default function IntelligenceStatus({
    currentTier,
    tier1Progress,
    tier2Progress,
    isOnline,
    isSovereign // True when tier2 is fully loaded
}) {
    const tierIcons = {
        'cloud': <Cloud size={14} className="text-blue-400" />,
        'tier1': <Lock size={14} className="text-amber-400" />,
        'tier2': <Brain size={14} className="text-purple-400" />
    };

    const tierLabels = {
        'cloud': 'Cloud',
        'tier1': 'Local Mini',
        'tier2': 'Sovereign'
    };

    return (
        <div className="flex items-center gap-3 text-xs font-mono">
            {/* Online/Offline indicator */}
            <div className={`flex items-center gap-1 ${isOnline ? 'text-green-500' : 'text-red-400'}`}>
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            </div>

            {/* Current mode */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {tierIcons[currentTier]}
                <span className="text-zinc-400">{tierLabels[currentTier]}</span>
            </div>

            {/* Background download progress */}
            {tier1Progress > 0 && tier1Progress < 100 && (
                <div className="flex items-center gap-1.5 text-zinc-500">
                    <Download size={12} className="animate-pulse" />
                    <span>Mini: {tier1Progress}%</span>
                </div>
            )}

            {tier2Progress > 0 && tier2Progress < 100 && (
                <div className="flex items-center gap-1.5 text-zinc-500">
                    <Download size={12} className="animate-pulse" />
                    <span>Full: {tier2Progress}%</span>
                </div>
            )}

            {/* Sovereign Mode celebration */}
            {isSovereign && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
                    <Check size={12} />
                    <span>Sovereign</span>
                </div>
            )}
        </div>
    );
}
