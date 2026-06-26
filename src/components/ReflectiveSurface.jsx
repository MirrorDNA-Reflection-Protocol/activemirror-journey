import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, FileText, Image, Lock, Map, RotateCcw, Search, Send, Sparkles } from 'lucide-react';

const SURFACES = [
    {
        id: 'decision_map',
        title: 'Decision map',
        summary: 'Separate the choice from the evidence.',
        icon: Compass,
        accent: 'purple',
        test: /\b(decide|decision|choice|choose|between|option|commit|quit|stay|leave|yes|no)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Pressure', text: mirror.question || 'What would make this choice honest?' },
            { label: 'Evidence', text: 'Name the signal that would make one option clearly earned.' },
            { label: 'Move', text: mirror.move || 'Pick the smallest test you can run today.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Make the test', intent: `Turn this into one measurable test: ${mirror.move || mirror.question || 'the next move'}` },
            { label: 'Compare options', intent: `Help me compare the two real options behind this question: ${mirror.question || 'what should I choose?'}` },
        ],
    },
    {
        id: 'research_brief',
        title: 'Research brief',
        summary: 'Turn the question into a source-backed check.',
        icon: Search,
        accent: 'cyan',
        test: /\b(research|source|sources|web|online|competitor|market|find|verify|check|latest|today)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Question', text: mirror.question || 'What needs to be verified before you act?' },
            { label: 'Check', text: 'Look for primary sources, dates, contradictions, and what changed recently.' },
            { label: 'Output', text: 'Bring back a short answer, links, and the one thing it changes.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Make research plan', intent: `Make a focused research plan for this question: ${mirror.question || 'what needs checking?'}` },
            { label: 'List sources', intent: 'What sources would actually prove or disprove this?' },
        ],
    },
    {
        id: 'launch_memo',
        title: 'Launch memo',
        summary: 'Convert messy positioning into something usable.',
        icon: Send,
        accent: 'violet',
        test: /\b(launch|site|homepage|copy|marketing|sales|ad|ads|positioning|offer|customer|user|demo)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Promise', text: 'What the user gets in one sentence.' },
            { label: 'Proof', text: mirror.receipt?.context_used || 'Only use the strongest evidence from this turn.' },
            { label: 'Next', text: mirror.move || 'Ship the smallest public proof.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Draft the memo', intent: `Turn this into a short launch memo: ${mirror.move || mirror.question || 'the next launch move'}` },
            { label: 'Tighten the offer', intent: 'Write the clearest user-facing offer from this reflection.' },
        ],
    },
    {
        id: 'file_review',
        title: 'File review',
        summary: 'Use documents without swallowing private context.',
        icon: FileText,
        accent: 'emerald',
        test: /\b(file|pdf|doc|document|spreadsheet|excel|sheet|deck|screenshot|upload|notes)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Use', text: 'Extract the decision, proof, open questions, and next action.' },
            { label: 'Leave out', text: mirror.receipt?.context_excluded || 'Private or unrelated details stay out.' },
            { label: 'Return', text: 'A short brief plus exact excerpts that matter.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Set review rules', intent: `Set rules for reviewing a file for this: ${mirror.question || mirror.move || 'the current task'}` },
            { label: 'Make checklist', intent: 'Make a file review checklist that keeps private details out.' },
        ],
    },
    {
        id: 'visual_board',
        title: 'Visual board',
        summary: 'Shape the image, scene, or artifact before making it.',
        icon: Image,
        accent: 'cyan',
        test: /\b(image|visual|video|screen|screenshot|design|figma|render|asset|poster|canvas|look|feel)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Scene', text: 'What should the user understand before reading?' },
            { label: 'Focus', text: mirror.question || 'What visual decision matters most?' },
            { label: 'Make', text: mirror.move || 'Create one strong visual, not a collage.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Make visual brief', intent: `Turn this into a visual brief: ${mirror.move || mirror.question || 'the visual direction'}` },
            { label: 'Simplify scene', intent: 'Reduce this into one striking visual moment.' },
        ],
    },
    {
        id: 'boundary_map',
        title: 'Boundary map',
        summary: 'Show what can help without taking what should stay yours.',
        icon: Lock,
        accent: 'emerald',
        test: /\b(private|privacy|secret|boundary|safe|client|confidential|memory|save|share|personal)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Used', text: mirror.receipt?.context_used || 'Only what you typed here.' },
            { label: 'Left out', text: mirror.receipt?.context_excluded || 'Private context stays out unless approved.' },
            { label: 'Choice', text: mirror.receipt?.memory_decision || 'Nothing becomes memory unless accepted.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Set boundary', intent: `Help me define the boundary for this work: ${mirror.question || 'what should stay private?'}` },
            { label: 'Explain privacy', intent: 'Show me what Active Mirror used, left out, and did not save.' },
        ],
    },
    {
        id: 'reset_flow',
        title: 'Reset flow',
        summary: 'Lower the noise without losing the thread.',
        icon: RotateCcw,
        accent: 'amber',
        test: /\b(overwhelmed|confused|spiral|stuck|anxious|tired|lost|drift|reset|pause|too much|scattered)\b/i,
        blocks: ({ mirror }) => [
            { label: 'Name it', text: mirror.reflection || 'You may be carrying too many open loops at once.' },
            { label: 'Shrink it', text: mirror.move || 'Pick one action small enough to finish.' },
            { label: 'Return', text: 'Keep only the conclusion you still trust.' },
        ],
        actions: ({ mirror }) => [
            { label: 'Make it smaller', intent: `Make this easier to start: ${mirror.move || 'the next move'}` },
            { label: 'Reset the thread', intent: 'Reset this into one sentence, one question, and one move.' },
        ],
    },
];

