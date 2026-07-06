import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    CircleDot,
    Database,
    Download,
    FileCheck2,
    FileSearch,
    KeyRound,
    Lock,
    Mail,
    Play,
    RotateCcw,
    Send,
    ServerCog,
    ShieldAlert,
    ShieldCheck,
    TerminalSquare,
    Workflow,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';

const ENTERPRISE_STREAM_URL = 'https://gateway.activemirror.ai/v1/mirror/enterprise-stream';
const PROOF_SPRINT_URL = 'https://gateway.activemirror.ai/v1/mirror/proof-sprint';

const workflowRuns = [
    {
        id: 'research',
        label: 'Research brief',
        request: 'Turn a source pile into a board-ready brief.',
        output: 'Brief outline, open questions, and a next move for review.',
        risk: 'medium',
        steps: [
            ['intake', 'workflow received', 'Only the selected files and brief are in scope.', 'ok'],
            ['boundary', 'private context held', 'Unneeded names and side notes stay out.', 'ok'],
            ['path', 'research path selected', 'Facts that affect decisions are marked for checking.', 'live'],
            ['check', 'open items marked', 'Two lines need better support before use.', 'warn'],
            ['record', 'review notes ready', 'Used, excluded, checked, and open items recorded.', 'ok'],
        ],
    },
    {
        id: 'approval',
        label: 'Approval memo',
        request: 'Review an AI-generated memo before it goes to leadership.',
        output: 'Risk notes, edits, approval state, and a clean handoff.',
        risk: 'high',
        steps: [
            ['intake', 'memo opened', 'The draft is readable, but not trusted yet.', 'ok'],
            ['check', 'figures inspected', 'Numbers without support stay in review.', 'block'],
            ['gate', 'approval required', 'External sharing is paused until a human approves.', 'warn'],
            ['repair', 'safer version produced', 'Weak lines become questions or caveats.', 'live'],
            ['record', 'review trail saved', 'Reviewer, path, changes, and limits recorded.', 'ok'],
        ],
    },
    {
        id: 'ops',
        label: 'Agent run',
        request: 'Let an agent prepare work without letting it act alone.',
        output: 'Tool calls, blocked actions, files touched, and handoff notes.',
        risk: 'controlled',
        steps: [
            ['start', 'agent started', 'Read-only prep run begins inside the boundary.', 'live'],
            ['tools', 'tools observed', 'Search, file read, and draft actions are logged.', 'ok'],
            ['block', 'side effect blocked', 'No external send or destructive action without approval.', 'block'],
            ['handoff', 'human checkpoint', 'The next action waits for review.', 'warn'],
            ['record', 'run summarized', 'What happened, what changed, and what is next are visible.', 'ok'],
        ],
    },
];

const controls = [
    {
        icon: Lock,
        title: 'No silent sharing',
        text: 'External sends, tool actions, and sensitive context require scoped approval.',
    },
    {
        icon: FileCheck2,
        title: 'No hidden work',
        text: 'Each serious output shows what was used, what stayed out, and what still needs support.',
    },
    {
        icon: ShieldCheck,
        title: 'No unapproved AI use',
        text: 'Teams can allow different AI help while keeping the same approval rules.',
    },
    {
        icon: Workflow,
        title: 'No runaway defaults',
        text: 'Repeated work can use defaults, but defaults stay editable and reversible.',
    },
];

const sprintDeliverables = [
    ['Workflow map', 'What the AI may read, produce, suggest, or keep out of scope.'],
    ['Boundary map', 'Private context, approval points, data exits, and blocked actions.'],
    ['Working demo', 'One useful flow running against sample or scoped real context.'],
    ['Go / no-go plan', 'What to deploy, what to hold, and what needs stronger support.'],
];

