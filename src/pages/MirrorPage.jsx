/**
 * ⟡ MIRROR PAGE — With Mandatory Consent Gate
 * 
 * CRITICAL: Consent is required EVERY SESSION.
 * State is held in React only — no persistence.
 * Page refresh = consent required again.
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConsentGate from '../components/ConsentGate';
import Mirror from './Mirror';

const MirrorPage = () => {
    // Session-only state. Refresh = gate reappears.
    const [hasConsented, setHasConsented] = useState(false);

    const handleConsent = () => {
        setHasConsented(true);
    };

    return (
        <AnimatePresence mode="wait">
            {!hasConsented ? (
                <motion.div
                    key="gate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <ConsentGate onConsent={handleConsent} />
                </motion.div>
            ) : (
                <motion.div
                    key="mirror"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Mirror />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MirrorPage;
