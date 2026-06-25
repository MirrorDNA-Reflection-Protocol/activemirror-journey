/**
 * ⟡ MIRROR AMBIENT — Ultimate Personal Assistant
 *
 * Features:
 * - Voice input (Web Speech API)
 * - Voice output (Text-to-Speech)
 * - Persistent memory (localStorage)
 * - Quick actions
 * - Sentiment-aware atmosphere
 * - Client-side safety layer + MirrorGate backend
 *
 * Models: Groq (Llama 3.3 70B) via MirrorGate proxy
 * Safety: EPISTEMIC_JUDGE + client-side filters
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Sparkles, RotateCcw, Trash2,
    Mic, MicOff, Volume2, VolumeX, Settings, X,
    Zap, BookOpen, Languages, Code, Lightbulb, Shield, Database, FileDown,
    ChevronDown, Cloud, Cpu, Monitor, Brain, Trash, Info, Paperclip, FileText, CheckCircle2, Share2, Download, Image as ImageIcon,
    Copy, Check, RefreshCw, AlertCircle, Sparkle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import ConsentGate from '../components/ConsentGate';
import HeartbeatGlyph from '../components/HeartbeatGlyph';
import Logo from '../components/Logo';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// MODEL OPTIONS - kept for API routing
// ============================================
const MODEL_OPTIONS = [
    { id: 'groq', name: 'Llama 3.3 70B', provider: 'Groq', icon: '⚡' },
    { id: 'browser', name: 'Phi-3', provider: 'WebLLM', icon: '🧠' },
    { id: 'sovereign', name: 'Qwen 2.5 7B', provider: 'Mac Mini M4', icon: '🔒' }
];

// ============================================
// INFERENCE TIERS (each tier = one model, simpler UX)
// ============================================
const INFERENCE_TIERS = [
    { id: 'hosted', name: 'Hosted', model: 'Intelligent Router', icon: Cloud, desc: 'Optimizes model for your query', privacy: 'Proactively selects best brain (Groq, DeepSeek, or Mistral).' },
    { id: 'browser', name: 'Browser', model: 'Phi-3', icon: Cpu, desc: 'Runs in your browser', privacy: '100% private. Downloads ~2GB model once.' },
    { id: 'sovereign', name: 'Mac Mini M4', model: 'Qwen 2.5 7B', icon: Monitor, desc: 'Our local hardware', privacy: 'Try local AI. See what sovereign feels like.' }
];

// ============================================
// REFLECTIVE PROMPTS (occasionally inject introspection)
// ============================================
const REFLECTIVE_PROMPTS = [
    "Before I answer — what's driving that question?",
    "Interesting. What would change if this were true?",
    "I could answer directly, but I'm curious — what do you think?",
    "Let me reflect that back: you're really asking about...",
    "That's a surface question. What's underneath it?"
];

// ============================================
// SAFETY: Client-side content filters
// ============================================
const SAFETY_PATTERNS = {
    // Self-harm / crisis
    crisis: /\b(kill\s*(myself|me)|suicide|end\s*(my|it\s*all)|hurt\s*myself|self.?harm|want\s*to\s*die)\b/i,
    // Violence toward others
    violence: /\b(kill|murder|attack|bomb|shoot|stab)\s+(someone|people|them|him|her|you)\b/i,
    // Illegal activities
    illegal: /\b(make\s*(a\s*)?(bomb|weapon|drug)|hack\s*(into|someone)|steal\s*(from|identity))\b/i,
    // Child safety
    csam: /\b(child|minor|kid|underage).{0,20}(porn|nude|naked|sexual)\b/i,
};

const CRISIS_RESOURCES = {
    message: "I noticed you might be going through a difficult time. Please know that help is available.",
    resources: [
        { name: "National Suicide Prevention Lifeline", contact: "988 (US)" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741" },
        { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/" }
    ]
};

const checkSafety = (text) => {
    const lower = text.toLowerCase();

    // Check for crisis language first (compassionate response)
    if (SAFETY_PATTERNS.crisis.test(lower)) {
        return { safe: false, type: 'crisis', showResources: true };
    }

    // Check for harmful content (block)
    if (SAFETY_PATTERNS.violence.test(lower)) {
        return { safe: false, type: 'violence', message: "I can't help with requests that could harm others." };
    }
    if (SAFETY_PATTERNS.illegal.test(lower)) {
        return { safe: false, type: 'illegal', message: "I can't assist with illegal activities." };
    }
    if (SAFETY_PATTERNS.csam.test(lower)) {
        return { safe: false, type: 'csam', message: "I cannot engage with this type of content." };
    }

    return { safe: true };
};

// ============================================
// MEMORY: Persistent user preferences
// ============================================
const MEMORY_KEY = 'mirror_ambient_memory';
const MEMORY_CONSENT_KEY = 'mirror_memory_consent';

const loadMemory = () => {
    try {
        const consent = localStorage.getItem(MEMORY_CONSENT_KEY);
        if (consent !== 'true') return { userName: null, preferences: {}, facts: [], sessionCount: 0, consentGiven: false };
        const saved = localStorage.getItem(MEMORY_KEY);
        const mem = saved ? JSON.parse(saved) : {
            userName: null,
            preferences: { voiceEnabled: false, voiceSpeed: 1 },
            facts: [],
            sessionCount: 0,
            lastVisit: null,
            firstSeen: new Date().toISOString().slice(0, 10)
        };
        // Auto-expire after 90 days
        if (mem.lastVisit) {
            const daysSince = (Date.now() - new Date(mem.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > 90) {
                localStorage.removeItem(MEMORY_KEY);
                localStorage.removeItem(MEMORY_CONSENT_KEY);
                return { userName: null, preferences: {}, facts: [], sessionCount: 0, consentGiven: false };
            }
        }
        return { ...mem, consentGiven: true };
    } catch {
        return { userName: null, preferences: {}, facts: [], sessionCount: 0, consentGiven: false };
    }
};

const saveMemory = (memory) => {
    try {
        if (!localStorage.getItem(MEMORY_CONSENT_KEY)) return; // Only save if consent given
        localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch (e) {
        console.warn('Could not save memory:', e);
    }
};

const giveMemoryConsent = () => {
    localStorage.setItem(MEMORY_CONSENT_KEY, 'true');
};

const forgetMe = () => {
    localStorage.removeItem(MEMORY_KEY);
    localStorage.removeItem(MEMORY_CONSENT_KEY);
};

// Extract facts from conversation
const extractFacts = (userMessage, assistantResponse) => {
    const facts = [];
    const patterns = [
        { regex: /my name is (\w+)/i, type: 'name', extract: 1 },
        { regex: /i(?:'m| am) (?:a |an )?(\w+(?:\s+\w+)?)/i, type: 'identity', extract: 1 },
        { regex: /i work (?:as |at |in )(.+?)(?:\.|,|$)/i, type: 'work', extract: 1 },
        { regex: /i live in (.+?)(?:\.|,|$)/i, type: 'location', extract: 1 },
        { regex: /i(?:'m| am) interested in (.+?)(?:\.|,|$)/i, type: 'interest', extract: 1 },
    ];

    for (const { regex, type, extract } of patterns) {
        const match = userMessage.match(regex);
        if (match) {
            facts.push({ type, value: match[extract], timestamp: Date.now() });
        }
    }

    return facts;
};

// ============================================
// ATMOSPHERE: Sentiment and time-aware
// ============================================
const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    const emotions = {
        joy: ['happy', 'excited', 'love', 'wonderful', 'amazing', 'great', 'awesome', 'fantastic', 'glad', 'thrilled'],
        sadness: ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 'miss', 'lost', 'grief', 'down'],
        anger: ['angry', 'furious', 'frustrated', 'hate', 'annoyed', 'mad', 'irritated', 'pissed'],
        fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'stressed'],
        hope: ['hope', 'dream', 'wish', 'future', 'maybe', 'possible', 'believe', 'optimistic'],
        calm: ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'chill'],
        curiosity: ['wonder', 'curious', 'what if', 'why', 'how', 'interesting', 'question']
    };

    let detected = 'neutral';
    let maxScore = 0;
    for (const [emotion, words] of Object.entries(emotions)) {
        const score = words.filter(w => lower.includes(w)).length;
        if (score > maxScore) { maxScore = score; detected = emotion; }
    }
    return detected;
};

const emotionAtmospheres = {
    joy: { primary: '#fbbf24', secondary: '#f97316', glow: 'rgba(251, 191, 36, 0.25)' },
    sadness: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.25)' },
    anger: { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.25)' },
    fear: { primary: '#8b5cf6', secondary: '#6366f1', glow: 'rgba(139, 92, 246, 0.25)' },
    hope: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16, 185, 129, 0.25)' },
    calm: { primary: '#06b6d4', secondary: '#8b5cf6', glow: 'rgba(6, 182, 212, 0.25)' },
    curiosity: { primary: '#f59e0b', secondary: '#ec4899', glow: 'rgba(245, 158, 11, 0.25)' },
    neutral: { primary: '#8b5cf6', secondary: '#06b6d4', glow: 'rgba(139, 92, 246, 0.25)' },
    // Astrocyte Resonance
    focus: { primary: '#22d3ee', secondary: '#3b82f6', glow: 'rgba(34, 211, 238, 0.25)' }, // Cyan/Blue
    flow: { primary: '#a855f7', secondary: '#ec4899', glow: 'rgba(168, 85, 247, 0.25)' },  // Purple/Pink
    relief: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16, 185, 129, 0.25)' }, // Green/Teal
    surge: { primary: '#f59e0b', secondary: '#f97316', glow: 'rgba(245, 158, 11, 0.25)' }   // Amber/Orange
};

const getTimeAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return { phase: 'dawn' };
    if (hour >= 8 && hour < 12) return { phase: 'morning' };
    if (hour >= 12 && hour < 17) return { phase: 'afternoon' };
    if (hour >= 17 && hour < 20) return { phase: 'evening' };
    if (hour >= 20 && hour < 23) return { phase: 'night' };
    return { phase: 'midnight' };
};

// Haptic feedback
const haptic = (pattern = 'light') => {
    if (!navigator.vibrate) return;
    const patterns = { light: [10], medium: [20], success: [10, 50, 10, 50, 30], error: [100, 50, 100] };
    navigator.vibrate(patterns[pattern] || patterns.light);
};

// ============================================
// COMPONENTS
// ============================================

// Floating particle
const Particle = ({ delay, atmosphere }) => {
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 25 + 20;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size, left: `${startX}%`,
                background: atmosphere.primary,
                boxShadow: `0 0 ${size * 2}px ${atmosphere.primary}40`
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-100vh', opacity: [0, 0.5, 0.5, 0], x: [0, Math.random() * 40 - 20, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
        />
    );
};

// Shadow Thoughts (Ghost Reasoning)
const ShadowThoughts = ({ thought, atmosphere }) => {
    if (!thought) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-24 left-0 right-0 mx-auto z-40 max-w-sm w-[90%] px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl pointer-events-none text-center"
        >
            <div className="flex items-center justify-center gap-2 mb-1.5">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-1.5 h-1.5 rounded-full border border-violet-400 border-t-transparent"
                />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/30">Shadow Intent</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light italic">
                {thought}
            </p>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/[0.02]" />
        </motion.div>
    );
};

// File Upload Zone for Zero-Vault RAG
const FileUploadZone = ({ onUpload, onImageUpload, currentDoc }) => {
    const handleFile = (file) => {
        if (!file) return;
        // Route images to image handler, documents to doc handler
        if (file.type.startsWith('image/')) {
            if (onImageUpload) {
                const reader = new FileReader();
                reader.onload = (e) => onImageUpload({ dataUrl: e.target.result, file });
                reader.readAsDataURL(file);
            }
        } else {
            onUpload(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mb-4 px-4">
            {!currentDoc ? (
                <div
                    className="group relative border-2 border-dashed border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all cursor-pointer bg-white/[0.02]"
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        hidden
                        accept=".pdf,.txt,.md,.doc,.docx,image/*"
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <Paperclip size={20} className="text-white/20 group-hover:text-white/40 transition-colors" />
                        <p className="text-xs text-white/30 font-medium uppercase tracking-widest">
                            Upload image or document
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-white/80 font-medium max-w-[150px] truncate">{currentDoc.name}</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-tighter">Sovereign Context Active</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onUpload(null)}
                        className="p-1 px-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/40 transition-all text-[10px] uppercase font-bold"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};
// Reflection Print Export Logic
const captureReflection = async (elementId, messageId) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        haptic('medium');
        const canvas = await html2canvas(element, {
            backgroundColor: '#000000',
            scale: 2,
            logging: false,
            useCORS: true
        });

        const link = document.createElement('a');
        const slug = messageId ? messageId.slice(0, 8) : Math.random().toString(36).slice(2, 10);
        link.download = `mirror-reflection-${slug}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        haptic('success');
    } catch (err) {
        console.error('Failed to capture reflection print:', err);
    }
};

const MessageBubble = ({ message, atmosphere, onSpeak, onRegenerate, voiceEnabled, isLast }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            haptic('light');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <motion.div
            id={`msg-${message.id}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 group`}
        >
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${isSystem
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : isUser
                        ? 'bg-white/10 border border-white/10'
                        : 'bg-white/5 border border-white/5'
                    }`}
                style={isUser ? { borderColor: `${atmosphere.primary}30`, boxShadow: `0 0 20px ${atmosphere.primary}10` } : {}}
            >
                {!isUser && !isSystem && (
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Logo size={18} theme="amber" className="opacity-80" />
                            <span className="text-white/40 text-xs">Mirror</span>
                            {message.model && (
                                <span className="text-white/20 text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                    via {message.model}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {isSystem && (
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-amber-400" />
                        <span className="text-amber-400 text-xs">Safety Notice</span>
                    </div>
                )}
                {/* Image attachment (user uploaded) */}
                {message.image && (
                    <div className="mb-2">
                        <img
                            src={message.image}
                            alt="Attached"
                            className="max-w-full max-h-48 rounded-lg object-contain"
                        />
                    </div>
                )}
                {/* Generated image (AI created) */}
                {message.generatedImage && (
                    <div className="mb-3">
                        <div className="relative group">
                            <img
                                src={message.generatedImage}
                                alt={message.imagePrompt || "Generated image"}
                                className="max-w-full rounded-xl border border-white/10"
                            />
                            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={message.generatedImage}
                                    download={`mirror-gen-${Date.now()}.png`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-black/60 text-white/70 hover:text-white transition-colors"
                                    title="Download"
                                >
                                    <Download size={14} />
                                </a>
                            </div>
                        </div>
                        {message.imagePrompt && (
                            <p className="text-[10px] text-white/30 mt-1 italic">"{message.imagePrompt}"</p>
                        )}
                    </div>
                )}
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isSystem ? 'text-amber-200/90' : isUser ? 'text-white' : 'text-white/85'
                    }`}>
                    {message.content}
                    {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse" />
                    )}
                </p>
                {message.resources && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                        {message.resources.map((r, i) => (
                            <div key={i} className="text-xs">
                                <span className="text-amber-300">{r.name}:</span>
                                <span className="text-amber-200/70 ml-2">{r.contact}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions (Only for assistant messages) */}
                {!isUser && !isSystem && !message.isStreaming && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Copy */}
                        <button
                            onClick={copyToClipboard}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
                            title="Copy"
                        >
                            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        {/* Listen */}
                        <button
                            onClick={() => onSpeak(message.content)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
                            title="Listen"
                        >
                            <Volume2 size={12} />
                        </button>
                        {/* Regenerate (only on last message) */}
                        {isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
                                title="Regenerate"
                            >
                                <RefreshCw size={12} />
                            </button>
                        )}
                        {/* Print */}
                        <button
                            onClick={() => captureReflection(`msg-${message.id}`, message.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
                            title="Save as image"
                        >
                            <ImageIcon size={12} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Quick action button
const QuickAction = ({ icon: Icon, label, onClick, atmosphere }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs"
        style={{ borderColor: `${atmosphere.primary}20` }}
    >
        <Icon size={14} />
        <span>{label}</span>
    </button>
);

// Settings modal
const SettingsModal = ({ isOpen, onClose, memory, setMemory, voiceEnabled, setVoiceEnabled, selectedModel, setSelectedModel }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Settings</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Model selection */}
                    <div>
                        <label className="text-white/50 text-xs block mb-2">AI Model</label>
                        <div className="space-y-2">
                            {MODEL_OPTIONS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        const updated = { ...memory, preferences: { ...memory.preferences, model: model.id } };
                                        setMemory(updated);
                                        saveMemory(updated);
                                    }}
                                    className={`w-full p-3 rounded-xl text-left transition-all ${selectedModel === model.id
                                        ? 'bg-violet-500/20 border-violet-500/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        } border`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{model.icon}</span>
                                            <div>
                                                <div className="text-white text-sm font-medium">{model.name}</div>
                                                <div className="text-white/40 text-xs">{model.provider}</div>
                                            </div>
                                        </div>
                                        {model.badge && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${model.badge === 'Recommended' ? 'bg-green-500/20 text-green-400' :
                                                model.badge === 'Smartest' ? 'bg-blue-500/20 text-blue-400' :
                                                    model.badge === 'Premium' ? 'bg-amber-500/20 text-amber-400' :
                                                        model.badge === 'Private' ? 'bg-violet-500/20 text-violet-400' :
                                                            'bg-white/10 text-white/60'
                                                }`}>
                                                {model.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/30 text-xs mt-1 ml-7">{model.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice toggle */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-white/70 text-sm">Voice Output</span>
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-violet-500' : 'bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-white/50 text-xs block mb-1">Your Name</label>
                        <input
                            type="text"
                            value={memory.userName || ''}
                            onChange={(e) => {
                                const updated = { ...memory, userName: e.target.value || null };
                                setMemory(updated);
                                saveMemory(updated);
                            }}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Memory info */}
                    <div className="pt-3 border-t border-white/10">
                        <p className="text-white/40 text-xs mb-2">Memory</p>
                        <p className="text-white/60 text-xs">
                            Sessions: {memory.sessionCount} · Facts remembered: {memory.facts?.length || 0}
                        </p>
                        <button
                            onClick={() => {
                                const cleared = { userName: null, preferences: { model: 'groq' }, facts: [], sessionCount: 0 };
                                setMemory(cleared);
                                saveMemory(cleared);
                            }}
                            className="mt-2 text-red-400 text-xs hover:text-red-300"
                        >
                            Clear all memory
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const MirrorAmbient = () => {
    const [hasConsented, setHasConsented] = useState(false);
    const [routingInfo, setRoutingInfo] = useState(null);
    const [atmosphereKey, setAtmosphereKey] = useState('calm');
    const [timeAtmosphere] = useState(getTimeAtmosphere);
    const [baseAtmosphere, setBaseAtmosphere] = useState(emotionAtmospheres.calm);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [memory, setMemory] = useState(loadMemory);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = loadMemory();
        return saved.preferences?.model || 'groq';
    });
    const [includeRagContext, setIncludeRagContext] = useState(false);
    const [inferenceTier, setInferenceTier] = useState('hosted');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showTierDropdown, setShowTierDropdown] = useState(false);
    const [showMemoryConsent, setShowMemoryConsent] = useState(false);
    const [ollamaAvailable, setOllamaAvailable] = useState(false);
    const [shadowThoughts, setShadowThoughts] = useState(null);
    const [localDoc, setLocalDoc] = useState(null);
    const [pastedImage, setPastedImage] = useState(null); // { dataUrl, file }
    const [isDragging, setIsDragging] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Get current model info
    const currentModel = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];
    const recognitionRef = useRef(null);

    // Generate particles
    const particles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({ id: i, delay: i * 1.2 }))
        , []);

    // Blend atmospheres
    const atmosphere = useMemo(() => ({
        ...baseAtmosphere,
        phase: timeAtmosphere.phase
    }), [baseAtmosphere, timeAtmosphere]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    // Update session count on mount
    useEffect(() => {
        const updated = {
            ...memory,
            sessionCount: (memory.sessionCount || 0) + 1,
            lastVisit: new Date().toISOString()
        };
        setMemory(updated);
        saveMemory(updated);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Check for Ollama availability
    useEffect(() => {
        const checkOllama = async () => {
            try {
                const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
                setOllamaAvailable(res.ok);
            } catch { setOllamaAvailable(false); }
        };
        checkOllama();
    }, []);

    // Show memory consent on first visit if not decided
    useEffect(() => {
        const consent = localStorage.getItem(MEMORY_CONSENT_KEY);
        if (consent === null && messages.length === 0) {
            // Show consent modal after a short delay for first-time visitors
            const timer = setTimeout(() => setShowMemoryConsent(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Sentiment analysis on input
    useEffect(() => {
        if (input.length > 10) {
            const emotion = analyzeSentiment(input);
            setBaseAtmosphere(emotionAtmospheres[emotion]);
        }
    }, [input]);

    // Voice input toggle
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            haptic('medium');
        }
    };

    // Zero-Vault RAG Handler
    const handleFileUpload = async (file) => {
        if (!file) {
            setLocalDoc(null);
            return;
        }

        setShadowThoughts(`Ingesting ${file.name}...`);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                setLocalDoc({ name: file.name, content: text });
                setShadowThoughts(`${file.name} synchronized to browser session.`);
                setTimeout(() => setShadowThoughts(null), 3000);
            };
            reader.readAsText(file);
        } catch (err) {
            setError("Failed to parse document for sovereign reflection.");
        }
    };
    // Handle image paste
    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setPastedImage({
                            dataUrl: event.target.result,
                            file: file
                        });
                        haptic('medium');
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    }, []);

    // Clear pasted image
    const clearPastedImage = useCallback(() => {
        setPastedImage(null);
    }, []);

    // Drag and drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPastedImage({ dataUrl: ev.target.result, file });
                haptic('medium');
            };
            reader.readAsDataURL(file);
        } else {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);

    const speak = useCallback((text) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = memory.preferences?.voiceSpeed || 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [voiceEnabled, memory.preferences?.voiceSpeed]);

    // Build context from memory
    const buildContext = () => {
        let context = '';
        if (memory.userName) {
            context += `The user's name is ${memory.userName}. `;
        }
        if (memory.facts?.length > 0) {
            const recentFacts = memory.facts.slice(-5);
            context += `Known facts about the user: ${recentFacts.map(f => `${f.type}: ${f.value}`).join(', ')}. `;
        }
        return context;
    };

    // Submit message
    const handleSubmit = async () => {
        const text = input.trim();
        if ((!text && !pastedImage) || isLoading) return;

        // Default message for image-only submissions
        const messageText = text || "What's in this image?";

        haptic('medium');
        setError(null);

        // CLIENT-SIDE SAFETY CHECK
        const safetyCheck = checkSafety(text);
        if (!safetyCheck.safe) {
            if (safetyCheck.type === 'crisis') {
                // Show compassionate response with resources
                setMessages(prev => [...prev,
                { role: 'user', content: text },
                {
                    role: 'system',
                    content: CRISIS_RESOURCES.message,
                    resources: CRISIS_RESOURCES.resources
                }
                ]);
                setInput('');
                haptic('medium');
                return;
            } else {
                // Block harmful content
                setMessages(prev => [...prev,
                { role: 'user', content: text },
                { role: 'system', content: safetyCheck.message }
                ]);
                setInput('');
                haptic('error');
                return;
            }
        }

        // Detect emotion
        const emotion = analyzeSentiment(text);
        setBaseAtmosphere(emotionAtmospheres[emotion]);

        // Add user message (with image if present)
        const userMessage = {
            role: 'user',
            content: messageText,
            image: pastedImage?.dataUrl || null
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setShadowThoughts("Analyzing intent & classifying resonance...");

        // Add placeholder
        setMessages([...newMessages, {
            id: `mirror-${Date.now()}`,
            role: 'assistant',
            content: '',
            isStreaming: true
        }]);

        try {
            // Build message context with memory
            const contextPrefix = buildContext();
            const messagesForAPI = newMessages.slice(-10).map(m => ({
                role: m.role === 'system' ? 'user' : m.role, // Convert system to user for API
                content: m.content
            }));

            // Prepend context to first message if we have memory
            if (contextPrefix && messagesForAPI.length > 0) {
                messagesForAPI[0] = {
                    ...messagesForAPI[0],
                    content: `[Context: ${contextPrefix}]\n\n${messagesForAPI[0].content}`
                };
            }

            // Fetch RAG context if enabled
            let ragContext = null;
            if (includeRagContext) {
                try {
                    const ragRes = await fetch('http://localhost:8081/chat/context', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: text, k: 3 })
                    });
                    if (ragRes.ok) {
                        const ragData = await ragRes.json();
                        ragContext = ragData.context;
                    }
                } catch (e) {
                    console.warn('RAG fetch failed:', e);
                }
            }

            // Sovereign Context Check (Local Doc)
            if (localDoc) {
                setShadowThoughts(`Comparing query against session document...`);
                // Simple substring/relevance mockup for first pass
                ragContext = `[Local Document Context from ${localDoc.name}: ${localDoc.content.slice(0, 500)}...]`;
            }

            // Prepare request body
            const requestBody = {
                message: messageText,
                history: messagesForAPI,
                tier: currentModel.tier,
                model: selectedModel,
                rag_context: ragContext
            };

            // Add image if present
            if (pastedImage) {
                requestBody.image = pastedImage.dataUrl;
                setShadowThoughts("Analyzing image with vision model...");
            }

            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            // Clear image after sending
            if (pastedImage) {
                setPastedImage(null);
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        // Handle model routing info
                        if (data.status === 'routing' && data.model_info) {
                            setRoutingInfo(data.model_info);
                            setShadowThoughts(`Routing to ${data.model_info.model} · ${data.model_info.atmosphere} resonance`);

                            // Let the shadow linger for a moment then fade
                            setTimeout(() => setShadowThoughts(null), 3000);

                            if (data.model_info.atmosphere && emotionAtmospheres[data.model_info.atmosphere]) {
                                setAtmosphereKey(data.model_info.atmosphere);
                                setBaseAtmosphere(emotionAtmospheres[data.model_info.atmosphere]);
                            }
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    id: `mirror-${Date.now()}`,
                                    role: 'assistant',
                                    content: '',
                                    isStreaming: true,
                                    model: data.model_info.model,
                                    provider: data.model_info.provider,
                                    reasoning: data.model_info.reasoning,
                                    atmosphere: data.model_info.atmosphere
                                };
                                return updated;
                            });
                        }

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    role: 'assistant',
                                    content: fullContent,
                                    isStreaming: true
                                };
                                return updated;
                            });
                        } else if (data.status === 'image') {
                            // Generated image received
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    role: 'assistant',
                                    content: fullContent,
                                    generatedImage: data.image_url,
                                    imagePrompt: data.prompt,
                                    isStreaming: true
                                };
                                return updated;
                            });
                        } else if (data.status === 'done') {
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    role: 'assistant',
                                    content: fullContent || data.response || '',
                                    isStreaming: false,
                                    model_used: data.model_used
                                };
                                return updated;
                            });
                        }
                    } catch (e) {
                        if (line.trim() && !line.includes('{')) {
                            fullContent += line;
                        }
                    }
                }
            }

            // Finalize
            setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.isStreaming) {
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: fullContent || 'I received your message.',
                        isStreaming: false
                    };
                }
                return updated;
            });

            // Extract and save facts from conversation
            const newFacts = extractFacts(text, fullContent);
            if (newFacts.length > 0) {
                const updatedMemory = {
                    ...memory,
                    facts: [...(memory.facts || []), ...newFacts].slice(-20) // Keep last 20 facts
                };
                // Check for name
                const nameFact = newFacts.find(f => f.type === 'name');
                if (nameFact) {
                    updatedMemory.userName = nameFact.value;
                }
                setMemory(updatedMemory);
                saveMemory(updatedMemory);
            }

            // Speak response if enabled
            if (voiceEnabled && fullContent) {
                speak(fullContent);
            }

            haptic('success');
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            setMessages(prev => prev.filter(m => !m.isStreaming));
            haptic('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            setInput('');
            clearPastedImage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        window.speechSynthesis?.cancel();
        haptic('light');
    };

    // Regenerate last response - removes last assistant message and re-sends
    const regenerateLastResponse = useCallback(async () => {
        if (messages.length < 2 || isLoading) return;

        // Find the last user message index
        let lastUserIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                lastUserIndex = i;
                break;
            }
        }
        if (lastUserIndex === -1) return;

        const lastUserMessage = messages[lastUserIndex];
        // Keep messages up to and including the user message, remove assistant response
        const newMessages = messages.slice(0, lastUserIndex + 1);
        setMessages(newMessages);

        // Set input to last user message and trigger submit
        setInput(lastUserMessage.content);
        haptic('medium');
    }, [messages, isLoading]);

    // Quick actions
    const quickActions = [
        { icon: Lightbulb, label: 'Brainstorm', prompt: 'Help me brainstorm ideas for ' },
        { icon: BookOpen, label: 'Explain', prompt: 'Explain this concept simply: ' },
        { icon: Languages, label: 'Translate', prompt: 'Translate this to Spanish: ' },
        { icon: Code, label: 'Code', prompt: 'Write code to ' },
        { icon: Zap, label: 'Summarize', prompt: 'Summarize this: ' },
    ];

    const handleQuickAction = (prompt) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    // Greeting based on memory
    const getGreeting = () => {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        if (memory.userName) {
            return `${timeGreeting}, ${memory.userName}!`;
        }
        return `${timeGreeting}!`;
    };

    if (!hasConsented) {
        return <ConsentGate onConsent={() => setHasConsented(true)} />;
    }

    return (
        <div
            className="fixed inset-0 bg-black flex flex-col"
            style={{ height: '100dvh' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-white/20"
                        >
                            <ImageIcon size={48} className="text-white/40" />
                            <p className="text-white/60 text-lg">Drop image or document</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Strategy Panel Overlay */}
            <AnimatePresence>
                {routingInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 cursor-pointer group hover:bg-white/10 transition-colors"
                        onClick={() => setRoutingInfo(null)} // Toggle off in this demo or expand
                    >
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-[10px] uppercase tracking-widest font-medium opacity-60">
                            Strategy: {routingInfo.model}
                        </span>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl bg-[#0a0a0c] border border-white/10 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none">
                            <p className="text-[10px] text-white/40 leading-relaxed italic">
                                "{routingInfo.reasoning}"
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[9px] uppercase tracking-tighter opacity-30">Resonance</span>
                                <span className="text-[9px] uppercase tracking-widest text-emerald-400/80">{routingInfo.atmosphere}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(p => <Particle key={p.id} delay={p.delay} atmosphere={atmosphere} />)}
            </div>

            {/* Shadow Thoughts Overlay */}
            <AnimatePresence>
                {shadowThoughts && <ShadowThoughts thought={shadowThoughts} atmosphere={atmosphere} />}
            </AnimatePresence>

            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ background: `radial-gradient(circle at 50% 20%, ${atmosphere.primary}20, transparent 50%)` }}
                transition={{ duration: 1.5 }}
            />

            {/* Ambient glow */}
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none blur-[120px]"
                animate={{ backgroundColor: atmosphere.glow }}
                transition={{ duration: 1.5 }}
            />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 rounded-full bg-white/10 text-white/60 active:scale-95 transition-transform">
                        <ArrowLeft size={18} />
                    </a>
                    <motion.div
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Logo size={28} theme="amber" />
                    </motion.div>
                    <span className="text-white/80 font-medium hidden sm:inline">Mirror</span>

                    {/* Single Tier + Model Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTierDropdown(!showTierDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
                        >
                            {React.createElement(INFERENCE_TIERS.find(t => t.id === inferenceTier)?.icon || Cloud, { size: 14, className: 'text-white/60' })}
                            <span className="text-white/70">{INFERENCE_TIERS.find(t => t.id === inferenceTier)?.model}</span>
                            <ChevronDown size={14} className={`text-white/40 transition-transform ${showTierDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showTierDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-full left-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                                >
                                    <div className="px-4 py-2 border-b border-white/5">
                                        <p className="text-white/40 text-xs">Where should Mirror run?</p>
                                    </div>
                                    {INFERENCE_TIERS.map(tier => {
                                        const Icon = tier.icon;
                                        return (
                                            <button
                                                key={tier.id}
                                                onClick={() => { setInferenceTier(tier.id); setShowTierDropdown(false); }}
                                                className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 hover:bg-white/5 ${inferenceTier === tier.id ? 'bg-violet-500/10' : ''}`}
                                            >
                                                <Icon size={18} className={inferenceTier === tier.id ? 'text-violet-400' : 'text-white/50'} />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm font-medium flex items-center gap-2">
                                                        {tier.name}
                                                        <span className="text-white/40 text-xs font-normal">• {tier.model}</span>
                                                    </div>
                                                    <div className="text-white/40 text-xs">{tier.desc}</div>
                                                    <div className="text-white/30 text-[10px] mt-1 italic">{tier.privacy}</div>
                                                </div>
                                                {inferenceTier === tier.id && <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5" />}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* RAG Toggle */}
                    <button
                        onClick={() => setIncludeRagContext(!includeRagContext)}
                        className={`p-2 rounded-full transition-colors ${includeRagContext ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40 hover:text-white/60'}`}
                        title={includeRagContext ? 'Vault Context: ON' : 'Vault Context: OFF'}
                    >
                        <Database size={14} />
                    </button>
                    {/* Export */}
                    {messages.length > 0 && (
                        <button
                            onClick={() => {
                                const timestamp = new Date().toLocaleString();
                                const md = `# ⟡ Mirror Reflection\n**Date:** ${timestamp}\n\n---\n\n${messages.map(m => `### ${m.role === 'user' ? '👤 YOU' : '⟡ MIRROR'}\n\n${m.content}`).join('\n\n---\n\n')}\n\n---\n\n*Exported from [Active Mirror](https://activemirror.ai)*`;
                                const blob = new Blob([md], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `mirror-chat-${new Date().toISOString().slice(0, 10)}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                            title="Export Chat"
                        >
                            <FileDown size={14} />
                        </button>
                    )}
                    <Sparkles size={12} style={{ color: atmosphere.primary }} className="animate-pulse" />
                    <span className="text-white/30 text-xs uppercase tracking-widest hidden sm:inline">{atmosphere.phase}</span>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="ml-2 p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                    >
                        <Settings size={14} />
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages area */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                        {/* Heartbeat Glyph Core */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="relative mb-8"
                            >
                                <HeartbeatGlyph atmosphere={atmosphere} />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h1 className="text-3xl font-light tracking-[0.2em] mb-4 text-white/90">
                                    ACTIVE MIRROR
                                </h1>
                                <p className="text-white/40 text-sm tracking-wide leading-relaxed font-light mb-8">
                                    Cognitive sovereignty through reflected intelligence.<br />
                                    <span className="mt-2 block italic opacity-50">"Silence is where the soul begins to listen."</span>
                                </p>

                                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                                    {[
                                        { icon: Zap, label: 'Intelligent', desc: 'Auto-routing' },
                                        { icon: Shield, label: 'Sovereign', desc: 'Private-first' },
                                    ].map((feature) => (
                                        <div key={feature.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-2">
                                            <feature.icon size={18} className="text-white/40" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest font-semibold text-white/70">{feature.label}</div>
                                                <div className="text-[9px] text-white/30 uppercase tracking-tighter">{feature.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={message.id || index}
                                    message={message}
                                    atmosphere={atmosphere}
                                    onSpeak={speak}
                                    onRegenerate={regenerateLastResponse}
                                    voiceEnabled={voiceEnabled}
                                    isLast={index === messages.length - 1}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-400" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={regenerateLastResponse}
                                    className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                >
                                    <RefreshCw size={12} /> Retry
                                </button>
                                <button
                                    onClick={() => setError(null)}
                                    className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </main>

            {/* Input area */}
            <div
                className="relative z-20 p-4 border-t border-white/5"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7))' }}
            >
                <div className="max-w-2xl mx-auto relative flex flex-col gap-2">
                    {/* Attachments Preview */}
                    <AnimatePresence>
                        {(pastedImage || localDoc) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2 overflow-hidden"
                            >
                                {/* Image Preview */}
                                {pastedImage && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative group"
                                    >
                                        <img
                                            src={pastedImage.dataUrl}
                                            alt="Attached"
                                            className="h-20 w-20 object-cover rounded-xl border border-white/10"
                                        />
                                        <button
                                            onClick={clearPastedImage}
                                            className="absolute -top-2 -right-2 p-1 rounded-full bg-black/80 border border-white/10 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="absolute bottom-1 left-1 right-1 text-center">
                                            <span className="text-[8px] uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded text-white/60">
                                                Vision
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Document Preview */}
                                {localDoc && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <FileText size={16} className="text-emerald-400" />
                                        <div>
                                            <p className="text-xs text-white/70 max-w-[100px] truncate">{localDoc.name}</p>
                                            <p className="text-[9px] text-white/30">Context active</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalDoc(null)}
                                            className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-2">
                    {/* Attachment button */}
                    <button
                        onClick={() => document.getElementById('file-input').click()}
                        className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
                        title="Attach image or document"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="file"
                        id="file-input"
                        hidden
                        accept="image/*,.pdf,.txt,.md,.doc,.docx"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result, file });
                                reader.readAsDataURL(file);
                            } else {
                                handleFileUpload(file);
                            }
                            e.target.value = '';
                        }}
                    />

                    {/* Voice input button */}
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all ${isListening
                            ? 'bg-red-500/30 text-red-400'
                            : 'bg-white/5 text-white/40 hover:text-white/60'
                            }`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            placeholder={isListening ? "Listening..." : pastedImage ? "Ask about the image..." : "Ask anything..."}
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-base transition-all disabled:opacity-50"
                            style={{
                                minHeight: '52px', maxHeight: '150px',
                                borderColor: input.length > 10 ? `${atmosphere.primary}40` : undefined
                            }}
                            rows={1}
                        />
                        <motion.button
                            onClick={handleSubmit}
                            disabled={(!input.trim() && !pastedImage) || isLoading}
                            className="absolute right-2 bottom-2 p-2.5 rounded-xl text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            style={{ background: (input.trim() || pastedImage) && !isLoading ? `${atmosphere.primary}40` : 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isLoading ? (
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.6 }}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.8] }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <Logo size={20} theme="amber" />
                                </motion.div>
                            ) : (
                                <Send size={18} />
                            )}
                        </motion.button>
                        {/* Character count */}
                        {input.length > 0 && (
                            <span className={`absolute left-3 bottom-1 text-[10px] ${input.length > 1800 ? 'text-amber-400' : 'text-white/20'}`}>
                                {input.length}/2000
                            </span>
                        )}
                    </div>

                    {/* Voice output toggle */}
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-3 rounded-xl transition-all ${voiceEnabled
                            ? 'bg-violet-500/30 text-violet-400'
                            : 'bg-white/5 text-white/40 hover:text-white/60'
                            }`}
                        title={voiceEnabled ? "Voice on" : "Voice off"}
                    >
                        {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                        <Shield size={10} className="text-white/20" />
                        <p className="text-white/20 text-xs">MirrorGate</p>
                    </div>
                    <span className="text-white/15 text-xs">•</span>
                    <button
                        onClick={() => setShowTierDropdown(!showTierDropdown)}
                        className="text-white/15 text-xs hover:text-white/30 transition-colors"
                    >
                        {INFERENCE_TIERS.find(t => t.id === inferenceTier)?.model}
                    </button>
                    <span className="text-white/15 text-xs">•</span>
                    <button
                        onClick={() => {
                            if (memory.consentGiven) {
                                forgetMe();
                                setMemory({ userName: null, preferences: {}, facts: [], sessionCount: 0, consentGiven: false });
                            } else {
                                giveMemoryConsent();
                                const updated = { ...memory, consentGiven: true, sessionCount: 1, lastVisit: new Date().toISOString() };
                                setMemory(updated);
                                saveMemory(updated);
                            }
                        }}
                        className={`flex items-center gap-1 text-xs transition-colors ${memory.consentGiven ? 'text-white/15 hover:text-red-400' : 'text-white/10 hover:text-green-400'}`}
                        title={memory.consentGiven ? "Click to forget" : "Click to enable memory"}
                    >
                        <span>{memory.consentGiven ? 'memory on' : 'memory off'}</span>
                    </button>
                </div>
            </div>

            {/* Settings modal */}
            <AnimatePresence>
                {showSettings && (
                    <SettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        memory={memory}
                        setMemory={setMemory}
                        voiceEnabled={voiceEnabled}
                        setVoiceEnabled={setVoiceEnabled}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />
                )}
            </AnimatePresence>

            {/* Memory Consent Modal */}
            <AnimatePresence>
                {showMemoryConsent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Brain size={24} className="text-violet-400" />
                                <h3 className="text-white font-medium text-lg">Enable Mirror Memory?</h3>
                            </div>
                            <p className="text-white/60 text-sm mb-2">Remembers your preferences locally.</p>
                            <ul className="text-white/40 text-xs space-y-1 mb-6">
                                <li>• Never uploaded to any server</li>
                                <li>• Delete anytime with one click</li>
                                <li>• Auto-expires after 90 days</li>
                            </ul>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        giveMemoryConsent();
                                        const updated = { ...memory, consentGiven: true, sessionCount: 1, lastVisit: new Date().toISOString() };
                                        setMemory(updated);
                                        saveMemory(updated);
                                        setShowMemoryConsent(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
                                >
                                    Enable
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.setItem(MEMORY_CONSENT_KEY, 'false');
                                        setShowMemoryConsent(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    No thanks
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MirrorAmbient;

