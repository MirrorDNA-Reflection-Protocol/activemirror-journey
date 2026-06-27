import { ArrowLeft, ArrowRight, CheckCircle, FileCheck2, Lock, ShieldCheck, SlidersHorizontal, Sparkles, TerminalSquare, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const outcomes = [
    'One workflow reflected into a usable next move.',
    'Source-sensitive claims marked before reliance.',
    'Private context kept out unless explicitly needed.',
    'Plain-language receipt for what was used, left out, and checked.',
];

const proofSteps = [
    {
        title: 'Bring one workflow',
        text: 'A decision, research flow, approval path, or recurring task where AI output needs review before action.',
    },
    {
        title: 'Run it through the mirror',
        text: 'Active Mirror reflects the real question, narrows broad claims, and creates one usable next move.',
    },
    {
        title: 'Read the receipt',
        text: 'You see what was used, what stayed out, what needed sources, and what should not be treated as proven.',
    },
];

const variants = [
    {
        name: 'Glass Box',
        for: 'AI transparency',
        shows: 'tool calls, rule blocks, source checks, memory decisions',
    },
    {
        name: 'Compliance',
        for: 'regulated review',
        shows: 'approvals, evidence gaps, receipt status, escalation paths',
    },
    {
        name: 'Research',
        for: 'source-heavy teams',
        shows: 'claim state, source quality, contradictions, open questions',
    },
    {
        name: 'Ops',
        for: 'automation teams',
        shows: 'runs, failures, queues, rollback points, human gates',
    },
    {
        name: 'Team Room',
        for: 'shared work',
        shows: 'who touched what, pending decisions, next approvals',
    },
];

const modules = [
    {
        name: 'MirrorDash',
        text: 'A glass-box control room for routed AI work: gates, tools, files, memory decisions, risk, and active automation state.',
    },
    {
        name: 'Execution capture',
        text: 'Observable process capture for model routes, tool calls, file access, web calls, automation state, approvals, warnings, and blocks.',
    },
    {
        name: 'MirrorProof',
        text: 'A proof pack for serious outputs: what was asked, what was used, what stayed out, what was checked, and what still needs evidence.',
    },
    {
        name: 'Signed Consent Gate',
        text: 'Cryptographic approval before sensitive context, memory, external sharing, or high-risk actions move forward.',
    },
    {
        name: 'Default Ledger',
        text: 'Team-approved defaults for what can be used automatically, what needs approval, and what should never leave the boundary.',
    },
    {
        name: 'Replay & recovery',
        text: 'A timeline view for routed work so teams can inspect decisions, recover from drift, and compare what changed.',
    },
    {
        name: 'Private deployment',
        text: 'A browser-first or self-hosted proof environment for teams that need sensitive workflows contained.',
    },
    {
        name: 'Mini control plane',
        text: 'An always-on local control plane can hold queues, ledgers, watchdogs, and private dashboards without becoming the public site source.',
    },
];

const tuiRows = [
    ['BEHAVIORAL METRICS', 'Integrity 92/100 · Drift low · Recurrence 0.07', 'ok'],
    ['GATE ACTIVITY', '2 held · 7 warned · 191 allowed · source-sensitive marked', 'warn'],
    ['MODEL / TOOL ROUTE', 'Reflection → source plan → human approval', 'ok'],
    ['SESSION ARC', 'read · reflect · check · approve · remember', 'live'],
    ['VAULT ACCESS', 'private context excluded · no memory without approval', 'ok'],
    ['RISK MONITOR', 'unsupported claims cannot become checked', 'block'],
];

function EnterpriseConsole() {
    return (
        <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#050608]/90 p-4 shadow-[0_0_90px_rgba(34,211,238,0.12)] ring-1 ring-white/[0.04]">
            <div className="mb-3 flex flex-col gap-2 border-b border-cyan-300/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100">
                        <TerminalSquare size={16} />
                    </span>
                    <div>
                        <div className="text-sm font-semibold text-cyan-100">MirrorDash Enterprise</div>
                        <div className="text-[11px] text-zinc-500">control room profile · live work state</div>
                    </div>
                </div>
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    human approval on
                </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="grid gap-2">
                    {tuiRows.slice(0, 3).map((row) => (
                        <ConsolePanel key={row[0]} row={row} />
                    ))}
                </div>
                <div className="grid gap-2">
                    <div className="rounded-2xl border border-cyan-300/20 bg-black/35 p-3">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Session arc</div>
                        <div className="font-mono text-[11px] leading-5 text-zinc-300">
                            RRXWRRRXRRRXWMMWWXXXXXXNNNNAAOXWRXRWX
                        </div>
                        <div className="mt-2 grid grid-cols-5 gap-1 text-[10px] text-zinc-500">
                            <span>read</span>
                            <span>write</span>
                            <span>check</span>
                            <span>approve</span>
                            <span>memory</span>
                        </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {tuiRows.slice(3).map((row) => (
                            <ConsolePanel key={row[0]} row={row} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ConsolePanel({ row }) {
    const [title, body, state] = row;
    const color = {
        ok: 'border-emerald-300/25 text-emerald-100',
        warn: 'border-amber-300/25 text-amber-100',
        live: 'border-cyan-300/25 text-cyan-100',
        block: 'border-red-300/25 text-red-100',
    }[state] || 'border-white/10 text-zinc-100';

    return (
        <div className={`rounded-2xl border bg-black/35 p-3 ${color}`}>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
            <div className="font-mono text-[11px] leading-5 text-zinc-300">{body}</div>
        </div>
    );
}

export default function Enterprise() {
    return (
        <div className="min-h-dvh overflow-hidden bg-black text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.18),transparent_34%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-10 flex items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <Link to="/mirror" className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12]">
                        Open mirror
                    </Link>
                </nav>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-8">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                            <ShieldCheck size={14} />
                            Governed reflection for real work
                        </div>
                        <h1 className="max-w-[11ch] text-[3.25rem] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[5rem]">
                            Prove the work before it moves.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                            Active Mirror helps teams use AI without turning every output into a trust exercise. Bring one workflow. Get one next move, one receipt, and a clear view of what still needs proof.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="mailto:paul@activemirror.ai?subject=Active%20Mirror%20enterprise%20proof"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-black shadow-[0_0_34px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
                            >
                                Start a proof sprint
                                <ArrowRight size={17} />
                            </a>
                            <Link
                                to="/"
                                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-200 transition hover:border-purple-300/30 hover:text-white"
                            >
                                Try it first
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <EnterpriseConsole />

                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100">
                                    <FileCheck2 size={18} />
                                </span>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">What you get</h2>
                            </div>
                            <div className="grid gap-3">
                                {outcomes.map((item) => (
                                    <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300">
                                        <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-purple-100">
                                    <Workflow size={18} />
                                </span>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">72-hour proof</h2>
                            </div>
                            <div className="grid gap-3">
                                {proofSteps.map((step, index) => (
                                    <div key={step.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                            <span>{String(index + 1).padStart(2, '0')}</span>
                                            <span>{step.title}</span>
                                        </div>
                                        <p className="text-sm leading-6 text-zinc-400">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.07] p-5">
                        <Lock size={20} className="mb-4 text-emerald-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Private first</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">Use only what the workflow needs. Sensitive context stays out unless explicitly approved.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
                        <Sparkles size={20} className="mb-4 text-cyan-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Reflection first</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">The system challenges vague claims, narrows the work, and keeps the next move concrete.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-purple-300/15 bg-purple-300/[0.07] p-5">
                        <FileCheck2 size={20} className="mb-4 text-purple-100" />
                        <h3 className="font-semibold tracking-[-0.02em]">Receipts by default</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">Every serious turn can show what was used, what was excluded, and what still needs proof.</p>
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1 text-xs font-semibold text-cyan-200">
                                <SlidersHorizontal size={14} />
                                Choose the control room
                            </div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">One mirror, different enterprise views.</h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-zinc-400">
                            The same governed workflow can show a different surface for compliance, research, operations, or leadership.
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-5">
                        {variants.map((variant) => (
                            <div key={variant.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                <div className="text-sm font-semibold text-white">{variant.name}</div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/65">{variant.for}</div>
                                <p className="mt-3 text-xs leading-5 text-zinc-400">{variant.shows}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/[0.07] px-3 py-1 text-xs font-semibold text-purple-200">
                                <ShieldCheck size={14} />
                                Enterprise modules
                            </div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Use only the parts your workflow needs.</h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-zinc-400">
                            Start with one proof sprint, then add gates and dashboards where the work actually needs them.
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                        {modules.map((module) => (
                            <div key={module.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                <div className="text-sm font-semibold text-white">{module.name}</div>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">{module.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
