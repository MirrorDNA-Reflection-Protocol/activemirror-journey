import { useState } from 'react';
import { recordMirrorFeedback } from '../lib/feedback-memory';
import { trackEvent } from '../lib/privacy-events';

const FEEDBACK_OPTIONS = [
    { id: 'yes', label: 'Yes' },
    { id: 'almost', label: 'Almost' },
    { id: 'no', label: 'No' },
];

export default function MirrorFeedback({ page = 'mirror', surface = 'reflection', turn = 1, result = {}, className = '' }) {
    const [selected, setSelected] = useState('');

    function choose(option) {
        setSelected(option.id);
        const metadata = recordMirrorFeedback({ page, surface, turn, label: option.id, result });
        trackEvent('mirror_feedback', {
            page,
            surface,
            source: 'turn_feedback',
            label: option.id,
            turn,
            route: metadata?.route || result.route?.capability || 'reflection',
            status: metadata?.truthState || result.truth_state?.status || 'unknown',
            fallback: Boolean(metadata?.fallback || result.fallback),
            visualKind: metadata?.visualKind || result.mirror?.visual?.kind || 'none',
        });
    }

    return (
        <div className={`max-w-[46rem] rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 ${className}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-xs font-semibold text-zinc-300">Was this useful?</div>
                    {selected ? <div className="mt-1 text-[11px] text-zinc-500">Thanks. No message text was saved.</div> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                    {FEEDBACK_OPTIONS.map((option) => {
                        const active = selected === option.id;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => choose(option)}
                                aria-pressed={active}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    active
                                        ? 'border-cyan-200/45 bg-cyan-300/[0.14] text-cyan-100'
                                        : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white'
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
