/**
 * ShareCard — Generate shareable identity cards
 * Canvas-based image generation for social sharing
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Twitter, Copy, Check } from 'lucide-react';

const ARCHETYPE_INFO = {
    architect: { name: 'The Architect', tagline: 'Systems thinker. Pattern builder.' },
    explorer: { name: 'The Explorer', tagline: 'Boundary pusher. Unknown seeker.' },
    builder: { name: 'The Builder', tagline: 'Maker of things. Shipping machine.' },
    analyst: { name: 'The Analyst', tagline: 'Data whisperer. Truth finder.' },
    connector: { name: 'The Connector', tagline: 'Bridge builder. Network weaver.' },
    creative: { name: 'The Creative', tagline: 'Idea generator. Pattern breaker.' },
    scholar: { name: 'The Scholar', tagline: 'Deep diver. Knowledge keeper.' },
    strategist: { name: 'The Strategist', tagline: 'Move maker. Future seer.' },
};

const ARCHETYPE_COLORS = {
    architect: '#3b82f6',
    explorer: '#8b5cf6',
    builder: '#10b981',
    analyst: '#f59e0b',
    connector: '#6366f1',
    creative: '#f97316',
    scholar: '#9ca3af',
    strategist: '#ef4444',
};

export default function ShareCard({
    archetype = 'architect',
    mirrorId = '',
    insight = '',
    onClose,
}) {
    const canvasRef = useRef(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [copied, setCopied] = useState(false);

    const info = ARCHETYPE_INFO[archetype] || ARCHETYPE_INFO.architect;
    const color = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS.architect;
    const shareUrl = 'https://activemirror.ai/start';
    const shareText = `I got ${info.name} on Active Mirror. Try the BrainScan and see what you get: ${shareUrl}`;
    const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    useEffect(() => {
        generateCard();
    }, [archetype, mirrorId, insight]);

    const generateCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = 1200;
        const height = 630;
        const dpr = 2;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Background gradient
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, '#08080a');
        bgGradient.addColorStop(1, '#0f0f14');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Accent glow
        const glowGradient = ctx.createRadialGradient(
            width * 0.7, height * 0.3, 0,
            width * 0.7, height * 0.3, 400
        );
        glowGradient.addColorStop(0, color + '30');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Top glyph
        ctx.fillStyle = color;
        ctx.font = '48px serif';
        ctx.textAlign = 'left';
        ctx.fillText('⟡', 60, 90);

        // Active Mirror text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillText('Active Mirror', 120, 82);

        // Archetype name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
        ctx.fillText(info.name, 60, 200);

        // Tagline
        ctx.fillStyle = color;
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.fillText(info.tagline, 60, 250);

        // Mirror ID
        if (mirrorId) {
            ctx.fillStyle = '#71717a';
            ctx.font = '16px monospace';
            ctx.fillText(`MirrorSig: ${mirrorId.slice(0, 16)}...`, 60, 310);
        }

        // Insight (if provided)
        if (insight) {
            ctx.fillStyle = '#a1a1aa';
            ctx.font = 'italic 22px system-ui, -apple-system, sans-serif';

            // Word wrap
            const maxWidth = width - 120;
            const words = insight.split(' ');
            let line = '"';
            let y = 380;

            for (const word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '"') {
                    ctx.fillText(line, 60, y);
                    line = word + ' ';
                    y += 32;
                    if (y > 480) break;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line.trim() + '"', 60, y);
        }

        // Bottom footer
        ctx.fillStyle = '#52525b';
        ctx.font = '18px system-ui, -apple-system, sans-serif';
        ctx.fillText('Discover your cognitive archetype at activemirror.ai', 60, height - 50);

        // Draw constellation (right side)
        drawConstellation(ctx, width - 200, height / 2, 150, archetype, mirrorId);

        setImageUrl(canvas.toDataURL('image/png'));
    };

    const drawConstellation = (ctx, cx, cy, radius, archetype, seed) => {
        const colors = [ARCHETYPE_COLORS[archetype]];
        const seedNum = hashString(seed || Date.now().toString());

        const nodeCount = 10;
        const nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2 + seededRandom(seedNum + i) * 0.3;
            const r = radius * (0.4 + seededRandom(seedNum + i + 100) * 0.6);
            nodes.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r,
                size: 3 + seededRandom(seedNum + i + 200) * 5,
            });
        }

        // Connections
        ctx.strokeStyle = colors[0] + '30';
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (seededRandom(seedNum + i * 100 + j) > 0.5) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Nodes
        nodes.forEach(node => {
            ctx.fillStyle = colors[0];
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center glyph
        ctx.fillStyle = colors[0];
        ctx.font = '40px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟡', cx, cy);
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.download = `mirrorsig-${archetype}.png`;
        link.href = imageUrl;
        link.click();
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (!canNativeShare) return;
        try {
            await navigator.share({
                title: `Active Mirror | ${info.name}`,
                text: shareText,
                url: shareUrl,
            });
        } catch {
            // user cancelled native share
        }
    };

    const handleTwitterShare = () => {
        const text = `I got ${info.name} on Active Mirror. Try the BrainScan and see what you get.`;
        const url = shareUrl;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Preview */}
                <div className="p-4 bg-black/50">
                    <canvas ref={canvasRef} className="hidden" />
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Share Card"
                            className="w-full rounded-lg"
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white mb-3">Share your result</h3>
                    <p className="text-sm text-zinc-400">
                        If you want, send this to someone else and compare what the system notices.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                        >
                            <Download size={18} />
                            Download
                        </button>

                        <button
                            onClick={handleTwitterShare}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] transition-colors"
                        >
                            <Twitter size={18} />
                            Share on X
                        </button>

                        {canNativeShare && (
                            <button
                                onClick={handleNativeShare}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 transition-colors"
                            >
                                <Share2 size={18} />
                                Share
                            </button>
                        )}

                        <button
                            onClick={handleCopyLink}
                            className={`${canNativeShare ? '' : 'col-span-2 '}flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy invite'}
                        </button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center mt-3">
                        Made with Active Mirror ⟡
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Utility functions
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
