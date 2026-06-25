import React from 'react';

export default function TrademarkPoster({ className = '', isDark = false, compact = false }) {
    return (
        <div
            className={`overflow-hidden rounded-[28px] border ${
                isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
                    : 'border-slate-300/90 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]'
            } ${className}`}
        >
            <div className={`grid items-center gap-5 p-4 sm:p-5 ${compact ? 'lg:grid-cols-[12rem_1fr]' : 'lg:grid-cols-[15rem_1fr]'}`}>
                <img
                    src="/assets/active-mirror-trust-poster.jpg"
                    alt="Active Mirror trademark poster"
                    className="w-full rounded-[22px] object-cover"
                    loading="lazy"
                />
                <div>
                    <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-[#7bd9ff]' : 'text-[#1d4ed8]'}`}>
                        Parent mark
                    </div>
                    <div className={`mt-3 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        Active Mirror™
                    </div>
                    <div className={`mt-2 text-sm font-medium ${isDark ? 'text-white/76' : 'text-slate-700'}`}>
                        Trust by Design™
                    </div>
                    <p className={`mt-3 max-w-xl text-sm leading-6 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        The parent brand mark for the governed ecosystem, carried consistently across public trust surfaces.
                    </p>
                </div>
            </div>
        </div>
    );
}
