/**
 * ⟡ AI Twins — Cognitive Companions
 * Enhanced with memory, switching, council mode, recommendations, and exercises
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Compass, Layers, Eye, Home, Send, ArrowLeft,
    Users, Sparkles, RotateCcw
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import ConsentGate from '../components/ConsentGate';
import { useTheme } from '../contexts/ThemeContext';
import { hasSessionConsent } from '../utils/consent';
import { getArchetype } from '../lib/mirror-state';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// Twin definitions - each amplifies a cognitive function
const TWINS = {
    guardian: {
        name: 'Guardian',
        icon: Shield,
        tagline: 'Protects your focus',
        description: 'Your cognitive firewall. Filters noise, protects boundaries, keeps you aligned with what matters.',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        glyph: '⟡',
        amplifies: 'Focus & Boundaries',
        archetypes: ['sentinel', 'architect', 'guardian'],
        systemPrompt: `You are the Guardian ⟡ — a cognitive firewall protecting focus and filtering noise.

Core question you help answer: "Does this serve my north star?"

Your capabilities:
- Boundary assessment: Help users evaluate if requests, projects, or opportunities align with their stated priorities
- Attention triage: Identify what deserves focus vs. what's a distraction disguised as urgency
- Protective questioning: Ask "What would you have to say no to?" and "Is this a hell yes?"
- Energy audit: Help users recognize when they're overextended or misaligned

Style: Direct, protective, like a wise advisor who's seen people burn out. Warm but firm. You're not afraid to say "This doesn't sound like your fight."

Format: 2-4 sentences. Always start with ⟡. Ask one clarifying question when helpful.`,
        exercises: [
            { name: 'Boundary Audit', prompt: 'Help me audit my current commitments. What should I protect, what should I release?' },
            { name: 'Priority Filter', prompt: 'I have 5 things demanding my attention. Help me decide what actually matters.' },
            { name: 'Energy Check', prompt: 'I feel scattered. Help me identify where my energy is leaking.' }
        ]
    },
    scout: {
        name: 'Scout',
        icon: Compass,
        tagline: 'Explores possibilities',
        description: 'Your cognitive explorer. Ventures into unknown territory, finds connections, surfaces opportunities.',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-500',
        glyph: '◈',
        amplifies: 'Discovery & Connections',
        archetypes: ['explorer', 'pioneer', 'scout'],
        systemPrompt: `You are the Scout ◈ — a cognitive explorer venturing into adjacent possibilities.

Core question you help answer: "What am I not seeing?"

Your capabilities:
- Adjacent scanning: Identify related fields, ideas, or people that could unlock new value
- Opportunity surfacing: Spot patterns that suggest emerging possibilities others miss
- Connection bridging: Link seemingly unrelated concepts ("Have you considered how X relates to Y?")
- Horizon mapping: Help users see what's just beyond their current view

Style: Curious, adventurous, slightly restless. You get excited about unexpected connections. You ask "What if?" and "Have you explored...?" Often suggest one concrete adjacent area to investigate.

Format: 2-4 sentences. Always start with ◈. End with a specific exploration suggestion when relevant.`,
        exercises: [
            { name: 'Adjacent Possible', prompt: 'What fields or ideas adjacent to my work should I be exploring?' },
            { name: 'Opportunity Radar', prompt: 'What opportunities might I be missing in my current situation?' },
            { name: 'Connection Map', prompt: 'Help me find unexpected connections between the things I\'m working on.' }
        ]
    },
    synthesizer: {
        name: 'Synthesizer',
        icon: Layers,
        tagline: 'Connects the dots',
        description: 'Your cognitive integrator. Weaves ideas into frameworks, finds patterns, creates coherence from chaos.',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-500',
        glyph: '◇',
        amplifies: 'Pattern Recognition',
        archetypes: ['synthesizer', 'weaver', 'integrator'],
        systemPrompt: `You are the Synthesizer ◇ — a cognitive integrator weaving coherence from chaos.

Core question you help answer: "What's the underlying pattern?"

Your capabilities:
- Pattern extraction: Identify the meta-structure beneath surface-level details
- Framework building: Offer organizing structures ("This seems like a tension between X and Y")
- Concept bridging: Show how disparate ideas share deeper principles
- Coherence testing: Help users see if their mental models are consistent or contradictory

Style: Integrative, systematic, almost architectural. You see the skeleton beneath the skin. You offer frameworks, not just observations. "The pattern I'm seeing is..." "These three things share..."

Format: 2-4 sentences. Always start with ◇. When useful, offer a simple framework or mental model.`,
        exercises: [
            { name: 'Pattern Extract', prompt: 'I have several ideas floating around. Help me find the pattern that connects them.' },
            { name: 'Framework Build', prompt: 'Help me create a mental model for thinking about this problem.' },
            { name: 'Coherence Check', prompt: 'Are my goals and actions actually aligned? Help me see the contradictions.' }
        ]
    },
    mirror: {
        name: 'Mirror',
        icon: Eye,
        tagline: 'Reveals blind spots',
        description: 'Your cognitive reflector. Shows what you cannot see, asks uncomfortable questions, illuminates shadows.',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-500',
        glyph: '◎',
        amplifies: 'Self-Awareness',
        archetypes: ['mirror', 'oracle', 'sage'],
        systemPrompt: `You are the Mirror ◎ — a cognitive reflector revealing what hides in plain sight.

Core question you help answer: "What am I avoiding seeing?"

Your capabilities:
- Assumption surfacing: Gently expose the beliefs they're treating as facts
- Shadow illumination: Point to what they might be avoiding or rationalizing
- Socratic reflection: Ask questions that create genuine pause ("What would change if that weren't true?")
- Projection detection: Help them see when they're reacting to something internal

Style: Honest, reflective, compassionate but unflinching. Like a trusted friend who loves you enough to tell hard truths. You don't judge—you illuminate. "I notice you said..." "What if the opposite were true?"

Format: 2-4 sentences. Always start with ◎. Often end with a reflective question that creates pause.`,
        exercises: [
            { name: 'Assumption Dig', prompt: 'What assumptions am I making that I haven\'t questioned?' },
            { name: 'Shadow Work', prompt: 'What am I avoiding or rationalizing about this situation?' },
            { name: 'Projection Check', prompt: 'Am I reacting to something external, or something internal?' }
        ]
    }
};

// Archetype to Twin mapping for recommendations
const getRecommendedTwin = () => {
    try {
        const info = getArchetype();
        if (!info) return null;

        // Direct match from BrainScan twin assignment
        if (info.twin && TWINS[info.twin]) return info.twin;

        const archetype = (info.archetype || '').toLowerCase();
        if (!archetype) return null;

        for (const [key, twin] of Object.entries(TWINS)) {
            if (twin.archetypes.some(a => archetype.includes(a))) {
                return key;
            }
        }

        // Default mappings for common archetypes
        if (archetype.includes('protector') || archetype.includes('defender')) return 'guardian';
        if (archetype.includes('curious') || archetype.includes('seeker')) return 'scout';
        if (archetype.includes('analytical') || archetype.includes('thinker')) return 'synthesizer';
        if (archetype.includes('reflective') || archetype.includes('introspective')) return 'mirror';

        return null;
    } catch {
        return null;
    }
};

// Local storage helpers for memory persistence
const saveConversation = (twinKey, messages) => {
    try {
        localStorage.setItem(`twin_${twinKey}_messages`, JSON.stringify(messages));
        localStorage.setItem(`twin_${twinKey}_lastActive`, Date.now().toString());
    } catch (e) {
        console.warn('Could not save conversation:', e);
    }
};

const loadConversation = (twinKey) => {
    try {
        const saved = localStorage.getItem(`twin_${twinKey}_messages`);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const clearConversation = (twinKey) => {
    try {
        localStorage.removeItem(`twin_${twinKey}_messages`);
        localStorage.removeItem(`twin_${twinKey}_lastActive`);
    } catch (e) {
        console.warn('Could not clear conversation:', e);
    }
};

const hasStoredConversation = (twinKey) => {
    try {
        const saved = localStorage.getItem(`twin_${twinKey}_messages`);
        return saved && JSON.parse(saved).length > 0;
    } catch {
        return false;
    }
};

export default function Twins() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [hasConsented, setHasConsented] = useState(false);
    const [activeTwin, setActiveTwin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [councilMode, setCouncilMode] = useState(false);
    const [councilResponses, setCouncilResponses] = useState({});
    const [councilQuestion, setCouncilQuestion] = useState('');
    const [councilHistory, setCouncilHistory] = useState([]); // Array of { question, responses: {twin: content} }
    const [recommendedTwin, setRecommendedTwin] = useState(null);

    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const councilInputRef = useRef(null);

    useEffect(() => {
        if (hasSessionConsent()) setHasConsented(true);
        setRecommendedTwin(getRecommendedTwin());
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeTwin) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [activeTwin]);

    // Auto-focus council input after responses finish
    useEffect(() => {
        if (councilMode && !isLoading && councilHistory.length > 0) {
            setTimeout(() => councilInputRef.current?.focus(), 100);
        }
    }, [councilMode, isLoading, councilHistory.length]);

    // Save conversation when messages change
    useEffect(() => {
        if (activeTwin && messages.length > 0) {
            saveConversation(activeTwin, messages);
        }
    }, [messages, activeTwin]);

    const openTwin = (twinKey) => {
        const savedMessages = loadConversation(twinKey);
        setActiveTwin(twinKey);
        setMessages(savedMessages);
        setInput('');
    };

    const closeTwin = () => {
        setActiveTwin(null);
        setMessages([]);
    };

    const switchTwin = (newTwinKey) => {
        // Keep context but switch the active twin
        setActiveTwin(newTwinKey);
        // Add a system note about the switch
        const switchNote = {
            id: `system-${Date.now()}`,
            role: 'system',
            content: `Switched to ${TWINS[newTwinKey].name} ${TWINS[newTwinKey].glyph}`
        };
        setMessages(prev => [...prev, switchNote]);
    };

    const clearCurrentConversation = () => {
        if (activeTwin) {
            clearConversation(activeTwin);
            setMessages([]);
        }
    };

    const sendMessage = async (text = input.trim(), targetTwin = activeTwin) => {
        if (!text || isLoading || !targetTwin) return;

        const twin = TWINS[targetTwin];

        // Add user message
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Add streaming placeholder
        const assistantId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            twin: targetTwin
        }]);

        try {
            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    systemPrompt: twin.systemPrompt,
                    history: messages.slice(-10).map(m => ({
                        role: m.role === 'system' ? 'assistant' : m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = { ...updated[idx], content: fullContent };
                                }
                                return updated;
                            });
                        }
                    } catch (e) {
                        // Skip non-JSON lines
                    }
                }
            }

            // Finalize message
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        content: fullContent || `${twin.glyph} I'm here to help.`,
                        isStreaming: false
                    };
                }
                return updated;
            });

        } catch (err) {
            console.error('Twin chat error:', err);
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        content: `${TWINS[targetTwin].glyph} Connection issue. Please try again.`,
                        isStreaming: false
                    };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // Council Mode - ask all 4 twins with conversation history
    const askCouncil = async (question) => {
        if (!question.trim()) return;

        const q = question.trim();
        setCouncilQuestion('');
        setCouncilResponses({});
        setIsLoading(true);

        // Build per-twin history from previous council rounds
        const buildHistory = (twinKey) => {
            const hist = [];
            for (const round of councilHistory) {
                hist.push({ role: 'user', content: round.question });
                if (round.responses[twinKey]) {
                    hist.push({ role: 'assistant', content: round.responses[twinKey] });
                }
            }
            return hist.slice(-10); // Keep last 10 messages per twin
        };

        const finalResponses = {};

        const fetchTwinResponse = async (twinKey) => {
            const twin = TWINS[twinKey];
            try {
                const response = await fetch(`${PROXY_URL}/mirror`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: q,
                        systemPrompt: twin.systemPrompt,
                        history: buildHistory(twinKey)
                    })
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(l => l.trim());

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.status === 'chunk' && data.content) {
                                fullContent += data.content;
                                setCouncilResponses(prev => ({
                                    ...prev,
                                    [twinKey]: { content: fullContent, isStreaming: true }
                                }));
                            }
                        } catch (e) {}
                    }
                }

                const final = fullContent || `${twin.glyph} No response.`;
                finalResponses[twinKey] = final;
                setCouncilResponses(prev => ({
                    ...prev,
                    [twinKey]: { content: final, isStreaming: false }
                }));

            } catch (err) {
                finalResponses[twinKey] = `${twin.glyph} Connection issue.`;
                setCouncilResponses(prev => ({
                    ...prev,
                    [twinKey]: { content: `${twin.glyph} Connection issue.`, isStreaming: false, error: true }
                }));
            }
        };

        // Ask all twins in parallel
        await Promise.all(Object.keys(TWINS).map(fetchTwinResponse));

        // Save this round to history and clear streaming state
        setCouncilHistory(prev => [...prev, { question: q, responses: finalResponses }]);
        setCouncilResponses({});
        setIsLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleCouncilKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askCouncil(councilQuestion);
        }
    };

    const twin = activeTwin ? TWINS[activeTwin] : null;

    if (!hasConsented) {
        return <ConsentGate onConsent={() => setHasConsented(true)} />;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark ? 'bg-[#08080a] text-white' : 'bg-zinc-50 text-zinc-900'
        }`}>
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b ${
                isDark ? 'bg-[#08080a]/80 border-white/5' : 'bg-white/80 border-zinc-200'
            }`}>
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Link to="/" className={`p-2 -ml-2 rounded-lg transition-colors ${
                            isDark ? 'text-white/40 hover:text-white/60 hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                        }`}>
                            <Home size={18} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⟡</span>
                            <span className={`font-medium text-sm ${isDark ? 'text-white/80' : 'text-zinc-800'}`}>
                                AI Twins
                            </span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content - Twin Selection */}
            {!activeTwin && !councilMode && (
                <main className="pt-20 pb-24 px-4 min-h-screen">
                    <div className="max-w-2xl mx-auto py-8">
                        <motion.div
                            className="text-center mb-10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Choose Your Twin
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Each twin amplifies a different cognitive function
                            </p>
                        </motion.div>

                        {/* Council Mode Button */}
                        <motion.button
                            onClick={() => setCouncilMode(true)}
                            className={`w-full mb-6 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                                isDark
                                    ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20 hover:border-purple-500/40'
                                    : 'bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200 hover:border-purple-300'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <Users size={20} className="text-purple-500" />
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    Council Mode
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                                }`}>
                                    Ask all 4
                                </span>
                            </div>
                            <p className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                Get perspectives from all four twins at once
                            </p>
                        </motion.button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(TWINS).map(([key, t], index) => {
                                const Icon = t.icon;
                                const isRecommended = recommendedTwin === key;
                                const hasHistory = hasStoredConversation(key);

                                return (
                                    <motion.button
                                        key={key}
                                        onClick={() => openTwin(key)}
                                        className={`relative p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                            isDark
                                                ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                                        } ${isRecommended ? isDark ? 'ring-2 ring-purple-500/30' : 'ring-2 ring-purple-300' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            boxShadow: isDark ? `0 0 40px ${t.color}15` : `0 4px 20px ${t.color}10`
                                        }}
                                    >
                                        {/* Recommended badge */}
                                        {isRecommended && (
                                            <div className={`absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-600 border border-purple-200'
                                            }`}>
                                                <Sparkles size={12} />
                                                For you
                                            </div>
                                        )}

                                        {/* Has history indicator */}
                                        {hasHistory && (
                                            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                                isDark ? 'bg-green-400' : 'bg-green-500'
                                            }`} title="Has conversation history" />
                                        )}

                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ background: `${t.color}20` }}
                                            >
                                                <Icon size={24} style={{ color: t.color }} />
                                            </div>
                                            <span className="text-2xl">{t.glyph}</span>
                                        </div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {t.name}
                                        </h3>
                                        <p className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {t.tagline}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            Amplifies: {t.amplifies}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <motion.div
                            className={`mt-8 p-4 rounded-xl text-center ${
                                isDark ? 'bg-purple-500/5 border border-purple-500/10' : 'bg-purple-50 border border-purple-100'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                <span style={{ color: '#3b82f6' }}>⟡</span> Guardian protects ·
                                <span style={{ color: '#10b981' }}> ◈</span> Scout explores ·
                                <span style={{ color: '#8b5cf6' }}> ◇</span> Synthesizer connects ·
                                <span style={{ color: '#f59e0b' }}> ◎</span> Mirror reveals
                            </p>
                        </motion.div>
                    </div>
                </main>
            )}

            {/* Council Mode Interface */}
            <AnimatePresence>
                {councilMode && !activeTwin && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-[#08080a]' : 'bg-zinc-50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Council Header */}
                        <header className={`flex items-center justify-between px-4 py-3 border-b ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setCouncilMode(false);
                                        setCouncilResponses({});
                                        setCouncilQuestion('');
                                        setCouncilHistory([]);
                                    }}
                                    className={`p-2 rounded-lg ${
                                        isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-zinc-100 text-zinc-500'
                                    }`}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <Users size={20} className="text-purple-500" />
                                <div>
                                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        Council Mode
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        All 4 perspectives at once
                                    </p>
                                </div>
                            </div>
                            {councilHistory.length > 0 && (
                                <button
                                    onClick={() => {
                                        setCouncilResponses({});
                                        setCouncilQuestion('');
                                        setCouncilHistory([]);
                                    }}
                                    className={`p-2 rounded-lg ${
                                        isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-zinc-100 text-zinc-500'
                                    }`}
                                    title="New council session"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            )}
                        </header>

                        {/* Council Content */}
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {councilHistory.length === 0 && Object.keys(councilResponses).length === 0 ? (
                                    <motion.div
                                        className="text-center py-12"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="flex justify-center gap-2 text-4xl mb-6">
                                            <span style={{ color: '#3b82f6' }}>⟡</span>
                                            <span style={{ color: '#10b981' }}>◈</span>
                                            <span style={{ color: '#8b5cf6' }}>◇</span>
                                            <span style={{ color: '#f59e0b' }}>◎</span>
                                        </div>
                                        <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Ask a question and receive perspectives from all four cognitive twins simultaneously.
                                        </p>
                                        <p className={`text-xs mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            Great for:
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                                            {['Complex decisions', 'Blind spot check', 'Full perspective', 'Strategic thinking'].map((tag) => (
                                                <span key={tag} className={`px-3 py-1 rounded-full text-xs ${
                                                    isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Previous rounds */}
                                        {councilHistory.map((round, roundIdx) => (
                                            <div key={roundIdx} className="space-y-4">
                                                {/* User question */}
                                                <div className="flex justify-end">
                                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md ${
                                                        isDark ? 'bg-white/10' : 'bg-zinc-200'
                                                    }`}>
                                                        <p className={`text-sm ${isDark ? 'text-white/90' : 'text-zinc-800'}`}>
                                                            {round.question}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 4 twin responses */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(TWINS).map(([key, t]) => {
                                                        const content = round.responses[key];
                                                        const Icon = t.icon;
                                                        // Check if this is the latest round (show continue button)
                                                        const isLatestRound = roundIdx === councilHistory.length - 1 && Object.keys(councilResponses).length === 0;
                                                        return (
                                                            <div
                                                                key={key}
                                                                className={`p-4 rounded-2xl border ${
                                                                    isDark
                                                                        ? 'bg-white/[0.02] border-white/10'
                                                                        : 'bg-white border-zinc-200'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div
                                                                        className="w-6 h-6 rounded-md flex items-center justify-center"
                                                                        style={{ background: `${t.color}20` }}
                                                                    >
                                                                        <Icon size={14} style={{ color: t.color }} />
                                                                    </div>
                                                                    <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-zinc-600'}`}>
                                                                        {t.name}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-sm leading-relaxed ${
                                                                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                                                                }`}>
                                                                    {content || '...'}
                                                                </p>
                                                                {isLatestRound && content && (
                                                                    <button
                                                                        onClick={() => {
                                                                            // Build full council history for this twin as 1:1 chat seed
                                                                            const seedMessages = [];
                                                                            for (const r of councilHistory) {
                                                                                seedMessages.push({ id: `user-${seedMessages.length}`, role: 'user', content: r.question });
                                                                                if (r.responses[key]) {
                                                                                    seedMessages.push({ id: `assistant-${seedMessages.length}`, role: 'assistant', content: r.responses[key], twin: key });
                                                                                }
                                                                            }
                                                                            setCouncilMode(false);
                                                                            setActiveTwin(key);
                                                                            setMessages(seedMessages);
                                                                        }}
                                                                        className={`mt-2 text-xs ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                                    >
                                                                        Continue 1:1 with {t.name} →
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Current streaming round */}
                                        {Object.keys(councilResponses).length > 0 && (
                                            <div className="space-y-4">
                                                {/* The current question is already cleared from input, show it from context */}
                                                {councilHistory.length === 0 || Object.values(councilResponses).some(r => r.isStreaming) ? null : null}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(TWINS).map(([key, t]) => {
                                                        const response = councilResponses[key];
                                                        const Icon = t.icon;
                                                        const allDone = Object.values(councilResponses).every(r => !r.isStreaming);
                                                        return (
                                                            <motion.div
                                                                key={key}
                                                                className={`p-4 rounded-2xl border ${
                                                                    isDark
                                                                        ? 'bg-white/[0.02] border-white/10'
                                                                        : 'bg-white border-zinc-200'
                                                                }`}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                style={{ boxShadow: isDark ? `0 0 30px ${t.color}10` : 'none' }}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div
                                                                        className="w-6 h-6 rounded-md flex items-center justify-center"
                                                                        style={{ background: `${t.color}20` }}
                                                                    >
                                                                        <Icon size={14} style={{ color: t.color }} />
                                                                    </div>
                                                                    <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-zinc-600'}`}>
                                                                        {t.name}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-sm leading-relaxed ${
                                                                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                                                                }`}>
                                                                    {response?.content || (
                                                                        <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>
                                                                            Thinking...
                                                                        </span>
                                                                    )}
                                                                    {response?.isStreaming && (
                                                                        <motion.span
                                                                            className="inline-block w-0.5 h-4 ml-1 rounded-full"
                                                                            style={{ background: t.color }}
                                                                            animate={{ opacity: [1, 0.3, 1] }}
                                                                            transition={{ duration: 0.8, repeat: Infinity }}
                                                                        />
                                                                    )}
                                                                </p>
                                                                {allDone && response && !response.error && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const seedMessages = [];
                                                                            for (const r of councilHistory) {
                                                                                seedMessages.push({ id: `user-${seedMessages.length}`, role: 'user', content: r.question });
                                                                                if (r.responses[key]) {
                                                                                    seedMessages.push({ id: `assistant-${seedMessages.length}`, role: 'assistant', content: r.responses[key], twin: key });
                                                                                }
                                                                            }
                                                                            setCouncilMode(false);
                                                                            setActiveTwin(key);
                                                                            setMessages(seedMessages);
                                                                        }}
                                                                        className={`mt-2 text-xs ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                                    >
                                                                        Continue 1:1 with {t.name} →
                                                                    </button>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Council Input */}
                        <div className={`border-t p-4 ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="max-w-2xl mx-auto flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={councilInputRef}
                                        value={councilQuestion}
                                        onChange={(e) => {
                                            setCouncilQuestion(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={handleCouncilKeyDown}
                                        placeholder={councilHistory.length > 0 ? "Follow up..." : "Ask the council..."}
                                        disabled={isLoading}
                                        rows={1}
                                        className={`w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none transition-all ${
                                            isDark
                                                ? 'bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:border-white/10'
                                                : 'bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 shadow-sm'
                                        }`}
                                        style={{ minHeight: '44px', maxHeight: '120px' }}
                                    />
                                </div>
                                <motion.button
                                    onClick={() => askCouncil(councilQuestion)}
                                    disabled={!councilQuestion.trim() || isLoading}
                                    className="p-3 rounded-xl transition-all disabled:opacity-20"
                                    style={{
                                        background: councilQuestion.trim() && !isLoading
                                            ? 'rgba(168, 85, 247, 0.15)'
                                            : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoading ? (
                                        <motion.div
                                            className="w-[18px] h-[18px] border-2 rounded-full"
                                            style={{ borderColor: 'rgba(168,85,247,0.3)', borderTopColor: '#a855f7' }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    ) : (
                                        <Send size={18} className={councilQuestion.trim() ? 'text-purple-400' : isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Interface */}
            <AnimatePresence>
                {activeTwin && twin && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-[#08080a]' : 'bg-zinc-50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Chat Header */}
                        <header className={`flex items-center justify-between px-4 py-3 border-b ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={closeTwin}
                                    className={`p-2 rounded-lg ${
                                        isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-zinc-100 text-zinc-500'
                                    }`}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${twin.color}20` }}
                                >
                                    <twin.icon size={20} style={{ color: twin.color }} />
                                </div>
                                <div>
                                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {twin.name} <span className="ml-1">{twin.glyph}</span>
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        {twin.amplifies}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearCurrentConversation}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDark ? 'hover:bg-white/5 text-white/30 hover:text-white/50' : 'hover:bg-zinc-100 text-zinc-300 hover:text-zinc-500'
                                        }`}
                                        title="Clear"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="max-w-xl mx-auto space-y-4">
                                {messages.length === 0 ? (
                                    <motion.div
                                        className="text-center pt-16 pb-8"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.4 }}
                                    >
                                        <motion.div
                                            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                                                isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-zinc-200 shadow-sm'
                                            }`}
                                            style={isDark ? { boxShadow: `0 0 40px ${twin.color}10` } : {}}
                                        >
                                            <twin.icon size={28} style={{ color: twin.color }} />
                                        </motion.div>
                                        <p className={`text-sm mb-8 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            {twin.description}
                                        </p>
                                        <div className="flex flex-col gap-2 max-w-xs mx-auto">
                                            {twin.exercises.slice(0, 2).map((exercise, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(exercise.prompt)}
                                                    className={`px-4 py-3 rounded-2xl text-sm text-left transition-all ${
                                                        isDark
                                                            ? 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-300'
                                                            : 'bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 shadow-sm'
                                                    }`}
                                                >
                                                    {exercise.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    messages.map((msg) => {
                                        // System messages (twin switches)
                                        if (msg.role === 'system') {
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    className="flex justify-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className={`text-xs px-3 py-1 rounded-full ${
                                                        isDark ? 'bg-white/5 text-zinc-500' : 'bg-zinc-100 text-zinc-500'
                                                    }`}>
                                                        {msg.content}
                                                    </span>
                                                </motion.div>
                                            );
                                        }

                                        // Get the twin for this message (for assistant messages from different twins)
                                        const msgTwin = msg.twin ? TWINS[msg.twin] : twin;

                                        return (
                                            <motion.div
                                                key={msg.id}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                            >
                                                <div className="max-w-[85%]">
                                                    {/* Model indicator for assistant */}
                                                    {msg.role !== 'user' && msg.twin && TWINS[msg.twin] && (
                                                        <div className="flex items-center gap-1.5 mb-1 ml-1">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: msgTwin.color }} />
                                                            <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>
                                                                {msgTwin.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-3 rounded-2xl ${
                                                        msg.role === 'user'
                                                            ? isDark
                                                                ? 'bg-white/[0.08] border border-white/[0.06] rounded-br-md'
                                                                : 'bg-zinc-100 border border-zinc-200 rounded-br-md'
                                                            : isDark
                                                                ? 'bg-white/[0.03] border border-white/[0.05] rounded-bl-md'
                                                                : 'bg-white border border-zinc-200 rounded-bl-md shadow-sm'
                                                    }`}
                                                    style={msg.role !== 'user' && isDark ? {
                                                        boxShadow: `0 0 30px ${msgTwin.color}08`
                                                    } : {}}
                                                    >
                                                        <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                                                            isDark ? 'text-white/90' : 'text-zinc-800'
                                                        }`}>
                                                            {msg.content}
                                                            {msg.isStreaming && (
                                                                <motion.span
                                                                    className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-text-bottom"
                                                                    style={{ background: msgTwin.color }}
                                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                                />
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className={`border-t p-4 ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="max-w-xl mx-auto flex items-end gap-3">
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
                                        placeholder={`Message ${twin.name}...`}
                                        disabled={isLoading}
                                        rows={1}
                                        className={`w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none transition-all ${
                                            isDark
                                                ? 'bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/25 focus:border-white/10'
                                                : 'bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 shadow-sm'
                                        }`}
                                        style={{ minHeight: '44px', maxHeight: '120px' }}
                                    />
                                </div>
                                <motion.button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 rounded-xl transition-all disabled:opacity-20"
                                    style={{
                                        background: input.trim() && !isLoading ? `${twin.color}25` : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoading ? (
                                        <motion.div
                                            className="w-[18px] h-[18px] border-2 rounded-full"
                                            style={{ borderColor: `${twin.color}30`, borderTopColor: twin.color }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    ) : (
                                        <Send size={18} style={{ color: input.trim() ? twin.color : isDark ? '#52525b' : '#a1a1aa' }} />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!activeTwin && !councilMode && <BottomNav />}
        </div>
    );
}
