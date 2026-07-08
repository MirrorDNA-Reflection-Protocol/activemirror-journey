import { useMemo, useState } from 'react';
import { Check, Code2, Copy, FileText, Image, PenLine, RefreshCw, Sparkles } from 'lucide-react';
import DraftActions from './DraftActions';
import { useTheme } from '../contexts/ThemeContext';
import { copyText } from '../lib/sendable-actions';

const ARTIFACT_META = {
    code: {
        label: 'Code starter',
        icon: Code2,
        tone: 'text-emerald-100 border-emerald-200/20 bg-emerald-300/[0.07]',
        toneLight: 'text-emerald-700 border-emerald-500/18 bg-emerald-50',
    },
    doc: {
        label: 'Document',
        icon: FileText,
        tone: 'text-cyan-100 border-cyan-200/20 bg-cyan-300/[0.07]',
        toneLight: 'text-cyan-700 border-cyan-500/18 bg-cyan-50',
    },
    image: {
        label: 'Image',
        icon: Image,
        tone: 'text-violet-100 border-violet-200/20 bg-violet-300/[0.07]',
        toneLight: 'text-violet-700 border-violet-500/18 bg-violet-50',
    },
    draft: {
        label: 'Draft',
        icon: PenLine,
        tone: 'text-zinc-100 border-white/10 bg-white/[0.055]',
        toneLight: 'text-stone-700 border-stone-300/70 bg-white/72',
    },
};

const CHALLENGE_META = {
    passed: 'border-emerald-300/15 bg-emerald-300/[0.065] text-emerald-100',
    draft: 'border-cyan-300/15 bg-cyan-300/[0.065] text-cyan-100',
    needs_check: 'border-amber-300/20 bg-amber-300/[0.075] text-amber-100',
    failed: 'border-rose-300/20 bg-rose-300/[0.075] text-rose-100',
};

const CHALLENGE_META_LIGHT = {
    passed: 'border-emerald-500/18 bg-emerald-50/85 text-emerald-800',
    draft: 'border-cyan-500/18 bg-cyan-50/85 text-cyan-800',
    needs_check: 'border-amber-500/22 bg-amber-50/88 text-amber-900',
    failed: 'border-rose-500/18 bg-rose-50/88 text-rose-800',
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

function CodeSegment({ lang, text, isLight }) {
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
        <div className={`overflow-hidden rounded-2xl border ${isLight ? 'border-emerald-500/18 bg-white/72 shadow-[0_14px_34px_rgba(77,65,50,0.08)]' : 'border-emerald-200/15 bg-black/40'}`}>
            <div className={`flex items-center justify-between border-b px-3 py-2 ${isLight ? 'border-stone-300/65' : 'border-white/10'}`}>
                <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${isLight ? 'text-emerald-700/78' : 'text-emerald-100/75'}`}>{lang}</span>
                <button
                    type="button"
                    onClick={copyCode}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-stone-50/78 text-stone-600 hover:border-emerald-500/30 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.045] text-zinc-300 hover:border-emerald-200/30 hover:bg-emerald-300/[0.075] hover:text-white'}`}
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy code'}
                </button>
            </div>
            <pre className={`max-h-[420px] overflow-auto px-3 py-3 text-[13px] leading-6 ${isLight ? 'text-stone-800' : 'text-emerald-50'}`}><code>{text}</code></pre>
        </div>
    );
}

function TextSegment({ text, isLight }) {
    return (
        <div className={`whitespace-pre-wrap break-words rounded-2xl border px-3 py-3 text-sm leading-6 ${isLight ? 'border-stone-300/70 bg-white/68 text-stone-800 shadow-[0_12px_30px_rgba(77,65,50,0.06)]' : 'border-white/10 bg-black/25 text-zinc-100'}`}>
            {text}
        </div>
    );
}

