import { ArrowLeft, Cookie, Database, EyeOff, Globe2, Lock, Mail, Shield, Trash2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const lastUpdated = 'July 5, 2026';

const sections = [
    {
        icon: Shield,
        title: 'What Active Mirror does',
        body: 'Active Mirror helps you reflect on one thing you are stuck on. The product is designed to use the minimum context needed for that turn and to keep memory under your control.',
    },
    {
        icon: Database,
        title: 'What you send',
        body: 'When you press send, the sentence you submit, your privacy choice, and a short session id are sent to Active Mirror so a response can be created.',
    },
    {
        icon: EyeOff,
        title: 'What telemetry excludes',
        body: 'Product events are allowlisted metadata only, such as page, button label, status, and count. They do not include your prompt, reflection text, files, private notes, or local profile.',
    },
    {
        icon: Lock,
        title: 'What stays local',
        body: 'Your local profile, approved defaults, saved-by-you continuity, phone-thread continuity, and local feedback counts are stored in your browser when you choose to use those features. You can clear them from the app or browser storage.',
    },
    {
        icon: Mail,
        title: 'Team requests',
        body: 'The team request form stores only the basics needed to respond: work email domain, selected workflow, timeline, consent, and request id. Workflow details stay out until a private intake.',
    },
    {
        icon: Globe2,
        title: 'Live answers and current facts',
        body: 'Some requests may be processed by secure AI or search services. Current-source checks happen only when you ask for current or external facts, or when an answer needs sources before you rely on it.',
    },
    {
        icon: Cookie,
        title: 'Cookies and local storage',
        body: 'The public app uses browser storage for session continuity and local preferences. We do not use ad-tracking cookies in the current public experience.',
    },
    {
        icon: UserCheck,
        title: 'Your rights',
        body: 'You can ask us to access, correct, or delete information you intentionally gave us outside the local app. Regional privacy rights may apply depending on where you live.',
    },
];

export default function Privacy() {
    return (
        <div className="am-theme-parity min-h-dvh bg-black text-white">
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

            <main className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Active Mirror
                </Link>

                <header className="mb-10">
                    <h1 className="text-5xl font-semibold leading-none sm:text-6xl">Privacy</h1>
                    <p className="mt-4 text-sm text-zinc-400">Last updated: {lastUpdated}</p>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                        Private first means we keep the product useful without quietly turning your personal context into our asset.
                    </p>
                </header>

                <section className="mb-8 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.08] p-5">
                    <h2 className="text-lg font-semibold text-emerald-100">Short version</h2>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
                        <li>Only send what you want reflected.</li>
                        <li>Do not paste secrets or highly sensitive personal details.</li>
                        <li>Memory is your choice; saved notes and local defaults stay in your browser.</li>
                        <li>Telemetry is counts, labels, and status; not prompt content.</li>
                        <li>We do not sell your personal data or train our own models on your conversations.</li>
                    </ul>
                </section>

                <div className="grid gap-4">
                    {sections.map((section) => (
                        <section key={section.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                            <div className="mb-3 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-cyan-100">
                                    <section.icon size={18} />
                                </span>
                                <h2 className="text-xl font-semibold">{section.title}</h2>
                            </div>
                            <p className="text-sm leading-7 text-zinc-400">{section.body}</p>
                        </section>
                    ))}
                </div>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold">Processing and retention</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-400">
                        <p>Reflection requests are processed by Active Mirror and the secure services needed to create the answer. We do not store full prompts or generated reflections as product analytics.</p>
                        <p>AI, search, hosting, and infrastructure services may process request content and limited operational data to deliver, debug, and protect the service.</p>
                        <p>Rate limiting uses session and network metadata to prevent abuse and control cost. The public feedback dashboard reads only your current browser session.</p>
                        <p>Contact messages and team requests are kept as long as needed to respond, manage the relationship, and maintain ordinary business records.</p>
                    </div>
                </section>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold">Safety limits</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-400">
                        <p>Active Mirror blocks common API keys, tokens, credentials, and private-key patterns before a live answer is created, but no automated filter is perfect.</p>
                        <p>Do not paste passwords, API keys, private URLs, payment data, health records, legal case details, or anything you would not want processed by an AI service.</p>
                        <p>No internet service can guarantee absolute security. We use practical safeguards, narrow telemetry, rate limits, and protected secret storage to reduce risk.</p>
                    </div>
                </section>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold">Your choices</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-400">
                        <p className="flex gap-3"><Trash2 className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />Clear local browser storage to remove your local profile, defaults, phone thread, and feedback counts.</p>
                        <p className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />Email <a href="mailto:paul@activemirror.ai" className="text-cyan-200 hover:underline">paul@activemirror.ai</a> for privacy questions or deletion requests for information you intentionally gave us outside the app.</p>
                    </div>
                </section>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5">
                    <h2 className="text-xl font-semibold">Terms</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                        The privacy notice works with the <Link to="/terms" className="text-cyan-200 hover:underline">Active Mirror terms</Link>, including the AI-output limits and acceptable-use rules.
                    </p>
                </section>

                <p className="mt-8 text-xs leading-6 text-zinc-400">
                    This notice is a practical product privacy statement, not legal advice. It may be updated as Active Mirror adds accounts, paid plans, enterprise deployments, or new processing options.
                </p>
            </main>
        </div>
    );
}
