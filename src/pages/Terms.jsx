import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Scale, Shield, Ban, CheckCircle } from 'lucide-react';

const Terms = () => {
    const lastUpdated = "January 17, 2026";
    const effectiveDate = "January 17, 2026";
    
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={18} />
                        <span>Back to Active Mirror</span>
                    </a>
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-zinc-500">Last updated: {lastUpdated}</p>
                    <p className="text-zinc-500">Effective: {effectiveDate}</p>
                </header>

                {/* TL;DR */}
                <section className="mb-12 p-6 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        TL;DR — The Human Version
                    </h2>
                    <ul className="space-y-2 text-zinc-300">
                        <li>• This is an <strong>experimental demo</strong>, not a production service.</li>
                        <li>• Don't use it for anything critical — it may be wrong, slow, or unavailable.</li>
                        <li>• Don't abuse it — no spam, no hacking, no illegal stuff.</li>
                        <li>• We're not responsible if the AI says something dumb or harmful.</li>
                        <li>• We can change or shut down the service anytime.</li>
                    </ul>
                </section>

                {/* Full Terms */}
                <div className="prose prose-invert max-w-none space-y-10">
                    
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Scale size={24} className="text-violet-400" />
                            1. Agreement to Terms
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            By accessing Active Mirror ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                            If you disagree with any part of these terms, you may not access the Service.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            The Service is operated by <strong>N1 Intelligence (OPC) Pvt Ltd</strong> ("we", "us", "our"), 
                            an AI research company based in Goa, India.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <AlertTriangle size={24} className="text-amber-400" />
                            2. Experimental Nature
                        </h2>
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                            <p className="text-amber-300 font-medium">⚠️ IMPORTANT: This is an experimental system.</p>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                            Active Mirror is a technology demonstration, not a commercial product. You acknowledge that:
                        </p>
                        <ul className="text-zinc-400 space-y-2 mt-4">
                            <li>• The AI may produce incorrect, incomplete, or nonsensical outputs</li>
                            <li>• The service may be slow, unavailable, or discontinued without notice</li>
                            <li>• Features may change or be removed at any time</li>
                            <li>• The AI is deliberately constrained and may refuse to answer</li>
                            <li>• Sovereign Mode uses a small model with significant limitations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Ban size={24} className="text-red-400" />
                            3. Prohibited Uses
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-4">
                            You agree NOT to use the Service to:
                        </p>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• Generate content that is illegal, harmful, threatening, abusive, or harassing</li>
                            <li>• Impersonate any person or entity</li>
                            <li>• Attempt to bypass safety filters (MirrorGate)</li>
                            <li>• Probe, scan, or test vulnerabilities of the system</li>
                            <li>• Send automated queries, scrape content, or abuse the API</li>
                            <li>• Use outputs for spam, fraud, or deception</li>
                            <li>• Generate content that sexualizes minors</li>
                            <li>• Create malware, weapons instructions, or dangerous content</li>
                            <li>• Violate any applicable laws or regulations</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            Violation of these terms may result in immediate termination of access and reporting to authorities where appropriate.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Shield size={24} className="text-violet-400" />
                            4. Content and Responsibility
                        </h2>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">Your Content</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            You retain ownership of any content you input. By using the Service, you grant us a limited license 
                            to process your input solely for the purpose of generating responses. In Sovereign Mode, your content 
                            never reaches our servers.
                        </p>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">AI-Generated Content</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            Outputs are generated by AI and may be inaccurate, biased, or inappropriate. You are solely responsible 
                            for evaluating and using any AI-generated content. We make no warranties about the accuracy, completeness, 
                            or fitness of outputs for any purpose.
                        </p>
                        
                        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-red-400 font-medium">The AI is NOT:</p>
                            <ul className="text-zinc-400 mt-2 space-y-1">
                                <li>• A medical professional — do not use for health advice</li>
                                <li>• A lawyer — do not use for legal advice</li>
                                <li>• A financial advisor — do not use for investment decisions</li>
                                <li>• A therapist — do not use as a substitute for mental health care</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            The Service, including its design, code, and content (excluding user inputs and AI outputs), 
                            is owned by N1 Intelligence and protected by intellectual property laws.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            "Active Mirror", "MirrorDNA", "MirrorBrain", "MirrorGate", and the ⟡ symbol are trademarks of N1 Intelligence.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            The Phi-3-mini model used in Sovereign Mode is provided by Microsoft under the MIT License.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                        </p>
                        <ul className="text-zinc-400 space-y-2 mt-4">
                            <li>• The Service is provided "AS IS" without warranties of any kind</li>
                            <li>• We are not liable for any direct, indirect, incidental, or consequential damages</li>
                            <li>• We are not responsible for any decisions made based on AI outputs</li>
                            <li>• Our total liability is limited to the amount you paid us (which is $0 for the free demo)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            You agree to indemnify and hold harmless N1 Intelligence, its officers, directors, employees, and agents 
                            from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service 
                            or violation of these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We may terminate or suspend your access immediately, without prior notice, for any reason, including:
                        </p>
                        <ul className="text-zinc-400 space-y-2 mt-4">
                            <li>• Violation of these Terms</li>
                            <li>• Abuse of the Service</li>
                            <li>• At our sole discretion for any reason</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            Upon termination, your right to use the Service ceases immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Material changes will be posted on this page 
                            with an updated "Last updated" date. Your continued use of the Service after changes constitutes 
                            acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Goa, India.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Severability</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <CheckCircle size={24} className="text-green-400" />
                            12. Contact
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Questions about these Terms? Contact us:
                        </p>
                        <div className="mt-4 p-4 rounded-lg bg-white/5">
                            <p className="text-zinc-300"><strong>N1 Intelligence (OPC) Pvt Ltd</strong></p>
                            <p className="text-zinc-400">Goa, India</p>
                            <p className="text-zinc-400 mt-2">
                                Email: <a href="mailto:paul@activemirror.ai" className="text-violet-400 hover:underline">paul@activemirror.ai</a>
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-zinc-600 text-sm">
                    <p>⟡ Active Mirror · N1 Intelligence</p>
                    <p className="mt-2">Trust by Design · Privacy by Default · Sovereignty by Choice</p>
                </footer>
            </div>
        </div>
    );
};

export default Terms;
