import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';

export default function NotFound() {
    return (
        <div className="relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-purple-500/30 flex items-center justify-center">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <div className="relative z-10 text-center p-8 max-w-lg">
                <div className="mb-8 flex justify-center">
                    <MirrorLogo className="w-16 h-16 text-white opacity-50" />
                </div>

                <h1 className="text-8xl font-bold bg-gradient-to-b from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
                    404
                </h1>

                <p className="text-xl text-zinc-400 mb-2">
                    This reflection doesn't exist.
                </p>
                <p className="text-sm text-zinc-600 mb-8">
                    The page you're looking for has drifted into the void.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> Return Home
                    </Link>
                    <Link
                        to="/mirror"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        Start Reflection <ArrowLeft size={18} className="rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
