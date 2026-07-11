import { useEffect, useState } from 'react';
import { BrainCircuit, Check, Download, HardDrive, ShieldCheck, Trash2, WifiOff, X } from 'lucide-react';
import { PRIVATE_RECALL_DOWNLOAD_BYTES } from '../lib/private-recall';

const DOWNLOAD_MB = Math.ceil(PRIVATE_RECALL_DOWNLOAD_BYTES / 1_000_000);

export default function PrivateRecallPanel({
    open,
    status,
    isLight = false,
    onClose,
    onEnable,
    onTurnOff,
    onClear,
}) {
    const [online, setOnline] = useState(() => navigator.onLine);
    const [actionBusy, setActionBusy] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);

    useEffect(() => {
        if (!open) setConfirmClear(false);
    }, [open]);

    if (!open) return null;

    const preparing = ['preparing', 'downloading', 'verifying', 'opening', 'indexing'].includes(status.phase);
    const progress = Math.max(0, Math.min(1, Number(status.progress) || 0));
    const panelClass = isLight
        ? 'border-stone-300/80 bg-[#fbfaf7]/98 text-stone-950 shadow-[0_30px_90px_rgba(66,54,39,0.22)]'
        : 'border-white/12 bg-[#0d0d11]/98 text-white shadow-[0_0_90px_rgba(34,211,238,0.16)]';
    const mutedClass = isLight ? 'text-stone-600' : 'text-zinc-400';
    const lineClass = isLight ? 'border-stone-300/70' : 'border-white/10';

    async function run(action) {
        setActionBusy(true);
        try {
            await action?.();
        } finally {
            setActionBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-40 bg-black/68 px-3 py-4 backdrop-blur-md sm:px-6" role="dialog" aria-modal="true" aria-label="Private recall">
            <button type="button" className="absolute inset-0 cursor-default" aria-label="Close private recall" onClick={onClose} />
            <section className={`relative mx-auto flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border ${panelClass}`}>
                <header className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${lineClass}`}>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <BrainCircuit size={19} className={isLight ? 'text-cyan-700' : 'text-cyan-100'} />
                            <h2 className="text-lg font-semibold">Private recall</h2>
                        </div>
                        <p className={`mt-1 text-sm leading-6 ${mutedClass}`}>Find useful things you chose to save, on this device.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition ${isLight ? 'border-stone-300 bg-white text-stone-600 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-100/30 hover:text-white'}`}
                        aria-label="Close private recall"
                    >
                        <X size={17} />
                    </button>
                </header>

                <div className="overflow-y-auto px-5 py-5">
                    {preparing ? (
                        <div className="grid min-h-64 content-center gap-5">
                            <div>
                                <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                                    <span>{status.message || 'Preparing private recall.'}</span>
                                    <span className={mutedClass}>{Math.round(progress * 100)}%</span>
                                </div>
                                <div
                                    className={`mt-3 h-2 overflow-hidden rounded-full ${isLight ? 'bg-stone-200' : 'bg-white/10'}`}
                                    role="progressbar"
                                    aria-label="Private recall setup"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={Math.round(progress * 100)}
                                >
                                    <div className="h-full rounded-full bg-cyan-400 transition-[width] duration-300" style={{ width: `${Math.max(3, progress * 100)}%` }} />
                                </div>
                            </div>
                            <p className={`text-sm leading-6 ${mutedClass}`}>Keep this tab open for the one-time setup. An interrupted download can be tried again.</p>
                        </div>
                    ) : status.ready ? (
                        <div className="grid gap-5">
                            <div className="flex items-start gap-3">
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${isLight ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700' : 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100'}`}>
                                    <Check size={18} />
                                </span>
                                <div>
                                    <div className="font-semibold">Ready without a service</div>
                                    <p className={`mt-1 text-sm leading-6 ${mutedClass}`}>Search still works after the connection drops. Nothing leaves this device unless you add it to a message.</p>
                                </div>
                            </div>

                            <div className={`divide-y border-y ${lineClass} ${isLight ? 'divide-stone-300/70' : 'divide-white/10'}`}>
                                <StatusRow icon={HardDrive} label="Saved for recall" value={`${status.count || 0} ${status.count === 1 ? 'item' : 'items'}`} mutedClass={mutedClass} />
                                <StatusRow icon={BrainCircuit} label="Runs here" value={status.accelerator === 'webgpu' ? 'Device graphics' : 'Device processor'} mutedClass={mutedClass} />
                                <StatusRow icon={ShieldCheck} label="Storage" value={status.persistent ? 'Protected from cleanup' : 'May clear under storage pressure'} mutedClass={mutedClass} />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={onTurnOff}
                                    className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${isLight ? 'border-stone-300 bg-white text-stone-700 hover:border-cyan-500/35 hover:text-stone-950' : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:border-cyan-200/30 hover:text-white'}`}
                                >
                                    Turn off
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!confirmClear) {
                                            setConfirmClear(true);
                                            return;
                                        }
                                        run(onClear);
                                    }}
                                    disabled={actionBusy}
                                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition disabled:opacity-60 ${isLight ? 'border-rose-300 bg-rose-50 text-rose-800 hover:border-rose-400' : 'border-rose-300/20 bg-rose-300/[0.07] text-rose-100 hover:border-rose-200/35'}`}
                                >
                                    <Trash2 size={15} />
                                    {confirmClear ? 'Confirm clear' : 'Clear recall'}
                                </button>
                            </div>
                            <p className={`text-xs leading-5 ${mutedClass}`}>Turning off keeps the download for later. Clearing removes the recall files, index, and recalled text from this browser.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            <div>
                                <div className="text-xl font-semibold">Download once. Recall anywhere.</div>
                                <p className={`mt-2 text-sm leading-6 ${mutedClass}`}>After setup, search what you saved even when an AI service or reliable connection is unavailable.</p>
                            </div>

                            <div className={`divide-y border-y ${lineClass} ${isLight ? 'divide-stone-300/70' : 'divide-white/10'}`}>
                                <StatusRow icon={Download} label="One-time setup" value={`About ${DOWNLOAD_MB} MB`} mutedClass={mutedClass} />
                                <StatusRow icon={HardDrive} label="What is indexed" value="Only things you save" mutedClass={mutedClass} />
                                <StatusRow icon={ShieldCheck} label="What is sent" value="Nothing automatically" mutedClass={mutedClass} />
                            </div>

                            {!online ? (
                                <div className={`flex items-start gap-2.5 text-sm leading-6 ${isLight ? 'text-amber-800' : 'text-amber-100'}`}>
                                    <WifiOff size={17} className="mt-1 shrink-0" />
                                    Offline now. Setup works only if the download is already on this device.
                                </div>
                            ) : null}

                            {status.error ? (
                                <div className={`text-sm leading-6 ${isLight ? 'text-rose-800' : 'text-rose-100'}`} role="alert">{status.error}</div>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => run(onEnable)}
                                disabled={actionBusy}
                                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1rem] border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${isLight ? 'border-cyan-600/25 bg-cyan-700 text-white hover:bg-cyan-800' : 'border-cyan-200/25 bg-cyan-200/[0.11] text-cyan-50 hover:border-cyan-100/40 hover:bg-cyan-200/[0.16]'}`}
                            >
                                <Download size={17} />
                                {online ? 'Download and turn on' : 'Open downloaded recall'}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function StatusRow({ icon: Icon, label, value, mutedClass }) {
    return (
        <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 text-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Icon size={16} className={mutedClass} />
            <span className={mutedClass}>{label}</span>
            <span className="col-start-2 font-semibold sm:col-start-auto">{value}</span>
        </div>
    );
}
