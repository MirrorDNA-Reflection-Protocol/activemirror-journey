import { useEffect, useState } from 'react';
import { BookmarkPlus, Check, Copy, FileText, LockKeyhole, PencilLine, ScanSearch, Sparkles } from 'lucide-react';
import { TrustStateMark } from './TrustStatusRail';

const TRUST_STATES = new Set(['proposed', 'verified', 'rejected', 'rolled_back']);

function compactText(value, fallback, limit) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return fallback;
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).trimEnd()}...`;
}

function normalizedTrustState(value) {
    const candidate = typeof value === 'string'
        ? value
        : value?.state || value?.status;

    if (candidate === 'checked') return 'verified';
    return TRUST_STATES.has(candidate) ? candidate : 'proposed';
}

async function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    if (typeof document === 'undefined') throw new Error('Clipboard unavailable');

    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(field);

    if (!copied) throw new Error('Clipboard unavailable');
}

export default function MirrorMoment({
    mirror = {},
    intent = '',
    isLight,
    trustState = 'proposed',
    onCopy,
    copied,
    onRemember,
    remembered = false,
    allowRemember = true,
    onChallenge,
    onImprove,
    onPublicNote,
    onOpenSaved,
    busy = false,
}) {
    const [copiedFallback, setCopiedFallback] = useState(false);
    const source = mirror && typeof mirror === 'object' ? mirror : {};
    const echo = compactText(
        intent || source.intent || source.prompt,
        'No request was captured.',
        170,
    );
    const observation = compactText(
        source.workingRead || source.observation || source.reflection || source.question,
        'There is enough here to make one useful first version.',
        260,
    );
    const draft = compactText(
        source.draft || source.sayThis || source.move || source.next || source.question,
        'Turn this into the first version you can send or test.',
        320,
    );
    const openQuestion = compactText(
        source.question,
        'What would make this useful by the end of today?',
        220,
    );
    const state = normalizedTrustState(trustState);
    const isCopied = typeof copied === 'boolean' ? copied : copiedFallback;
    const canRemember = allowRemember && typeof onRemember === 'function';
    const receipt = source.receipt && typeof source.receipt === 'object' ? source.receipt : {};
    const evidence = [
        ['Used', compactText(receipt.context_used, 'Only the current thread.', 170)],
        ['Excluded', compactText(receipt.context_excluded, 'No additional context was used.', 170)],
        ['Memory', compactText(receipt.memory_decision, 'This read is not kept until you choose Save note or Keep thread.', 170)],
    ];

    useEffect(() => {
        if (typeof copied === 'boolean' || !copiedFallback) return undefined;

        const timeout = window.setTimeout(() => setCopiedFallback(false), 1600);
        return () => window.clearTimeout(timeout);
    }, [copied, copiedFallback]);

    async function handleCopy() {
        try {
            if (typeof onCopy === 'function') {
                await onCopy(draft);
            } else {
                await copyToClipboard(draft);
            }

            if (typeof copied !== 'boolean') setCopiedFallback(true);
        } catch {
            if (typeof copied !== 'boolean') setCopiedFallback(false);
        }
    }

    return (
        <section
            className="am-surface min-w-0 max-w-[46rem] overflow-hidden px-4 py-4 sm:px-5 sm:py-5"
            data-testid="mirror-moment"
            data-theme={isLight === true ? 'light' : isLight === false ? 'dark' : undefined}
            aria-label="Active Mirror working read"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--am-muted)]">
                    <PencilLine size={14} aria-hidden="true" />
                    <h2 className="font-semibold">Working read</h2>
                </div>
                <TrustStateMark state={state} />
            </div>

            <div className="mt-4 grid gap-5 border-t border-[var(--am-border)] pt-4 sm:mt-5 sm:pt-5">
                <div className="grid min-w-0 gap-1.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4" data-testid="mirror-intent-echo">
                    <p className="text-xs font-semibold text-[var(--am-muted)]">What I heard</p>
                    <p className="min-w-0 break-words text-sm font-medium leading-6 text-[var(--am-ink)]">&quot;{echo}&quot;</p>
                </div>

                <div className="grid min-w-0 gap-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4" data-testid="mirror-moment-observation">
                    <div className="flex items-center gap-3 sm:items-start sm:pt-2">
                        <div className="am-witness-line shrink-0" data-tone="clear" aria-hidden="true" />
                        <p className="text-xs font-semibold text-[var(--am-muted)]">Working read</p>
                    </div>
                    <p className="min-w-0 break-words text-base font-semibold leading-7 text-[var(--am-ink)]">{observation}</p>
                </div>

                <div className="min-w-0 border-l-2 border-[var(--am-primary-marker)] pl-4 sm:ml-[9rem]" data-testid="mirror-moment-say-this">
                    <p className="text-xs font-semibold text-[var(--am-muted)]">Use this next</p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-[1.02rem] font-medium leading-7 text-[var(--am-ink)]">{draft}</p>
                </div>

                <div className="grid min-w-0 gap-2 border-t border-[var(--am-border)] pt-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4" data-testid="mirror-thread-record">
                    <p className="text-xs font-semibold text-[var(--am-muted)]">Working record</p>
                    <dl className="grid min-w-0 gap-3 text-sm leading-6">
                        <div className="grid min-w-0 gap-1 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3">
                            <dt className="font-semibold text-[var(--am-muted)]">Still open</dt>
                            <dd className="min-w-0 break-words text-[var(--am-ink)]">{openQuestion}</dd>
                        </div>
                        <div className="grid min-w-0 gap-1 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3">
                            <dt className="font-semibold text-[var(--am-muted)]">Carry forward</dt>
                            <dd className="min-w-0 break-words text-[var(--am-ink)]">Save note keeps this read on this browser. Keep thread keeps the full thread.</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--am-border)] pt-4">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="am-primary-action inline-flex min-h-11 items-center justify-center gap-2 px-3.5 text-sm font-semibold"
                >
                    {isCopied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    {isCopied ? 'Copied' : 'Copy draft'}
                </button>

                {typeof onChallenge === 'function' ? (
                    <button
                        type="button"
                        onClick={onChallenge}
                        disabled={busy}
                        className="am-secondary-action inline-flex min-h-11 items-center justify-center gap-2 px-3.5 text-sm font-semibold disabled:cursor-default disabled:opacity-55"
                    >
                        <ScanSearch size={15} aria-hidden="true" />
                        Challenge
                    </button>
                ) : null}

                {typeof onImprove === 'function' ? (
                    <button
                        type="button"
                        onClick={onImprove}
                        disabled={busy}
                        className="am-secondary-action inline-flex min-h-11 items-center justify-center gap-2 px-3.5 text-sm font-semibold disabled:cursor-default disabled:opacity-55"
                    >
                        <Sparkles size={15} aria-hidden="true" />
                        Improve
                    </button>
                ) : null}

                {canRemember ? (
                    <button
                        type="button"
                        onClick={() => onRemember(source)}
                        disabled={remembered}
                        data-testid="mirror-save-note"
                        className="am-secondary-action inline-flex min-h-11 items-center justify-center gap-2 px-3.5 text-sm font-semibold disabled:cursor-default disabled:opacity-55"
                    >
                        {remembered ? <Check size={15} aria-hidden="true" /> : <BookmarkPlus size={15} aria-hidden="true" />}
                        {remembered ? 'Saved' : 'Save note'}
                    </button>
                ) : null}

                {typeof onPublicNote === 'function' ? (
                    <button
                        type="button"
                        onClick={onPublicNote}
                        disabled={busy}
                        className="inline-flex min-h-11 items-center justify-center gap-2 border border-transparent px-2 text-sm font-semibold text-[var(--am-muted)] transition hover:border-[var(--am-border)] hover:text-[var(--am-ink)] disabled:cursor-default disabled:opacity-55"
                    >
                        <FileText size={15} aria-hidden="true" />
                        Public draft
                    </button>
                ) : null}
            </div>

            {remembered ? (
                <div
                    className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--am-border)] pt-3"
                    data-testid="mirror-private-record"
                >
                    <div className="flex min-w-0 items-start gap-2.5">
                        <LockKeyhole size={15} className="mt-0.5 shrink-0 text-[var(--am-primary)]" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--am-ink)]">Private record</p>
                            <p className="mt-0.5 text-sm leading-6 text-[var(--am-muted)]">Saved by you on this browser. Sharing stays your choice.</p>
                        </div>
                    </div>
                    {typeof onOpenSaved === 'function' ? (
                        <button
                            type="button"
                            onClick={onOpenSaved}
                            className="am-secondary-action inline-flex min-h-10 shrink-0 items-center justify-center px-3 text-xs font-semibold"
                        >
                            Open saved record
                        </button>
                    ) : null}
                </div>
            ) : null}

            <details className="mt-4 border-t border-[var(--am-border)] pt-3" data-testid="mirror-evidence">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--am-muted)] transition hover:text-[var(--am-ink)]">
                    Evidence and boundary
                </summary>
                <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                    {evidence.map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="font-semibold text-[var(--am-muted)]">{label}</dt>
                            <dd className="min-w-0 break-words text-[var(--am-ink)]">{value}</dd>
                        </div>
                    ))}
                </dl>
            </details>
        </section>
    );
}
