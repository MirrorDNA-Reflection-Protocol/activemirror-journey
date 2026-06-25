import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

/**
 * SessionReplay — Shows the user their journey through the reflection
 * "Here's what you said, in order... You went from X to Y. That's not nothing."
 */
export default function SessionReplay({ messages, onClose }) {
    // Extract only user messages
    const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content.trim())
        .filter(m => m.length > 0 && m.length < 200); // Filter out very long messages
    
    if (userMessages.length < 3) {
        return null; // Not enough for a meaningful replay
    }
    
    const first = userMessages[0];
    const last = userMessages[userMessages.length - 1];
    
    // Simple arc detection - did they go somewhere?
    const hasArc = first.toLowerCase() !== last.toLowerCase();
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-400" size={20} />
                        <span className="text-purple-400 font-medium">Your Journey</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={18} className="text-zinc-400" />
                    </button>
                </div>
                
                {/* The Journey */}
                <div className="space-y-4 mb-8">
                    <p className="text-zinc-400 text-sm">Here's what you said, in order:</p>
                    
                    <div className="space-y-3 pl-4 border-l-2 border-purple-500/30">
                        {userMessages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-white/80"
                            >
                                <span className="text-purple-400 mr-2">→</span>
                                "{msg}"
                            </motion.div>
                        ))}
                    </div>
                </div>
                
                {/* The Arc */}
                {hasArc && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: userMessages.length * 0.1 + 0.3 }}
                        className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
                    >
                        <p className="text-purple-300">
                            <span className="glyph-breathe">⟡</span> You went from "{first.slice(0, 50)}{first.length > 50 ? '...' : ''}" to "{last.slice(0, 50)}{last.length > 50 ? '...' : ''}"
                        </p>
                        <p className="text-purple-400/70 text-sm mt-2">That's not nothing.</p>
                    </motion.div>
                )}
                
                {/* Close */}
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
