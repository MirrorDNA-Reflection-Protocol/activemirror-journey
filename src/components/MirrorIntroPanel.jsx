import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, MessageSquareText, PencilLine, ShieldCheck, Trash2, UserRoundCheck, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { copyText } from '../lib/sendable-actions';

const TOPIC_OPTIONS = [
    { id: 'work', label: 'Work I am building' },
    { id: 'collaboration', label: 'Ways we could work together' },
    { id: 'ideas', label: 'Ideas and questions' },
    { id: 'availability', label: 'What I am open to next' },
];

function clean(value, limit = 220) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function formFromIntro(intro = {}) {
    const source = intro && typeof intro === 'object' ? intro : {};
    return {
        name: clean(source.name, 80),
        summary: clean(source.summary),
        openTo: clean(source.openTo),
        topics: Array.isArray(source.topics) && source.topics.length ? source.topics : ['work'],
        boundary: clean(source.boundary),
    };
}

function topicLabels(topics = []) {
    return topics
        .map((topic) => TOPIC_OPTIONS.find((option) => option.id === topic)?.label)
        .filter(Boolean);
}

export function buildMirrorIntroPreview(intro = {}) {
    const name = clean(intro.name, 80);
    const summary = clean(intro.summary);
    const openTo = clean(intro.openTo);
    const topics = topicLabels(intro.topics);
    const boundary = clean(intro.boundary);

    if (!name || !summary || !openTo || !topics.length) return '';

    return [
        `Hi, I am Active Mirror, an AI representative for ${name}.`,
        summary,
        `${name} is open to ${openTo}.`,
        `I can discuss: ${topics.join(', ')}.`,
        boundary ? `Please do not ask me to discuss: ${boundary}.` : '',
        `I am here for the first exchange only. I will hand back to ${name} before commitments, scheduling, or sharing private details.`,
    ].filter(Boolean).join('\n\n');
}

