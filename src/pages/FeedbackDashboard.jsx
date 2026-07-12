import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BarChart3, Cloud, Image, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { clearBufferedPrivacyEvents, getBufferedPrivacyEvents } from '../lib/privacy-events';

const GATEWAY_HEALTH_URL = 'https://gateway.activemirror.ai/health';

const LABELS = {
    useful: 'Useful',
    too_vague: 'Too vague',
    too_agreeable: 'Too agreeable',
    too_much: 'Too much',
};

function summarize(events) {
    const feedback = events.filter((event) => event.event === 'mirror_feedback');
    const artifacts = events.filter((event) => event.event === 'sendable_created');
    const images = artifacts.filter((event) => event.label === 'image');
    const gatewayErrors = events.filter((event) => event.event === 'gateway_error');
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
        artifactTotal: artifacts.length,
        imageTotal: images.length,
        gatewayErrors: gatewayErrors.length,
        labels,
        surfaces,
        latest: feedback.slice(-12).reverse(),
    };
}

function Stat({ label, value }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
        </div>
    );
}

function HealthStat({ icon: Icon, label, value, note, tone = 'cyan' }) {
    const tones = {
        cyan: 'border-cyan-300/15 bg-cyan-300/[0.065] text-cyan-100',
        amber: 'border-amber-300/20 bg-amber-300/[0.075] text-amber-100',
        emerald: 'border-emerald-300/15 bg-emerald-300/[0.065] text-emerald-100',
        zinc: 'border-white/10 bg-white/[0.045] text-zinc-100',
    };

    return (
        <div className={`rounded-lg border p-4 ${tones[tone] || tones.zinc}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
                <Icon size={14} />
                {label}
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
            {note ? <div className="mt-2 text-sm leading-6 text-zinc-400">{note}</div> : null}
        </div>
    );
}

function healthTone(health) {
    if (health.status === 'error') return 'amber';
    if (health.data?.guardrails?.media_storage === 'r2_configured') return 'emerald';
    if (health.data?.guardrails?.media_storage === 'edge_cache_ephemeral') return 'cyan';
    return 'amber';
}

function storageLabel(health) {
    const storage = health.data?.guardrails?.media_storage;
    if (storage === 'r2_configured') return 'Cloud image storage on';
    if (storage === 'edge_cache_ephemeral') return 'Temporary image links on';
    if (health.status === 'error') return 'Status unavailable';
    return 'Storage setup needed';
}

function storageNote(health) {
    const guardrails = health.data?.guardrails || {};
    if (guardrails.media_storage === 'r2_configured') {
        return `Images use ${guardrails.media_url_policy || 'signed links'}.`;
    }
    if (guardrails.media_storage === 'edge_cache_ephemeral') {
        return 'Images use short-lived signed links until cloud storage is enabled.';
    }
    if (health.status === 'error') return 'Could not read service status.';
    return 'Image storage is not ready.';
}

function budgetLabel(health) {
    const guardrails = health.data?.guardrails || {};
    const session = guardrails.image_session_daily_limit || '5';
    const network = guardrails.image_network_daily_limit || '80';
    return `${session} / ${network}`;
}

function budgetNote(health) {
    const guardrails = health.data?.guardrails || {};
    const minuteSession = guardrails.image_session_window_limit || '2';
    const minuteNetwork = guardrails.image_network_window_limit || '12';
    return `${minuteSession} per session and ${minuteNetwork} per network per minute.`;
}

function signingLabel(health) {
    const signing = health.data?.guardrails?.media_signing;
    if (signing === 'secret_hmac') return 'Signed links on';
    if (signing === 'receipt_hash_fallback') return 'Fallback links on';
    return 'Waiting for storage';
}

function Bar({ label, value, total }) {
    const width = total ? Math.max(4, Math.round((value / total) * 100)) : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-zinc-300">{label}</span>
                <span className="text-zinc-400">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-[var(--am-primary)]"
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

export default function FeedbackDashboard() {
    const [events, setEvents] = useState(() => getBufferedPrivacyEvents());
    const [health, setHealth] = useState({ status: 'loading', data: null, error: '' });
    const summary = useMemo(() => summarize(events), [events]);

    async function refresh() {
        setEvents(getBufferedPrivacyEvents());
        setHealth((current) => ({ ...current, status: 'loading' }));
        try {
            const response = await fetch(GATEWAY_HEALTH_URL, { cache: 'no-store' });
            const data = await response.json();
            setHealth({ status: response.ok && data?.ok ? 'ready' : 'error', data, error: response.ok ? '' : `HTTP ${response.status}` });
        } catch (error) {
            setHealth({ status: 'error', data: null, error: error?.message || 'health_unavailable' });
        }
    }

    function clear() {
        clearBufferedPrivacyEvents();
        setEvents([]);
    }

    useEffect(() => {
        refresh();
    }, []);

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-black text-white">
            <div className="fixed inset-0 bg-[var(--am-canvas)]" />

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
                <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5 ring-1 ring-white/[0.04] sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-200">
                                <BarChart3 size={14} />
                                Operator pulse
                            </div>
                            <h1 className="max-w-[11ch] text-[3.3rem] font-semibold leading-[0.95] sm:text-[4.8rem]">
                                Is the mirror helping?
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                                Counts only. No prompts. No personal context. This is the place to catch quality, spend, and storage issues before more people use it.
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

                    <div className="mt-6 grid gap-3 lg:grid-cols-4">
                        <HealthStat
                            icon={Cloud}
                            label="Image storage"
                            value={storageLabel(health)}
                            note={storageNote(health)}
                            tone={healthTone(health)}
                        />
                        <HealthStat
                            icon={Image}
                            label="Image daily cap"
                            value={budgetLabel(health)}
                            note={budgetNote(health)}
                            tone="cyan"
                        />
                        <HealthStat
                            icon={ShieldCheck}
                            label="Image links"
                            value={signingLabel(health)}
                            note={`TTL ${health.data?.guardrails?.media_url_ttl_seconds || '604800'} seconds.`}
                            tone={health.data?.guardrails?.media_signing === 'secret_hmac' ? 'emerald' : 'zinc'}
                        />
                        <HealthStat
                            icon={AlertTriangle}
                            label="This browser"
                            value={`${summary.imageTotal} image starts`}
                            note={`${summary.artifactTotal} output starts. ${summary.gatewayErrors} service errors.`}
                            tone={summary.gatewayErrors ? 'amber' : 'zinc'}
                        />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-black/25 p-5">
                            <h2 className="text-lg font-semibold text-white">Response quality</h2>
                            <div className="mt-5 grid gap-4">
                                {Object.entries(LABELS).map(([key, label]) => (
                                    <Bar key={key} label={label} value={summary.labels[key] || 0} total={summary.total} />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/25 p-5">
                            <h2 className="text-lg font-semibold text-white">Where feedback happened</h2>
                            <div className="mt-5 grid gap-4">
                                {Object.keys(summary.surfaces).length ? (
                                    Object.entries(summary.surfaces).map(([surface, value]) => (
                                        <Bar key={surface} label={surface.replace(/_/g, ' ')} value={value} total={summary.total} />
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-400">
                                        Use the mirror, tap feedback, then come back here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-5">
                        <h2 className="text-lg font-semibold text-white">Latest signals</h2>
                        <div className="mt-4 grid gap-2">
                            {summary.latest.length ? (
                                summary.latest.map((event, index) => (
                                    <div key={`${event.ts}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
                                        <span className="font-semibold text-zinc-200">{LABELS[event.label] || event.label}</span>
                                        <span className="text-zinc-400">{event.surface || event.page || 'unknown'} · turn {event.turn || 1}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-400">
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
