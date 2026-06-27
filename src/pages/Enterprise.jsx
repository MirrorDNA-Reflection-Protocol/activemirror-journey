import { ArrowLeft, ArrowRight, CheckCircle, FileCheck2, Lock, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const outcomes = [
    'One workflow reflected into a usable next move.',
    'Source-sensitive claims marked before reliance.',
    'Private context kept out unless explicitly needed.',
    'Plain-language receipt for what was used, left out, and checked.',
];

const proofSteps = [
    {
        title: 'Bring one workflow',
        text: 'A decision, research flow, approval path, or recurring task where AI output needs review before action.',
    },
    {
        title: 'Run it through the mirror',
        text: 'Active Mirror reflects the real question, narrows broad claims, and creates one usable next move.',
    },
    {
        title: 'Read the receipt',
        text: 'You see what was used, what stayed out, what needed sources, and what should not be treated as proven.',
    },
];

export default function Enterprise() {
    return (
        <div className="min-h-dvh overflow-hidden bg-black text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.18),transparent_34%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-10 flex items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <Link to="/mirror" className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12]">
                        Open mirror
                    </Link>
                </nav>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-8">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                            <ShieldCheck size={14} />
                            Governed reflection for real work
                        </div>
                        <h1 className="max-w-[11ch] text-[3.25rem] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[5rem]">
                            Prove the work before it moves.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                            Active Mirror helps teams use AI without turning every output into a trust exercise. Bring one workflow. Get one next move, one receipt, and a clear view of what still needs proof.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="mailto:paul@activemirror.ai?subject=Active%20Mirror%20enterprise%20proof"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-black shadow-[0_0_34px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
                            >
                                Start a proof sprint
                                <ArrowRight size={17} />
                            </a>
                            <Link
                                to="/"
                                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-200 transition hover:border-purple-300/30 hover:text-white"
                            >
                                Try it first
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                                    <FileCheck2 size={18} />
                                </span>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">What you get</h2>
                            </div>
                            <div className="grid gap-3">
                                {outcomes.map((item) => (
                                    <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300">
                                        <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-purple-100">
                                    <Workflow size={18} />
                                </span>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">72-hour proof</h2>
                            </div>
                            <div className="grid gap-3">
                                {proofSteps.map((step, index) => (
                                    <div key={step.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                            <span>{String(index + 1).padStart(2, '0')}</span>
                                            <span>{step.title}</span>
                                        </div>
                                        <p className="text-sm leading-6 text-zinc-400">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.07] p-5">
                        <Lock size={20} className="mb-4 text-emerald-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Private first</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">Use only what the workflow needs. Sensitive context stays out unless explicitly approved.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
                        <Sparkles size={20} className="mb-4 text-cyan-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Reflection first</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">The system challenges vague claims, narrows the work, and keeps the next move concrete.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-purple-300/15 bg-purple-300/[0.07] p-5">
                        <FileCheck2 size={20} className="mb-4 text-purple-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Receipts by default</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">Every serious turn can show what was used, what was excluded, and what still needs proof.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
