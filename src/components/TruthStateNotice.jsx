import { useState } from 'react';
import { ChevronDown, ExternalLink, Loader2, SearchCheck } from 'lucide-react';
import { getPrivacySessionId } from '../lib/privacy-events';

const SOURCE_CHECK_ENDPOINT = 'https://gateway.activemirror.ai/v1/mirror/source-check';

const VERDICT_COPY = {
    supported: {
        title: 'Source checked',
        shell: 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-50',
        icon: 'text-emerald-200',
        muted: 'text-emerald-100/80',
        link: 'text-emerald-100 hover:border-emerald-200/35 hover:bg-emerald-300/[0.10]',
    },
    mixed: {
        title: 'Evidence mixed',
        shell: 'border-amber-300/20 bg-amber-300/[0.08] text-amber-50',
        icon: 'text-amber-200',
        muted: 'text-amber-100/80',
        link: 'text-amber-100 hover:border-amber-200/35 hover:bg-amber-300/[0.10]',
    },
    not_enough: {
        title: 'Still needs proof',
        helper: 'Found links, but not enough reliable evidence to trust the claim yet.',
        shell: 'border-zinc-300/15 bg-white/[0.055] text-zinc-100',
        icon: 'text-zinc-300',
        muted: 'text-zinc-400',
        link: 'text-zinc-200 hover:border-zinc-200/30 hover:bg-white/[0.08]',
    },
};

export function sourceCheckLabel(truthState) {
    return truthState?.label || 'Reflective, not source-checked.';
}

function makeNarrowClaimPrompt(intent, mirror = {}, research = {}) {
    return [
        'Narrow this into one specific claim we can check before using it.',
        `Original ask: ${intent || 'the current ask'}`,
        `Current question: ${mirror.question || intent || 'What needs to be checked?'}`,
        research.answer ? `Source result: ${research.answer}` : '',
        'Give me the safest next move.',
    ].filter(Boolean).join('\n');
}

export function NeedsSources({ truthState, intent = '', mirror = {}, disabled = false, onPrompt }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

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
                    question: mirror.question || intent,
                    move: mirror.move || '',
                    boundary: 'personal',
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'source_check_failed');
            }
            setResult(data);
        } catch {
            setError('Could not check sources just now.');
        } finally {
            setBusy(false);
        }
    }

    if (result?.truth_state?.status === 'checked') {
        const sources = result.research?.sources || [];
        const verdict = VERDICT_COPY[result.research?.verdict] || VERDICT_COPY.mixed;
        const canNarrowClaim = typeof onPrompt === 'function' && result.research?.verdict !== 'supported';
        return (
            <div className={`max-w-[46rem] rounded-2xl border px-4 py-3 text-sm leading-6 ${verdict.shell}`}>
                <div className="mb-2 flex items-center gap-2 font-semibold">
                    <SearchCheck size={16} className={verdict.icon} />
                    {verdict.title}
                </div>
                {verdict.helper ? (
                    <div className={`mb-2 ${verdict.muted}`}>{verdict.helper}</div>
                ) : null}
                <div>{result.research?.answer}</div>
                {result.research?.changes ? (
                    <div className={`mt-2 ${verdict.muted}`}>{result.research.changes}</div>
                ) : null}
                {canNarrowClaim ? (
                    <button
                        type="button"
                        onClick={() => onPrompt(makeNarrowClaimPrompt(intent, mirror, result.research))}
                        disabled={disabled}
                        className="mt-3 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-current transition hover:border-white/25 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Narrow the claim
                    </button>
                ) : null}
                {sources.length ? (
                    <div className="mt-3 grid gap-2">
                        {sources.map((source) => (
                            <details
                                key={source.url}
                                className={`group rounded-xl border border-white/10 bg-black/20 text-xs font-semibold transition ${verdict.link}`}
                            >
                                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 px-3 py-2">
                                    {source.quality_label ? (
                                        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-current opacity-80">
                                            {source.quality_label}
                                        </span>
                                    ) : null}
                                    <span className="min-w-0 flex-1 truncate">{source.title || source.url}</span>
                                    <ChevronDown size={13} className="shrink-0 opacity-70 transition group-open:rotate-180" />
                                </summary>
                                <div className="border-t border-white/10 px-3 py-3 text-xs font-normal leading-5 text-current/75">
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

    return (
        <div className="max-w-[46rem] rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm leading-5 text-amber-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-medium">Needs sources before you rely on it.</div>
                <button
                    type="button"
                    onClick={checkSources}
                    disabled={busy || disabled}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-amber-200/25 bg-black/20 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:border-amber-200/45 hover:bg-amber-200/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <SearchCheck size={14} />}
                    {busy ? 'Checking' : 'Check sources'}
                </button>
            </div>
            {error ? <div className="mt-2 text-xs text-amber-100/70">{error}</div> : null}
        </div>
    );
}

export function SourceCheckLine({ truthState }) {
    return (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Checked</div>
            <div className="mt-1 leading-6">{sourceCheckLabel(truthState)}</div>
        </div>
    );
}
