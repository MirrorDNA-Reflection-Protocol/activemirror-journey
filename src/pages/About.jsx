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
        <div className="am-theme-parity min-h-dvh bg-[var(--am-canvas)] text-white">
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

            <main className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:py-14">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Active Mirror
                </Link>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
                    <header>
                        <div className="mb-6 grid h-14 w-14 place-items-center rounded-lg border border-blue-200/20 bg-white/[0.05]">
                            <Sparkles size={23} className="text-cyan-100" />
                        </div>
                        <h1 className="max-w-3xl text-5xl font-semibold leading-none sm:text-7xl">
                            Built for people who want AI to help, not overwhelm.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                            Active Mirror started from a simple problem: AI can answer almost anything, but it often misses what the person is really trying to move.
                        </p>
                    </header>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-200/20 bg-emerald-300/[0.08] text-emerald-100">
                                <HeartHandshake size={18} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-white">The idea</p>
                                <p className="text-xs text-zinc-400">One thing first.</p>
                            </div>
                        </div>
                        <p className="text-sm leading-7 text-zinc-300">
                            Bring what you want. Active Mirror helps shape the next useful move, then lets you decide what stays.
                        </p>
                    </div>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/[0.07] text-cyan-100">
                                <Check size={17} />
                            </span>
                            <h2 className="text-xl font-semibold">What it is for</h2>
                        </div>
                        <ul className="space-y-3 text-sm leading-7 text-zinc-300">
                            {whatItDoes.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-lg border border-blue-200/20 bg-blue-300/[0.07] text-blue-100">
                                <X size={17} />
                            </span>
                            <h2 className="text-xl font-semibold">What it should not do</h2>
                        </div>
                        <ul className="space-y-3 text-sm leading-7 text-zinc-300">
                            {whatItAvoids.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.065] p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <Lock size={18} className="text-emerald-100" />
                        <h2 className="text-xl font-semibold">The privacy line</h2>
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-zinc-300">
                        Use it with one sentence, a private note, or a bigger workflow. The important part is choice: you decide what to send, what to save, and what to clear.
                    </p>
                </section>

                <section className="mt-10 flex flex-wrap gap-3">
                    <Link
                        to="/"
                        className="am-primary-action inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-bold"
                    >
                        Start with one thing
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/enterprise"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 text-sm font-bold text-zinc-200 transition hover:border-cyan-200/35 hover:text-white"
                    >
                        For teams
                    </Link>
                </section>
            </main>
        </div>
    );
}
