/**
 * ⟡ Self-Hosting Guide
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Server, ArrowRight, Github, Terminal, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const requirements = [
    'Docker & Docker Compose',
    'Node.js 18+ (for frontend)',
    'Python 3.11+ (for backend)',
    '4GB RAM minimum (8GB recommended)',
    'Local LLM (Ollama) or API keys',
];

const repos = [
    { name: 'mirrorbrain-api', desc: 'Cognitive engine backend', url: 'https://github.com/MirrorDNA-Reflection-Protocol/mirrorbrain-api' },
    { name: 'activemirror-site', desc: 'Frontend application', url: 'https://github.com/MirrorDNA-Reflection-Protocol/activemirror-site' },
    { name: 'mirrorgate', desc: 'Policy enforcement proxy', url: 'https://github.com/MirrorDNA-Reflection-Protocol/mirrorgate' },
    { name: 'mirrorrecall', desc: 'Session memory layer', url: 'https://github.com/MirrorDNA-Reflection-Protocol/mirrorrecall' },
];

export default function SelfHostingPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Server size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Self-Hosting Guide
                    </h1>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Run the entire MirrorDNA stack on your own infrastructure. Full sovereignty, zero cloud dependencies.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Requirements</h2>
                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                        <ul className="space-y-3">
                            {requirements.map((r, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-emerald-400" />
                                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Quick Start</h2>
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                        <div className={`p-4 font-mono text-sm ${isDark ? 'bg-zinc-900' : 'bg-zinc-800'}`}>
                            <pre className="text-green-400 overflow-x-auto">
{`# Clone the repos
git clone https://github.com/MirrorDNA-Reflection-Protocol/mirrorbrain-api
git clone https://github.com/MirrorDNA-Reflection-Protocol/activemirror-site

# Start the backend
cd mirrorbrain-api
pip install -e ".[dev]"
uvicorn src.main:app --port 8000

# Start the frontend (in another terminal)
cd activemirror-site
npm install
npm run dev`}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Key Repositories</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {repos.map((r, i) => (
                            <a
                                key={i}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                                    isDark ? 'bg-white/5 border-white/10 hover:border-purple-500/30' : 'bg-white border-zinc-200 hover:border-purple-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Github size={18} className="text-purple-400" />
                                    <span className={`font-mono font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{r.name}</span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{r.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Need Help?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Enterprise support and deployment assistance available.
                    </p>
                    <Link to="/about/contact" className="px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                        Contact Support
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
