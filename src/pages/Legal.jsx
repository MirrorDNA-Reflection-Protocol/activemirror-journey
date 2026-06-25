import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Scale, AlertTriangle } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';

export default function Legal() {
    return (
        <div className="min-h-screen bg-black text-zinc-400 font-sans p-8 selection:bg-green-500/30">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-white mb-12 hover:text-green-400 transition-colors">
                    <ArrowLeft size={16} /> Return to Portal
                </Link>

                <div className="mb-12">
                    <MirrorLogo className="w-12 h-12 text-white mb-6" />
                    <h1 className="text-3xl text-white font-bold mb-2">Sovereign Protocols</h1>
                    <p className="text-sm">Legal & Risk Framework v2.0</p>
                </div>

                <section id="terms" className="mb-12 space-y-4">
                    <h2 className="flex items-center gap-2 text-white font-medium"><Scale size={18} /> Terms of Service</h2>
                    <p className="text-sm leading-relaxed">
                        ActiveMirrorOS is a local-first intelligence protocol. By initializing the system, you acknowledge that:
                        1. You are the sole controller of the hardware and data.
                        2. No telemetry is sent to the cloud without explicit consent.
                        3. The software is provided "AS IS", without warranty of any kind.
                    </p>
                </section>

                <section id="privacy" className="mb-12 space-y-4">
                    <h2 className="flex items-center gap-2 text-white font-medium"><Shield size={18} /> Privacy Policy</h2>
                    <p className="text-sm leading-relaxed">
                        We do not collect your prompts, outputs, or identity. Your reflection remains on your device (Apple Silicon / Local GPU).
                        Authentication is handled locally. We have no access to your mind.
                    </p>
                </section>

                <section id="risk" className="mb-12 space-y-4">
                    <h2 className="flex items-center gap-2 text-white font-medium"><AlertTriangle size={18} /> Risk Mitigant</h2>
                    <p className="text-sm leading-relaxed">
                        Large Language Models can hallucinate and generate inaccurate information.
                        You are responsible for verifying all outputs. Do not rely on this system for critical life-safety, medical, or legal advice.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-xs font-mono">
                    LAST UPDATED: 2026-01-03 • SIGNED: MIRROR_ADMIN
                </div>
            </div>
        </div>
    );
}
