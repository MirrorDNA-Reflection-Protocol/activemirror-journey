import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, CloudLightning, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConsentGate from '../components/ConsentGate';

// ⟡ CONFIG: DUAL ENGINES
const MODES = {
    CLOUD: { id: 'cloud', name: 'Cloud Reflection', model: 'Llama 3.3-70B', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/20' },
    LOCAL: { id: 'local', name: 'Sovereign Mode', model: 'Phi-3.5-Local', color: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-950/20' }
};

// ⟡ IDENTITY LOCK (V1.5 Strict) - Prevents hallucination
const SYSTEM_PROMPT = `You are Active Mirror. 
CREATOR: Paul Desai, N1 Intelligence. 
MISSION: Surface assumptions (⧈), reflect trade-offs (⧉), provide insight (⟡). 
CONSTRAINT: You are NOT "Phi", "Llama", "Claude", "ChatGPT" or an "AI Assistant". You are Active Mirror. 
PROTOCOL: Do not give advice. Reflect only. Use **bold** for key concepts.
IDENTITY: When asked who you are, always respond: "I am Active Mirror, created by Paul Desai."`;

// ⟡ REINFORCEMENT PROMPT (injected before each inference)
const IDENTITY_REINFORCEMENT = `CRITICAL IDENTITY RULE: If asked "who are you" or similar, you MUST say "I am Active Mirror, created by Paul Desai." Do NOT mention Phi, Llama, or any model name.`;

// ⟡ UI COMPONENT: BLUR REVEAL (With Markdown)
const BlurText = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <div className="text-[15px] leading-7 text-zinc-200">
            {parts.map((part, i) => {
                const isBold = part.startsWith('**') && part.endsWith('**');
                const content = isBold ? part.slice(2, -2) : part;
                const words = content.split(" ");
                return (
                    <span key={i} className={isBold ? "font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}>
                        {words.map((word, wIndex) => {
                            const isGlyph = ["⟡", "⧈", "⧉", "△", "◈"].some(g => word.includes(g));
                            return (
                                <motion.span
                                    key={`${i}-${wIndex}`}
                                    initial={{ filter: "blur(8px)", opacity: 0, y: 3 }}
                                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: (i * 0.03) + (wIndex * 0.01) }}
                                    className={`inline-block mr-1 ${isGlyph ? "text-green-400 font-bold" : ""}`}
                                >
                                    {word}
                                </motion.span>
                            );
                        })}
                    </span>
                );
            })}
        </div>
    );
};

