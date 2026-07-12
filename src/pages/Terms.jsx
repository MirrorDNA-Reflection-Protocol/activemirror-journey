import { ArrowLeft, Ban, CheckCircle, FileText, Fingerprint, Scale, Shield, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const lastUpdated = 'July 5, 2026';

const prohibited = [
    'Do not paste passwords, API keys, private URLs, payment data, or other secrets.',
    'Do not use Active Mirror to generate illegal, harmful, deceptive, abusive, or harassing content.',
    'Do not probe, scan, overload, scrape, or bypass the service, rate limits, or safety protections.',
    'Do not use outputs as professional medical, legal, financial, or mental-health advice.',
];

export default function Terms() {
    return (
        <div className="min-h-dvh bg-black text-white">
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

            <main className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Active Mirror
                </Link>

                <header className="mb-10">
                    <h1 className="text-5xl font-semibold leading-none sm:text-6xl">Terms</h1>
                    <p className="mt-4 text-sm text-zinc-400">Last updated: {lastUpdated}</p>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                        Active Mirror is an AI-assisted reflection service. Use it to clarify work, not to skip your own review.
                    </p>
                </header>

                <section className="mb-8 rounded-lg border border-teal-300/15 bg-teal-300/[0.08] p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <FileText size={20} className="text-teal-100" />
                        <h2 className="text-lg font-semibold text-teal-100">Short version</h2>
                    </div>
                    <ul className="space-y-2 text-sm leading-6 text-zinc-300">
                        <li>Bring one thing you want reflected.</li>
                        <li>Review the output before acting on it.</li>
                        <li>Keep secrets and sensitive details out.</li>
                        <li>Memory, saved notes, and defaults are your choice.</li>
                        <li>Abuse, scraping, bypass attempts, and automated overload are not allowed.</li>
                    </ul>
                </section>

                <section className="grid gap-4">
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <Scale size={20} className="text-cyan-100" />
                            <h2 className="text-xl font-semibold">Agreement</h2>
                        </div>
                        <p className="text-sm leading-7 text-zinc-400">
                            By using Active Mirror, you agree to these terms and the privacy notice. The service is operated by N1 Intelligence (OPC) Pvt Ltd. If you do not agree, do not use the service.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <Shield size={20} className="text-cyan-100" />
                            <h2 className="text-xl font-semibold">Your content</h2>
                        </div>
                        <p className="text-sm leading-7 text-zinc-400">
                            You keep ownership of what you submit. You give us permission to process your input only to provide and improve the service, protect the product, enforce these terms, and operate Active Mirror as described in the privacy notice.
                        </p>
                    </div>

                    <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.07] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <TriangleAlert size={20} className="text-amber-100" />
                            <h2 className="text-xl font-semibold">AI output</h2>
                        </div>
                        <p className="text-sm leading-7 text-zinc-300">
                            AI output can be incomplete, wrong, biased, outdated, or inappropriate. Active Mirror is designed to make reasoning clearer, but you remain responsible for decisions and actions you take.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <Fingerprint size={20} className="text-cyan-100" />
                            <h2 className="text-xl font-semibold">Not professional or emergency advice</h2>
                        </div>
                        <p className="text-sm leading-7 text-zinc-400">
                            Active Mirror is not a doctor, lawyer, financial adviser, therapist, crisis service, or emergency service. For urgent safety, health, legal, financial, or mental-health concerns, contact a qualified professional or local emergency support.
                        </p>
                    </div>

                    <div className="rounded-lg border border-red-300/15 bg-red-300/[0.07] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <Ban size={20} className="text-red-100" />
                            <h2 className="text-xl font-semibold">Prohibited use</h2>
                        </div>
                        <ul className="space-y-2 text-sm leading-7 text-zinc-300">
                            {prohibited.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-100" />
                            <h2 className="text-xl font-semibold">Availability and changes</h2>
                        </div>
                        <p className="text-sm leading-7 text-zinc-400">
                            We may change, suspend, rate limit, or discontinue parts of the service to protect users, control cost, improve quality, or comply with law.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <h2 className="text-xl font-semibold">Intellectual property</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            Active Mirror, MirrorDNA, Trust by Design, associated marks, product language, designs, and software are owned by N1 Intelligence (OPC) Pvt Ltd or its licensors. These terms do not give you rights to copy the brand, source, or commercial product materials.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <h2 className="text-xl font-semibold">Liability</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            The service is provided as-is, without warranties. To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, special, or punitive damages arising from use of the service.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <h2 className="text-xl font-semibold">Age and eligibility</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            You must be old enough to use online services in your jurisdiction. Do not use Active Mirror if you are barred from doing so under applicable law.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <h2 className="text-xl font-semibold">Contact</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            Questions about these terms: <a href="mailto:paul@activemirror.ai" className="text-cyan-200 hover:underline">paul@activemirror.ai</a>.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                        <h2 className="text-xl font-semibold">Privacy</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            Read the <Link to="/privacy" className="text-cyan-200 hover:underline">Active Mirror privacy notice</Link> for what is sent, what stays local, and how telemetry is limited.
                        </p>
                    </div>
                </section>

                <p className="mt-8 text-xs leading-6 text-zinc-400">
                    These public terms are a practical operating baseline, not legal advice. They should be reviewed before paid launch, enterprise contracting, or jurisdiction-specific campaigns.
                </p>
            </main>
        </div>
    );
}
