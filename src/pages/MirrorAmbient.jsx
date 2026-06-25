/**
 * Mirror Ambient
 *
 * Public reflective chat surface for visitors.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX,
    Paperclip, X, Copy, Check, RefreshCw, Download,
    Shield, Lock, Eye, EyeOff, FileDown
} from 'lucide-react';
import Logo from '../components/Logo';
import ConsentGate from '../components/ConsentGate';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { getState, hasBrainScan, hasIntake } from '../lib/mirror-state';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// ============================================
// MODEL COLORS - Each model has a signature color
// ============================================
const MODEL_COLORS = {
    'Llama 3.3 70B': { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },
    'DeepSeek R1': { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.15)' },
    'Mistral Large': { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.15)' },
    'FLUX Schnell': { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
    'Llama 4 Scout': { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },
    default: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.15)' }
};

const getModelColor = (model) => MODEL_COLORS[model] || MODEL_COLORS.default;

// ============================================
// SAFETY - Crisis detection
// ============================================
const CRISIS_PATTERN = /\b(kill\s*(myself|me)|suicide|end\s*(my|it\s*all)|hurt\s*myself|self.?harm|want\s*to\s*die)\b/i;
const CRISIS_RESOURCES = {
    message: "I noticed you might be going through a difficult time. Please know that help is available.",
    resources: [
        { name: "National Suicide Prevention Lifeline", contact: "988 (US)" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741" },
        { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/" }
    ]
};

// ============================================
// TRUST CONTRACT - Privacy badge
// ============================================
const TrustBadge = ({ isDark }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
            isDark
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
        }`}
    >
        <Lock size={12} />
        <span>Sovereign Session</span>
    </motion.div>
);

// ============================================
// FINGERPRINT REVEAL - Shows at turn 5
// ============================================
const FingerprintReveal = ({ onDismiss, isDark }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
    >
        <motion.div
            className={`max-w-md w-full p-6 rounded-2xl border ${
                isDark
                    ? 'bg-zinc-900 border-white/10'
                    : 'bg-white border-zinc-200 shadow-xl'
            }`}
            onClick={e => e.stopPropagation()}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                    <Eye size={24} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Privacy Check
                </h3>
            </div>

            <p className={`mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                In a typical AI chat, by now they would know:
            </p>

            <div className={`space-y-2 p-4 rounded-xl mb-4 ${
                isDark ? 'bg-white/5' : 'bg-zinc-50'
            }`}>
                <div className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>IP Address:</span> [Your location]
                </div>
                <div className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Browser:</span> {navigator.userAgent.split(' ').slice(-2).join(' ')}
                </div>
                <div className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Interests:</span> [Derived from conversation]
                </div>
                <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Storage:</span> Forever, used for training
                </div>
            </div>

            <div className={`p-4 rounded-xl mb-4 ${
                isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
            }`}>
                <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    <strong>With Active Mirror:</strong> Your data stays sovereign. No tracking, no training on your inputs, session-only retention.
                </p>
            </div>

            <button
                onClick={onDismiss}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    isDark
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
            >
                Got it
            </button>
        </motion.div>
    </motion.div>
);

// ============================================
// FLOATING PARTICLES - Graph-like nodes
// ============================================
const Particle = ({ delay, color }) => {
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 30 + 25;
    const drift = Math.random() * 60 - 30;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${startX}%`,
                background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`
            }}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
                y: '-10vh',
                opacity: [0, 0.6, 0.6, 0],
                x: [0, drift, 0]
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear'
            }}
        />
    );
};

// ============================================
// GLASS MESSAGE BUBBLE
// ============================================
const Message = ({ message, isLast, onRegenerate, accentColor, isDark }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [copied, setCopied] = useState(false);
    const color = getModelColor(message.model);

    const copyText = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
        >
            <div className={`max-w-[85%] relative`}>
                {/* Glass bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                        isSystem
                            ? isDark
                                ? 'bg-amber-500/10 border border-amber-500/20'
                                : 'bg-amber-50 border border-amber-200'
                            : isUser
                                ? isDark
                                    ? 'bg-white/[0.08] border border-white/[0.08] rounded-br-md'
                                    : 'bg-zinc-100 border border-zinc-200 rounded-br-md'
                                : isDark
                                    ? 'bg-white/[0.03] border border-white/[0.05] rounded-bl-md'
                                    : 'bg-white border border-zinc-200 rounded-bl-md shadow-sm'
                    }`}
                    style={!isUser && !isSystem && isDark ? {
                        boxShadow: `0 0 30px ${color.glow}`,
                        borderColor: `${color.primary}15`
                    } : {}}
                >
                    {/* System message header */}
                    {isSystem && (
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                            <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                Support Resources
                            </span>
                        </div>
                    )}

                    {/* User's attached image */}
                    {message.image && (
                        <img
                            src={message.image}
                            alt="Attached"
                            className={`max-w-full max-h-48 rounded-xl mb-3 border ${
                                isDark ? 'border-white/10' : 'border-zinc-200'
                            }`}
                        />
                    )}

                    {/* Generated image */}
                    {message.generatedImage && (
                        <div className="mb-3 relative group/img">
                            <img
                                src={message.generatedImage}
                                alt={message.imagePrompt || "Generated"}
                                className={`max-w-full rounded-xl border ${
                                    isDark ? 'border-white/10' : 'border-zinc-200'
                                }`}
                            />
                            <a
                                href={message.generatedImage}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`absolute bottom-2 right-2 p-2 rounded-lg backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity ${
                                    isDark
                                        ? 'bg-black/60 text-white/60 hover:text-white'
                                        : 'bg-white/80 text-zinc-600 hover:text-zinc-900'
                                }`}
                            >
                                <Download size={14} />
                            </a>
                            {message.imagePrompt && (
                                <p className={`text-[10px] mt-2 italic text-center ${
                                    isDark ? 'text-white/60' : 'text-zinc-400'
                                }`}>
                                    "{message.imagePrompt}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Text content */}
                    <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                        isSystem
                            ? isDark ? 'text-amber-200/90' : 'text-amber-800'
                            : isDark ? 'text-white/90' : 'text-zinc-800'
                    }`}>
                        {message.content}
                        {message.isStreaming && (
                            <motion.span
                                className="inline-block w-0.5 h-4 ml-0.5 rounded-full"
                                style={{ background: color.primary }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        )}
                    </p>

                    {/* Crisis resources */}
                    {message.resources && (
                        <div className={`mt-3 pt-3 border-t space-y-2 ${
                            isDark ? 'border-amber-500/20' : 'border-amber-200'
                        }`}>
                            {message.resources.map((r, i) => (
                                <div key={i} className="text-xs">
                                    <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>{r.name}:</span>
                                    <span className={`ml-2 ${isDark ? 'text-amber-200/70' : 'text-amber-600'}`}>{r.contact}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isUser && !isSystem && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={copyText}
                            className={`p-1.5 rounded-lg transition-all ${
                                isDark
                                    ? 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        {isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className={`p-1.5 rounded-lg transition-all ${
                                    isDark
                                        ? 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                        : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                                <RefreshCw size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const MirrorAmbient = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [hasConsented, setHasConsented] = useState(false);
    const [mirrorState] = useState(() => getState());
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pastedImage, setPastedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [currentModel, setCurrentModel] = useState(null);
    const [turnCount, setTurnCount] = useState(0);
    const [showFingerprint, setShowFingerprint] = useState(false);
    const [fingerprintShown, setFingerprintShown] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    const accentColor = useMemo(() => getModelColor(currentModel), [currentModel]);

    const particles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({ id: i, delay: i * 2 })),
        []
    );

    const starterPrompts = useMemo(() => ([
        {
            label: 'Name the pattern',
            prompt: 'I keep circling the same thought. Name the pattern you notice.',
        },
        {
            label: 'Why this feels heavy',
            prompt: 'This decision feels heavier than it should. What do you notice?',
        },
        {
            label: 'What are you building?',
            prompt: 'What is Active Mirror really building, and why does it matter?',
        },
        {
            label: 'Reflect me back',
            prompt: 'Based on how I asked that, what do you notice about me?',
        },
    ]), []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input after consent
    useEffect(() => {
        if (hasConsented) inputRef.current?.focus();
    }, [hasConsented]);

    // Show fingerprint reveal at turn 5
    useEffect(() => {
        if (turnCount === 5 && !fingerprintShown) {
            setShowFingerprint(true);
            setFingerprintShown(true);
        }
    }, [turnCount, fingerprintShown]);

    // Speech recognition
    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (e) => {
                const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
                setInput(transcript);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = useCallback((text) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }, [voiceEnabled]);

    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result });
                reader.readAsDataURL(file);
                break;
            }
        }
    }, []);

    const exportConversation = () => {
        const content = messages.map(m => {
            const role = m.role === 'user' ? 'You' : 'Mirror';
            return `**${role}:**\n${m.content}\n`;
        }).join('\n---\n\n');

        const blob = new Blob([`# Mirror Conversation\n\nExported: ${new Date().toISOString()}\n\n---\n\n${content}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirror-conversation-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (seedText = null) => {
        const text = (typeof seedText === 'string' ? seedText : input).trim();
        if (!text && !pastedImage) return;
        if (isLoading) return;

        // Crisis check
        if (CRISIS_PATTERN.test(text)) {
            setMessages(prev => [...prev,
                { id: `user-${Date.now()}`, role: 'user', content: text },
                { id: `system-${Date.now()}`, role: 'system', content: CRISIS_RESOURCES.message, resources: CRISIS_RESOURCES.resources }
            ]);
            setInput('');
            return;
        }

        const messageText = text || "What's in this image?";
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            image: pastedImage?.dataUrl || null
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setTurnCount(prev => prev + 1);

        setTimeout(() => inputRef.current?.focus(), 0);

        const assistantId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: '',
            isStreaming: true
        }]);

        try {
            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    image: pastedImage?.dataUrl,
                    mode: 'mirror_only'
                })
            });

            setPastedImage(null);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let modelName = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.status === 'routing' && data.model_info) {
                            modelName = data.model_info.model;
                            setCurrentModel(modelName);

                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) updated[idx] = { ...updated[idx], model: modelName };
                                return updated;
                            });
                        }

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) updated[idx] = { ...updated[idx], content: fullContent };
                                return updated;
                            });
                        }

                        if (data.status === 'image') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = {
                                        ...updated[idx],
                                        generatedImage: data.image_url,
                                        imagePrompt: data.prompt
                                    };
                                }
                                return updated;
                            });
                        }

                        if (data.status === 'done') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = {
                                        ...updated[idx],
                                        content: fullContent || data.response || '',
                                        isStreaming: false,
                                        model: data.model_used || modelName
                                    };
                                }
                                return updated;
                            });
                        }
                    } catch {}
                }
            }

            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1 && updated[idx].isStreaming) {
                    updated[idx] = { ...updated[idx], isStreaming: false };
                }
                return updated;
            });

            if (voiceEnabled && fullContent) speak(fullContent);

        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setInput('');
            setPastedImage(null);
        }
    };

    const regenerate = useCallback(() => {
        if (messages.length < 2 || isLoading) return;
        let lastUserIdx = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') { lastUserIdx = i; break; }
        }
        if (lastUserIdx === -1) return;
        setMessages(messages.slice(0, lastUserIdx + 1));
        setInput(messages[lastUserIdx].content);
    }, [messages, isLoading]);

    // Consent gate
    if (!hasConsented) {
        return <ConsentGate onConsent={() => setHasConsented(true)} />;
    }

    return (
        <div
            className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
                isDark ? 'bg-[#08080a]' : 'bg-[#fafafa]'
            }`}
            style={{ height: '100dvh' }}
        >
            {/* Floating particles (dark mode only) */}
            {isDark && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map(p => (
                        <Particle key={p.id} delay={p.delay} color={accentColor.primary} />
                    ))}
                </div>
            )}

            {/* Ambient gradient */}
            {isDark && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        background: `radial-gradient(ellipse at 50% 0%, ${accentColor.glow}, transparent 60%)`
                    }}
                    transition={{ duration: 1 }}
                />
            )}

            {/* Fingerprint reveal modal */}
            <AnimatePresence>
                {showFingerprint && (
                    <FingerprintReveal onDismiss={() => setShowFingerprint(false)} isDark={isDark} />
                )}
            </AnimatePresence>

            {/* Header */}
            <header className={`relative z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm ${
                isDark
                    ? 'border-white/[0.04] bg-[#08080a]/80'
                    : 'border-zinc-200 bg-white/80'
            }`}>
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className={`p-2 -ml-2 transition-colors ${
                            isDark ? 'text-white/60 hover:text-white/60' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                        <ArrowLeft size={18} />
                    </a>
                    <div className="flex items-center gap-2">
                        <Logo size={24} theme="amber" />
                        <span className={`font-medium text-sm ${isDark ? 'text-white/80' : 'text-zinc-800'}`}>
                            Mirror
                        </span>
                        {mirrorState.blueprint && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}>
                                {mirrorState.blueprint.modeLabel || mirrorState.blueprint.mode}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TrustBadge isDark={isDark} />
                    <ThemeToggle />
                    {messages.length > 0 && (
                        <button
                            onClick={exportConversation}
                            className={`p-2 rounded-lg transition-colors ${
                                isDark
                                    ? 'text-white/60 hover:text-white/60 hover:bg-white/5'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="Export conversation"
                        >
                            <FileDown size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="h-full flex flex-col items-center justify-center text-center pt-20"
                        >
                            <motion.div
                                animate={isDark ? {
                                    boxShadow: [`0 0 40px ${accentColor.glow}`, `0 0 60px ${accentColor.glow}`, `0 0 40px ${accentColor.glow}`]
                                } : {}}
                                transition={{ duration: 3, repeat: Infinity }}
                                className={`mb-8 p-6 rounded-full border ${
                                    isDark
                                        ? 'bg-white/[0.02] border-white/[0.05]'
                                        : 'bg-white border-zinc-200 shadow-sm'
                                }`}
                            >
                                <Logo size={48} theme="amber" />
                            </motion.div>
                            <h1 className={`text-xl font-light tracking-wide mb-3 ${
                                isDark ? 'text-white/80' : 'text-zinc-800'
                            }`}>
                                {mirrorState.archetypeName
                                    ? `${mirrorState.archetypeName}'s Mirror ⟡`
                                    : 'Active Mirror ⟡'}
                            </h1>
                            <p className={`text-sm max-w-sm leading-relaxed ${
                                isDark ? 'text-white/60' : 'text-zinc-500'
                            }`}>
                                {mirrorState.blueprint
                                    ? `${mirrorState.blueprint.modeLabel || 'Sovereign'} mode is live. Start anywhere and the interesting layer usually shows itself.`
                                    : mirrorState.archetype
                                        ? `Welcome back. Start with what feels charged, unresolved, or hard to name.`
                                        : 'A reflective intelligence surface for people who want clarity, not noise.'}
                            </p>
                            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                                {starterPrompts.map((starter) => (
                                    <button
                                        key={starter.label}
                                        onClick={() => handleSubmit(starter.prompt)}
                                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                                            isDark
                                                ? 'border-white/[0.07] bg-white/[0.03] text-white/80 hover:border-white/15 hover:bg-white/[0.05]'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">{starter.label}</div>
                                        <div className="mt-2 text-sm leading-relaxed">{starter.prompt}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <Message
                                    key={msg.id}
                                    message={msg}
                                    isLast={idx === messages.length - 1 && msg.role === 'assistant'}
                                    onRegenerate={regenerate}
                                    accentColor={accentColor}
                                    isDark={isDark}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </main>

            {/* Input */}
            <div className={`relative z-20 border-t p-4 pb-20 backdrop-blur-sm ${
                isDark
                    ? 'border-white/[0.04] bg-[#08080a]/80'
                    : 'border-zinc-200 bg-white/80'
            }`}>
                <div className="max-w-2xl mx-auto">
                    {/* Image preview */}
                    <AnimatePresence>
                        {pastedImage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-3"
                            >
                                <div className="relative inline-block">
                                    <img
                                        src={pastedImage.dataUrl}
                                        alt="Attached"
                                        className={`h-16 w-16 object-cover rounded-xl border ${
                                            isDark ? 'border-white/10' : 'border-zinc-200'
                                        }`}
                                    />
                                    <button
                                        onClick={() => setPastedImage(null)}
                                        className={`absolute -top-1.5 -right-1.5 p-1 rounded-full border ${
                                            isDark
                                                ? 'bg-black border-white/10 text-white/60 hover:text-white'
                                                : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600'
                                        }`}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="file"
                        id="file-input"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file?.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result });
                                reader.readAsDataURL(file);
                            }
                            e.target.value = '';
                        }}
                    />

                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                placeholder="Say what is real..."
                                disabled={isLoading}
                                rows={1}
                                className={`w-full px-4 py-3 rounded-2xl text-[15px] resize-none focus:outline-none transition-all disabled:opacity-50 ${
                                    isDark
                                        ? 'bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:border-white/10'
                                        : 'bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 shadow-sm'
                                }`}
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        <motion.button
                            onClick={handleSubmit}
                            disabled={(!input.trim() && !pastedImage) || isLoading}
                            className={`p-3 rounded-xl disabled:opacity-20 transition-all ${
                                isDark ? 'text-white/60' : 'text-zinc-600'
                            }`}
                            style={{
                                background: (input.trim() || pastedImage) && !isLoading
                                    ? isDark ? `${accentColor.primary}25` : `${accentColor.primary}15`
                                    : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? (
                                <motion.div
                                    className="w-[18px] h-[18px] border-2 rounded-full"
                                    style={{ borderColor: `${accentColor.primary}30`, borderTopColor: accentColor.primary }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <Send size={18} />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default MirrorAmbient;
