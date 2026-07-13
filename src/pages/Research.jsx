import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const pageClass = isLight
        ? 'min-h-dvh overflow-hidden bg-[var(--am-canvas)] text-stone-950 selection:bg-cyan-200/70'
        : 'min-h-dvh overflow-hidden bg-[var(--am-canvas)] text-white selection:bg-cyan-300/25';
    const navClass = isLight ? 'text-stone-600 hover:text-stone-950' : 'text-zinc-400 hover:text-white';
    const surfaceClass = isLight
        ? 'border-stone-300/80 bg-white/80 ring-black/[0.045]'
        : 'border-white/10 bg-white/[0.045] ring-white/[0.04]';
    const insetSurfaceClass = isLight
        ? 'border-stone-300/80 bg-stone-100/88 ring-black/[0.04]'
        : 'border-white/10 bg-black/25 ring-white/[0.03]';
    const headingClass = isLight ? 'text-stone-950' : 'text-white';
    const bodyClass = isLight ? 'text-stone-700' : 'text-zinc-400';
    const strongerBodyClass = isLight ? 'text-stone-700' : 'text-zinc-300';
    const iconClass = isLight
        ? 'border-cyan-700/20 bg-cyan-50 text-cyan-800'
        : 'border-cyan-200/20 bg-white/[0.045] text-cyan-100';
    const cardIconClass = isLight
        ? 'border-cyan-700/20 bg-cyan-50 text-cyan-800'
        : 'border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100';

    return (
        <div className={pageClass}>
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-12 flex items-center justify-between gap-4">
                    <Link to="/" className={`inline-flex items-center gap-2 text-sm font-semibold transition ${navClass}`}>
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <div className={`flex items-center gap-4 text-sm font-semibold ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                        <Link to="/" className={`transition ${navClass}`}>Try it</Link>
                        <Link to="/enterprise" className={`transition ${navClass}`}>Business</Link>
                    </div>
                </nav>

                <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
                    <div className={`rounded-lg border p-6 ring-1 sm:p-8 ${surfaceClass}`}>
                        <div className={`mb-8 grid h-16 w-16 place-items-center rounded-lg border ${iconClass}`}>
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h1 className={`max-w-[12ch] text-[3.05rem] font-semibold leading-[0.94] sm:text-[4.9rem] ${headingClass}`}>
                            How we build it.
                        </h1>
                        <p className={`mt-6 max-w-xl text-lg leading-8 ${bodyClass}`}>
                            For people who want to look deeper: open papers, source material, and field lessons behind Active Mirror.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="https://doi.org/10.5281/zenodo.17787618"
                                target="_blank"
                                rel="noreferrer"
                                className="am-primary-action inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-semibold"
                            >
                                Open paper
                                <ExternalLink size={16} />
                            </a>
                            <Link
                                to="/enterprise"
                                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition ${isLight ? 'border-stone-300/80 bg-white text-stone-700 hover:border-cyan-700/30 hover:text-stone-950' : 'border-white/10 bg-white/[0.045] text-zinc-200 hover:border-cyan-300/30 hover:text-white'}`}
                            >
                                For teams
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {proofPoints.map(([title, text], index) => (
                            <div key={title} className={`rounded-lg border p-5 ring-1 ${insetSurfaceClass}`}>
                                <div className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-semibold ${cardIconClass}`}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className={`text-base font-semibold ${headingClass}`}>{title}</div>
                                <p className={`mt-2 text-sm leading-6 ${bodyClass}`}>{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`mt-8 border-t px-1 pt-7 ${isLight ? 'border-stone-300/80' : 'border-white/10'}`}>
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className={`text-2xl font-semibold sm:text-3xl ${headingClass}`}>Open materials.</h2>
                            <p className={`mt-2 max-w-xl text-sm leading-6 ${bodyClass}`}>
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
                                className={`group rounded-lg border p-4 transition ${isLight ? 'border-stone-300/80 bg-white/78 hover:border-cyan-700/30 hover:bg-cyan-50' : 'border-white/10 bg-black/25 hover:border-cyan-300/30 hover:bg-cyan-300/[0.055]'}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className={`text-sm font-semibold ${headingClass}`}>{paper.title}</div>
                                    <ExternalLink className={`h-4 w-4 transition ${isLight ? 'text-stone-500 group-hover:text-cyan-800' : 'text-zinc-400 group-hover:text-cyan-100'}`} />
                                </div>
                                <p className={`mt-3 text-sm leading-6 ${bodyClass}`}>{paper.detail}</p>
                                <div className={`mt-5 text-xs font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-cyan-800' : 'text-cyan-200/70'}`}>{paper.label}</div>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                    <div className={`rounded-lg border p-6 ring-1 ${isLight ? 'border-emerald-700/20 bg-emerald-50 ring-emerald-900/[0.04]' : 'border-emerald-300/15 bg-emerald-300/[0.06] ring-white/[0.04]'}`}>
                        <div className={`mb-5 grid h-12 w-12 place-items-center rounded-lg border ${isLight ? 'border-emerald-700/20 bg-white text-emerald-800' : 'border-emerald-200/20 bg-black/25 text-emerald-100'}`}>
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className={`text-2xl font-semibold sm:text-3xl ${headingClass}`}>Field story, anonymized.</h2>
                        <p className={`mt-3 text-sm leading-6 ${strongerBodyClass}`}>
                            A research workflow became easier to use: chosen material in, weak spots marked, review before sharing.
                        </p>
                    </div>
                    <div className={`rounded-lg border p-6 ring-1 ${surfaceClass}`}>
                        <div className={`mb-5 grid h-12 w-12 place-items-center rounded-lg border ${isLight ? 'border-blue-700/20 bg-blue-50 text-blue-800' : 'border-blue-200/20 bg-black/25 text-blue-100'}`}>
                            <FileCheck2 className="h-6 w-6" />
                        </div>
                        <h2 className={`text-2xl font-semibold sm:text-3xl ${headingClass}`}>Open references.</h2>
                        <p className={`mt-3 text-sm leading-6 ${bodyClass}`}>
                            Two DOI records, an open source repository, and an anonymized field story you can inspect before a call.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
