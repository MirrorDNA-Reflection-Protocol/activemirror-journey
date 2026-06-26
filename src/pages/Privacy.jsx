import { ArrowLeft, Database, EyeOff, Lock, Mail, Shield, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const lastUpdated = 'June 26, 2026';

const sections = [
    {
        icon: Shield,
        title: 'What Active Mirror does',
        body: 'Active Mirror helps you reflect on one thing you are stuck on. The product is designed to use the minimum context needed for that turn and to keep memory under your control.',
    },
    {
        icon: Database,
        title: 'What may leave your browser',
        body: 'When you send a reflection request, the sentence you submit and a small boundary setting are sent to the Active Mirror gateway so a governed response can be generated. We do not ask for passwords, account numbers, private keys, or other secrets.',
    },
    {
        icon: EyeOff,
        title: 'What we do not collect',
        body: 'Feedback events contain metadata only, such as page, surface, label, status, and route. They do not include your prompt, reflection text, files, private notes, or MirrorSeed.',
    },
    {
        icon: Lock,
        title: 'What stays local',
        body: 'MirrorSeed, approved defaults, phone-thread continuity, and local feedback counts are stored in your browser when you choose to use those features. You can clear them from the app or browser storage.',
    },
];

export default function Privacy() {
    return (
        <div className="min-h-dvh bg-black text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),transparent_34%),#000]" />

            <main className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Active Mirror
                </Link>

                <header className="mb-10">
                    <h1 className="text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">Privacy</h1>
                    <p className="mt-4 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                        Private first means we keep the product useful without quietly turning your personal context into our asset.
                    </p>
                </header>

                <section className="mb-8 rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.08] p-5">
                    <h2 className="text-lg font-semibold text-emerald-100">Short version</h2>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
                        <li>Only send what you want reflected.</li>
                        <li>Do not paste secrets or highly sensitive personal details.</li>
                        <li>Memory is your choice; local defaults stay in your browser.</li>
                        <li>Feedback events are counts and labels, not prompt content.</li>
                        <li>We do not sell your data or train models on your conversations.</li>
                    </ul>
                </section>

                <div className="grid gap-4">
                    {sections.map((section) => (
                        <section key={section.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                            <div className="mb-3 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                                    <section.icon size={18} />
                                </span>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">{section.title}</h2>
                            </div>
                            <p className="text-sm leading-7 text-zinc-400">{section.body}</p>
                        </section>
                    ))}
                </div>

                <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold tracking-[-0.03em]">Processing and retention</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-400">
                        <p>Reflection requests are processed transiently by the gateway and model route. We do not store full prompts or generated reflections as product analytics.</p>
                        <p>Infrastructure providers may keep limited operational logs for security, abuse prevention, debugging, and service reliability. We keep our own product events prompt-free by design.</p>
                        <p>Rate limiting uses session and network metadata to prevent abuse. The public feedback dashboard reads only your current browser session.</p>
                    </div>
                </section>

                <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold tracking-[-0.03em]">Your choices</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-400">
                        <p className="flex gap-3"><Trash2 className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />Clear local browser storage to remove local MirrorSeed, defaults, phone thread, and feedback counts.</p>
                        <p className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />Email <a href="mailto:paul@activemirror.ai" className="text-cyan-200 hover:underline">paul@activemirror.ai</a> for privacy questions or deletion requests for information you intentionally gave us outside the app.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
