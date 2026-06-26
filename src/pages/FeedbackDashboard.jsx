import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import { clearBufferedPrivacyEvents, getBufferedPrivacyEvents } from '../lib/privacy-events';

const LABELS = {
    useful: 'Useful',
    too_vague: 'Too vague',
    too_agreeable: 'Too agreeable',
    too_much: 'Too much',
};

function summarize(events) {
    const feedback = events.filter((event) => event.event === 'mirror_feedback');
    const labels = Object.fromEntries(Object.keys(LABELS).map((key) => [key, 0]));
    const surfaces = {};

    feedback.forEach((event) => {
        if (labels[event.label] !== undefined) labels[event.label] += 1;
        const surface = event.surface || event.page || 'unknown';
        surfaces[surface] = (surfaces[surface] || 0) + 1;
    });

    const useful = labels.useful || 0;
    const total = feedback.length;

    return {
        total,
        useful,
        usefulRate: total ? Math.round((useful / total) * 100) : 0,
        labels,
        surfaces,
        latest: feedback.slice(-12).reverse(),
    };
}

function Stat({ label, value }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{value}</div>
        </div>
    );
}

function Bar({ label, value, total }) {
    const width = total ? Math.max(4, Math.round((value / total) * 100)) : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-zinc-300">{label}</span>
                <span className="text-zinc-500">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan-300"
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

export default function FeedbackDashboard() {
    const [events, setEvents] = useState(() => getBufferedPrivacyEvents());
    const summary = useMemo(() => summarize(events), [events]);

    function refresh() {
        setEvents(getBufferedPrivacyEvents());
    }

    function clear() {
        clearBufferedPrivacyEvents();
        setEvents([]);
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-black text-white">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),transparent_32%),#000]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

            <header className="relative z-10 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <Link to="/mirror" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
                        <ArrowLeft size={16} />
                        Back to mirror
                    </Link>
                    <div className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                        this browser only
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_0_70px_rgba(124,58,237,0.12)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-200">
                                <BarChart3 size={14} />
                                Feedback pulse
                            </div>
                            <h1 className="max-w-[11ch] text-[3.3rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[4.8rem]">
                                Is the mirror helping?
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                                Counts only. No prompts. No personal context. This is a local check so we can make the reflection sharper.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={refresh}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                            >
                                <RefreshCw size={13} />
                                Refresh
                            </button>
                            <button
                                type="button"
                                onClick={clear}
                                className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.08] px-3 py-2 text-xs font-semibold text-red-100 transition hover:border-red-300/35"
                            >
                                <Trash2 size={13} />
                                Clear local counts
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <Stat label="Feedback clicks" value={summary.total} />
                        <Stat label="Useful" value={summary.useful} />
                        <Stat label="Useful rate" value={`${summary.usefulRate}%`} />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                            <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Response quality</h2>
                            <div className="mt-5 grid gap-4">
                                {Object.entries(LABELS).map(([key, label]) => (
                                    <Bar key={key} label={label} value={summary.labels[key] || 0} total={summary.total} />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                            <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Where feedback happened</h2>
                            <div className="mt-5 grid gap-4">
                                {Object.keys(summary.surfaces).length ? (
                                    Object.entries(summary.surfaces).map(([surface, value]) => (
                                        <Bar key={surface} label={surface.replace(/_/g, ' ')} value={value} total={summary.total} />
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-500">
                                        Use the mirror, tap feedback, then come back here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                        <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Latest signals</h2>
                        <div className="mt-4 grid gap-2">
                            {summary.latest.length ? (
                                summary.latest.map((event, index) => (
                                    <div key={`${event.ts}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
                                        <span className="font-semibold text-zinc-200">{LABELS[event.label] || event.label}</span>
                                        <span className="text-zinc-500">{event.surface || event.page || 'unknown'} · turn {event.turn || 1}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-500">
                                    No feedback yet in this browser session.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