const DEFAULT_SURFACE = {
    id: 'next_move',
    title: 'Next move',
    summary: 'Keep the work small enough to start.',
    icon: Map,
    accent: 'purple',
    blocks: ({ mirror }) => [
        { label: 'Question', text: mirror.question || 'What is the real question?' },
        { label: 'Move', text: mirror.move || 'Choose one concrete action.' },
        { label: 'Check', text: 'After doing it, decide what changed.' },
    ],
    actions: ({ mirror }) => [
        { label: 'Help me start', intent: `Help me start this: ${mirror.move || mirror.question || 'the next move'}` },
        { label: 'Make it concrete', intent: `Make this more concrete: ${mirror.move || 'the next move'}` },
    ],
};

const accentStyles = {
    purple: {
        shell: 'border-purple-300/20 bg-purple-300/[0.075]',
        text: 'text-purple-100',
        icon: 'text-purple-200',
        line: 'from-purple-300/80 to-cyan-200/80',
        button: 'hover:border-purple-300/35 hover:bg-purple-300/[0.10]',
    },
    violet: {
        shell: 'border-violet-300/20 bg-violet-300/[0.075]',
        text: 'text-violet-100',
        icon: 'text-violet-200',
        line: 'from-violet-300/80 to-fuchsia-200/70',
        button: 'hover:border-violet-300/35 hover:bg-violet-300/[0.10]',
    },
    cyan: {
        shell: 'border-cyan-300/20 bg-cyan-300/[0.065]',
        text: 'text-cyan-100',
        icon: 'text-cyan-200',
        line: 'from-cyan-200/80 to-emerald-200/70',
        button: 'hover:border-cyan-300/35 hover:bg-cyan-300/[0.10]',
    },
    emerald: {
        shell: 'border-emerald-300/20 bg-emerald-300/[0.065]',
        text: 'text-emerald-100',
        icon: 'text-emerald-200',
        line: 'from-emerald-200/80 to-cyan-200/70',
        button: 'hover:border-emerald-300/35 hover:bg-emerald-300/[0.10]',
    },
    amber: {
        shell: 'border-amber-300/20 bg-amber-300/[0.065]',
        text: 'text-amber-100',
        icon: 'text-amber-200',
        line: 'from-amber-200/80 to-purple-200/70',
        button: 'hover:border-amber-300/35 hover:bg-amber-300/[0.10]',
    },
};

export function chooseReflectiveSurface(intent = '') {
    const fileSurface = SURFACES.find((surface) => surface.id === 'file_review' && surface.test.test(intent));
    if (fileSurface) return fileSurface;

    return SURFACES.find((surface) => surface.test.test(intent)) || DEFAULT_SURFACE;
}

export default function ReflectiveSurface({ result, intent, onPrompt, disabled }) {
    const mirror = result?.mirror || {};
    const surface = chooseReflectiveSurface(`${intent} ${mirror.question || ''} ${mirror.move || ''}`);
    const styles = accentStyles[surface.accent] || accentStyles.purple;
    const Icon = surface.icon;
    const blocks = surface.blocks({ mirror });
    const actions = surface.actions({ mirror });

    return (
        <motion.div
            key={surface.id}
            initial={{ y: 10, scale: 0.99 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`overflow-hidden rounded-3xl border ${styles.shell}`}
        >
            <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="flex min-w-0 gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/25 ${styles.icon}`}>
                        <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                        <div className={`text-sm font-semibold ${styles.text}`}>{surface.title}</div>
                        <div className="mt-1 text-xs leading-5 text-zinc-400">{surface.summary}</div>
                    </div>
                </div>
                <Sparkles size={16} className="mt-1 shrink-0 text-white/35" />
            </div>

            <div className={`h-px bg-gradient-to-r ${styles.line} opacity-45`} />

            <div className="grid gap-2 px-4 py-4 sm:grid-cols-3">
                {blocks.map((block) => (
                    <div key={block.label} className="rounded-2xl border border-white/10 bg-black/22 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-zinc-500">
                            <CheckCircle2 size={12} />
                            {block.label}
                        </div>
                        <div className="text-xs leading-5 text-zinc-200">{block.text}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        onClick={() => onPrompt?.(action.intent)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-zinc-200 transition ${styles.button} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {action.label}
                        <ArrowRight size={12} />
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
