/**
 * MirrorSig — Procedural Visual Identity Generator
 * Creates a unique constellation/neural map based on archetype + timestamp
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// Archetype color palettes
const ARCHETYPE_PALETTES = {
    architect: ['#3b82f6', '#06b6d4', '#8b5cf6'],
    explorer: ['#8b5cf6', '#a855f7', '#ec4899'],
    builder: ['#10b981', '#22c55e', '#84cc16'],
    analyst: ['#f59e0b', '#eab308', '#f97316'],
    connector: ['#3b82f6', '#6366f1', '#8b5cf6'],
    creative: ['#f97316', '#ef4444', '#ec4899'],
    scholar: ['#6b7280', '#9ca3af', '#d1d5db'],
    strategist: ['#ef4444', '#f43f5e', '#ec4899'],
};

// Generate deterministic random from seed
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Hash string to number
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export default function MirrorSig({
    archetype = 'architect',
    seed = '',
    size = 200,
    animated = true,
    className = ''
}) {
    const canvasRef = useRef(null);
    const colors = ARCHETYPE_PALETTES[archetype] || ARCHETYPE_PALETTES.architect;

    const seedNum = useMemo(() => {
        return hashString(seed || Date.now().toString());
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, size, size);

        const centerX = size / 2;
        const centerY = size / 2;
        const maxRadius = size * 0.4;

        // Generate nodes
        const nodeCount = 12 + Math.floor(seededRandom(seedNum) * 8);
        const nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2 + seededRandom(seedNum + i) * 0.5;
            const radius = maxRadius * (0.3 + seededRandom(seedNum + i + 100) * 0.7);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const nodeSize = 2 + seededRandom(seedNum + i + 200) * 4;
            const colorIndex = Math.floor(seededRandom(seedNum + i + 300) * colors.length);

            nodes.push({ x, y, size: nodeSize, color: colors[colorIndex], angle, radius });
        }

        // Draw connections
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (dist < maxRadius * 0.8 && seededRandom(seedNum + i * 100 + j) > 0.4) {
                    const gradient = ctx.createLinearGradient(
                        nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
                    );
                    gradient.addColorStop(0, nodes[i].color + '40');
                    gradient.addColorStop(1, nodes[j].color + '40');
                    ctx.strokeStyle = gradient;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw orbital rings
        ctx.strokeStyle = colors[0] + '20';
        ctx.lineWidth = 1;
        for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius * (r / 3), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw nodes with glow
        nodes.forEach(node => {
            // Glow
            const glow = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.size * 3
            );
            glow.addColorStop(0, node.color + '60');
            glow.addColorStop(1, node.color + '00');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center glyph
        ctx.fillStyle = colors[0];
        ctx.font = `${size * 0.15}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟡', centerX, centerY);

    }, [size, seedNum, colors]);

    return (
        <motion.div
            className={`relative ${className}`}
            initial={animated ? { opacity: 0, scale: 0.8 } : false}
            animate={animated ? { opacity: 1, scale: 1 } : false}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size }}
                className="rounded-full"
            />
            {animated && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${colors[0]}20 0%, transparent 70%)`,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </motion.div>
    );
}

// Generate shareable card data URL
export function generateMirrorSigDataURL(archetype, seed, size = 400) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = 2;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const colors = ARCHETYPE_PALETTES[archetype] || ARCHETYPE_PALETTES.architect;
    const seedNum = hashString(seed || Date.now().toString());

    // Background
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.35;

    // Generate and draw (same logic as component)
    const nodeCount = 12 + Math.floor(seededRandom(seedNum) * 8);
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + seededRandom(seedNum + i) * 0.5;
        const radius = maxRadius * (0.3 + seededRandom(seedNum + i + 100) * 0.7);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const nodeSize = 2 + seededRandom(seedNum + i + 200) * 4;
        const colorIndex = Math.floor(seededRandom(seedNum + i + 300) * colors.length);
        nodes.push({ x, y, size: nodeSize, color: colors[colorIndex] });
    }

    // Draw connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < maxRadius * 0.8 && seededRandom(seedNum + i * 100 + j) > 0.4) {
                const gradient = ctx.createLinearGradient(
                    nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
                );
                gradient.addColorStop(0, nodes[i].color + '40');
                gradient.addColorStop(1, nodes[j].color + '40');
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    // Draw nodes
    nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Center glyph
    ctx.fillStyle = colors[0];
    ctx.font = `${size * 0.12}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟡', centerX, centerY);

    return canvas.toDataURL('image/png');
}
