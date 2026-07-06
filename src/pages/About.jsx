import { ArrowLeft, ArrowRight, Check, HeartHandshake, Lock, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const whatItDoes = [
    'Turns a messy thought into a useful next step.',
    'Helps draft, decide, simplify, compare, or make something sendable.',
    'Keeps saved context as a choice, not a trap.',
];

const whatItAvoids = [
    'It should not flatter you just to keep the conversation smooth.',
    'It should not turn one sentence into a lecture.',
    'It should not quietly keep private context you did not choose to save.',
];

export default function About() {
    return (
        <div className="min-h-dvh bg-[#050507] text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(126,87,255,0.18),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(34,211,238,0.10),transparent_30%),#050507]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

            <main className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:py-14">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Active Mirror
                </Link>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
                    <header>
                        <div className="mb-6 grid h-14 w-14 place-items-center rounded-[1.25rem] border border-violet-200/20 bg-white/[0.05] shadow-[0_0_42px_rgba(168,85,247,0.16)]">
                            <Sparkles size={23} className="text-cyan-100" />
                        </div>
                        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.05em] sm:text-7xl">
                            Built for people who want AI to help, not overwhelm.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                            Active Mirror started from a simple problem: AI can answer almost anything, but it often misses what the person is really trying to move.
                        </p>
                    </header>

                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_70px_rgba(34,211,238,0.08)]">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/[0.08] text-emerald-100">
                                <HeartHandshake size={18} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-white">The idea</p>
                                <p className="text-xs text-zinc-500">One thing first.</p>
                            </div>
                        </div>
                        <p className="text-sm leading-7 text-zinc-300">
                            Bring what you want. Active Mirror helps shape the next useful move, then lets you decide what stays.
                        </p>
                    </div>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.07] text-cyan-100">
                                <Check size={17} />
                            </span>
                            <h2 className="text-xl font-semibold tracking-[-0.03em]">What it is for</h2>
                        </div>
                        <ul className="space-y-3 text-sm leading-7 text-zinc-300">
                            {whatItDoes.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-violet-200/20 bg-violet-300/[0.07] text-violet-100">
                                <X size={17} />
                            </span>
                            <h2 className="text-xl font-semibold tracking-[-0.03em]">What it should not do</h2>
                        </div>
                        <ul className="space-y-3 text-sm leading-7 text-zinc-300">
                            {whatItAvoids.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="mt-4 rounded-[1.6rem] border border-emerald-300/15 bg-emerald-300/[0.065] p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <Lock size={18} className="text-emerald-100" />
                        <h2 className="text-xl font-semibold tracking-[-0.03em]">The privacy line</h2>
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-zinc-300">
                        Use it with one sentence, a private note, or a bigger workflow. The important part is choice: you decide what to send, what to save, and what to clear.
                    </p>
                </section>

                <section className="mt-10 flex flex-wrap gap-3">
                    <Link
                        to="/"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 text-sm font-bold text-white shadow-[0_0_42px_rgba(168,85,247,0.24)] transition hover:-translate-y-0.5"
                    >
                        Start with one thing
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/enterprise"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 text-sm font-bold text-zinc-200 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:text-white"
                    >
                        For teams
                    </Link>
                </section>
            </main>
        </div>
    );
}
