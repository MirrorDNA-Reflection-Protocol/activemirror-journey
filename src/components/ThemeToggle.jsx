/**
 * Theme Toggle Component
 * Elegant sun/moon toggle for light/dark mode
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-colors ${
                isDark
                    ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900'
            } ${className}`}
            whileTap={{ scale: 0.95 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {isDark ? (
                    <Moon size={18} />
                ) : (
                    <Sun size={18} />
                )}
            </motion.div>
        </motion.button>
    );
}
