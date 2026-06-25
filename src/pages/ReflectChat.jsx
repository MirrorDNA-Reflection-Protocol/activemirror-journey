import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArchetype } from '../lib/mirror-state';

const GATEWAY = 'https://gateway.activemirror.ai/v1/mirror/create';

function Visual({ visual }) {
    if (!visual) return null;

    if (visual.kind === 'reframe') {
        return (
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-[0_1px_0_rgba(11,18,32,0.03)]">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">The real question</div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="text-sm text-slate-400 line-through decoration-slate-200">{visual.left}</div>
                    <div className="text-emerald-700">→</div>
                    <div className="text-sm font-semibold text-slate-950">{visual.right}</div>
                </div>
            </div>
        );
    }

    if (visual.kind === 'axes') {
        return (
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-[0_1px_0_rgba(11,18,32,0.03)]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {visual.note || 'Two forces in tension'}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4 text-sm font-semibold">
                    <div className="text-right text-slate-950">{visual.left}</div>
                    <div className="w-px bg-slate-200" />
                    <div className="text-emerald-700">{visual.right}</div>
                </div>
            </div>
        );
    }

    if (visual.kind === 'spectrum') {
        return (
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-[0_1px_0_rgba(11,18,32,0.03)]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {visual.note || 'A range, not a binary'}
                </div>
                <div className="mb-3 h-1 rounded-full bg-gradient-to-r from-slate-950 to-emerald-700" />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <span>{visual.left}</span>
                    <span className="text-right text-emerald-700">{visual.right}</span>
                </div>
            </div>
        );
    }

    return null;
}

function MirrorTurn({ data }) {
    const mirror = data.mirror || {};
    const keptOut = mirror.receipt?.context_excluded || 'private context kept out';

    return (
        <div className="flex flex-col gap-3">
            <div className="max-w-[46rem] text-[1.05rem] leading-7 tracking-[-0.01em] text-slate-950">
                {mirror.reflection}
            </div>
            <Visual visual={mirror.visual} />
            <div className="flex max-w-[46rem] gap-3 rounded-2xl border border-emerald-800/15 bg-emerald-800/[0.06] px-4 py-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">One thing</div>
                    <div className="mt-1 text-sm leading-6 text-slate-950">{mirror.move}</div>
                </div>
            </div>
            <div className="font-mono text-xs text-slate-400">reflected from your words only · {keptOut}</div>
        </div>
    );
}

export default function ReflectChat() {
    const [seed] = useState(() => getArchetype());
    const [turns, setTurns] = useState([{ who: 'mirror', intro: true }]);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const turnNum = useRef(0);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [turns, busy]);

    async function ask(intent) {
        setTurns((current) => [...current, { who: 'you', text: intent }]);
        setBusy(true);

        try {
            turnNum.current += 1;
            const seededIntent = seed
                ? `MirrorSeed: ${seed.archetypeName || seed.archetype}. Strengths: ${(seed.strengths || []).join(', ') || 'unknown'}. User intent: ${intent}`
                : intent;
            const response = await fetch(GATEWAY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: seededIntent,
                    boundary: 'personal',
                    route: 'reflection',
                    turn: turnNum.current,
                }),
            });
            const data = await response.json();

            setTurns((current) => [
                ...current,
                data.ok
                    ? { who: 'mirror', data }
                    : { who: 'mirror', error: 'I held that one back because it looked like it carried a secret. Nothing was sent.' },
            ]);
        } catch {
            setTurns((current) => [
                ...current,
                { who: 'mirror', error: "Couldn't reach the mirror just now. Try again in a moment." },
            ]);
        } finally {
            setBusy(false);
        }
    }

    function submit(event) {
        event.preventDefault();
        const intent = text.trim();
        if (intent.length < 12 || busy) return;
        setText('');
        ask(intent);
    }

    return (
        <div className="flex h-dvh flex-col bg-[#fafbfd] text-slate-950">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
                <Link to="/" className="inline-flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                        <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="#0A6B42" strokeWidth="1.6" />
                        <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="#0A6B42" strokeWidth="1.6" />
                    </svg>
                    <div>
                        <div className="text-sm font-semibold tracking-[-0.01em]">Active Mirror</div>
                        <div className="hidden text-xs text-slate-500 sm:block">tells you what you need to hear</div>
                    </div>
                </Link>
                <Link to="/start" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300">
                    BrainScan
                </Link>
            </header>

            <main className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto flex max-w-[48rem] flex-col gap-7 px-4 py-7">
                    {turns.map((turn, index) => {
                        if (turn.who === 'you') {
                            return (
                                <div key={index} className="flex justify-end">
                                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white">
                                        {turn.text}
                                    </div>
                                </div>
                            );
                        }

                        if (turn.intro) {
                            return (
                                <div key={index} className="max-w-[44rem] text-[1.08rem] leading-7 tracking-[-0.01em]">
                                    Bring one real thing you are stuck on. Active Mirror will reflect the real question and give you one next move.
                                    {seed && (
                                        <div className="mt-4 inline-flex rounded-full border border-emerald-800/15 bg-emerald-800/[0.06] px-3 py-1 text-xs font-semibold text-emerald-800">
                                            Using your local seed: {seed.archetypeName || seed.archetype}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (turn.error) {
                            return <div key={index} className="max-w-[44rem] text-[1.08rem] leading-7">{turn.error}</div>;
                        }

                        return <MirrorTurn key={index} data={turn.data} />;
                    })}
                    {busy && <div className="text-slate-500">reflecting...</div>}
                    <div ref={endRef} />
                </div>
            </main>

            <footer className="border-t border-slate-200 bg-white px-3 py-3">
                <form className="mx-auto flex max-w-[48rem] items-end gap-2" onSubmit={submit}>
                    <textarea
                        rows={1}
                        value={text}
                        maxLength={1000}
                        placeholder="What's one thing you're stuck on?"
                        onChange={(event) => setText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                submit(event);
                            }
                        }}
                        className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-base leading-6 outline-none transition focus:border-emerald-700"
                    />
                    <button
                        type="submit"
                        disabled={busy || text.trim().length < 12}
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-xl text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send"
                    >
                        ↑
                    </button>
                </form>
                <div className="mx-auto mt-2 max-w-[48rem] text-center text-xs text-slate-400">One sentence is enough. Nothing is saved.</div>
            </footer>
        </div>
    );
}
