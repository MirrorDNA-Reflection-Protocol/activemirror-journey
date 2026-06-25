import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    BadgeAlert,
    Building2,
    CheckCircle2,
    MessageSquareWarning,
    ShieldAlert,
} from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';
import { chetanaChecks, chetanaExamples, merchantPoints } from '../lib/flagshipContent';

const faqs = [
    {
        q: 'What does Chetana check?',
        a: 'Chetana checks suspicious links, UPI IDs, QR payment patterns, phone numbers, messages, and other scam-like signals. The exact checks depend on the surface you use.',
    },
    {
        q: 'Is it only for individuals?',
        a: 'No. Individuals are the clearest public entry, but merchants and support teams can use the same trust-checking posture as a first-pass review layer.',
    },
    {
        q: 'Does a flag mean the case is definitely fraudulent?',
        a: 'No. A flag is a trust signal that should explain why it fired and what to verify next. It is not a promise of certainty.',
    },
    {
        q: 'What should I do when the result is unclear?',
        a: 'Pause the action, verify through an independent channel, preserve the evidence, and escalate to a human review path where needed.',
    },
];

export default function ChetanaLanding() {
    return (
        <SiteShell>
            <SectionShell
                eyebrow="Chetana"
                title="Scam and trust checks built for India."
                description="Chetana helps people and merchants check suspicious payment screenshots, QR / UPI patterns, links, messages, and scam-like signals before acting."
                className="pt-12"
            >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
                    <div>
                        <div className="flex flex-wrap gap-3">
                            <a href="https://chetana.activemirror.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#132033] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d2d48]">
                                Try Chetana
                                <ArrowUpRight size={16} />
                            </a>
                            <Link to="/pricing#merchant" className="inline-flex items-center gap-2 rounded-full border border-[#d8dfe7] bg-white px-5 py-3 text-sm font-medium text-[#152033] transition-colors hover:border-[#bdc8d7]">
                                For merchants
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {chetanaChecks.map((item) => (
                                <div key={item} className="rounded-[22px] border border-[#e7dfd4] bg-white px-4 py-4 text-sm text-[#364255] shadow-[0_12px_30px_rgba(13,21,34,0.03)]">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[28rem] rounded-[36px] border border-[#d8dfe7] bg-white p-5 shadow-[0_30px_90px_rgba(13,21,34,0.08)]">
                        <div className="rounded-[32px] border border-[#d8dfe7] bg-[#132033] p-5 text-white">
                            <div className="flex items-center justify-between">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9fb1c7]">Chetana verdict</div>
                                <div className="rounded-full bg-[#183f4a] px-3 py-1 text-[11px] font-semibold text-[#9ad6de]">Review advised</div>
                            </div>
                            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#8ea4bf]">Suspicious input</div>
                                <div className="mt-3 text-sm leading-7 text-[#dbe6f4]">
                                    “Payment screenshot attached. Pay now through the QR in 2 minutes or the booking is gone.”
                                </div>
                            </div>
                            <div className="mt-4 rounded-[24px] border border-[#275c69] bg-[#102434] p-4">
                                <div className="text-xs uppercase tracking-[0.22em] text-[#9ad6de]">Why flagged</div>
                                <div className="mt-3 space-y-3 text-sm leading-7 text-[#dbe6f4]">
                                    <p>Urgency language + QR request + screenshot-only proof.</p>
                                    <p>Next action: verify the merchant through an independent channel before paying.</p>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#e7eef8]">Reason trace</div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#e7eef8]">Risk signal</div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#e7eef8]">Next step</div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="What it checks"
                title="Designed for the trust failures people understand immediately."
                description="This page stays concrete: familiar risk categories first, deeper system detail only when it helps."
            >
                <div className="grid gap-5 md:grid-cols-3">
                    {[
                        { title: 'Payment and UPI trust', body: 'QR requests, UPI IDs, screenshot-only payment proof, and pressure-based collection patterns.', icon: ShieldAlert },
                        { title: 'Links and messages', body: 'Suspicious links, message patterns, and social engineering signals that try to push action before verification.', icon: MessageSquareWarning },
                        { title: 'Merchant and support review', body: 'First-pass checks that help merchants and teams route risky cases into review instead of guessing.', icon: Building2 },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[28px] border border-[#e7dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                            <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f7fbff] p-3">
                                <item.icon size={20} className="text-[#2855d9]" />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{item.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{item.body}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Example verdicts"
                title="A verdict should explain itself."
                description="If the output does not tell the user why it fired and what to do next, it is not doing enough."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {chetanaExamples.map((example, index) => (
                        <div key={example.title} className={`rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)] ${index === 0 ? 'border-[#d7e4ff] bg-[#f7fbff]' : index === 1 ? 'border-[#f1e2c8] bg-[#fdf9f1]' : 'border-[#d9eee6] bg-[#f7fbf9]'}`}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">{example.title}</div>
                            <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#152033]">
                                {example.verdict}
                            </div>
                            <p className="mt-4 text-sm leading-7 text-[#5b6776]">{example.why}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="For merchants"
                title="For merchants and support teams."
                description="Chetana can act as a first-pass trust check before support, payouts, or merchant-facing review flows move forward."
                className="scroll-mt-32"
            >
                <div id="for-merchants" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]">
                    <div className="rounded-[32px] border border-[#d9eee6] bg-[#f7fbf9] p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="space-y-4">
                            {merchantPoints.map((point) => (
                                <div key={point} className="flex gap-3 rounded-[22px] border border-[#d9eee6] bg-white px-4 py-4 text-sm leading-7 text-[#364255]">
                                    <CheckCircle2 size={16} className="mt-1 text-[#1c7b5b]" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">Merchant route</div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">First-pass trust checking before the team has to guess.</h2>
                        <div className="mt-5 space-y-3">
                            <div className="rounded-2xl border border-[#ebeff4] bg-[#fbfcfd] px-4 py-4 text-sm text-[#364255]">1. Customer submits screenshot, link, QR, or suspicious message.</div>
                            <div className="rounded-2xl border border-[#ebeff4] bg-[#fbfcfd] px-4 py-4 text-sm text-[#364255]">2. Chetana surfaces why it looks risky and whether review is needed.</div>
                            <div className="rounded-2xl border border-[#ebeff4] bg-[#fbfcfd] px-4 py-4 text-sm text-[#364255]">3. Support or payment ops takes the case with clearer evidence, not guesswork.</div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/pricing#merchant" className="inline-flex items-center gap-2 rounded-full bg-[#132033] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d2d48]">
                                Merchant pricing
                                <ArrowRight size={16} />
                            </Link>
                            <Link to="/about/contact" className="inline-flex items-center gap-2 rounded-full border border-[#d8dfe7] bg-white px-5 py-3 text-sm font-medium text-[#152033] transition-colors hover:border-[#bdc8d7]">
                                Talk to Active Mirror
                            </Link>
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Reporting and recovery"
                title="Do not stop at the flag. Route the next move."
                description="A trust product becomes more useful when it helps the user choose the next safe action."
            >
                <div className="grid gap-5 md:grid-cols-3">
                    {[
                        'Pause the action when the result is high-risk or unclear.',
                        'Verify the merchant, sender, or payment request through an independent channel.',
                        'Preserve the evidence and route to human support or recovery when the incident matters.',
                    ].map((step, index) => (
                        <div key={step} className="rounded-[28px] border border-[#e7dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                            <div className="inline-flex rounded-full bg-[#132033] px-3 py-1 text-[11px] font-semibold text-white">{index + 1}</div>
                            <p className="mt-4 text-sm leading-7 text-[#5b6776]">{step}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell eyebrow="FAQ" title="Questions people should be able to answer fast." description="Common concerns should be handled directly, without making people decode platform language first.">
                <div className="grid gap-5 lg:grid-cols-2">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="rounded-[28px] border border-[#e7dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#152033]">{faq.q}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>
        </SiteShell>
    );
}
