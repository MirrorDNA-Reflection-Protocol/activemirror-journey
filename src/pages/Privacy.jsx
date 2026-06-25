import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Trash2, Mail, Globe, Lock } from 'lucide-react';

const Privacy = () => {
    const lastUpdated = "January 17, 2026";
    
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={18} />
                        <span>Back to Active Mirror</span>
                    </a>
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-zinc-500">Last updated: {lastUpdated}</p>
                </header>

                {/* TL;DR */}
                <section className="mb-12 p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        TL;DR — The Short Version
                    </h2>
                    <ul className="space-y-2 text-zinc-300">
                        <li>• <strong>Sovereign Mode:</strong> Your data never leaves your device. Period.</li>
                        <li>• <strong>Cloud Mode:</strong> Messages are processed transiently, never stored or used for training.</li>
                        <li>• <strong>Waitlist:</strong> Your email is stored securely and only used to notify you about launches.</li>
                        <li>• <strong>No tracking:</strong> We don't use analytics that track individuals.</li>
                        <li>• <strong>No selling:</strong> We never sell your data. Ever.</li>
                    </ul>
                </section>

                {/* Full Policy */}
                <div className="prose prose-invert max-w-none space-y-10">
                    
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Globe size={24} className="text-violet-400" />
                            1. Who We Are
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Active Mirror is operated by <strong>N1 Intelligence (OPC) Pvt Ltd</strong>, an independent AI research company based in Goa, India. 
                            We build sovereign AI infrastructure — AI that serves users, not corporations.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            Contact: <a href="mailto:paul@activemirror.ai" className="text-violet-400 hover:underline">paul@activemirror.ai</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Eye size={24} className="text-violet-400" />
                            2. What We Collect
                        </h2>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">Sovereign Mode (Local AI)</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            <strong>Nothing.</strong> When you use Sovereign Mode, the AI runs entirely in your browser using WebLLM. 
                            Your messages, the AI's responses, and all processing happen on your device. We have no access to this data 
                            because it never reaches our servers.
                        </p>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">Cloud Mode</h3>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• <strong>Messages:</strong> Sent to our proxy server, forwarded to Groq for processing, then discarded. Not stored.</li>
                            <li>• <strong>IP Address:</strong> Logged temporarily for rate limiting and abuse prevention. Anonymized after 24 hours.</li>
                            <li>• <strong>Browser Fingerprint:</strong> Collected only for the fingerprint reveal feature. Displayed to you, not stored by us.</li>
                        </ul>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">Waitlist / Email Signup</h3>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• <strong>Email Address:</strong> Stored securely to notify you when MirrorBrain Desktop launches.</li>
                            <li>• <strong>Signup Source:</strong> Which page you signed up from (e.g., "mirror").</li>
                            <li>• <strong>Timestamp:</strong> When you signed up.</li>
                        </ul>
                        
                        <h3 className="text-lg font-medium text-zinc-200 mt-6 mb-3">Automatically Collected</h3>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• <strong>Server Logs:</strong> Standard web server logs (IP, timestamp, URL, status code). Retained for 7 days for debugging.</li>
                            <li>• <strong>Error Reports:</strong> If something crashes, we may log the error (not your messages) to fix bugs.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Database size={24} className="text-violet-400" />
                            3. How We Use Your Data
                        </h2>
                        <ul className="text-zinc-400 space-y-3">
                            <li><strong>Provide the Service:</strong> Process messages in Cloud Mode, deliver AI responses.</li>
                            <li><strong>Prevent Abuse:</strong> Rate limiting, blocking malicious requests.</li>
                            <li><strong>Notify You:</strong> Send one email when MirrorBrain Desktop launches (if you signed up).</li>
                            <li><strong>Improve the Product:</strong> Aggregate, anonymized statistics (e.g., "X% of users try Sovereign Mode").</li>
                        </ul>
                        
                        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-red-400 font-medium">We do NOT:</p>
                            <ul className="text-zinc-400 mt-2 space-y-1">
                                <li>• Train AI models on your conversations</li>
                                <li>• Sell or share your data with third parties</li>
                                <li>• Build advertising profiles</li>
                                <li>• Track you across websites</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Lock size={24} className="text-violet-400" />
                            4. Third-Party Services
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-4">
                            In Cloud Mode, we use the following third-party service:
                        </p>
                        <ul className="text-zinc-400 space-y-3">
                            <li>
                                <strong>Groq:</strong> AI inference provider. Your messages are sent to Groq's API for processing. 
                                See <a href="https://groq.com/privacy" className="text-violet-400 hover:underline" target="_blank" rel="noopener">Groq's Privacy Policy</a>.
                            </li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            In Sovereign Mode, no third-party services are used. The model runs entirely in your browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Trash2 size={24} className="text-violet-400" />
                            5. Your Rights
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• <strong>Access:</strong> Request a copy of any data we have about you.</li>
                            <li>• <strong>Deletion:</strong> Request deletion of your email from our waitlist.</li>
                            <li>• <strong>Correction:</strong> Update your email address.</li>
                            <li>• <strong>Portability:</strong> Receive your data in a machine-readable format.</li>
                            <li>• <strong>Objection:</strong> Opt out of any communications.</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            To exercise these rights, email <a href="mailto:paul@activemirror.ai" className="text-violet-400 hover:underline">paul@activemirror.ai</a>.
                            We'll respond within 30 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                        <ul className="text-zinc-400 space-y-2">
                            <li>• <strong>Messages:</strong> Not retained (Cloud Mode processes transiently).</li>
                            <li>• <strong>Server Logs:</strong> 7 days.</li>
                            <li>• <strong>Waitlist Emails:</strong> Until you unsubscribe or request deletion.</li>
                            <li>• <strong>Sovereign Mode Data:</strong> Never leaves your device; cleared when you close the browser.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We use industry-standard security measures including:
                        </p>
                        <ul className="text-zinc-400 space-y-2 mt-4">
                            <li>• HTTPS encryption for all data in transit</li>
                            <li>• Rate limiting to prevent abuse</li>
                            <li>• MirrorGate content filtering to block harmful inputs/outputs</li>
                            <li>• Regular security reviews</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We use <strong>localStorage</strong> (not cookies) to remember:
                        </p>
                        <ul className="text-zinc-400 space-y-2 mt-4">
                            <li>• Your conversation history (local only, never sent to us)</li>
                            <li>• Your mode preference (Cloud/Sovereign)</li>
                            <li>• Whether you've completed the welcome flow</li>
                            <li>• Turn count for the demo</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-4">
                            This data stays in your browser and is never transmitted to our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Children</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Active Mirror is not intended for children under 13. We do not knowingly collect data from children.
                            If you believe a child has provided us with personal information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. International Users</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            N1 Intelligence is based in India. If you're accessing from the EU, UK, or other regions with data protection laws,
                            you have additional rights under GDPR or equivalent legislation. Contact us to exercise these rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We may update this policy from time to time. Material changes will be announced on our website.
                            Your continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                            <Mail size={24} className="text-violet-400" />
                            12. Contact
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Questions about this policy? Contact us:
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

export default Privacy;
