import { useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { copyText, downloadTextFile, shareText } from '../lib/sendable-actions';
import { trackEvent } from '../lib/privacy-events';

const KIND_DOWNLOADS = {
    code: { ext: 'js', type: 'text/javascript;charset=utf-8', label: 'Download code' },
    doc: { ext: 'md', type: 'text/markdown;charset=utf-8', label: 'Download .md' },
    image: { ext: 'md', type: 'text/markdown;charset=utf-8', label: 'Download brief' },
    draft: { ext: 'txt', type: 'text/plain;charset=utf-8', label: 'Download' },
};

const CODE_LANG_EXTENSIONS = {
    bash: 'sh',
    css: 'css',
    html: 'html',
    js: 'js',
    javascript: 'js',
    json: 'json',
    jsx: 'jsx',
    py: 'py',
    python: 'py',
    sh: 'sh',
    ts: 'ts',
    tsx: 'tsx',
};

function firstCodeBlock(text = '') {
    const match = String(text || '').match(/```([a-z0-9_-]+)?\n?([\s\S]*?)```/i);
    if (!match) return null;
    return {
        lang: String(match[1] || 'js').toLowerCase(),
        code: match[2].trim(),
    };
}

function downloadInfo(kind = 'draft', text = '') {
    if (kind !== 'code') return KIND_DOWNLOADS[kind] || KIND_DOWNLOADS.draft;

    const block = firstCodeBlock(text);
    const ext = CODE_LANG_EXTENSIONS[block?.lang] || KIND_DOWNLOADS.code.ext;
    const type = ext === 'json'
        ? 'application/json;charset=utf-8'
        : ext === 'html'
            ? 'text/html;charset=utf-8'
            : ext === 'css'
                ? 'text/css;charset=utf-8'
                : 'text/plain;charset=utf-8';
    return { ext, type, label: `Download .${ext}`, code: block?.code || String(text || '') };
}

function filenameFromTitle(title = 'active-mirror-draft', kind = 'draft') {
    const slug = String(title || 'active-mirror-draft')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48);
    const ext = KIND_DOWNLOADS[kind]?.ext || 'txt';
    return `${slug || 'active-mirror-draft'}.${ext}`;
}

export default function DraftActions({ title = 'Sendable draft', text = '', kind = 'draft', surface = 'home' }) {
    const [status, setStatus] = useState('');
    const download = downloadInfo(kind, text);

    function flash(nextStatus) {
        setStatus(nextStatus);
        window.setTimeout(() => setStatus(''), 1800);
    }

    async function copyDraft() {
        try {
            await copyText(text);
            trackEvent('draft_copied', { page: surface, source: 'sendable' });
            flash('Copied');
        } catch {
            flash('Copy failed');
        }
    }

    function downloadDraft() {
        try {
            downloadTextFile(filenameFromTitle(title, kind).replace(/\.[^.]+$/, `.${download.ext}`), download.code || text, download.type);
            trackEvent('draft_downloaded', { page: surface, source: 'sendable' });
            flash('Downloaded');
        } catch {
            flash('Download failed');
        }
    }

    async function shareDraft() {
        try {
            const result = await shareText({ title, text });
            trackEvent('draft_shared', { page: surface, source: result });
            flash(result === 'copied' ? 'Copied' : 'Shared');
        } catch (error) {
            if (error?.name === 'AbortError') {
                flash('Share canceled');
                return;
            }
            flash('Share failed');
        }
    }

    const buttonClass = 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-cyan-200/30 hover:bg-cyan-300/[0.075] hover:text-white';

    return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyDraft} className={buttonClass}>
                <Copy size={13} />
                Copy
            </button>
            <button type="button" onClick={shareDraft} className={buttonClass}>
                <Share2 size={13} />
                Share
            </button>
            <button type="button" onClick={downloadDraft} className={buttonClass}>
                <Download size={13} />
                {download.label}
            </button>
            {status ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-100">
                    <Check size={13} />
                    {status}
                </span>
            ) : null}
        </div>
    );
}
