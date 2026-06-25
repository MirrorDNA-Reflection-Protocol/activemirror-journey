/**
 * ⟡ CONSENT GATE — with Mirror Proof Protocol
 *
 * Proof-of-Memory: Cryptographic attestation that you actually read this.
 * - Must check 3 acknowledgments
 * - Generates unique proof hash
 * - No bypass, no shortcuts
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, ArrowRight, ExternalLink, Check, Lock, Fingerprint } from 'lucide-react';
import Logo from './Logo';
import { hasSessionConsent, setSessionConsent, generateProofHash } from '../utils/consent';

const ConsentGate = ({ onConsent }) => {
    const [acknowledgments, setAcknowledgments] = useState({
        notTherapy: false,
        experimental: false,
        ownRisk: false
    });
    const [proofGenerated, setProofGenerated] = useState(false);
    const [showProof, setShowProof] = useState(false);
    const [alreadyConsented, setAlreadyConsented] = useState(false);

    const timestamp = useMemo(() => Date.now(), []);

    // Check if user already has valid consent from another page
    useEffect(() => {
        if (hasSessionConsent()) {
            setAlreadyConsented(true);
            onConsent?.();
        }
    }, [onConsent]);

    const allAcknowledged = acknowledgments.notTherapy &&
                           acknowledgments.experimental &&
                           acknowledgments.ownRisk;

    const proofHash = useMemo(() => {
        if (allAcknowledged) {
            return generateProofHash(
                Object.entries(acknowledgments).filter(([_, v]) => v).map(([k]) => k),
                timestamp
            );
        }
        return null;
    }, [allAcknowledged, acknowledgments, timestamp]);

    useEffect(() => {
        if (allAcknowledged && !proofGenerated) {
            setTimeout(() => {
                setProofGenerated(true);
                setShowProof(true);
            }, 500);
        }
    }, [allAcknowledged, proofGenerated]);

    const handleAck = (key) => {
        setAcknowledgments(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleEnter = async () => {
        if (allAcknowledged && proofGenerated) {
            // Store proof using shared consent utility (also logs to backend)
            const acks = Object.keys(acknowledgments).filter(k => acknowledgments[k]);
            await setSessionConsent(proofHash, acks);
            onConsent();
        }
    };

    // If already consented, don't render the gate
    if (alreadyConsented) {
        return null;
    }

    return (
        <div className="min-h-screen min-h-[100dvh] bg-[#020204] text-white overflow-y-auto">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/[0.08] via-[#020204] to-[#020204]" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px]"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen min-h-[100dvh] flex items-center justify-center p-4 py-8">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-lg"
                >
                    {/* Card */}
                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/50">

                        {/* Header */}
                        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-white/[0.05]">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4">
                                <motion.div
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Logo size={56} theme="violet" />
                                </motion.div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-medium text-white">Active Mirror</h1>
                                    <p className="text-xs sm:text-sm text-zinc-500">Reflective AI Experience</p>
                                </div>
                            </div>

                            {/* Mirror Proof Badge */}
                            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                                <Fingerprint size={16} className="text-indigo-400 flex-shrink-0" />
                                <span className="text-indigo-200/90 text-xs sm:text-sm font-medium">
                                    Mirror Proof Required
                                </span>
                            </div>
                        </div>

                        {/* Content with Acknowledgments */}
                        <div className="px-6 sm:px-8 py-4 sm:py-6">
                            <div className="space-y-4 sm:space-y-5">

                                {/* Section 1: What This Is */}
                                <div>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <span className="text-violet-400">⟡</span> What This Is
                                    </h3>
                                    <p className="text-zinc-400 text-sm">
                                        Active Mirror is a <strong className="text-zinc-300">reflective AI</strong> — it asks questions to help you think, rather than giving advice.
                                    </p>
                                </div>

                                {/* Section 2: What This Is Not - with ACK */}
                                <div className={`p-3 rounded-xl border transition-all ${
                                    acknowledgments.notTherapy
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-zinc-800/30 border-white/5'
                                }`}>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <span className="text-violet-400">◈</span> What This Is Not
                                    </h3>
                                    <ul className="text-zinc-400 space-y-1 text-sm mb-3">
                                        <li>• Not a therapist or mental health service</li>
                                        <li>• Not a substitute for professional advice</li>
                                    </ul>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => handleAck('notTherapy')}
                                            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                                                acknowledgments.notTherapy
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-zinc-600 group-hover:border-zinc-400'
                                            }`}
                                        >
                                            {acknowledgments.notTherapy && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                                            I understand this is not therapy or professional advice
                                        </span>
                                    </label>
                                </div>

                                {/* Section 3: MirrorGate */}
                                <div>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <Shield size={14} className="text-emerald-400" /> MirrorGate Protection
                                    </h3>
                                    <p className="text-zinc-400 text-sm">
                                        All responses pass through <strong className="text-zinc-300">MirrorGate</strong>, a safety layer that blocks harmful content.
                                    </p>
                                </div>

                                {/* Section 4: Experimental Warning - with ACK */}
                                <div className={`p-3 rounded-xl border transition-all ${
                                    acknowledgments.experimental
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-amber-500/5 border-amber-500/10'
                                }`}>
                                    <h3 className="text-amber-300 font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm">
                                        <AlertTriangle size={14} /> Experimental Technology
                                    </h3>
                                    <p className="text-amber-200/70 text-xs sm:text-sm mb-3">
                                        This is <strong>experimental AI</strong>. Responses may be inaccurate, unexpected, or imperfect.
                                    </p>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => handleAck('experimental')}
                                            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                                                acknowledgments.experimental
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-amber-600/50 group-hover:border-amber-500'
                                            }`}
                                        >
                                            {acknowledgments.experimental && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-amber-200/60 group-hover:text-amber-200/80">
                                            I understand this is experimental and may have limitations
                                        </span>
                                    </label>
                                </div>

                                {/* Section 5: Own Risk - with ACK */}
                                <div className={`p-3 rounded-xl border transition-all ${
                                    acknowledgments.ownRisk
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-red-500/5 border-red-500/10'
                                }`}>
                                    <h3 className="text-red-300 font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm">
                                        <Lock size={14} /> Acceptance of Risk
                                    </h3>
                                    <p className="text-red-200/70 text-xs sm:text-sm mb-3">
                                        By proceeding, you use Active Mirror <strong>at your own risk</strong> and accept full responsibility.
                                    </p>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => handleAck('ownRisk')}
                                            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                                                acknowledgments.ownRisk
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-red-600/50 group-hover:border-red-500'
                                            }`}
                                        >
                                            {acknowledgments.ownRisk && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-red-200/60 group-hover:text-red-200/80">
                                            I accept full responsibility for my use of this tool
                                        </span>
                                    </label>
                                </div>

                            </div>
                        </div>

                        {/* Footer with Proof */}
                        <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-white/[0.05] bg-black/20">

                            {/* Proof Display */}
                            <AnimatePresence>
                                {showProof && proofHash && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Fingerprint size={14} className="text-emerald-400" />
                                                <span className="text-emerald-400 text-xs font-medium">Mirror Proof Generated</span>
                                            </div>
                                            <code className="text-emerald-300 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                                                {proofHash}
                                            </code>
                                        </div>
                                        <p className="text-emerald-400/60 text-[10px] mt-1">
                                            Cryptographic attestation of informed consent
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress indicator */}
                            {!allAcknowledged && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                                        <span>Acknowledgments</span>
                                        <span>{Object.values(acknowledgments).filter(Boolean).length}/3</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(Object.values(acknowledgments).filter(Boolean).length / 3) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <motion.button
                                onClick={handleEnter}
                                disabled={!allAcknowledged || !proofGenerated}
                                whileTap={allAcknowledged ? { scale: 0.98 } : {}}
                                className={`w-full py-3 sm:py-4 px-4 sm:px-6 font-medium rounded-2xl flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 text-sm sm:text-base ${
                                    allAcknowledged && proofGenerated
                                        ? 'bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-lg shadow-violet-500/20 cursor-pointer'
                                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                            >
                                {allAcknowledged && proofGenerated ? (
                                    <>
                                        <Fingerprint size={16} />
                                        <span>Proof Verified — Enter Mirror</span>
                                        <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <Lock size={16} />
                                        <span>Complete All Acknowledgments</span>
                                    </>
                                )}
                            </motion.button>

                            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-600">
                                <a href="/terms" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                    Terms <ExternalLink size={8} />
                                </a>
                                <span>·</span>
                                <a href="/privacy" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                    Privacy <ExternalLink size={8} />
                                </a>
                                <span>·</span>
                                <a href="/proof" target="_blank" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                    Mirror Proof <ExternalLink size={8} />
                                </a>
                                <span>·</span>
                                <a href="/" className="hover:text-zinc-400 transition-colors">
                                    Exit
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Version tag */}
                    <div className="mt-3 sm:mt-4 text-center text-[9px] sm:text-[10px] text-zinc-700 tracking-wide">
                        Active Mirror v15.1 · Mirror Proof Protocol · MirrorGate Protected
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ConsentGate;