export default function MirrorIntroPanel({
    open,
    intro,
    onClose,
    onSave,
    onDelete,
    onRefine,
}) {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [draft, setDraft] = useState(() => formFromIntro(intro));
    const [status, setStatus] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!open) return;
        setDraft(formFromIntro(intro));
        setStatus('');
        setConfirmDelete(false);
    }, [open]);

    const preview = useMemo(() => buildMirrorIntroPreview(draft), [draft]);
    const canSave = Boolean(clean(draft.name, 80) && clean(draft.summary) && clean(draft.openTo) && draft.topics.length);

    if (!open) return null;

    const panelClass = isLight
        ? 'border-stone-300/80 bg-[var(--am-surface)] text-stone-950'
        : 'border-white/12 bg-[var(--am-surface)] text-white';
    const mutedClass = isLight ? 'text-stone-600' : 'text-zinc-400';
    const lineClass = isLight ? 'border-stone-300/70' : 'border-white/10';
    const inputClass = `min-h-11 w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-500/55 ${isLight ? 'border-stone-300/80 text-stone-950 placeholder:text-stone-500' : 'border-white/12 text-white placeholder:text-zinc-500'}`;
    const iconButtonClass = `grid h-10 w-10 place-items-center rounded-lg border transition ${isLight ? 'border-stone-300 bg-white text-stone-600 hover:border-cyan-500/35 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-100/30 hover:text-white'}`;

    function updateField(field, value) {
        setDraft((current) => ({ ...current, [field]: value }));
        setStatus('');
    }

    function toggleTopic(topic) {
        setDraft((current) => {
            const selected = current.topics.includes(topic);
            return {
                ...current,
                topics: selected
                    ? current.topics.filter((item) => item !== topic)
                    : [...current.topics, topic],
            };
        });
        setStatus('');
    }

    function saveIntro() {
        if (!canSave) {
            setStatus('Add a name, one line, what you are open to, and at least one topic.');
            return;
        }
        const saved = onSave?.(draft);
        setStatus(saved ? 'Intro saved on this browser.' : 'This intro could not be saved. Check the required fields and try again.');
    }

    async function copyPreview() {
        if (!preview) return;
        try {
            await copyText(preview);
            setStatus('Preview copied.');
        } catch {
            setStatus('Copy did not work.');
        }
    }

    return (
        <div className="fixed inset-0 z-40 bg-black/68 px-3 py-4 backdrop-blur-md sm:px-6" role="dialog" aria-modal="true" aria-label="Make an intro">
            <button type="button" className="absolute inset-0 cursor-default" aria-label="Close intro" onClick={onClose} />
            <section className={`relative mx-auto flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border ${panelClass}`}>
                <header className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${lineClass}`}>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <UserRoundCheck size={19} className={isLight ? 'text-cyan-700' : 'text-cyan-100'} />
                            <h2 className="text-lg font-semibold">Make an intro</h2>
                        </div>
                        <p className={`mt-1 text-sm leading-6 ${mutedClass}`}>Set exactly what Active Mirror can say in a first exchange.</p>
                    </div>
                    <button type="button" onClick={onClose} className={iconButtonClass} aria-label="Close intro" title="Close">
                        <X size={17} />
                    </button>
                </header>

                <div className="grid min-h-0 gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.82fr)]">
                    <div className={`grid gap-5 px-5 py-5 lg:border-r ${lineClass}`}>
                        <div className="grid gap-2">
                            <label htmlFor="mirror-intro-name" className="text-sm font-semibold">How should people know you?</label>
                            <input
                                id="mirror-intro-name"
                                value={draft.name}
                                maxLength={80}
                                onChange={(event) => updateField('name', event.target.value)}
                                placeholder="Your name or public role"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="mirror-intro-summary" className="text-sm font-semibold">One honest line about you</label>
                            <textarea
                                id="mirror-intro-summary"
                                value={draft.summary}
                                maxLength={220}
                                rows={3}
                                onChange={(event) => updateField('summary', event.target.value)}
                                placeholder="What you are building, exploring, or known for."
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="mirror-intro-open-to" className="text-sm font-semibold">What are you open to?</label>
                            <textarea
                                id="mirror-intro-open-to"
                                value={draft.openTo}
                                maxLength={220}
                                rows={2}
                                onChange={(event) => updateField('openTo', event.target.value)}
                                placeholder="A collaborator, a thoughtful customer, a new idea, or something specific."
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        <fieldset className="grid gap-2">
                            <legend className="text-sm font-semibold">It may discuss</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {TOPIC_OPTIONS.map((option) => {
                                    const checked = draft.topics.includes(option.id);
                                    return (
                                        <label key={option.id} className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm transition ${checked ? (isLight ? 'border-cyan-500/35 bg-cyan-50 text-cyan-950' : 'border-cyan-200/25 bg-cyan-200/[0.07] text-cyan-50') : (isLight ? 'border-stone-300/70 bg-white/55 text-stone-700' : 'border-white/10 bg-white/[0.025] text-zinc-300')}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleTopic(option.id)}
                                                className="h-4 w-4 accent-cyan-600"
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <div className="grid gap-2">
                            <label htmlFor="mirror-intro-boundary" className="text-sm font-semibold">Keep this out of the conversation <span className={mutedClass}>(optional)</span></label>
                            <textarea
                                id="mirror-intro-boundary"
                                value={draft.boundary}
                                maxLength={220}
                                rows={2}
                                onChange={(event) => updateField('boundary', event.target.value)}
                                placeholder="Private clients, personal history, money, or anything else you do not want discussed."
                                className={`${inputClass} resize-y`}
                            />
                        </div>
                    </div>

                    <aside className={`grid content-start gap-4 px-5 py-5 ${isLight ? 'bg-cyan-50/45' : 'bg-cyan-300/[0.035]'}`}>
                        <div>
                            <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-cyan-800/65' : 'text-cyan-100/65'}`}>Preview</div>
                            <div className={`whitespace-pre-wrap text-sm leading-6 ${preview ? (isLight ? 'text-stone-800' : 'text-zinc-100') : mutedClass}`}>
                                {preview || 'Add the details you want an introduction to carry. Nothing is generated or sent until you choose an action.'}
                            </div>
                        </div>

                        <div className={`divide-y border-y ${lineClass} ${isLight ? 'divide-stone-300/70' : 'divide-white/10'}`}>
                            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 text-sm">
                                <UserRoundCheck size={16} className={isLight ? 'text-cyan-700' : 'text-cyan-100'} />
                                <div><div className="font-semibold">Always disclosed</div><div className={`mt-0.5 text-xs leading-5 ${mutedClass}`}>It says it is an AI representative.</div></div>
                            </div>
                            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 text-sm">
                                <PencilLine size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-100'} />
                                <div><div className="font-semibold">Draft only</div><div className={`mt-0.5 text-xs leading-5 ${mutedClass}`}>Nothing is sent from here.</div></div>
                            </div>
                            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 text-sm">
                                <ShieldCheck size={16} className={isLight ? 'text-blue-700' : 'text-blue-100'} />
                                <div><div className="font-semibold">Human handoff</div><div className={`mt-0.5 text-xs leading-5 ${mutedClass}`}>It hands back before commitments or private disclosure.</div></div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={copyPreview}
                                disabled={!preview}
                                className={iconButtonClass}
                                aria-label="Copy intro preview"
                                title="Copy intro preview"
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onRefine?.(preview)}
                                disabled={!preview}
                                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isLight ? 'border-stone-300 bg-white text-stone-700 hover:border-cyan-500/35 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:border-cyan-100/30 hover:text-white'}`}
                            >
                                <MessageSquareText size={15} />
                                Refine in chat
                            </button>
                            {intro ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className={`${iconButtonClass} ml-auto hover:!border-red-300/40 hover:!text-red-500`}
                                    aria-label="Remove intro"
                                    title="Remove intro"
                                >
                                    <Trash2 size={16} />
                                </button>
                            ) : null}
                        </div>

                        {confirmDelete ? (
                            <div className={`grid gap-3 border-t pt-4 text-sm ${lineClass}`} role="alert">
                                <div className="font-semibold">Remove this intro from this browser?</div>
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => { onDelete?.(); setConfirmDelete(false); onClose?.(); }} className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${isLight ? 'border-red-300 bg-red-50 text-red-800' : 'border-red-300/25 bg-red-300/[0.07] text-red-100'}`}>Remove intro</button>
                                    <button type="button" onClick={() => setConfirmDelete(false)} className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${isLight ? 'border-stone-300 bg-white text-stone-700' : 'border-white/10 bg-white/[0.04] text-zinc-200'}`}>Keep it</button>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid gap-2">
                            <button
                                type="button"
                                onClick={saveIntro}
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${isLight ? 'bg-cyan-700 text-white hover:bg-cyan-800' : 'bg-cyan-200/[0.14] text-cyan-50 hover:bg-cyan-200/[0.2]'}`}
                            >
                                <Check size={16} />
                                Save intro
                            </button>
                            <div aria-live="polite" className={`min-h-5 text-xs leading-5 ${status ? (isLight ? 'text-cyan-800' : 'text-cyan-100') : mutedClass}`}>
                                {status || 'Saved only after you choose it, on this browser.'}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}
