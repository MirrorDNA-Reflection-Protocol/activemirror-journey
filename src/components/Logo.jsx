import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 48, theme = 'amber', className = "" }) => {
    const colors = {
        amber: {
            primary: '#f59e0b',
            secondary: 'rgba(245, 158, 11, 0.4)',
            glow: 'rgba(245, 158, 11, 0.2)'
        },
        violet: {
            primary: '#a78bfa',
            secondary: 'rgba(167, 139, 250, 0.4)',
            glow: 'rgba(167, 139, 250, 0.2)'
        }
    }[theme] || colors.amber;

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Soft Ambient Glow */}
            <motion.div
                animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ backgroundColor: colors.glow }}
            />

            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-2xl"
            >
                {/* Main Diamond Frame */}
                <motion.rect
                    x="15" y="15" width="70" height="70"
                    rx="12"
                    transform="rotate(45 50 50)"
                    stroke={colors.primary}
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Left Square */}
                <motion.rect
                    x="35" y="42" width="16" height="16"
                    fill={colors.primary}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                />

                {/* Right Arcs */}
                <motion.path
                    d="M62 38 C68 42 68 58 62 62"
                    stroke={colors.primary}
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.path
                    d="M72 32 C82 38 82 62 72 68"
                    stroke={colors.primary}
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </svg>
        </div>
    );
};

export default Logo;
