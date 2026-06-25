/**
 * Active Mirror — Homepage
 * Minimal onboarding front door for first-time visitors.
 */

import React from 'react';
import { motion } from 'framer-motion';
import HomeMinimal from './HomeMinimal';

const HomePage = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <HomeMinimal />
    </motion.div>
);

export default HomePage;
