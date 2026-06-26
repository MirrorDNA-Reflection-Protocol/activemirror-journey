import { useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { copyText, downloadTextFile, shareText } from '../lib/sendable-actions';
import { trackEvent } from '../lib/privacy-events';

function filenameFromTitle(title = 'active-mirror-draft') {
    const slug = String(title || 'active-mirror-draft')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48);
    return `${slug || 'active-mirror-draft'}.txt`;
}

export default function DraftActions({ title = 'Sendable draft', text = '', surface = 'home' }) {
    const [status, setStatus] = useState('');

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
            downloadTextFile(filenameFromTitle(title), text);
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
                Download
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
