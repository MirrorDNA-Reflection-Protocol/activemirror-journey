/**
 * ⟡ Light Consent Banner — Quick one-click acknowledgment
 *
 * Used for pages with lower risk (BrainScan, Brief, etc.)
 * If user already has Mirror Proof, this doesn't show.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, ExternalLink } from 'lucide-react';
import { hasSessionConsent, setQuickConsent, hasQuickConsent } from '../utils/consent';

const LightConsentBanner = ({ feature, onConsent, isDark = true }) => {
    const [visible, setVisible] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        // Check if user needs to see this
        const hasFullConsent = hasSessionConsent();
        const hasQuick = hasQuickConsent(feature);

        if (!hasFullConsent && !hasQuick) {
            setVisible(true);
        } else {
            onConsent?.();
        }
    }, [feature, onConsent]);

    const handleAcknowledge = async () => {
        setAcknowledged(true);
        await setQuickConsent(feature);
        setTimeout(() => {
            setVisible(false);
            onConsent?.();
        }, 500);
    };

    const handleDismiss = () => {
        // Can't dismiss without acknowledging - redirect to home
        window.location.href = '/';
    };

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-0 left-0 right-0 z-50 p-4"
            >
                <div className={`max-w-lg mx-auto rounded-2xl border backdrop-blur-xl shadow-2xl ${
                    isDark
                        ? 'bg-zinc-900/95 border-amber-500/20'
                        : 'bg-white/95 border-amber-300'
                }`}>
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    Before You Continue
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            This feature uses <strong className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>experimental AI</strong>.
                            Results are for entertainment/reflection only — not professional advice.
                            By continuing, you accept our{' '}
                            <a href="/terms" className={`underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Terms</a>.
                        </p>

                        {/* Action */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleAcknowledge}
                                disabled={acknowledged}
                                className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                                    acknowledged
                                        ? 'bg-emerald-500 text-white'
                                        : isDark
                                            ? 'bg-purple-500 hover:bg-purple-400 text-white'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                            >
                                {acknowledged ? (
                                    <>
                                        <Check size={16} />
                                        Got it
                                    </>
                                ) : (
                                    'I Understand — Continue'
                                )}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                                    isDark
                                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                                }`}
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LightConsentBanner;
