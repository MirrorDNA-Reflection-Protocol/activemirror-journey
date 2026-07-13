import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';

export default function NotFound() {
    return (
        <div className="am-theme-parity relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-teal-500/30 flex items-center justify-center">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 z-0 bg-[var(--am-canvas)]"></div>

            <div className="relative z-10 text-center p-8 max-w-lg">
                <div className="mb-8 flex justify-center">
                    <MirrorLogo className="h-16 w-16" />
                </div>

                <h1 className="mb-4 text-8xl font-bold text-emerald-300">
                    404
                </h1>

                <p className="text-xl text-zinc-400 mb-2">
                    This reflection doesn't exist.
                </p>
                <p className="text-sm text-zinc-400 mb-8">
                    The page you're looking for has drifted into the void.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> Return Home
                    </Link>
                    <Link
                        to="/mirror"
                        className="am-primary-action flex items-center justify-center gap-2 px-6 py-3 font-medium"
                    >
                        Start Reflection <ArrowLeft size={18} className="rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
