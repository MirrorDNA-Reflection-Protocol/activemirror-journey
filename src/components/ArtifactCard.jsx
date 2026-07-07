import { useMemo, useState } from 'react';
import { Check, Code2, Copy, FileText, Image, PenLine, RefreshCw, Sparkles } from 'lucide-react';
import DraftActions from './DraftActions';
import { copyText } from '../lib/sendable-actions';

const ARTIFACT_META = {
    code: { label: 'Code starter', icon: Code2, tone: 'text-emerald-100 border-emerald-200/20 bg-emerald-300/[0.07]' },
    doc: { label: 'Document', icon: FileText, tone: 'text-cyan-100 border-cyan-200/20 bg-cyan-300/[0.07]' },
    image: { label: 'Image', icon: Image, tone: 'text-violet-100 border-violet-200/20 bg-violet-300/[0.07]' },
    draft: { label: 'Draft', icon: PenLine, tone: 'text-zinc-100 border-white/10 bg-white/[0.055]' },
};

const CHALLENGE_META = {
    passed: 'border-emerald-300/15 bg-emerald-300/[0.065] text-emerald-100',
    draft: 'border-cyan-300/15 bg-cyan-300/[0.065] text-cyan-100',
    needs_check: 'border-amber-300/20 bg-amber-300/[0.075] text-amber-100',
    failed: 'border-rose-300/20 bg-rose-300/[0.075] text-rose-100',
};

function cleanKind(kind = 'draft') {
    return ARTIFACT_META[kind] ? kind : 'draft';
}

function splitBody(body = '') {
    const text = String(body || '').trim();
    if (!text) return [];

    const parts = [];
    const pattern = /```([a-z0-9_-]+)?\n?([\s\S]*?)```/gi;
    let cursor = 0;
    let match;

    while ((match = pattern.exec(text))) {
        const before = text.slice(cursor, match.index).trim();
        if (before) parts.push({ type: 'text', text: before });
        parts.push({ type: 'code', lang: match[1] || 'code', text: match[2].trim() });
        cursor = pattern.lastIndex;
    }

    const after = text.slice(cursor).trim();
    if (after) parts.push({ type: 'text', text: after });
    return parts.length ? parts : [{ type: 'text', text }];
}

function CodeSegment({ lang, text }) {
    const [copied, setCopied] = useState(false);

    async function copyCode() {
        try {
            await copyText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-emerald-200/15 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/75">{lang}</span>
                <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-200/30 hover:bg-emerald-300/[0.075] hover:text-white"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy code'}
                </button>
            </div>
            <pre className="max-h-[420px] overflow-auto px-3 py-3 text-[13px] leading-6 text-emerald-50"><code>{text}</code></pre>
        </div>
    );
}

function TextSegment({ text }) {
    return (
        <div className="whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-100">
            {text}
        </div>
    );
}

function ArtifactBody({ body }) {
    const parts = useMemo(() => splitBody(body), [body]);
    return (
        <div className="grid gap-2">
            {parts.map((part, index) => (
                part.type === 'code'
                    ? <CodeSegment key={`${part.type}-${index}`} lang={part.lang} text={part.text} />
                    : <TextSegment key={`${part.type}-${index}`} text={part.text} />
            ))}
        </div>
    );
}

function mediaFilename(title = 'active-mirror-poster', mimeType = 'image/png') {
    const slug = String(title || 'active-mirror-poster')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48);
    const ext = String(mimeType || '').includes('jpeg')
        ? 'jpg'
        : String(mimeType || '').includes('webp')
            ? 'webp'
            : 'png';
    return `${slug || 'active-mirror-poster'}.${ext}`;
}

function downloadMedia(dataUrl, title, mimeType) {
    if (typeof document === 'undefined' || !dataUrl) return false;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = mediaFilename(title, mimeType);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
}

function ImageMedia({ media, title }) {
    const [status, setStatus] = useState('');
    const dataUrl = media?.data_url || media?.dataUrl || '';
    if (!dataUrl) return null;
    const readyLabel = /\bposter\b/i.test(String(title || '')) ? 'Poster ready' : 'Image ready';

    function flash(nextStatus) {
        setStatus(nextStatus);
        window.setTimeout(() => setStatus(''), 1600);
    }

    function downloadImage() {
        try {
            downloadMedia(dataUrl, title, media?.mime_type || media?.mimeType);
            flash('Downloaded');
        } catch {
            flash('Download failed');
        }
    }

    return (
        <div className="mb-3 overflow-hidden rounded-[1.25rem] border border-violet-200/15 bg-black/30">
            <img
                src={dataUrl}
                alt={media?.alt || title || 'Generated visual'}
                className="block max-h-[520px] w-full object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
                <span className="text-xs font-semibold text-violet-100">{readyLabel}</span>
                <button
                    type="button"
                    onClick={downloadImage}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-violet-200/30 hover:bg-violet-300/[0.075] hover:text-white"
                >
                    {status || 'Download image'}
                </button>
            </div>
        </div>
    );
}

function ImageRetryActions({ onRegenerate, onSharpen }) {
    if (!onRegenerate && !onSharpen) return null;
    const buttonClass = 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-violet-200/30 hover:bg-violet-300/[0.075] hover:text-white';

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {onRegenerate ? (
                <button type="button" onClick={onRegenerate} className={buttonClass}>
                    <RefreshCw size={13} />
                    Try again
                </button>
            ) : null}
            {onSharpen ? (
                <button type="button" onClick={onSharpen} className={buttonClass}>
                    <Sparkles size={13} />
                    Make cleaner
                </button>
            ) : null}
        </div>
    );
}

export default function ArtifactCard({ artifact, surface = 'home', dismissInset = false, onRegenerate, onSharpen }) {
    if (!artifact) return null;

    const kind = cleanKind(artifact.kind);
    const meta = ARTIFACT_META[kind];
    const Icon = meta.icon;
    const checklist = Array.isArray(artifact.checklist)
        ? artifact.checklist
        : Array.isArray(artifact.checks)
            ? artifact.checks
            : [];
    const title = artifact.title || meta.label;
    const body = artifact.body || '';
    const media = artifact.media || null;
    const challenge = artifact.challenge || {};
    const challengeTone = CHALLENGE_META[challenge.status] || CHALLENGE_META.draft;
    const challengeLabel = challenge.label || 'Draft';
    const challengeNote = challenge.user_note || '';

    return (
        <section className="min-w-0 overflow-hidden rounded-[1.7rem] border border-cyan-300/15 bg-cyan-300/[0.055] px-4 py-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className={`mb-3 flex flex-wrap items-start justify-between gap-2 ${dismissInset ? 'pr-10' : ''}`}>
                <div className="flex min-w-0 items-start gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-2xl border ${meta.tone}`}>
                        <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                        <div className="break-words text-sm font-semibold leading-5 text-cyan-50">{title}</div>
                        <div className="text-xs text-zinc-500">{meta.label}</div>
                    </div>
                </div>
                <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${challengeTone}`}>
                    {challengeLabel}
                </div>
            </div>
            {challengeNote ? (
                <div className="mb-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-zinc-400">
                    {challengeNote}
                </div>
            ) : null}
            <ImageMedia media={media} title={title} />
            <ArtifactBody body={body} />
            <DraftActions title={title} text={body} kind={kind} surface={surface} />
            {kind === 'image' ? <ImageRetryActions onRegenerate={onRegenerate} onSharpen={onSharpen} /> : null}
            {checklist.length ? (
                <div className="mt-3 grid gap-2">
                    {checklist.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs leading-5 text-zinc-400">
                            <Check size={12} className="mt-1 shrink-0 text-cyan-200/75" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
