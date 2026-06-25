import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const navItems = [
    { label: 'BrainScan', href: '/start' },
    { label: 'Mirror', href: '/mirror' },
    { label: 'Chetana', href: '/chetana' },
    { label: 'For teams', href: '/platform' },
    { label: 'Docs', href: '/docs' },
];

export function SectionShell({ eyebrow, title, description, children, className = '' }) {
    return (
        <section className={`mx-auto w-full max-w-[76rem] px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
            {(eyebrow || title || description) && (
                <div className="max-w-3xl">
                    {eyebrow && (
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">
                            {eyebrow}
                        </div>
                    )}
                    {title && (
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#0d1522] sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-4 text-base leading-7 text-[#5b6776] sm:text-lg">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className={eyebrow || title || description ? 'mt-8' : ''}>{children}</div>
        </section>
    );
}

export default function SiteShell({ children }) {
    return (
        <div className="min-h-screen bg-[#f7f4ee] text-[#0d1522]">
            <div className="fixed inset-x-0 top-0 z-50 border-b border-[#e7dfd4] bg-[rgba(247,244,238,0.88)] backdrop-blur-xl">
                <div className="mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-16 items-center justify-between gap-4 py-3">
                        <Link to="/" className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[#d8dfe7] bg-white text-sm font-semibold text-[#2855d9]">
                                ⟡
                            </span>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#667385]">
                                    Active Mirror
                                </div>
                                <div className="text-sm font-medium text-[#152033]">
                                    Scam checks + reflective AI
                                </div>
                            </div>
                        </Link>

                        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
                            {navItems.map((item) => (
                                <Link key={item.label} to={item.href} className="text-sm font-medium text-[#4c5768] transition-colors hover:text-[#0d1522]">
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link to="/pricing" className="hidden text-sm font-medium text-[#4c5768] transition-colors hover:text-[#0d1522] sm:inline-flex">
                                Pricing
                            </Link>
                            <Link
                                to="/start"
                                className="inline-flex items-center gap-2 rounded-full bg-[#132033] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d2d48]"
                            >
                                Start BrainScan
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>

                    <nav aria-label="Mobile" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className="whitespace-nowrap rounded-full border border-[#d8dfe7] bg-white px-3 py-1.5 text-sm font-medium text-[#4c5768] transition-colors hover:text-[#0d1522]"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="pt-28 md:pt-16">{children}</main>

            <footer className="border-t border-[#e7dfd4] bg-white/70">
                <div className="mx-auto grid w-full max-w-[76rem] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.65fr))] lg:px-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[#d8dfe7] bg-white text-sm font-semibold text-[#2855d9]">
                                ⟡
                            </span>
                            <div>
                                <div className="text-sm font-semibold text-[#152033]">Active Mirror</div>
                                <div className="text-sm text-[#5b6776]">Scam checks for people. Governed AI for teams.</div>
                            </div>
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-6 text-[#5b6776]">
                            Public trust checks in front, deeper governance, memory, and proof infrastructure behind them.
                        </p>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-[#152033]">Start here</div>
                        <div className="mt-4 space-y-3 text-sm text-[#5b6776]">
                            <div><Link to="/start" className="transition-colors hover:text-[#0d1522]">BrainScan</Link></div>
                            <div><Link to="/mirror" className="transition-colors hover:text-[#0d1522]">Mirror</Link></div>
                            <div><Link to="/chetana" className="transition-colors hover:text-[#0d1522]">Chetana</Link></div>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-[#152033]">Resources</div>
                        <div className="mt-4 space-y-3 text-sm text-[#5b6776]">
                            <div><Link to="/platform" className="transition-colors hover:text-[#0d1522]">Platform</Link></div>
                            <div><Link to="/docs" className="transition-colors hover:text-[#0d1522]">Docs</Link></div>
                            <div><Link to="/docs/self-hosting" className="transition-colors hover:text-[#0d1522]">Self-hosting</Link></div>
                            <div><Link to="/pricing" className="transition-colors hover:text-[#0d1522]">Pricing</Link></div>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-[#152033]">Company</div>
                        <div className="mt-4 space-y-3 text-sm text-[#5b6776]">
                            <div><Link to="/about/contact" className="transition-colors hover:text-[#0d1522]">Contact</Link></div>
                            <div><a href="https://beacon.activemirror.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#0d1522]">Beacon</a></div>
                            <div><a href="https://www.youtube.com/@ActiveMirror-1" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#0d1522]">YouTube</a></div>
                            <div><Link to="/trust" className="transition-colors hover:text-[#0d1522]">Trust</Link></div>
                            <div><Link to="/privacy" className="transition-colors hover:text-[#0d1522]">Privacy</Link></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
