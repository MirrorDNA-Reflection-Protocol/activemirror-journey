import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Trash2, StopCircle, Plus, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ConsentGate from '../components/ConsentGate';

// --- SONIC IDENTITY ENGINE (Procedural Audio) ---
const SoundEngine = {
    ctx: null,
    init: () => {
        if (!SoundEngine.ctx) {
            SoundEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (SoundEngine.ctx.state === 'suspended') SoundEngine.ctx.resume();
    },
    playClick: () => {
        if (!SoundEngine.ctx) return;
        const osc = SoundEngine.ctx.createOscillator();
        const gain = SoundEngine.ctx.createGain();
        osc.connect(gain);
        gain.connect(SoundEngine.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, SoundEngine.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, SoundEngine.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, SoundEngine.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, SoundEngine.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(SoundEngine.ctx.currentTime + 0.1);
    },
    playHover: () => {
        if (!SoundEngine.ctx) return;
        const osc = SoundEngine.ctx.createOscillator();
        const gain = SoundEngine.ctx.createGain();
        osc.connect(gain);
        gain.connect(SoundEngine.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, SoundEngine.ctx.currentTime);

        gain.gain.setValueAtTime(0.01, SoundEngine.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, SoundEngine.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(SoundEngine.ctx.currentTime + 0.05);
    },
    playSend: () => {
        if (!SoundEngine.ctx) return;
        const osc = SoundEngine.ctx.createOscillator();
        const gain = SoundEngine.ctx.createGain();
        osc.connect(gain);
        gain.connect(SoundEngine.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, SoundEngine.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, SoundEngine.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.05, SoundEngine.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, SoundEngine.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(SoundEngine.ctx.currentTime + 0.3);
    }
};

// --- LIQUID TYPEWRITER COMPONENT ---
const LiquidText = ({ text }) => {
    // Simple parser for markdown
    const parse = (t) => {
        return t.split(/(⟡)/).map((part, i) => {
            if (part === '⟡') return <span key={i} className="text-purple-400 font-bold mx-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">⟡</span>;
            const formatted = part.split(/(\*\*.*?\*\*|\*.*?\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**'))
                    return <strong key={j} className="text-white font-semibold">{chunk.slice(2, -2)}</strong>;
                if (chunk.startsWith('*') && chunk.endsWith('*'))
                    return <em key={j} className="text-purple-200/80 italic">{chunk.slice(1, -1)}</em>;
                return chunk;
            });
            return <span key={i}>{formatted}</span>;
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {parse(text)}
        </motion.div>
    );
};


export default function Demo() {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem("mirror_chat_v10");
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isZen, setIsZen] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);

    if (!hasConsented) return <ConsentGate onConsent={() => setHasConsented(true)} />;

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortController = useRef(null);
    const zenTimeout = useRef(null);

    // --- REACTIVE BACKGROUND STATE ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    // Parallax transforms
    const blob1X = useTransform(springX, [0, window.innerWidth], [-50, 50]);
    const blob1Y = useTransform(springY, [0, window.innerHeight], [-50, 50]);
    const blob2X = useTransform(springX, [0, window.innerWidth], [50, -50]);
    const blob2Y = useTransform(springY, [0, window.innerHeight], [50, -50]);

    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            // Zen Mode Reset
            setIsZen(false);
            clearTimeout(zenTimeout.current);
            zenTimeout.current = setTimeout(() => {
                if (!inputRef.current?.value && messages.length > 0) {
                    setIsZen(true);
                }
            }, 3000);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("click", () => SoundEngine.init()); // Init audio context

        console.log("⟡ Mirror v12.0 ZENITH Mounted");

        return () => {
            window.removeEventListener("mousemove", handleMove);
            clearTimeout(zenTimeout.current);
        };
    }, [messages.length]);

    // Persistence
    useEffect(() => {
        localStorage.setItem("mirror_chat_v10", JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        SoundEngine.playSend();
        setIsZen(false);

        const userMsg = input;
        setInput("");
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        try {
            abortController.current = new AbortController();
            const PROXY_URL = window.location.hostname === 'localhost' ? 'http://localhost:8082' : 'https://proxy.activemirror.ai';

            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
                    dial: 0.5
                }),
                signal: abortController.current.signal
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.status === "chunk" || data.status === "ok") {
                            setMessages(prev => {
                                const newHistory = [...prev];
                                const lastMsg = newHistory[newHistory.length - 1];
                                if (lastMsg.role === "assistant") lastMsg.content += data.content;
                                return newHistory;
                            });
                        }
                    } catch (e) { }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].content = "⟡ The mirror is silent.";
                    return newHistory;
                });
            }
        } finally {
            setIsLoading(false);
            abortController.current = null;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const cleanExit = () => {
        localStorage.removeItem("mirror_chat_v10");
        setMessages([]);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-purple-500/30"
        >
            {/* --- REACTIVE VOID (Background) --- */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-90 z-0" /> {/* Depth layer */}
                <motion.div
                    style={{ x: blob1X, y: blob1Y }}
                    className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black blur-[120px] opacity-40 mix-blend-screen"
                />
                <motion.div
                    style={{ x: blob2X, y: blob2Y }}
                    className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black blur-[100px] opacity-30 mix-blend-screen"
                />
            </div>

            {/* --- ZEN HEADER (Fades on idle) --- */}
            <motion.header
                animate={{ opacity: isZen ? 0 : 1, y: isZen ? -20 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center"
            >
                <a href="/" onClick={cleanExit} onMouseEnter={SoundEngine.playHover} className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all hover:border-white/10 hover:scale-105 active:scale-95">
                    <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Exit</span>
                </a>

                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl">
                    <span className="text-purple-400 text-lg animate-pulse shadow-purple-500/50">⟡</span>
                    <span className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">Zenith 12.1</span>
                </div>

                <div className="relative">
                    <button
                        onMouseEnter={SoundEngine.playHover}
                        onClick={() => { SoundEngine.playClick(); setIsMenuOpen(!isMenuOpen); }}
                        className={`p-3 rounded-full transition-all active:scale-90 ${isMenuOpen ? 'bg-white text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                    >
                        <Menu size={18} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                className="absolute top-full right-0 mt-3 w-56 bg-[#050505]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 py-1 overflow-hidden"
                            >
                                <button onClick={() => { setMessages([]); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <Plus size={16} /> New Reflection
                                </button>
                                <div className="h-px bg-white/5 mx-4 my-1" />
                                <a href="/" onClick={cleanExit} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <ArrowLeft size={16} /> Reality
                                </a>
                                <a href="https://github.com/MirrorDNA-Reflection-Protocol" target="_blank" className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <Sparkles size={16} /> Source
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* --- CHAT AREA --- */}
            <div className="flex-1 overflow-y-auto px-4 pt-32 pb-40 scrollbar-hide z-10 relative mask-image-gradient">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 180, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="mb-10 relative pointer-events-none"
                        >
                            <div className="absolute inset-0 bg-purple-500/10 blur-[50px] rounded-full w-64 h-64 -translate-x-1/2 -translate-y-1/2" />
                            <span className="text-7xl relative z-10 text-purple-500/50 font-thin">⟡</span>
                        </motion.div>
                        <h2 className="text-3xl font-thin text-white/90 mb-3 tracking-wide">The Mirror is Still.</h2>
                        <p className="text-zinc-600 font-light tracking-widest text-xs uppercase">Begin the reflection</p>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className={`flex mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start group'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-2xl px-8 py-6 rounded-[2rem] leading-loose backdrop-blur-md transition-all duration-500 ${msg.role === 'user'
                                ? 'bg-white/5 text-white border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]'
                                : 'text-zinc-200 hover:text-white'
                                }`}>
                                <div className={`whitespace-pre-wrap ${msg.role === 'assistant' ? 'font-light text-lg/loose' : 'font-normal'}`}>
                                    <LiquidText text={msg.content} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading State */}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start px-4">
                        <div className="flex gap-2 bg-white/5 px-4 py-3 rounded-full border border-white/5">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* --- ZEN INPUT (Fades on idle) --- */}
            <motion.div
                animate={{ opacity: isZen ? 0 : 1, y: isZen ? 20 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-8 left-0 right-0 px-4 z-20 flex justify-center"
            >
                <motion.div className="w-full max-w-2xl relative group">
                    <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-500 group-focus-within:border-purple-500/30 group-focus-within:shadow-[0_0_40px_rgba(168,85,247,0.1)]" />

                    <form onSubmit={handleSend} className="relative flex items-end gap-3 p-2 pl-6">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Reflect..."
                            rows={1}
                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-white placeholder-zinc-600 py-4 max-h-40 min-h-[56px] leading-relaxed text-lg font-light"
                            autoFocus
                        />

                        {isLoading ? (
                            <button
                                type="button"
                                onClick={() => abortController.current?.abort()}
                                onMouseEnter={SoundEngine.playHover}
                                onClickCapture={SoundEngine.playClick}
                                className="p-4 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95 mb-1 mr-1"
                            >
                                <StopCircle size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                onMouseEnter={SoundEngine.playHover}
                                className="p-4 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-0 disabled:scale-75 transition-all duration-500 mb-1 mr-1 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-90"
                            >
                                <Send size={20} fill="currentColor" className="ml-0.5" />
                            </button>
                        )}
                    </form>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
