import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const papers = [
    {
        title: 'SCD Protocol v3.1',
        detail: 'A published protocol for making AI-assisted work inspectable, bounded, and repeatable.',
        href: 'https://doi.org/10.5281/zenodo.17787618',
        label: 'Open DOI',
    },
    {
        title: 'SCD Protocol v4',
        detail: 'A later package for protocol evaluation, deployment evidence, and governance-oriented AI workflows.',
        href: 'https://doi.org/10.5281/zenodo.18910362',
        label: 'Open DOI',
    },
    {
        title: 'MirrorDNA protocol',
        detail: 'Public source trail for identity, continuity, and reflective AI language around Active Mirror.',
        href: 'https://github.com/MirrorDNA-Reflection-Protocol/MirrorDNA',
        label: 'Open source',
    },
];

const proofPoints = [
    ['Research', 'Published protocols and source-backed product claims before public language.'],
    ['Deployment', 'A governed institutional workflow pattern tested around research, sources, and approval.'],
    ['Boundary', 'Client names and private material stay out unless explicitly approved for publication.'],
];

export default function Research() {
    return (
        <div className="min-h-dvh overflow-hidden bg-[#050507] text-white selection:bg-cyan-300/25">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_88%_72%,rgba(168,85,247,0.14),transparent_34%),#050507]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-12 flex items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-semibold text-zinc-500">
                        <Link to="/" className="transition hover:text-white">Try it</Link>
                        <Link to="/enterprise" className="transition hover:text-white">Business</Link>
                    </div>
                </nav>

                <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_0_70px_rgba(34,211,238,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-8">
                        <div className="mb-8 grid h-16 w-16 place-items-center rounded-[1.35rem] border border-cyan-200/20 bg-white/[0.045] shadow-[0_0_38px_rgba(34,211,238,0.14)]">
                            <BookOpen className="h-8 w-8 text-cyan-100" />
                        </div>
                        <h1 className="max-w-[12ch] text-[3.05rem] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[4.9rem]">
                            Research & deployment.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                            Active Mirror is built from published protocols, public source trails, and live workflow lessons. Claims stay bounded to what can be checked.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="https://doi.org/10.5281/zenodo.17787618"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(34,211,238,0.22)] transition hover:scale-[1.01]"
                            >
                                Read the protocol
                                <ExternalLink size={16} />
                            </a>
                            <Link
                                to="/enterprise"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300/30 hover:text-white"
                            >
                                See deployment path
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {proofPoints.map(([title, text], index) => (
                            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 ring-1 ring-white/[0.03] backdrop-blur-xl">
                                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] font-mono text-xs font-semibold text-cyan-100">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="text-base font-semibold text-white">{title}</div>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Public trail.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Research belongs here when it can be opened, cited, or inspected.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {papers.map((paper) => (
                            <a
                                key={paper.title}
                                href={paper.href}
                                target="_blank"
                                rel="noreferrer"
                                className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/[0.055]"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-white">{paper.title}</div>
                                    <ExternalLink className="h-4 w-4 text-zinc-500 transition group-hover:text-cyan-100" />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{paper.detail}</p>
                                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/70">{paper.label}</div>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.06] p-6 ring-1 ring-white/[0.04]">
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-[1.1rem] border border-emerald-200/20 bg-black/25">
                            <ShieldCheck className="h-6 w-6 text-emerald-100" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Real work, safely anonymized.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                            A source-heavy institutional workflow became clearer: selected sources in, weak claims held, human review before anything went out.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-[1.1rem] border border-violet-200/20 bg-black/25">
                            <FileCheck2 className="h-6 w-6 text-violet-100" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Proof you can open.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            Two DOI records, a public source trail, and a safely anonymized deployment story you can inspect before a call.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
