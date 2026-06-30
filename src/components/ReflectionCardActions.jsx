import { useRef, useState } from 'react';
import { Check, Copy, ImageDown, Share2 } from 'lucide-react';
import { copyText, shareText } from '../lib/sendable-actions';
import { trackEvent } from '../lib/privacy-events';

function reflectionText(mirror = {}) {
    return [
        'Active Mirror',
        '',
        'Ask this:',
        mirror.question || 'What is the useful question here?',
        '',
        'Try this:',
        mirror.move || 'Take the smallest concrete next step.',
        '',
        'Private by default. Nothing saved unless accepted.',
    ].join('\n');
}

export default function ReflectionCardActions({ mirror = {}, surface = 'home', className = '' }) {
    const cardRef = useRef(null);
    const [status, setStatus] = useState('');
    const text = reflectionText(mirror);

    function flash(message) {
        setStatus(message);
        window.setTimeout(() => setStatus(''), 1800);
    }

    async function copyCard() {
        await copyText(text);
        trackEvent('draft_copied', { page: surface, source: 'reflection_card' });
        flash('Copied');
    }

    async function shareCard() {
        const result = await shareText({ title: 'Active Mirror reflection', text });
        trackEvent('draft_shared', { page: surface, source: result });
        flash(result === 'shared' ? 'Shared' : 'Copied');
    }

    async function saveImage() {
        if (!cardRef.current) return;
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: '#030305',
            scale: 2,
            useCORS: true,
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'active-mirror-reflection-card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        trackEvent('draft_downloaded', { page: surface, source: 'reflection_card' });
        flash('Saved');
    }

    return (
        <>
            <div className={`max-w-[46rem] rounded-[1.5rem] border border-white/10 bg-white/[0.045] px-4 py-3 ${className}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-zinc-200">Take this with you.</div>
                        <div className="mt-1 text-xs leading-5 text-zinc-500">Share the next move, not your private prompt.</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={copyCard}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-purple-300/30 hover:text-white"
                        >
                            <Copy size={13} />
                            Copy
                        </button>
                        <button
                            type="button"
                            onClick={shareCard}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                        >
                            <Share2 size={13} />
                            Share
                        </button>
                        <button
                            type="button"
                            onClick={saveImage}
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.12]"
                        >
                            {status === 'Saved' ? <Check size={13} /> : <ImageDown size={13} />}
                            Image
                        </button>
                    </div>
                </div>
                {status ? <div className="mt-2 text-xs font-semibold text-emerald-200">{status}</div> : null}
            </div>

            <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
                <div
                    ref={cardRef}
                    className="w-[720px] overflow-hidden rounded-[36px] border border-white/10 bg-[#030305] p-8 text-white shadow-2xl"
                >
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.05]">
                                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                                    <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
                                    <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[20px] font-semibold tracking-[-0.02em]">Active Mirror</div>
                                <div className="text-[13px] text-zinc-500">one clear move</div>
                            </div>
                        </div>
                        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-2 text-[13px] font-semibold text-emerald-100">
                            private first
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-purple-300/20 bg-purple-300/[0.08] p-6">
                        <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-200/75">Ask this</div>
                        <div className="text-[30px] font-semibold leading-[1.16] tracking-[-0.04em] text-white">
                            {mirror.question || 'What is the useful question here?'}
                        </div>
                    </div>

                    <div className="mt-5 rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.08] p-6">
                        <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-200/75">Try this</div>
                        <div className="text-[22px] leading-[1.45] text-zinc-100">
                            {mirror.move || 'Take the smallest concrete next step.'}
                        </div>
                    </div>

                    <div className="mt-8 text-[14px] leading-6 text-zinc-500">
                        Private by default. Nothing saved unless accepted.
                    </div>
                </div>
            </div>
        </>
    );
}
