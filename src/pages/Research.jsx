import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const papers = [
    {
        title: 'SCD Protocol v3.1',
        detail: 'A public paper on making AI-assisted work easier to inspect and repeat.',
        href: 'https://doi.org/10.5281/zenodo.17787618',
        label: 'Open DOI',
    },
    {
        title: 'SCD Protocol v4',
        detail: 'A follow-up research package on evaluation, field lessons, and safer AI workflows.',
        href: 'https://doi.org/10.5281/zenodo.18910362',
        label: 'Open DOI',
    },
    {
        title: 'Source repository',
        detail: 'Open source material for identity, continuity, and reflective AI research around Active Mirror.',
        href: 'https://github.com/MirrorDNA-Reflection-Protocol/MirrorDNA',
        label: 'Open source',
    },
];

const proofPoints = [
    ['Why it matters', 'AI should make the next step clearer, not harder to trust.'],
    ['Field work', 'The pattern has been tested around research, review, and controlled sharing.'],
    ['Boundary', 'Private material stays out unless it is explicitly approved for publication.'],
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
                            How we build it.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                            For people who want to look deeper: open papers, source material, and field lessons behind Active Mirror.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="https://doi.org/10.5281/zenodo.17787618"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(34,211,238,0.22)] transition hover:scale-[1.01]"
                            >
                                Open paper
                                <ExternalLink size={16} />
                            </a>
                            <Link
                                to="/enterprise"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300/30 hover:text-white"
                            >
                                For teams
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
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Open materials.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Deeper references live here after the product makes sense.
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
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Field story, anonymized.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                            A research workflow became easier to use: chosen material in, weak spots marked, review before sharing.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-[1.1rem] border border-violet-200/20 bg-black/25">
                            <FileCheck2 className="h-6 w-6 text-violet-100" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Open references.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            Two DOI records, an open source repository, and an anonymized field story you can inspect before a call.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
