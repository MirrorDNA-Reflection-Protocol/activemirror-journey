import { useState } from 'react';
import { recordMirrorFeedback } from '../lib/feedback-memory';
import { trackEvent } from '../lib/privacy-events';

const FEEDBACK_OPTIONS = [
    { id: 'yes', label: 'Yes' },
    { id: 'almost', label: 'Almost' },
    { id: 'no', label: 'No' },
];

function repairOptions(result = {}) {
    const mirror = result.mirror || {};
    const move = mirror.move || 'the next move';
    const question = mirror.question || 'the real question';

    return [
        {
            id: 'smaller',
            label: 'Another angle',
            intent: `Give me one different useful angle on this, without repeating yourself. Keep one next move only: ${move}`,
        },
        {
            id: 'sharper',
            label: 'Challenge it',
            intent: `Challenge my premise and name what I may be avoiding. Keep it short: ${question}`,
        },
        {
            id: 'different',
            label: 'Draft it',
            intent: 'Create a sendable draft from this reflection.',
        },
    ];
}

export default function MirrorFeedback({ page = 'mirror', surface = 'reflection', turn = 1, result = {}, onRepair, className = '' }) {
    const [selected, setSelected] = useState('');
    const showRepair = selected === 'almost' || selected === 'no';

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

    function repair(option) {
        trackEvent('followup_clicked', {
            page,
            surface,
            source: 'feedback_repair',
            label: option.id,
            turn,
        });
        onRepair?.(option.intent, option);
    }

    return (
        <div className={`max-w-[46rem] rounded-[1.25rem] px-1 py-1 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <div className="mr-1 text-xs font-medium text-zinc-500">Helpful?</div>
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
                                        : 'border-white/10 bg-white/[0.025] text-zinc-500 hover:border-purple-300/30 hover:bg-purple-300/[0.08] hover:text-white'
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                {selected ? <div className="text-[11px] text-zinc-600">No message text saved.</div> : null}
            </div>
            {showRepair ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {repairOptions(result).map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => repair(option)}
                            className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300/40 hover:bg-purple-300/[0.12] hover:text-white"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
