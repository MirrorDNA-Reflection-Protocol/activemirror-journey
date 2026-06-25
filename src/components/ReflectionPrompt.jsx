import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReflectionPrompt({ onSetIntent, ready }) {
    const [intent, setIntent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (intent.trim() && ready) {
            onSetIntent(intent);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl text-center space-y-8"
            >
                <div className="flex justify-center mb-6">
                    <Sparkles size={48} className="text-zinc-500 animate-pulse" />
                </div>

                <h1 className="text-3xl font-light text-white tracking-wide">
                    The Mirror is Clear.
                </h1>

                <p className="text-zinc-400 text-lg">
                    What is the most important question for today?
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
                    <input
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-center"
                        placeholder="My intent is..."
                        autoFocus
                        disabled={!ready}
                    />
                    <button
                        type="submit"
                        disabled={!intent.trim() || !ready}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-0 disabled:scale-95 transition-all"
                    >
                        <ArrowRight size={20} />
                    </button>
                    {!ready && (
                        <div className="absolute -bottom-8 left-0 right-0 text-[10px] text-zinc-600 font-mono tracking-widest uppercase animate-pulse">
                            Initializing Neural Core...
                        </div>
                    )}
                </form>

                <div className="text-xs text-zinc-600 font-mono tracking-widest uppercase mt-12">
                    NO DATA LEAVES THIS DEVICE.
                </div>
            </motion.div>
        </div>
    );
}