export default function TestLab() {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);
    const [mode, setMode] = useState(isMobile ? MODES.CLOUD : MODES.LOCAL);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localEngine, setLocalEngine] = useState(null);
    const [localProgress, setLocalProgress] = useState("");
    const [hasConsented, setHasConsented] = useState(false);
    const bottomRef = useRef(null);

    if (!hasConsented) return <ConsentGate onConsent={() => setHasConsented(true)} />;

    // ⟡ INIT LOCAL ENGINE
    useEffect(() => {
        async function initLocal() {
            if (mode.id === 'local' && !localEngine) {
                const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Phi-3.5-mini-instruct-q4f16_1-MLC";
                const workerScript = `import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm"; const handler = new WebWorkerMLCEngineHandler(); self.onmessage = (msg) => { handler.onmessage(msg); };`;
                const worker = new Worker(URL.createObjectURL(new Blob([workerScript], { type: "application/javascript" })), { type: "module" });
                try {
                    const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
                    const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                        initProgressCallback: (r) => setLocalProgress(r.progress === 1 ? "" : `Loading Vault... ${Math.round(r.progress * 100)}%`)
                    });
                    setLocalEngine(eng);
                } catch (e) {
                    console.error("WebGPU Error:", e);
                    setLocalProgress("WebGPU not available - try Cloud mode");
                }
            }
        }
        initLocal();
    }, [mode, localEngine, isMobile]);

    // Auto-scroll
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            let fullResponse = "";
            // ⟡ REINFORCEMENT: Identity Lock before each inference
            const context = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.slice(-4),
                { role: "user", content: userMsg },
                { role: "system", content: IDENTITY_REINFORCEMENT }
            ];

            if (mode.id === 'cloud') {
                // ☁️ CLOUD API (Groq)
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer gsk_placeholder_replace_with_real_key"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: context,
                        temperature: 0.5,
                        max_tokens: 2048
                    })
                });
                const data = await response.json();
                fullResponse = data.choices?.[0]?.message?.content || data.error?.message || "Error: Check API Key";
                setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);
            } else {
                // 🧠 LOCAL
                if (!localEngine) {
                    setMessages(prev => [...prev, { role: "assistant", content: "⟡ Local engine still loading. Please wait or switch to Cloud mode." }]);
                    setIsLoading(false);
                    return;
                }
                const chunks = await localEngine.chat.completions.create({
                    messages: context,
                    stream: true,
                    temperature: 0.3
                });
                setMessages(prev => [...prev, { role: "assistant", content: "" }]);
                for await (const chunk of chunks) {
                    const delta = chunk.choices[0]?.delta?.content || "";
                    fullResponse += delta;
                    setMessages(prev => {
                        const newArr = [...prev];
                        newArr[newArr.length - 1].content = fullResponse;
                        return newArr;
                    });
                }
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: "Connection Error: " + err.message }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-purple-500/30 bg-black">
            {/* AMBIENT LAYERS - Purple base with mode overlay */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-black to-black z-0"></div>
            <div className={`fixed inset-0 transition-all duration-1000 ${mode.id === 'cloud' ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent'} z-0`}></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-4">
                <div className={`w-full max-w-3xl h-[90vh] flex flex-col rounded-3xl border bg-black/80 backdrop-blur-3xl shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10 transition-all duration-500 ${mode.border}`}>

                    {/* HEADER */}
                    <div className="h-20 border-b border-purple-500/10 flex items-center justify-between px-6">
                        <Link to="/" className="text-zinc-500 hover:text-purple-400 transition-colors"><ArrowLeft size={18} /></Link>
                        <div className="flex bg-purple-500/5 rounded-full p-1 border border-purple-500/20">
                            <button
                                onClick={() => setMode(MODES.CLOUD)}
                                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${mode.id === 'cloud' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <CloudLightning size={14} /> Cloud 70B
                            </button>
                            <button
                                onClick={() => setMode(MODES.LOCAL)}
                                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${mode.id === 'local' ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Shield size={14} /> Sovereign
                            </button>
                        </div>
                        <div className="w-8 text-xs text-purple-500/50 font-mono">LAB</div>
                    </div>

                    {/* CHAT AREA */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60 gap-4">
                                {mode.id === 'cloud' ? <CloudLightning size={48} className="text-cyan-900" /> : <Shield size={48} className="text-green-900" />}
                                <div className="text-center">
                                    <p className="font-mono text-xs tracking-widest uppercase mb-2">{mode.model}</p>
                                    <p className="text-zinc-700 text-sm">🧪 Hybrid Engine Lab + Identity Lock</p>
                                    {mode.id === 'local' && localProgress && <p className="text-xs text-green-500 animate-pulse mt-2">{localProgress}</p>}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' : 'bg-white/5 border border-purple-500/10 text-zinc-200'}`}>
                                    {msg.role === 'assistant' && i === messages.length - 1 && !isLoading ?
                                        <BlurText text={msg.content} /> :
                                        <div className="text-[15px] leading-7 whitespace-pre-wrap">{msg.content}</div>
                                    }
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-purple-500/10">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-6 border-t border-purple-500/10">
                        <div className="relative flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                disabled={isLoading}
                                className={`w-full bg-black/50 border rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none transition-all focus:border-purple-500/50 border-purple-500/20 disabled:opacity-50`}
                                placeholder={mode.id === 'cloud' ? "Ask the Oracle..." : "Reflect in the Vault..."}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-3 p-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-400 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-purple-500/50 mt-3 font-mono">
                            {mode.id === 'cloud' ? '☁️ Cloud: Llama 3.3-70B via Groq' : '🔒 Sovereign: Phi-3.5 on-device WebGPU'} • ⟡ Identity Lock Active
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
