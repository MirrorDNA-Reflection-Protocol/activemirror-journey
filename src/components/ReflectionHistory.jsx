import React from 'react';
import { Clock, CheckCircle, PauseCircle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReflectionSnapshot from './ReflectionSnapshot';

export default function ReflectionHistory({ isOpen, onClose, history, stats }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-white/10 z-[100] p-6 shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-lg font-medium text-white tracking-wide">Reflection History</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Snapshot Stats */}
                        <div className="mb-8">
                            <ReflectionSnapshot stats={stats} />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center text-zinc-600 mt-20">
                                    <Clock size={40} className="mx-auto mb-4 opacity-50" />
                                    <p>No reflections recorded yet.</p>
                                </div>
                            ) : (
                                history.map((entry) => (
                                    <div key={entry.id} className="group p-5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-mono text-zinc-500">
                                                {new Date(entry.timestamp).toLocaleDateString()}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${entry.outcome === 'Decide' || entry.outcome === 'Next Action'
                                                    ? 'border-green-500/30 text-green-500'
                                                    : 'border-yellow-500/30 text-yellow-500'
                                                }`}>
                                                {entry.outcome}
                                            </span>
                                        </div>
                                        <h3 className="text-zinc-200 text-sm font-medium leading-relaxed mb-3">
                                            {entry.intent}
                                        </h3>
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                                                View Markdown <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
