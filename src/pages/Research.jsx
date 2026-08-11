import { useEffect } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Download,
    ExternalLink,
    FileCheck2,
    Library,
    ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import research from '../data/research.json';

function formatDate(value) {
    return new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}

export default function Research() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const featured = research.featured;

    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Research | Active Mirror';

        const description = document.querySelector('meta[name="description"]');
        const previousDescription = description?.getAttribute('content');
        description?.setAttribute('content', 'Open theses, preprints, source links and scored forecasts by Paul Desai.');

        let canonical = document.querySelector('link[rel="canonical"]');
        const createdCanonical = !canonical;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        const previousCanonical = canonical.getAttribute('href');
        canonical.href = 'https://activemirror.ai/research/';

        return () => {
            document.title = previousTitle;
            if (previousDescription) description?.setAttribute('content', previousDescription);
            if (createdCanonical) canonical?.remove();
            else if (previousCanonical) canonical?.setAttribute('href', previousCanonical);
        };
    }, []);

    const pageClass = isLight
        ? 'min-h-dvh overflow-hidden bg-[var(--am-canvas)] text-stone-950 selection:bg-cyan-200/70'
        : 'min-h-dvh overflow-hidden bg-[var(--am-canvas)] text-white selection:bg-cyan-300/25';
    const navClass = isLight ? 'text-stone-600 hover:text-stone-950' : 'text-zinc-400 hover:text-white';
    const surfaceClass = isLight
        ? 'border-stone-300/80 bg-white/82 ring-black/[0.045]'
        : 'border-white/10 bg-white/[0.045] ring-white/[0.04]';
    const insetSurfaceClass = isLight
        ? 'border-stone-300/80 bg-stone-100/88 ring-black/[0.04]'
        : 'border-white/10 bg-black/25 ring-white/[0.03]';
    const headingClass = isLight ? 'text-stone-950' : 'text-white';
    const bodyClass = isLight ? 'text-stone-700' : 'text-zinc-400';
    const strongerBodyClass = isLight ? 'text-stone-800' : 'text-zinc-300';
    const iconClass = isLight
        ? 'border-amber-700/20 bg-amber-50 text-amber-800'
        : 'border-amber-200/20 bg-amber-300/[0.07] text-amber-100';
    const quietButtonClass = isLight
        ? 'border-stone-300/80 bg-white text-stone-700 hover:border-cyan-700/30 hover:text-stone-950'
        : 'border-white/10 bg-white/[0.045] text-zinc-200 hover:border-cyan-300/30 hover:text-white';

    return (
        <div className={pageClass}>
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-10 flex items-center justify-between gap-4 sm:mb-14">
                    <Link to="/" className={`inline-flex items-center gap-2 text-sm font-semibold transition ${navClass}`}>
                        <ArrowLeft size={16} />
                        Active Mirror
                    </Link>
                    <div className={`flex items-center gap-4 text-sm font-semibold ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                        <a href="#papers" className={`transition ${navClass}`}>Papers</a>
                        <a href="#ledger" className={`hidden transition sm:inline ${navClass}`}>Ledger</a>
                        <Link to="/" className={`transition ${navClass}`}>Try it</Link>
                    </div>
                </nav>

                <section className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
                    <div className={`rounded-lg border p-6 ring-1 sm:p-10 ${surfaceClass}`}>
                        <div className={`mb-8 grid h-14 w-14 place-items-center rounded-lg border ${iconClass}`}>
                            <Library className="h-7 w-7" />
                        </div>
                        <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLight ? 'text-amber-800' : 'text-amber-200/80'}`}>
                            Research · Paul Desai
                        </div>
                        <h1 className={`mt-4 max-w-[11ch] text-[3.35rem] font-semibold leading-[0.92] sm:text-[5.45rem] ${headingClass}`}>
                            Ideas you can inspect.
                        </h1>
                        <p className={`mt-6 max-w-2xl text-lg leading-8 ${bodyClass}`}>
                            Open theses, preprints, source links and scored forecasts behind Active Mirror.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="/research/electric-mind/"
                                className="am-primary-action inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-semibold"
                            >
                                Read The Electric Mind
                                <ArrowRight size={16} />
                            </a>
                            <a
                                href="https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Desai%2C%20Paul%22&l=list&p=1&s=10&sort=mostviewed"
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition ${quietButtonClass}`}
                            >
                                Browse Zenodo
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ['01', 'Featured public thesis'],
                            [String(research.snapshot.recordCount).padStart(2, '0'), 'Current Zenodo records'],
                            ['06', 'Dated first-ledger forecasts'],
                            ['4×', 'Target weekly publication rhythm'],
                        ].map(([value, label]) => (
                            <div key={label} className={`flex min-h-36 flex-col justify-between rounded-lg border p-5 ring-1 ${insetSurfaceClass}`}>
                                <div className={`font-mono text-3xl font-semibold ${isLight ? 'text-cyan-800' : 'text-cyan-100'}`}>{value}</div>
                                <p className={`text-sm leading-6 ${bodyClass}`}>{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`mt-16 border-t pt-8 ${isLight ? 'border-stone-300/80' : 'border-white/10'}`}>
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-amber-800' : 'text-amber-200/75'}`}>Featured thesis</div>
                            <h2 className={`mt-2 text-3xl font-semibold sm:text-5xl ${headingClass}`}>How we build it.</h2>
                        </div>
                        <p className={`max-w-lg text-sm leading-6 ${bodyClass}`}>
                            One clear argument, a stable public source, and forecasts that can be scored later.
                        </p>
                    </div>

                    <article className={`grid gap-8 rounded-lg border p-6 ring-1 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] ${surfaceClass}`}>
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-[0.15em] ${isLight ? 'text-cyan-800' : 'text-cyan-200/75'}`}>
                                {featured.type} · {formatDate(featured.publishedAt)}
                            </div>
                            <h3 className={`mt-3 text-3xl font-semibold sm:text-4xl ${headingClass}`}>{featured.title}</h3>
                            <p className={`mt-4 text-sm leading-6 ${strongerBodyClass}`}>{featured.subtitle}</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {[featured.horizon, 'India', 'Version 1.0'].map((label) => (
                                    <span key={label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${isLight ? 'border-stone-300 bg-stone-50 text-stone-700' : 'border-white/10 bg-black/20 text-zinc-300'}`}>{label}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className={`text-base leading-7 ${bodyClass}`}>{featured.abstract}</p>
                            <p className={`mt-5 border-l-2 pl-4 text-xs leading-6 ${isLight ? 'border-amber-600 text-stone-600' : 'border-amber-200/55 text-zinc-400'}`}>
                                {featured.notice}
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a href="/research/electric-mind/" className="am-primary-action inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold">
                                    Paper page
                                    <BookOpen size={16} />
                                </a>
                                <a href={featured.links.pdf} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${quietButtonClass}`}>
                                    PDF
                                    <Download size={16} />
                                </a>
                                <a href={featured.links.citation} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${quietButtonClass}`}>
                                    Cite
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </article>
                </section>

                <section id="papers" className={`mt-16 border-t pt-8 ${isLight ? 'border-stone-300/80' : 'border-white/10'}`}>
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-cyan-800' : 'text-cyan-200/75'}`}>DOI archive</div>
                            <h2 className={`mt-2 text-3xl font-semibold sm:text-5xl ${headingClass}`}>Papers and preprints.</h2>
                        </div>
                        <p className={`max-w-lg text-sm leading-6 ${bodyClass}`}>
                            Labels follow the live Zenodo record types. Nothing here is described as peer-reviewed without separate venue evidence.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {research.publications.map((paper) => (
                            <article key={paper.id} className={`flex flex-col rounded-lg border p-5 ring-1 sm:p-6 ${surfaceClass}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className={`text-xs font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-cyan-800' : 'text-cyan-200/75'}`}>
                                        {paper.type} · {formatDate(paper.publishedAt)}
                                    </div>
                                    <CalendarDays className={`h-4 w-4 shrink-0 ${bodyClass}`} />
                                </div>
                                <h3 className={`mt-4 text-xl font-semibold leading-7 ${headingClass}`}>{paper.title}</h3>
                                <p className={`mt-3 text-sm leading-6 ${bodyClass}`}>{paper.abstract}</p>
                                <div className={`mt-4 font-mono text-xs ${isLight ? 'text-blue-800' : 'text-blue-200/75'}`}>doi:{paper.doi}</div>
                                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                                    <a href={paper.recordUrl} target="_blank" rel="noreferrer" className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${quietButtonClass}`}>
                                        Record
                                        <ExternalLink size={14} />
                                    </a>
                                    <a href={paper.fileUrl} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${quietButtonClass}`}>
                                        Download
                                        <Download size={14} />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="ledger" className={`mt-16 rounded-lg border p-6 ring-1 sm:p-8 ${surfaceClass}`}>
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-amber-800' : 'text-amber-200/75'}`}>Forecasts and research drops</div>
                            <h2 className={`mt-2 text-3xl font-semibold sm:text-5xl ${headingClass}`}>{research.ledger.title}</h2>
                            <p className={`mt-4 max-w-3xl text-sm leading-7 ${bodyClass}`}>{research.ledger.description}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <a href={research.ledger.links.repository} target="_blank" rel="noreferrer" className="am-primary-action inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold">
                                Open ledger
                                <ExternalLink size={16} />
                            </a>
                            <a href={research.ledger.links.drops} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${quietButtonClass}`}>
                                Research drops
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className={`rounded-lg border p-6 ring-1 ${insetSurfaceClass}`}>
                        <ShieldCheck className={`h-6 w-6 ${isLight ? 'text-emerald-800' : 'text-emerald-200'}`} />
                        <h2 className={`mt-5 text-2xl font-semibold ${headingClass}`}>Field story, anonymized.</h2>
                        <p className={`mt-3 text-sm leading-6 ${bodyClass}`}>Research becomes more useful when weak spots are visible before sharing.</p>
                    </div>
                    <div className={`rounded-lg border p-6 ring-1 ${insetSurfaceClass}`}>
                        <FileCheck2 className={`h-6 w-6 ${isLight ? 'text-blue-800' : 'text-blue-200'}`} />
                        <h2 className={`mt-5 text-2xl font-semibold ${headingClass}`}>Open references.</h2>
                        <p className={`mt-3 text-sm leading-6 ${bodyClass}`}>Every item leads to the paper, release, DOI record, source archive or public ledger.</p>
                    </div>
                </section>

                <footer className={`mt-16 border-t py-7 text-xs leading-6 ${isLight ? 'border-stone-300/80 text-stone-600' : 'border-white/10 text-zinc-500'}`}>
                    Independent research, preprints, technical reports and theses. Not professional advice. Zenodo snapshot checked {research.snapshot.fetchedAt}.
                </footer>
            </main>
        </div>
    );
}
