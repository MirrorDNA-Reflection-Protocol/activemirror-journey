import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const HeartbeatGlyph = ({ atmosphere = { primary: '#f59e0b' } }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const xPct = (e.clientX / innerWidth) - 0.5;
            const yPct = (e.clientY / innerHeight) - 0.5;

            mouseX.set(xPct * 40); // Max movement 40px
            mouseY.set(yPct * 40);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{ x, y }}
            className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center pointer-events-none"
        >
            {/* Outer Glow */}
            <motion.div
                className="absolute inset-0 bg-white/5 blur-2xl rounded-full"
                animate={{
                    backgroundColor: [`${atmosphere.primary}05`, `${atmosphere.primary}15`, `${atmosphere.primary}05`],
                    scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* The Glyph */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            >
                {/* Vertical Core */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M50 20 L50 80"
                    className="opacity-40"
                    strokeDasharray="1 3"
                />

                {/* Mirror Diamond */}
                <motion.path
                    animate={{
                        stroke: [atmosphere.primary, '#ffffff', atmosphere.primary],
                        strokeWidth: [2.5, 3.5, 2.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    d="M50 35 L35 50 L50 65 L65 50 Z"
                />

                {/* The Pulse Core */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="4"
                    fill="currentColor"
                    animate={{
                        scale: [1, 2, 1],
                        opacity: [0.5, 1, 0.5],
                        fill: [atmosphere.primary, '#ffffff', atmosphere.primary]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Orbital Rings */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="4 8"
                    className="opacity-10"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </motion.div>
    );
};

export default HeartbeatGlyph;
