import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Loader2, SearchCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { languagePayloadFor } from '../lib/language-preference';
import { getPrivacySessionId } from '../lib/privacy-events';

const SOURCE_CHECK_ENDPOINT = 'https://gateway.activemirror.ai/v1/mirror/source-check';

const VERDICT_COPY = {
    supported: {
        title: 'Checked with sources',
        shell: 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-50',
        shellLight: 'border-emerald-500/20 bg-emerald-50/85 text-emerald-950',
        icon: 'text-emerald-200',
        iconLight: 'text-emerald-700',
        muted: 'text-emerald-100/80',
        mutedLight: 'text-emerald-800/75',
        link: 'text-emerald-100 hover:border-emerald-200/35 hover:bg-emerald-300/[0.10]',
        linkLight: 'text-emerald-900 hover:border-emerald-500/35 hover:bg-emerald-100/75',
    },
    mixed: {
        title: 'Sources mixed',
        shell: 'border-amber-300/20 bg-amber-300/[0.08] text-amber-50',
        shellLight: 'border-amber-500/22 bg-amber-50/88 text-amber-950',
        icon: 'text-amber-200',
        iconLight: 'text-amber-700',
        muted: 'text-amber-100/80',
        mutedLight: 'text-amber-800/75',
        link: 'text-amber-100 hover:border-amber-200/35 hover:bg-amber-300/[0.10]',
        linkLight: 'text-amber-950 hover:border-amber-500/35 hover:bg-amber-100/75',
    },
    not_enough: {
        title: 'Needs stronger support',
        helper: 'Found links, but not enough reliable support to trust the line yet.',
        shell: 'border-zinc-300/15 bg-white/[0.055] text-zinc-100',
        shellLight: 'border-stone-300/75 bg-white/82 text-stone-900 shadow-[0_18px_50px_rgba(77,65,50,0.10)]',
        icon: 'text-zinc-300',
        iconLight: 'text-stone-500',
        muted: 'text-zinc-400',
        mutedLight: 'text-stone-600',
        link: 'text-zinc-200 hover:border-zinc-200/30 hover:bg-white/[0.08]',
        linkLight: 'text-stone-800 hover:border-stone-400/60 hover:bg-stone-100/80',
    },
};

export function sourceCheckLabel(truthState) {
    return truthState?.label || 'Reflective, not checked with sources.';
}

function makeNarrowClaimPrompt(intent, mirror = {}, research = {}) {
    return [
        'Narrow this into one specific line we can check before using it.',
        `Original ask: ${intent || 'the current ask'}`,
        `Current question: ${mirror.question || intent || 'What needs to be checked?'}`,
        research.answer ? `Source result: ${research.answer}` : '',
        'Give me the safest next move.',
    ].filter(Boolean).join('\n');
}

function displayResearchText(value = '') {
    return String(value || '')
        .replace(/The source route could not fetch reliable citations from this edge right now\./gi, 'I could not fetch reliable citations just now.')
        .replace(/\bsource route\b/gi, 'source check')
        .replace(/\bfrom this edge\b/gi, 'right now')
        .trim();
}

