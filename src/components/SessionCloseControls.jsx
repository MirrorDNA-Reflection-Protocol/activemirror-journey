import React from 'react';
import { CheckCircle, Clock, List, PauseCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionCloseControls({ onOutcome }) {
    const actions = [
        { label: "Decide", icon: CheckCircle, color: "hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/50" },
        { label: "Defer", icon: Clock, color: "hover:bg-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/50" },
        { label: "Next Action", icon: List, color: "hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/50" },
        { label: "Pause", icon: PauseCircle, color: "hover:bg-zinc-500/20 hover:text-zinc-300 hover:border-zinc-500/50" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 py-6"
        >
            <span className="w-full text-center text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-mono">Close Reflection Session</span>
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={() => onOutcome(action.label)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all duration-300 text-sm ${action.color}`}
                >
                    <action.icon size={14} />
                    {action.label}
                </button>
            ))}
        </motion.div>
    );
}
