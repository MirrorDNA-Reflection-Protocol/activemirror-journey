import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const navItems = [
    { label: 'Start', href: '/start', featured: true },
    { label: 'Mirror', href: '/mirror' },
    { label: 'Privacy', href: '/privacy' },
];

export default function HomePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(76,29,149,0.18),rgba(0,0,0,1)_62%)]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-40" />

            <nav className="relative z-20 border-b border-purple-500/10 bg-black/70 px-3 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-zinc-400 sm:gap-x-8 sm:text-sm">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            className={`transition hover:text-white ${item.featured ? 'text-purple-300' : ''}`}
                        >
                            {item.featured ? <span className="mr-1 text-purple-300">✦</span> : null}
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>

            <main className="relative z-10 flex min-h-[calc(100vh-52px)] items-center justify-center px-4 py-8 sm:px-6">
                <section className="min-w-0 w-full max-w-2xl rounded-[2rem] border border-purple-500/20 bg-zinc-950/60 px-6 py-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.12)] ring-1 ring-white/5 backdrop-blur-3xl sm:px-12 sm:py-14">
                    <div className="mx-auto mb-7 flex flex-col items-center justify-center">
                        <Logo size={54} theme="violet" />
                        <div className="-mt-1 text-[11px] font-bold uppercase leading-none tracking-[-0.02em] text-white">
                            Active
                            <br />
                            Mirror
                        </div>
                    </div>

                    <h1 className="mx-auto max-w-[10ch] bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-[2.65rem] font-bold leading-[0.95] tracking-[-0.04em] text-transparent sm:text-7xl sm:tracking-[-0.06em]">
                        Intelligence
                        <br />
                        Reflected.
                    </h1>

                    <p className="mx-auto mt-6 max-w-lg text-lg font-light leading-8 text-zinc-400 sm:text-xl">
                        Start with one real thing. Get the clearer question, the next move, and a mirror that stays yours.
                    </p>

                    <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3">
                        <Link
                            to="/start"
                            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.34)] transition hover:scale-[1.01] hover:shadow-[0_0_42px_rgba(168,85,247,0.44)] active:scale-[0.99]"
                        >
                            Start Reflection
                            <ArrowRight size={22} className="transition group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/mirror"
                            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-purple-500/20 bg-white/[0.06] px-6 py-4 text-base font-semibold text-white shadow-[0_0_18px_rgba(168,85,247,0.08)] transition hover:border-purple-500/35 hover:bg-purple-500/10"
                        >
                            Reflect now
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-left sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                            <div className="text-sm font-semibold text-white">One move</div>
                            <div className="mt-1 text-xs leading-5 text-zinc-500">Less advice. A cleaner next step.</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                            <div className="text-sm font-semibold text-white">Private first</div>
                            <div className="mt-1 text-xs leading-5 text-zinc-500">Nothing becomes memory unless you choose it.</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                            <div className="text-sm font-semibold text-white">Yours to keep</div>
                            <div className="mt-1 text-xs leading-5 text-zinc-500">Your MirrorSeed stays in this browser.</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
