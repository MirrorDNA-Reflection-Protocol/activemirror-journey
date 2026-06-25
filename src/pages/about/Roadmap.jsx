/**
 * ⟡ Roadmap Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Map, CheckCircle, Clock, Sparkles } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const timeline = [
    {
        period: 'Shipped (Live)',
        status: 'done',
        items: [
            'BrainScan cognitive assessment',
            'AI Twins (Guardian, Scout, Synthesizer, Mirror)',
            'Mirror reflection engine with consent & proof logging',
            'MirrorDNA protocol — 61 public repositories',
            'MirrorGate inference control plane (live)',
            'MirrorBalance governance engine — 189 tests, Sovereign Control Plane',
            'MirrorRecall session memory layer',
            'MirrorSwarm multi-model orchestration (Claude, Groq, Gemini, Ollama)',
            'Cognitive Dashboard — 12-panel live TUI',
            'Beacon auto-publishing pipeline (beacon.activemirror.ai)',
            'Sovereign Factory — visual agent spawner',
            'Local inference via Ollama (11 models)',
            '5 published papers on Zenodo + aiXiv',
            'Mobile command (Pixel 9 Pro XL + OnePlus 15)',
            'activemirror.ai public launch',
        ],
    },
    {
        period: 'Q1 2026 (Now)',
        status: 'current',
        items: [
            'NetBird sovereign mesh (replacing Tailscale)',
            'MirrorBrain-Mobile ambient AI on Android',
            'Phone as eyes, ears, hands, mouth — wake word pipeline',
            'Enterprise pilot outreach',
        ],
    },
    {
        period: 'Q2 2026',
        status: 'planned',
        items: [
            'Self-hosting packages & SC1 deployment',
            'Team collaboration (MirrorCowork)',
            'Public API & SDK release',
            'Webhook integrations',
        ],
    },
    {
        period: 'H2 2026',
        status: 'planned',
        items: [
            'On-premise enterprise deployment',
            'Federated MirrorDNA mesh',
            'Plugin/extension system',
            'Multi-language support',
        ],
    },
    {
        period: 'Vision',
        status: 'vision',
        items: [
            'Network of sovereign AI instances',
            'Research partnerships & open governance',
            'AI that knows you better than you know yourself',
        ],
    },
];

const statusConfig = {
    done: { icon: CheckCircle, color: 'emerald', label: 'Complete' },
    current: { icon: Clock, color: 'amber', label: 'In Progress' },
    planned: { icon: Clock, color: 'blue', label: 'Planned' },
    vision: { icon: Sparkles, color: 'purple', label: 'Vision' },
};

export default function RoadmapPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Map size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Roadmap
                    </h1>
                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Where we've been, where we're going. This roadmap reflects our current priorities and may evolve based on community feedback.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {timeline.map((phase, i) => {
                            const config = statusConfig[phase.status];
                            const Icon = config.icon;
                            return (
                                <div key={i} className={`relative pl-8 border-l-2 ${
                                    phase.status === 'done' ? 'border-emerald-500' :
                                    phase.status === 'current' ? 'border-amber-500' :
                                    'border-zinc-700'
                                }`}>
                                    <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                        phase.status === 'done' ? 'bg-emerald-500' :
                                        phase.status === 'current' ? 'bg-amber-500' :
                                        phase.status === 'vision' ? 'bg-purple-500' :
                                        isDark ? 'bg-zinc-700' : 'bg-zinc-300'
                                    }`}>
                                        <Icon size={14} className="text-white" />
                                    </div>
                                    <div className="mb-4">
                                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {phase.period}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            phase.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                                            phase.status === 'current' ? 'bg-amber-500/20 text-amber-400' :
                                            phase.status === 'vision' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {phase.items.map((item, j) => (
                                            <li key={j} className={`flex items-start gap-2 ${
                                                isDark ? 'text-zinc-300' : 'text-zinc-700'
                                            }`}>
                                                <span className={
                                                    phase.status === 'done' ? 'text-emerald-400' :
                                                    phase.status === 'current' ? 'text-amber-400' :
                                                    'text-zinc-500'
                                                }>
                                                    {phase.status === 'done' ? '✓' : '○'}
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Want to influence the roadmap?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Join the community, file issues, or reach out directly.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol" target="_blank" rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                            GitHub Discussions
                        </a>
                        <Link to="/about/contact" className={`px-6 py-3 rounded-xl font-medium ${
                            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                        }`}>
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