export function NeedsSources({ truthState, intent = '', mirror = {}, disabled = false, onPrompt, onSourceChecked, autoCheck = false, answerFirst = false }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [narrowed, setNarrowed] = useState(false);
    const sourceKey = useMemo(
        () => [truthState?.status || 'none', intent, mirror.question || '', mirror.move || ''].join('::'),
        [truthState?.status, intent, mirror.question, mirror.move],
    );
    const settledKey = useRef(sourceKey);
    const autoCheckedKey = useRef('');

    useEffect(() => {
        if (disabled || sourceKey === settledKey.current) return;
        settledKey.current = sourceKey;
        autoCheckedKey.current = '';
        setResult(null);
        setError('');
        setNarrowed(false);
    }, [disabled, sourceKey]);

    useEffect(() => {
        if (!autoCheck || disabled || busy || result || truthState?.status !== 'needs_checking') return;
        if (autoCheckedKey.current === sourceKey) return;
        autoCheckedKey.current = sourceKey;
        checkSources();
    }, [autoCheck, disabled, busy, result, truthState?.status, sourceKey]);

    if (truthState?.status !== 'needs_checking') return null;

    async function checkSources() {
        if (busy || disabled) return;
        setBusy(true);
        setError('');

        try {
            const response = await fetch(SOURCE_CHECK_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Active-Mirror-Session': getPrivacySessionId(),
                },
                body: JSON.stringify({
                    intent,
                    question: answerFirst ? intent : mirror.question || intent,
                    move: mirror.move || '',
                    boundary: 'personal',
                    ...languagePayloadFor(intent || mirror.question || ''),
                }),
            });
            const data = await response.json();
            if (!response.ok && !data.research?.verification_plan) {
                throw new Error(data.error || 'source_check_failed');
            }
            setResult(data);
            onSourceChecked?.(data);
        } catch {
            setError('Could not check sources just now.');
        } finally {
            setBusy(false);
        }
    }

    if (result?.truth_state?.status === 'checked' || result?.research?.verification_plan) {
        const sources = result.research?.sources || [];
        const baseVerdict = VERDICT_COPY[result.research?.verdict] || VERDICT_COPY.mixed;
        const verdict = {
            ...baseVerdict,
            shell: isLight ? baseVerdict.shellLight : baseVerdict.shell,
            icon: isLight ? baseVerdict.iconLight : baseVerdict.icon,
            muted: isLight ? baseVerdict.mutedLight : baseVerdict.muted,
            link: isLight ? baseVerdict.linkLight : baseVerdict.link,
        };
        const canNarrowClaim = typeof onPrompt === 'function' && result.research?.verdict !== 'supported';
        const plan = result.research?.verification_plan;
        return (
            <div className={`min-w-0 max-w-[46rem] overflow-hidden rounded-2xl border px-4 py-3 text-sm leading-6 ${verdict.shell}`}>
                <div className="mb-2 flex items-center gap-2 font-semibold">
                    <SearchCheck size={16} className={verdict.icon} />
                    {answerFirst && !plan ? 'What I found' : plan ? 'What to check' : verdict.title}
                </div>
                {verdict.helper ? (
                    <div className={`mb-2 ${verdict.muted}`}>{verdict.helper}</div>
                ) : null}
                <div>{displayResearchText(result.research?.answer)}</div>
                {result.research?.changes ? (
                    <div className={`mt-2 ${verdict.muted}`}>{displayResearchText(result.research.changes)}</div>
                ) : null}
                {plan ? (
                    <div className="mt-3 grid gap-3">
                        {plan.queries?.length ? (
                            <div className={`rounded-xl border p-3 ${isLight ? 'border-stone-300/70 bg-white/68' : 'border-white/10 bg-black/20'}`}>
                                <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                                    Try these searches
                                </div>
                                <div className="grid gap-2">
                                    {plan.queries.map((query) => (
                                        <div key={query} className={`rounded-lg border px-3 py-2 text-xs leading-5 ${isLight ? 'border-stone-300/70 bg-stone-50/80 text-stone-700' : 'border-white/10 bg-white/[0.035] text-zinc-200'}`}>
                                            {query}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        <div className="grid gap-2 sm:grid-cols-2">
                            {plan.prefer?.length ? (
                                <div className={`rounded-xl border p-3 ${isLight ? 'border-emerald-500/20 bg-emerald-50/78' : 'border-emerald-300/15 bg-emerald-300/[0.06]'}`}>
                                    <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-emerald-700' : 'text-emerald-200/75'}`}>
                                        Prefer
                                    </div>
                                    <ul className={`grid gap-1 text-xs leading-5 ${isLight ? 'text-emerald-900/80' : 'text-emerald-50/85'}`}>
                                        {plan.prefer.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            ) : null}
                            {plan.avoid?.length ? (
                                <div className={`rounded-xl border p-3 ${isLight ? 'border-amber-500/20 bg-amber-50/78' : 'border-amber-300/15 bg-amber-300/[0.06]'}`}>
                                    <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-amber-700' : 'text-amber-200/75'}`}>
                                        Avoid
                                    </div>
                                    <ul className={`grid gap-1 text-xs leading-5 ${isLight ? 'text-amber-900/80' : 'text-amber-50/85'}`}>
                                        {plan.avoid.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                {canNarrowClaim ? (
                    <button
                        type="button"
                        onClick={() => {
                            setNarrowed(true);
                            onPrompt(makeNarrowClaimPrompt(intent, mirror, result.research));
                        }}
                        disabled={disabled}
                        className={`mt-3 inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold text-current transition disabled:cursor-not-allowed disabled:opacity-50 ${isLight ? 'border-stone-300/80 bg-stone-100/75 hover:border-stone-400 hover:bg-white' : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/[0.08]'}`}
                    >
                        Narrow the claim
                    </button>
                ) : null}
                {narrowed ? (
                    <div className={`mt-2 text-xs leading-5 ${verdict.muted}`}>
                        Smaller claims are easier to check, easier to act on, and harder for AI to bluff.
                    </div>
                ) : null}
                {sources.length ? (
                    <div className="mt-3 grid gap-2">
                        {sources.map((source) => (
                            <details
                                key={source.url}
                                className={`group overflow-hidden rounded-xl border text-xs font-semibold transition ${isLight ? 'border-stone-300/75 bg-white/62' : 'border-white/10 bg-black/20'} ${verdict.link}`}
                            >
                                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 px-3 py-2">
                                    {source.quality_label ? (
                                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-current opacity-80 ${isLight ? 'border-stone-300/75 bg-stone-50/80' : 'border-white/10 bg-white/[0.06]'}`}>
                                            {source.quality_label}
                                        </span>
                                    ) : null}
                                    <span className="min-w-0 flex-1 truncate">{source.title || source.url}</span>
                                    <ChevronDown size={13} className="shrink-0 opacity-70 transition group-open:rotate-180" />
                                </summary>
                                <div className={`border-t px-3 py-3 text-xs font-normal leading-5 text-current/75 ${isLight ? 'border-stone-300/70' : 'border-white/10'}`}>
                                    <div>{source.quality_reason || 'This source was labeled from its domain and title.'}</div>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 font-semibold text-current underline decoration-current/30 underline-offset-4 transition hover:decoration-current"
                                    >
                                        Open source
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            </details>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    if (answerFirst && error) {
        return (
            <div className={`max-w-[46rem] rounded-2xl border px-4 py-3 text-sm leading-6 ${isLight ? 'border-amber-500/22 bg-amber-50/88 text-amber-950' : 'border-amber-300/20 bg-amber-300/[0.065] text-amber-50'}`}>
                <div className="font-semibold">I could not check live sources just now.</div>
                <div className={`mt-1 text-xs leading-5 ${isLight ? 'text-amber-800/75' : 'text-amber-100/75'}`}>
                    I will not guess from memory. Try again, or add one detail that narrows the search.
                </div>
                <button
                    type="button"
                    onClick={checkSources}
                    disabled={busy || disabled}
                    className={`mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${isLight ? 'border-amber-500/25 bg-white/72 text-amber-950 hover:border-amber-500/45 hover:bg-white' : 'border-amber-200/25 bg-black/20 text-amber-50 hover:border-amber-200/45 hover:bg-amber-200/[0.10]'}`}
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <SearchCheck size={14} />}
                    {busy ? 'Checking' : 'Try again'}
                </button>
            </div>
        );
    }

    if (answerFirst && (busy || autoCheck)) {
        return (
            <div className={`max-w-[46rem] rounded-2xl border px-4 py-3 text-sm leading-6 ${isLight ? 'border-cyan-500/18 bg-cyan-50/85 text-cyan-950' : 'border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-50'}`}>
                <div className="flex items-center gap-2 font-semibold">
                    <Loader2 size={15} className={`animate-spin ${isLight ? 'text-cyan-700' : 'text-cyan-100'}`} />
                    Checking current options
                </div>
                <div className={`mt-1 text-xs leading-5 ${isLight ? 'text-cyan-800/72' : 'text-cyan-100/72'}`}>
                    I'll answer from sources where possible, not guess from memory.
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-[46rem] rounded-2xl border px-4 py-3 text-sm leading-5 ${isLight ? 'border-amber-500/22 bg-amber-50/88 text-amber-950' : 'border-amber-300/20 bg-amber-300/[0.065] text-amber-50'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-semibold">This asks for current facts.</div>
                    <div className={`mt-1 text-xs leading-5 ${isLight ? 'text-amber-800/75' : 'text-amber-100/75'}`}>Check before you use it.</div>
                </div>
                <button
                    type="button"
                    onClick={checkSources}
                    disabled={busy || disabled}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${isLight ? 'border-amber-500/25 bg-white/72 text-amber-950 hover:border-amber-500/45 hover:bg-white' : 'border-amber-200/25 bg-black/20 text-amber-50 hover:border-amber-200/45 hover:bg-amber-200/[0.10]'}`}
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <SearchCheck size={14} />}
                    {busy ? 'Checking' : 'Check now'}
                </button>
            </div>
            {error ? <div className={`mt-2 text-xs ${isLight ? 'text-amber-800/70' : 'text-amber-100/70'}`}>{error}</div> : null}
        </div>
    );
}

export function SourceCheckLine({ truthState, sourceCheck, onClearSourceCheck }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const sources = sourceCheck?.research?.sources || [];
    const firstSource = sources[0];
    const plan = sourceCheck?.research?.verification_plan;

    return (
        <div>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>Checked</div>
            <div className="mt-1 leading-6">{sourceCheckLabel(truthState)}</div>
            {sourceCheck?.truth_state?.status === 'checked' || plan ? (
                <details className={`group mt-3 rounded-2xl border px-3 py-2 ${isLight ? 'border-stone-300/70 bg-white/62' : 'border-white/10 bg-white/[0.035]'}`}>
                    <summary className={`cursor-pointer list-none text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-zinc-300'}`}>
                        {plan ? 'Last check plan' : 'Last check'}
                        <ChevronDown className={`float-right mt-0.5 h-4 w-4 transition group-open:rotate-180 ${isLight ? 'text-stone-500' : 'text-zinc-500'}`} />
                    </summary>
                    <div className={`mt-3 border-t pt-3 text-xs leading-5 ${isLight ? 'border-stone-300/65 text-stone-600' : 'border-white/10 text-zinc-500'}`}>
                        <div className={`font-semibold ${isLight ? 'text-stone-800' : 'text-zinc-300'}`}>
                            {plan
                                ? 'Needs sources'
                                : sourceCheck.research?.verdict === 'supported'
                                ? 'Checked with sources'
                                : sourceCheck.research?.verdict === 'mixed'
                                    ? 'Sources mixed'
                                    : 'Needs stronger support'}
                        </div>
                        <div className="mt-1">{displayResearchText(sourceCheck.research?.answer)}</div>
                        {plan?.queries?.length ? (
                            <div className="mt-3 grid gap-2">
                                {plan.queries.slice(0, 3).map((query) => (
                                    <div key={query} className={`rounded-xl border px-3 py-2 ${isLight ? 'border-stone-300/70 bg-stone-50/78 text-stone-600' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                                        {query}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {firstSource ? (
                            <a
                                href={firstSource.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-2 inline-flex max-w-full items-center gap-1.5 font-semibold underline underline-offset-4 transition ${isLight ? 'text-stone-700 decoration-stone-400/55 hover:text-stone-950 hover:decoration-stone-700' : 'text-zinc-300 decoration-zinc-500/40 hover:text-white hover:decoration-white'}`}
                            >
                                <span className="truncate">{firstSource.quality_label || 'Source'} - {firstSource.title || firstSource.url}</span>
                                <ExternalLink size={12} className="shrink-0" />
                            </a>
                        ) : null}
                        {typeof onClearSourceCheck === 'function' ? (
                            <button
                                type="button"
                                onClick={onClearSourceCheck}
                                className={`mt-3 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 hover:border-stone-400 hover:text-stone-950' : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white'}`}
                            >
                                Clear check
                            </button>
                        ) : null}
                    </div>
                </details>
            ) : null}
        </div>
    );
}
