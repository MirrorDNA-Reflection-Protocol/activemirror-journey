export function sourceCheckLabel(truthState) {
    return truthState?.label || 'Reflective, not source-checked.';
}

export function NeedsSources({ truthState }) {
    if (truthState?.status !== 'needs_checking') return null;

    return (
        <div className="max-w-[46rem] rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm font-medium leading-5 text-amber-100">
            Needs sources before you rely on it.
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