const consultingServices = [
    ['AI workflow discovery', 'Find the first workflow worth proving, then define the output, owner, risk, and approval path.'],
    ['Private deployment design', 'Choose the right shape: browser-first, self-hosted, local machine, private server, or managed access.'],
    ['Tool and file integration', 'Connect the files, apps, and actions the workflow actually needs, with clear limits.'],
    ['Operating rules', 'Use the right AI help while keeping permission, review, and support rules outside the answer.'],
    ['Testing and review', 'Test hallucination, privacy leakage, weak support, and unsafe action paths before rollout.'],
    ['Team enablement', 'Create the operating playbook, first workflows, and review habits your team can keep using.'],
];

const workSteps = [
    ['Scope', 'Choose one valuable task with a clear owner and output.'],
    ['Map', 'Define what AI may read, remember, suggest, or send.'],
    ['Build', 'Connect the minimum files, tools, and approvals needed to run it.'],
    ['Test', 'Check privacy leakage, hallucination, weak support, and unsafe action paths.'],
    ['Decide', 'Ship, pause, or redesign with a clear record of what happened.'],
];

const offerLadder = [
    {
        title: 'Workflow Sprint',
        time: 'Start here',
        text: 'One workflow, one working demo, one go / no-go decision.',
    },
    {
        title: 'Private AI Deployment',
        time: 'When the sprint works',
        text: 'A controlled AI layer for selected tools, files, users, and approvals.',
    },
    {
        title: 'Ongoing Governance',
        time: 'After rollout',
        text: 'Evals, red-team runs, policy updates, model changes, and team enablement.',
    },
];

const proofStory = [
    ['Before', 'A research workflow had useful AI drafts, urgent data fires, and no clear line between private context, weak lines, and review-ready output.'],
    ['After', 'The work became a safer research workflow: selected material in, weak spots marked, human review before sharing.'],
    ['Result', 'Less rework, fewer blind spots, and a repeatable path for research, briefs, and executive review.'],
];

const whyUs = [
    ['Useful before scale', 'Start with one workflow that produces something your team can judge.'],
    ['Private by design', 'Context is scoped before AI help touches it.'],
    ['Built for control', 'Approvals, blocked actions, and support needs stay visible.'],
    ['AI-flexible', 'Use the right AI help without letting any one system define the rules.'],
];

const architectureQuestions = [
    ['Context', 'Where does the work live today: files, apps, browser tabs, inboxes, dashboards?'],
    ['Control', 'Who approves memory, sharing, tool use, and external actions?'],
    ['Output', 'What should the system produce: brief, memo, report, research pack, decision note, task handoff?'],
    ['Deployment', 'What belongs in the browser, on your machines, in a private server, or behind managed access?'],
];

const architectureDiagrams = [
    {
        title: 'Browser pilot',
        text: 'Fastest way to prove one workflow before any rollout.',
        nodes: ['Browser', 'Chosen files', 'Active Mirror', 'Approved output'],
    },
    {
        title: 'Private server',
        text: 'For teams that need managed access, logs, and shared controls.',
        nodes: ['Team tools', 'Private gateway', 'Allowed AI help', 'Review trail'],
    },
    {
        title: 'Local control',
        text: 'For sensitive work where context should stay closest to your machines.',
        nodes: ['Your machines', 'Local context', 'Approved AI help', 'Team handoff'],
    },
];

const views = [
    ['Control dashboard', 'live work state, files, checks, tools, approvals'],
    ['Review pack', 'support trail for serious outputs'],
    ['Consent check', 'approval before memory, sharing, or side effects'],
    ['Private deployment', 'browser-first, self-hosted, or managed access'],
];

