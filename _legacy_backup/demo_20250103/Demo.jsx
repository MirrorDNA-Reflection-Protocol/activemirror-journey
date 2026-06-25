import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Zap, Trash2, Cpu } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';
import { Link } from 'react-router-dom';

// --------------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------------
const SYSTEM_PROMPT = "You are Active Mirror — a reflective thinking partner. You help users think, not tell them what to do. Surface assumptions, reflect trade-offs, ask clarifying questions. Tag uncertainty honestly. The user makes final decisions. You're a mirror, not a driver.";

// Device Detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const MODEL = isMobile
    ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"
    : "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export default function Demo() {
    const [input, setInput] = useState("");

    // Persistence with Lazy Init
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem("mirror_chat_history");
            return saved ? JSON.parse(saved) : [{ role: "assistant", content: "⟡ Intelligence Reflected. Ready." }];
        } catch {
            return [{ role: "assistant", content: "⟡ Intelligence Reflected. Ready." }];
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [engine, setEngine] = useState(null);
    const [progress, setProgress] = useState("");
    const [stats, setStats] = useState({ tps: 0 });
    const [hasShownPromo, setHasShownPromo] = useState(false);
    const bottomRef = useRef(null);

    // --------------------------------------------------------------------------
    // 1. ENGINE INITIALIZATION (WEB WORKER)
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (engine) return;

        async function init() {
            setProgress(`Initializing ${MODEL.split('-')[0]} ${isMobile ? '(Mobile)' : '(Core)'}...`);
            try {
                // Create Inline Worker via Blob to avoid GitHub Pages path issues
                // Using explicit version matching @0.2.80 to ensure compatibility
                const workerScript = `
            import { WebWorkerMLCEngineHandler } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.80/+esm";
            const handler = new WebWorkerMLCEngineHandler();
            self.onmessage = (msg) => { handler.onmessage(msg); };
        `;
                const blob = new Blob([workerScript], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(blob);
                const worker = new Worker(workerUrl, { type: 'module' });

                const eng = await CreateWebWorkerMLCEngine(worker, MODEL, {
                    initProgressCallback: (report) => setProgress(report.text)
                });
                setEngine(eng);
                setProgress("");
            } catch (e) {
                setProgress(`Error: ${e.message}`);
            }
        }
        init();
    }, [engine]);

    // --------------------------------------------------------------------------
    // 2. AUTO-SCROLL & SYNC
    // --------------------------------------------------------------------------
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    useEffect(() => {
        localStorage.setItem("mirror_chat_history", JSON.stringify(messages));
    }, [messages]);

    // --------------------------------------------------------------------------
    // 3. HANDLERS
    // --------------------------------------------------------------------------
    const handleClear = () => {
        const fresh = [{ role: "assistant", content: "⟡ Intelligence Reflected. Ready." }];
        setMessages(fresh);
        localStorage.setItem("mirror_chat_history", JSON.stringify(fresh));
        setHasShownPromo(false); // Reset promo state
    };

    const handleSend = async () => {
        if (!input.trim() || !engine) return;
        const userMsg = input;
        setInput("");

        // Optimistic Update
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            // 1. Prepare Messages (Inject System Prompt)
            const conversationHistory = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.filter(m => !m.isPromo), // Exclude promo from context
                { role: "user", content: userMsg }
            ];

            // 2. Stream Response
            const chunks = await engine.chat.completions.create({
                messages: conversationHistory,
                stream: true
            });

            let fullResponse = "";
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            let startTime = performance.now();
            let tokens = 0;

            for await (const chunk of chunks) {
                const delta = chunk.choices[0]?.delta?.content || "";
                fullResponse += delta;
                tokens++;

                // Update UI
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullResponse;
                    return newArr;
                });

                // Update Stats
                if (tokens % 5 === 0) {
                    const elapsed = (performance.now() - startTime) / 1000;
                    setStats({ tps: Math.round(tokens / elapsed) });
                }
            }

            // 3. Post-Response Actions (Onboarding Link)
            // Check if user has sent at least 1 message (this one) and we haven't shown promo
            const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
            if (userMessageCount >= 1 && !hasShownPromo) {
                setMessages(prev => [...prev, {
                    role: "system",
                    content: "Want your own identity kernel? → id.activemirror.ai",
                    isPromo: true
                }]);
                setHasShownPromo(true);
            }

        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: `[ERROR]: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --------------------------------------------------------------------------
    // UI RENDER
    // --------------------------------------------------------------------------
    return (
        <main className="relative min-h-screen bg-black text-white font-sans selection:bg-green-500/30 flex flex-col overflow-hidden">
            {/* BACKGROUND NOISE */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* HEADER */}
            <header className="fixed top-0 inset-x-0 p-4 z-50 flex items-center justify-between pointer-events-none">
                <Link to="/" className="p-2 rounded-full bg-white/5 backdrop-blur border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[10px] font-mono text-zinc-400 pointer-events-auto">
                    {/* Clear Button */}
                    <button onClick={handleClear} className="hover:text-red-400 transition-colors flex items-center gap-1" title="Clear Memory">
                        <Trash2 size={12} />
                    </button>
                    <div className="w-px h-3 bg-white/10"></div>

                    <div className="flex items-center gap-2">
                        <Zap size={10} className={stats.tps > 0 ? "text-green-500" : "text-zinc-600"} />
                        {stats.tps > 0 ? `${stats.tps} T/s` : "IDLE"}
                    </div>
                </div>
            </header>

            {/* CENTER GLASS PANEL */}
            <div className="flex-1 max-w-2xl w-full mx-auto relative flex flex-col pt-20 pb-4 px-4 h-full">

                {/* LOADING OVERLAY */}
                {progress && (
                    <div className="absolute inset-x-4 top-20 z-50 p-6 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl text-center shadow-2xl">
                        <MirrorLogo className="w-8 h-8 mx-auto mb-4 animate-spin-slow text-green-500" />
                        <div className="text-sm font-medium animate-pulse">{progress}</div>
                        <div className="text-xs text-zinc-500 mt-2 font-mono uppercase tracking-widest">
                            {isMobile ? "Mobile Neural Engine" : "Desktop Matrix Core"}
                        </div>
                    </div>
                )}

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto space-y-6 pb-4 no-scrollbar">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}>
                            {msg.isPromo ? (
                                // PROMO STYLE
                                <a href="https://id.activemirror.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-green-400 transition-colors cursor-pointer border-b border-dashed border-zinc-700 hover:border-green-400 pb-0.5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    {msg.content}
                                </a>
                            ) : (
                                // STANDARD BUBBLE
                                <div className={
                                    msg.role === 'user'
                                        ? "max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed backdrop-blur-sm bg-white text-black shadow-lg font-medium"
                                        : "max-w-[85%] w-full p-4 rounded-2xl text-[15px] leading-relaxed backdrop-blur-sm bg-white/5 border border-white/10 text-zinc-200"
                                }>
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="mt-auto">
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl focus-within:border-white/20 transition-colors">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isLoading ? "Reflecting..." : "Initialize instruction..."}
                            disabled={isLoading || !!progress}
                            className="w-full bg-transparent p-4 pr-12 outline-none text-white placeholder-zinc-600 text-base"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !!progress}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-0 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-center mt-3 text-[10px] text-zinc-600 font-mono flex items-center justify-center gap-2">
                        <Cpu size={10} />
                        <span>RUNNING LOCAL • {MODEL.split('-')[0]} • {isMobile ? "MOBILE" : "DESKTOP"}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