function ArtifactBody({ body, isLight }) {
    const parts = useMemo(() => splitBody(body), [body]);
    return (
        <div className="grid gap-2">
            {parts.map((part, index) => (
                part.type === 'code'
                    ? <CodeSegment key={`${part.type}-${index}`} lang={part.lang} text={part.text} isLight={isLight} />
                    : <TextSegment key={`${part.type}-${index}`} text={part.text} isLight={isLight} />
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

function downloadHref(href, title, mimeType) {
    if (typeof document === 'undefined' || !href) return false;
    const link = document.createElement('a');
    link.href = href;
    link.download = mediaFilename(title, mimeType);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
}

async function downloadMediaUrl(url, title, mimeType) {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('image_download_failed');
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    try {
        downloadHref(href, title, mimeType || blob.type);
    } finally {
        window.setTimeout(() => URL.revokeObjectURL(href), 1200);
    }
}

function ImageMedia({ media, title, isLight }) {
    const [status, setStatus] = useState('');
    const dataUrl = media?.data_url || media?.dataUrl || '';
    const mediaUrl = media?.url || '';
    const imageSrc = dataUrl || mediaUrl;
    if (!imageSrc) return null;
    const readyLabel = /\bposter\b/i.test(String(title || '')) ? 'Poster ready' : 'Image ready';

    function flash(nextStatus) {
        setStatus(nextStatus);
        window.setTimeout(() => setStatus(''), 1600);
    }

    async function downloadImage() {
        try {
            if (dataUrl) {
                downloadHref(dataUrl, title, media?.mime_type || media?.mimeType);
            } else {
                await downloadMediaUrl(mediaUrl, title, media?.mime_type || media?.mimeType);
            }
            flash('Downloaded');
        } catch {
            flash('Download failed');
        }
    }

    return (
        <div className={`mb-3 overflow-hidden rounded-[1.25rem] border ${isLight ? 'border-violet-500/18 bg-white/72 shadow-[0_16px_36px_rgba(77,65,50,0.08)]' : 'border-violet-200/15 bg-black/30'}`}>
            <img
                src={imageSrc}
                alt={media?.alt || title || 'Generated visual'}
                className="block max-h-[520px] w-full object-contain"
            />
            <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 ${isLight ? 'border-stone-300/65' : 'border-white/10'}`}>
                <span className={`text-xs font-semibold ${isLight ? 'text-violet-700' : 'text-violet-100'}`}>{readyLabel}</span>
                <button
                    type="button"
                    onClick={downloadImage}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-stone-50/78 text-stone-600 hover:border-violet-500/30 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.045] text-zinc-300 hover:border-violet-200/30 hover:bg-violet-300/[0.075] hover:text-white'}`}
                >
                    {status || 'Download image'}
                </button>
            </div>
        </div>
    );
}

function ImageRetryActions({ onRegenerate, onSharpen, isLight }) {
    if (!onRegenerate && !onSharpen) return null;
    const buttonClass = `inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${isLight ? 'border-stone-300/70 bg-white/58 text-stone-600 hover:border-violet-500/30 hover:bg-white hover:text-stone-950' : 'border-white/10 bg-white/[0.045] text-zinc-300 hover:border-violet-200/30 hover:bg-violet-300/[0.075] hover:text-white'}`;

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
    const { theme } = useTheme();
    const isLight = theme === 'light';
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
    const challengeTone = (isLight ? CHALLENGE_META_LIGHT : CHALLENGE_META)[challenge.status] || (isLight ? CHALLENGE_META_LIGHT.draft : CHALLENGE_META.draft);
    const challengeLabel = challenge.label || 'Draft';
    const challengeNote = challenge.user_note || '';

    return (
        <section className={`min-w-0 overflow-hidden rounded-[1.7rem] border px-4 py-4 ${isLight ? 'border-stone-300/70 bg-white/72 shadow-[0_20px_50px_rgba(77,65,50,0.10)]' : 'border-cyan-300/15 bg-cyan-300/[0.055] shadow-[0_0_40px_rgba(34,211,238,0.08)]'}`}>
            <div className={`mb-3 flex flex-wrap items-start justify-between gap-2 ${dismissInset ? 'pr-10' : ''}`}>
                <div className="flex min-w-0 items-start gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-2xl border ${isLight ? meta.toneLight : meta.tone}`}>
                        <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                        <div className={`break-words text-sm font-semibold leading-5 ${isLight ? 'text-stone-900' : 'text-cyan-50'}`}>{title}</div>
                        <div className={`text-xs ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>{meta.label}</div>
                    </div>
                </div>
                <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${challengeTone}`}>
                    {challengeLabel}
                </div>
            </div>
            {challengeNote ? (
                <div className={`mb-3 rounded-2xl border px-3 py-2 text-xs leading-5 ${isLight ? 'border-stone-300/70 bg-stone-50/75 text-stone-600' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                    {challengeNote}
                </div>
            ) : null}
            <ImageMedia media={media} title={title} isLight={isLight} />
            <ArtifactBody body={body} isLight={isLight} />
            <DraftActions title={title} text={body} kind={kind} surface={surface} />
            {kind === 'image' ? <ImageRetryActions onRegenerate={onRegenerate} onSharpen={onSharpen} isLight={isLight} /> : null}
            {checklist.length ? (
                <div className="mt-3 grid gap-2">
                    {checklist.map((item) => (
                        <div key={item} className={`flex items-start gap-2 text-xs leading-5 ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                            <Check size={12} className={`mt-1 shrink-0 ${isLight ? 'text-cyan-600/75' : 'text-cyan-200/75'}`} />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