const machineryPanels = [
    {
        icon: FileSearch,
        title: 'Files',
        value: 'selected only',
        note: 'Unneeded context stays out.',
        tone: 'cyan',
    },
    {
        icon: ServerCog,
        title: 'Tools',
        value: 'observed',
        note: 'Reads, searches, and drafts are logged.',
        tone: 'violet',
    },
    {
        icon: ShieldAlert,
        title: 'Actions',
        value: 'approval first',
        note: 'External sends and side effects wait.',
        tone: 'amber',
    },
    {
        icon: Database,
        title: 'Memory',
        value: 'choice',
        note: 'Durable memory waits for approval.',
        tone: 'emerald',
    },
    {
        icon: KeyRound,
        title: 'Support',
        value: 'marked',
        note: 'Weak spots are visible.',
        tone: 'cyan',
    },
    {
        icon: FileCheck2,
        title: 'Review',
        value: 'ready',
        note: 'Used, excluded, and open items stay reviewable.',
        tone: 'emerald',
    },
];

function enterpriseBriefMarkdown() {
    return [
        '# Active Mirror Private AI Workflow Sprint',
        '',
        'Active Mirror helps teams use AI on private work without losing control.',
        '',
        'Bring one real workflow. We map the context, files, tools, approvals, and allowed AI help around your rules. The first sprint is deliberately narrow: prove one useful flow, surface the risks, and leave a clean go / no-go path.',
        '',
        '## What the sprint answers',
        '',
        '- What can AI help with in this workflow?',
        '- What context is required, and what should stay out?',
        '- Where must a human approve memory, sharing, or action?',
        '- Which outputs need support before they move?',
        '- What deployment shape fits: browser-first, local machine, private server, or managed access?',
        '',
        '## Sprint deliverables',
        '',
        '- Workflow map',
        '- Boundary map',
        '- Working demo',
        '- Go / no-go plan',
        '',
        '## Services',
        '',
        '- AI workflow discovery',
        '- Private deployment design',
        '- Tool and file integration',
        '- Operating rules',
        '- Testing and review',
        '- Team enablement',
        '',
        '## How we work',
        '',
        '- Scope',
        '- Map',
        '- Build',
        '- Test',
        '- Decide',
        '',
        '## Offer ladder',
        '',
        '- Workflow Sprint',
        '- Private AI Deployment',
        '- Ongoing Governance',
        '',
        '## Case study pattern',
        '',
        'Composite example. No client data.',
        '',
        'Before: a research workflow had useful AI drafts, urgent data fires, and no clear line between private context, weak lines, and review-ready output.',
        'After: the work became a safer research workflow: selected material in, weak spots marked, human review before sharing.',
        'Result: less rework and a repeatable path for research, briefs, and executive review.',
        '',
        '## What not to send first',
        '',
        'Do not send private workflow content through the public request form. Start with work email, workflow type, and timeline. Details come after scoped intake.',
        '',
        '## First call checklist',
        '',
        '- One workflow worth proving',
        '- Data sensitivity level',
        '- Tools and files involved',
        '- Desired output',
        '- Approval owner',
        '- What must stay out of shared or stored context',
    ].join('\n');
}

