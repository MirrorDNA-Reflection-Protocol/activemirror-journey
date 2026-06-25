import React from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    Database,
    FileSearch,
    Hand,
    LockKeyhole,
    ShieldCheck,
} from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';

const guardrails = [
    {
        title: 'What Active Mirror is',
        body: 'A company building AI products and infrastructure that verify, remember, and show their work.',
    },
    {
        title: 'What it does not guarantee',
        body: 'It does not guarantee perfect scam detection, perfect memory, or perfect policy outcomes. It is designed to surface clearer signals and stronger review paths, not magic certainty.',
    },
    {
        title: 'Privacy stance',
        body: 'Routes should be explicit about what they do, what they collect, and where the next review path lives. Privacy is a design stance, not a vague marketing promise.',
    },
    {
        title: 'Human override',
        body: 'Serious trust systems need human review and escalation paths. The goal is legibility before action, not hiding humans behind automation.',
    },
];

const proofFlow = [
    'Input is checked against a named product or control route.',
    'Signals or rules are gathered before the conclusion is shown.',
    'The output explains why a result was reached and what to do next.',
    'When escalation is needed, the handoff path stays visible.',
];

const dataHandling = [
    {
        title: 'Public utility surfaces',
        body: 'Public tools should explain the scope of the check and keep the result tied to the user action that triggered it.',
        icon: ShieldCheck,
    },
    {
        title: 'Self-hosting and sovereignty',
        body: 'Teams with tighter control requirements should evaluate self-hosting and internal deployment routes rather than assuming the public web surface fits every need.',
        icon: LockKeyhole,
    },
    {
        title: 'Research and methods',
        body: 'Trust improves when methods, architecture, and limitations are written down instead of implied.',
        icon: FileSearch,
    },
];

const recoveryPaths = [
    'Use Chetana as the first-pass trust check for suspicious links, QR / UPI payment flows, screenshots, and scam-like messages.',
    'If the result is unclear or high-risk, stop the payment or support action and verify through an independent channel.',
    'For serious incidents, preserve evidence, route to human review, and use the contact / reporting path instead of treating the AI result as the final authority.',
];

export default function Trust() {
    return (
        <SiteShell>
            <SectionShell
                eyebrow="Trust"
                title="Trust is earned by legibility, not by tone."
                description="This page explains what Active Mirror does, what it does not guarantee, how proof works, and where human review remains essential."
                className="pt-12"
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {guardrails.map((item, index) => (
                        <div key={item.title} className={`rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)] ${index % 2 === 0 ? 'border-[#d7e4ff] bg-[#f7fbff]' : 'border-[#f1e2c8] bg-[#fdf9f1]'}`}>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{item.title}</h2>
                            <p className="mt-4 text-sm leading-7 text-[#5b6776]">{item.body}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="How proof works"
                title="A trust result should have a route behind it."
                description="Important outputs need a visible path from input to signal to action."
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="space-y-4">
                            {proofFlow.map((step, index) => (
                                <div key={step} className="flex gap-4 rounded-[22px] border border-[#ebeff4] bg-[#fbfcfd] p-4">
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#132033] text-sm font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="pt-0.5 text-sm leading-7 text-[#364255]">{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#f2d8d4] bg-[#fff8f7] p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="inline-flex rounded-2xl border border-[#f2d8d4] bg-white p-3">
                            <AlertTriangle size={20} className="text-[#b54c3f]" />
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">What a trustworthy system still refuses to claim</h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-[#5b6776]">
                            <p>It should not claim perfect detection.</p>
                            <p>It should not imply that a single model result replaces judgment, compliance, or escalation.</p>
                            <p>It should not hide limitations behind a confidence number.</p>
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Privacy and review"
                title="Serious trust products still need boundaries, review, and data handling clarity."
                description="The point of a trust page is not to sound comforting. It is to make the operating posture explicit."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {dataHandling.map((item) => (
                        <div key={item.title} className="rounded-[28px] border border-[#e7dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                            <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f6faff] p-3">
                                <item.icon size={20} className="text-[#2855d9]" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{item.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{item.body}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Chetana recovery"
                title="Chetana should help route the next move, not pretend to finish the incident."
                description="For scam-like scenarios, the recovery posture matters as much as the initial flag."
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
                    <div className="rounded-[32px] border border-[#d9eee6] bg-[#f7fbf9] p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="space-y-4">
                            {recoveryPaths.map((path, index) => (
                                <div key={path} className="flex gap-4 rounded-[22px] border border-[#d9eee6] bg-white p-4">
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1c7b5b] text-sm font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="pt-0.5 text-sm leading-7 text-[#364255]">{path}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f7fbff] p-3">
                            <Hand size={20} className="text-[#2855d9]" />
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">Need a human path?</h3>
                        <p className="mt-4 text-sm leading-7 text-[#5b6776]">
                            Use the contact route when the case is serious, ambiguous, or operationally important. Human override is part of the trust story, not evidence that the system failed.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/about/contact" className="inline-flex items-center gap-2 rounded-full bg-[#132033] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d2d48]">
                                Contact Active Mirror
                                <ArrowRight size={16} />
                            </Link>
                            <Link to="/docs" className="inline-flex items-center gap-2 rounded-full border border-[#d8dfe7] bg-white px-5 py-3 text-sm font-medium text-[#152033] transition-colors hover:border-[#bdc8d7]">
                                Read the docs
                            </Link>
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell eyebrow="Research and methods" title="Trust improves when the method is visible." description="If you want deeper architecture, hosting, or API material, go to the written system layer.">
                <div className="grid gap-5 md:grid-cols-3">
                    <Link to="/docs/architecture" className="rounded-[28px] border border-[#d7e4ff] bg-[#f7fbff] p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2855d9]">Architecture</div>
                        <div className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">See the system map</div>
                    </Link>
                    <Link to="/docs/self-hosting" className="rounded-[28px] border border-[#d9eee6] bg-[#f7fbf9] p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1c7b5b]">Self-hosting</div>
                        <div className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">Evaluate control options</div>
                    </Link>
                    <Link to="/docs/api" className="rounded-[28px] border border-[#f1e2c8] bg-[#fdf9f1] p-6 shadow-[0_20px_60px_rgba(13,21,34,0.04)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6121]">API</div>
                        <div className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#152033]">Inspect the interface layer</div>
                    </Link>
                </div>
            </SectionShell>
        </SiteShell>
    );
}
