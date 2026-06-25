import React from 'react';
import { Target, RotateCcw } from 'lucide-react';

export default function ReflectionSnapshot({ stats }) {
    if (!stats || stats.count === 0) return null;

    return (
        <div className="bg-white/5 border-t border-b border-white/5 py-4 px-6 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">Stored</span>
                    <span className="text-white font-bold text-lg leading-none">{stats.count}</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <Target size={12} className="text-green-500" />
                    <span>{stats.decisions} Decisions</span>
                </div>
                <div className="flex items-center gap-2">
                    <RotateCcw size={12} className="text-yellow-500" />
                    <span>{stats.deferrals} Deferrals</span>
                </div>
            </div>
            <div>
                {stats.firstEntry && (
                    <span className="opacity-50">Active since {new Date(stats.firstEntry).toLocaleDateString()}</span>
                )}
            </div>
        </div>
    );
}