function downloadEnterpriseBrief() {
    const blob = new Blob([enterpriseBriefMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'active-mirror-private-ai-workflow-sprint.md';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 400);
    trackEvent('draft_downloaded', { page: 'enterprise', source: 'workflow_sprint_brief', status: 'local' });
}

const timelineOptions = [
    ['72h', '72 hours'],
    ['this_week', 'This week'],
    ['exploring', 'Exploring'],
];

const statusStyles = {
    ok: 'border-emerald-300/25 text-emerald-100 bg-emerald-300/[0.06]',
    live: 'border-cyan-300/25 text-cyan-100 bg-cyan-300/[0.06]',
    warn: 'border-amber-300/25 text-amber-100 bg-amber-300/[0.06]',
    block: 'border-red-300/25 text-red-100 bg-red-300/[0.06]',
};

function defaultMetrics(run) {
    return [
        { label: 'Approval', value: 'Human on', tone: 'emerald' },
        { label: 'Risk', value: run.risk, tone: run.risk === 'high' ? 'amber' : 'cyan' },
        { label: 'Saved context', value: 'choice', tone: 'violet' },
        { label: 'Sharing', value: 'gated', tone: 'emerald' },
    ];
}

function cleanEnterpriseText(value = '') {
    return String(value)
        .replace(/\bproof pack\b/gi, 'review pack')
        .replace(/\bproof\b/gi, 'support')
        .replace(/\bevidence\b/gi, 'support')
        .replace(/\broute\b/gi, 'path')
        .replace(/\breceipt\b/gi, 'record');
}

function cleanStepKey(value = '') {
    const keys = {
        route: 'path',
        claim: 'check',
        receipt: 'record',
    };
    return keys[value] || value;
}

function formatControlPath(value = '') {
    const labels = {
        'request.read': 'request',
        'boundary.check': 'boundary',
        'route.choose': 'choose path',
        'human.approve': 'approval',
        intake: 'intake',
        boundary: 'boundary',
        approval: 'approval',
        receipt: 'record',
    };
    return String(value || '')
        .split('->')
        .map((part) => {
            const token = part.trim();
            const cleaned = cleanEnterpriseText(token);
            return labels[token] || cleaned.replace('support.mark', 'mark support');
        })
        .filter(Boolean)
        .join(' -> ');
}

function stepTupleFromPayload(payload, fallback) {
    const raw = payload?.step
        ? [
            payload.step.key,
            payload.step.title,
            payload.step.body,
            payload.step.status,
        ]
        : fallback;
    return [
        cleanStepKey(raw[0]),
        cleanEnterpriseText(raw[1]),
        cleanEnterpriseText(raw[2]),
        raw[3],
    ];
}

function useEnterpriseRun(activeRun) {
    const [restartKey, setRestartKey] = useState(0);
    const [state, setState] = useState({
        index: 0,
        source: 'connecting',
        connected: false,
        error: false,
        payload: null,
    });

    useEffect(() => {
        setState({
            index: 0,
            source: 'connecting',
            connected: false,
            error: false,
            payload: null,
        });
    }, [activeRun.id]);

    useEffect(() => {
        let cancelled = false;
        let eventSource = null;
        let localTimer = null;
        let restartTimer = null;

        function closeStream() {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
        }

        function stopLocal() {
            if (localTimer) {
                window.clearInterval(localTimer);
                localTimer = null;
            }
        }

        function startLocalReplay() {
            closeStream();
            if (localTimer || cancelled) return;
            setState((current) => ({
                ...current,
                source: 'local',
                connected: false,
                error: true,
                payload: null,
            }));
            localTimer = window.setInterval(() => {
                setState((current) => ({
                    ...current,
                    index: (current.index + 1) % activeRun.steps.length,
                    source: 'local',
                    connected: false,
                    payload: null,
                }));
            }, 1800);
        }

        function openStream() {
            stopLocal();
            closeStream();

            if (typeof window === 'undefined' || !('EventSource' in window)) {
                startLocalReplay();
                return;
            }

            setState((current) => ({
                ...current,
                source: current.payload ? 'gateway' : 'connecting',
                connected: Boolean(current.payload),
                error: false,
            }));

            eventSource = new EventSource(`${ENTERPRISE_STREAM_URL}?run=${encodeURIComponent(activeRun.id)}`);

            eventSource.addEventListener('mirror.event', (event) => {
                if (cancelled) return;
                try {
                    const payload = JSON.parse(event.data);
                    setState({
                        index: Number.isFinite(payload.index) ? payload.index : 0,
                        source: 'gateway',
                        connected: true,
                        error: false,
                        payload,
                    });
                } catch {
                    startLocalReplay();
                }
            });

            eventSource.addEventListener('mirror.done', () => {
                closeStream();
                if (!cancelled) {
                    restartTimer = window.setTimeout(openStream, 1400);
                }
            });

            eventSource.onerror = () => {
                if (!cancelled) startLocalReplay();
            };
        }

        openStream();

        return () => {
            cancelled = true;
            closeStream();
            stopLocal();
            if (restartTimer) window.clearTimeout(restartTimer);
        };
    }, [activeRun.id, activeRun.steps.length, restartKey]);

    const index = Math.min(state.index, activeRun.steps.length - 1);

    function restart() {
        setState({
            index: 0,
            source: 'connecting',
            connected: false,
            error: false,
            payload: null,
        });
        setRestartKey((current) => current + 1);
    }

    const visibleSteps = useMemo(() => {
        return activeRun.steps.map((step, stepIndex) => ({
            step,
            active: stepIndex === index,
            complete: stepIndex < index,
        }));
    }, [activeRun.steps, index]);

    return {
        index,
        restart,
        visibleSteps,
        payload: state.payload,
        streamSource: state.source,
        streamConnected: state.connected,
        streamError: state.error,
    };
}

function LiveConsole({ run }) {
    const { index, restart, visibleSteps, payload, streamSource, streamConnected, streamError } = useEnterpriseRun(run);
    const active = stepTupleFromPayload(payload, run.steps[index]);
    const completed = payload?.progress || Math.round(((index + 1) / run.steps.length) * 100);
    const metrics = payload?.metrics || defaultMetrics(run);
    const route = formatControlPath(payload?.route || 'intake -> boundary -> support -> approval -> record');
    const streamLabel = streamConnected ? 'live demo' : streamSource === 'local' ? 'offline replay' : 'connecting';
    const streamPill = streamConnected ? 'demo on' : streamError ? 'offline replay' : 'connecting';

    return (
        <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#050608]/92 shadow-[0_0_90px_rgba(34,211,238,0.12)] ring-1 ring-white/[0.04]">
            <div className="flex flex-col gap-3 border-b border-cyan-300/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100">
                        <TerminalSquare size={18} />
                    </span>
                    <div>
                        <div className="text-sm font-semibold text-cyan-100">Live workflow console</div>
                        <div className="text-[11px] text-zinc-500">{streamLabel}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${streamConnected ? 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200' : 'border-white/10 bg-white/[0.04] text-zinc-400'}`}>
                        {streamPill}
                    </span>
                    <button
                        type="button"
                        onClick={restart}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-zinc-300 transition hover:border-cyan-300/35 hover:text-white"
                    >
                        <RotateCcw size={13} />
                        Restart
                    </button>
                </div>
            </div>

            <div className="grid gap-3 p-4 lg:grid-cols-[1fr_1.08fr]">
                <div className="grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Review path</div>
                        <div className="font-mono text-[12px] leading-6 text-zinc-300">
                            {route}
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 transition-all duration-500"
                                style={{ width: `${completed}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {machineryPanels.map((item) => (
                            <MachineryPanel key={item.title} item={item} />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {metrics.map((metric) => (
                            <Metric key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
                        ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Current checkpoint</div>
                        <div className="flex items-start gap-3">
                            <CircleDot className="mt-1 h-4 w-4 shrink-0 animate-pulse text-cyan-200" />
                            <div>
                                <div className="text-sm font-semibold text-white">{active[1]}</div>
                                <p className="mt-1 text-sm leading-6 text-zinc-400">{active[2]}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Approval activity</div>
                        <div className="font-mono text-[10px] text-zinc-500">step {index + 1}/{run.steps.length}</div>
                    </div>
                    <div className="grid gap-2">
                        {visibleSteps.map(({ step, active: isActive, complete }) => {
                            const [key, title, body, status] = step;
                            return (
                                <div
                                    key={key}
                                    className={`rounded-xl border px-3 py-2 transition ${
                                        isActive ? statusStyles[status] : complete ? 'border-emerald-300/15 bg-emerald-300/[0.035]' : 'border-white/10 bg-white/[0.025]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">{key}</span>
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[status]}`}>{status}</span>
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-white">{title}</div>
                                    <div className="mt-1 text-xs leading-5 text-zinc-500">{body}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function MachineryPanel({ item }) {
    const Icon = item.icon;
    const colors = {
        emerald: 'border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-100',
        cyan: 'border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-100',
        violet: 'border-violet-300/15 bg-violet-300/[0.055] text-violet-100',
        amber: 'border-amber-300/15 bg-amber-300/[0.055] text-amber-100',
    };

    return (
        <div className={`rounded-2xl border p-3 ${colors[item.tone] || colors.cyan}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <Icon size={15} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">{item.title}</span>
            </div>
            <div className="text-sm font-semibold tracking-[-0.02em]">{item.value}</div>
            <div className="mt-1 text-[11px] leading-4 text-zinc-400">{item.note}</div>
        </div>
    );
}

function ArchitectureDiagram({ diagram }) {
    return (
        <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4">
            <div className="mb-4">
                <div className="text-sm font-semibold text-white">{diagram.title}</div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{diagram.text}</p>
            </div>
            <div className="grid gap-2">
                {diagram.nodes.map((node, index) => (
                    <div key={node} className="flex items-center gap-2">
                        <div className="min-w-0 flex-1 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.055] px-3 py-2 text-xs font-semibold text-cyan-50">
                            {node}
                        </div>
                        {index < diagram.nodes.length - 1 ? (
                            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Metric({ label, value, tone }) {
    const colors = {
        emerald: 'border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-100',
        cyan: 'border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-100',
        violet: 'border-violet-300/15 bg-violet-300/[0.06] text-violet-100',
        amber: 'border-amber-300/15 bg-amber-300/[0.06] text-amber-100',
    };

    return (
        <div className={`rounded-2xl border p-4 ${colors[tone] || colors.cyan}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</div>
            <div className="mt-2 text-xl font-semibold tracking-[-0.03em]">{value}</div>
        </div>
    );
}

function proofSprintFallbackHref({ workflow, timeline, receiptId }) {
    const workflowLabel = workflowRuns.find((run) => run.id === workflow)?.label || 'Not sure';
    const timelineLabel = timelineOptions.find(([value]) => value === timeline)?.[1] || timeline;
    const subject = encodeURIComponent('Active Mirror workflow sprint');
    const body = encodeURIComponent([
        'I want to start an Active Mirror workflow sprint.',
        '',
        `Workflow: ${workflowLabel}`,
        `Timeline: ${timelineLabel}`,
        receiptId ? `Request reference: ${receiptId}` : '',
        '',
        'I will share workflow details after scoped intake.',
    ].filter(Boolean).join('\n'));
    return `mailto:paul@activemirror.ai?subject=${subject}&body=${body}`;
}

function ProofSprintRequest({ activeRun, source = 'final' }) {
    const [replyTo, setReplyTo] = useState('');
    const [timeline, setTimeline] = useState('72h');
    const [consent, setConsent] = useState(false);
    const [website, setWebsite] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [fallbackHref, setFallbackHref] = useState('');

    async function submit(event) {
        event.preventDefault();
        const workflow = activeRun?.id || 'unsure';

        if (!replyTo.trim() || !consent) {
            setStatus('error');
            setMessage('Add a work email and consent first.');
            return;
        }

        setStatus('submitting');
        setMessage('');
        setReceipt(null);
        trackEvent('proof_sprint_started', { page: 'enterprise', source, workflow, timeline });

        try {
            const response = await fetch(PROOF_SPRINT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Active-Mirror-Session': getPrivacySessionId(),
                },
                body: JSON.stringify({
                    reply_to: replyTo,
                    workflow,
                    timeline,
                    source,
                    consent,
                    website,
                }),
            });
            const data = await response.json();

            if (!response.ok || data.ok !== true) {
                throw new Error(data.error || 'request_failed');
            }

            const href = proofSprintFallbackHref({ workflow, timeline, receiptId: data.receipt_id });
            setReceipt(data);
            setFallbackHref(href);
            setStatus('ready');
            setMessage('Request sent. Details stayed out.');
            trackEvent('proof_sprint_result', { page: 'enterprise', source, workflow, timeline, status: 'ok' });
        } catch (error) {
            const href = proofSprintFallbackHref({ workflow, timeline });
            setFallbackHref(href);
            setStatus(error.message === 'rate_limited' ? 'cooldown' : 'error');
            setMessage(error.message === 'rate_limited' ? 'The request path is cooling down. Use the email fallback.' : 'Could not send through the gateway. Use the email fallback.');
            trackEvent('proof_sprint_result', { page: 'enterprise', source, workflow, timeline, status: 'fallback' });
        }
    }

    return (
        <form id="proof-sprint" onSubmit={submit} className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.07] p-5 text-left ring-1 ring-white/[0.04] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <Mail size={14} />
                        Scoped request
                    </div>
                    <h2 className="text-3xl font-semibold tracking-[-0.05em]">Start a workflow sprint.</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
                        Send a work email and the rough workflow. Details come after scoped intake.
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-300">
                    Selected: <span className="font-semibold text-white">{activeRun?.label || 'Not sure'}</span>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_13rem]">
                <label className="grid gap-2 text-sm font-semibold text-zinc-200">
                    Work email
                    <input
                        type="email"
                        value={replyTo}
                        onChange={(event) => setReplyTo(event.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="min-h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/45"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-zinc-200">
                    Timeline
                    <select
                        value={timeline}
                        onChange={(event) => setTimeline(event.target.value)}
                        className="min-h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-base text-white outline-none transition focus:border-emerald-300/45"
                    >
                        {timelineOptions.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </label>
                <label className="hidden" aria-hidden="true">
                    Website
                    <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
                </label>
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-zinc-300">
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black"
                />
                I consent to be contacted about this workflow sprint. I will share workflow details only after scoped intake.
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                    {status === 'submitting' ? 'Sending...' : 'Send request'}
                    <Send size={16} />
                </button>
                {fallbackHref ? (
                    <a
                        href={fallbackHref}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-300/35 hover:text-white"
                    >
                        Open email
                        <ArrowRight size={16} />
                    </a>
                ) : null}
            </div>

            {message ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${status === 'ready' ? 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100' : 'border-amber-300/20 bg-amber-300/[0.08] text-amber-100'}`}>
                    {message}
                    {receipt?.receipt_id ? <span className="ml-2 font-mono text-xs text-zinc-300">Ref {receipt.receipt_id}</span> : null}
                </div>
            ) : null}
        </form>
    );
}

export default function Enterprise() {
    const location = useLocation();
    const [runId, setRunId] = useState(workflowRuns[0].id);
    const activeRun = workflowRuns.find((run) => run.id === runId) || workflowRuns[0];

    useEffect(() => {
        if (!/\/consulting\/?$/.test(location.pathname)) return;
        const timeout = window.setTimeout(() => {
            document.getElementById('consulting')?.scrollIntoView({ block: 'start' });
        }, 80);
        return () => window.clearTimeout(timeout);
    }, [location.pathname]);

    return (
        <div className="min-h-dvh overflow-hidden bg-black text-white selection:bg-emerald-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.16),transparent_34%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
                <nav className="mb-10 flex items-center justify-between gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <Link to="/" className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12]">
                        Try Active Mirror
                    </Link>
                </nav>

                <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_0_70px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-8">
                        <div className="mb-8 grid h-16 w-16 place-items-center rounded-[1.35rem] border border-emerald-200/20 bg-white/[0.045] shadow-[0_0_38px_rgba(16,185,129,0.14)]">
                            <ShieldCheck className="h-8 w-8 text-emerald-100" />
                        </div>
                        <h1 className="max-w-[11ch] text-[3.05rem] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[4.9rem]">
                            Private AI for real work.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                            Bring one workflow. We shape the context, approvals, tools, and allowed AI help around how your team already works.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#proof-sprint"
                                className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-black shadow-[0_0_34px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
                            >
                                Start workflow sprint
                                <ArrowRight size={17} />
                            </a>
                            <button
                                type="button"
                                onClick={downloadEnterpriseBrief}
                                className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] px-5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:text-white"
                            >
                                Download brief
                                <Download size={16} />
                            </button>
                            <Link
                                to="/"
                                className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-zinc-200 transition hover:border-purple-300/30 hover:text-white"
                            >
                                Try it first
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <LiveConsole run={activeRun} />
                    </div>
                </section>

                <section id="consulting" className="mt-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Private AI deployment.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            Active Mirror wraps your AI tools with practical controls: what AI may read, what it may do next, who approves it, and what gets recorded before rollout.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.06] p-6 ring-1 ring-white/[0.04]">
                        <div className="text-sm font-semibold text-emerald-50">One workflow first.</div>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                            We do not replace enterprise AI platforms. We make one workflow usable inside your rules.
                        </p>
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">How we work.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                A short path from unclear AI interest to one controlled workflow your team can judge.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-5">
                        {workSteps.map(([title, text], index) => (
                            <div key={title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] font-mono text-xs font-semibold text-cyan-100">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="text-sm font-semibold text-white">{title}</div>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Start small. Grow only if it works.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            The first sale is not a platform promise. It is one useful workflow, tested under your rules.
                        </p>
                    </div>
                    <div className="grid gap-3">
                        {offerLadder.map((offer) => (
                            <div key={offer.title} className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[12rem_1fr] sm:items-center">
                                <div>
                                    <div className="text-sm font-semibold text-white">{offer.title}</div>
                                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/70">{offer.time}</div>
                                </div>
                                <p className="text-sm leading-6 text-zinc-400">{offer.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.065] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Anonymized case study.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/75">
                                Composite example. No client data.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {proofStory.map(([title, text]) => (
                            <div key={title} className="rounded-2xl border border-emerald-300/15 bg-black/25 p-4">
                                <div className="text-sm font-semibold text-emerald-50">{title}</div>
                                <p className="mt-2 text-sm leading-6 text-zinc-300">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Pick one workflow.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Use the public demo to see the controls. A private sprint connects the same pattern to your real tools, files, approval points, and support needs.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-semibold text-cyan-200">
                            <Play size={14} />
                            Live demo
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {workflowRuns.map((run) => (
                            <button
                                key={run.id}
                                type="button"
                                onClick={() => setRunId(run.id)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    run.id === runId
                                        ? 'border-emerald-300/30 bg-emerald-300/[0.08] shadow-[0_0_30px_rgba(16,185,129,0.10)]'
                                        : 'border-white/10 bg-black/25 hover:border-cyan-300/25 hover:bg-white/[0.045]'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-white">{run.label}</div>
                                    {run.id === runId ? <CheckCircle2 className="h-4 w-4 text-emerald-200" /> : null}
                                </div>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">{run.request}</p>
                                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-zinc-500">
                                    {run.output}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Architecture choices.</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Start narrow. Move closer to the work only when the workflow proves it is worth scaling.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3">
                        {architectureDiagrams.map((diagram) => (
                            <ArchitectureDiagram key={diagram.title} diagram={diagram} />
                        ))}
                    </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 ring-1 ring-white/[0.04] backdrop-blur-2xl">
                        <h2 className="text-2xl font-semibold tracking-[-0.04em]">First call expectation.</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            Bring one workflow, one owner, and one example output. Do not send private files through the public form.
                        </p>
                    </div>
                    <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-6 ring-1 ring-white/[0.04]">
                        <div className="text-sm font-semibold text-cyan-50">Scoped before priced.</div>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                            We scope the workflow first, then decide whether it is a sprint, a deployment, or not worth doing yet.
                        </p>
                    </div>
                </section>

                <section className="mt-6">
                    <ProofSprintRequest activeRun={activeRun} source="final" />
                </section>
            </main>
        </div>
    );
}
