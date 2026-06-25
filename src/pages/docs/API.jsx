/**
 * ⟡ API Documentation — Developer reference for MirrorDNA APIs
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Code, Server, Key, Lock, Zap, CheckCircle, Copy, ExternalLink,
    Brain, Shield, Database, Activity, ArrowRight, Terminal
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

const endpoints = [
    {
        category: 'MirrorBrain',
        baseUrl: 'https://brain.activemirror.ai',
        description: 'Cognitive engine powering BrainScan and AI Twins',
        endpoints: [
            {
                method: 'GET',
                path: '/health',
                description: 'Health check',
                response: '{ "status": "healthy", "version": "1.0.0" }',
            },
            {
                method: 'GET',
                path: '/api/quiz/questions',
                description: 'Get BrainScan questions',
                response: '{ "questions": [{ "id": 1, "text": "...", "options": [...] }] }',
            },
            {
                method: 'POST',
                path: '/api/quiz/submit',
                description: 'Submit BrainScan answers',
                body: '{ "answers": [{ "question_id": 1, "answer_index": 0 }] }',
                response: '{ "archetype": "architect", "scores": {...}, "twin": "guardian" }',
            },
            {
                method: 'POST',
                path: '/api/resonance',
                description: 'Calculate resonance match',
                body: '{ "profile_a": {...}, "profile_b": {...} }',
                response: '{ "resonance_score": 0.85, "compatibility": "high" }',
            },
            {
                method: 'POST',
                path: '/consent/log',
                description: 'Log consent proof',
                body: '{ "hash": "⟡XXXX-YYYY", "acks": [...], "timestamp": "..." }',
                response: '{ "success": true, "id": "..." }',
            },
        ]
    },
    {
        category: 'MirrorGate',
        baseUrl: 'https://proxy.activemirror.ai',
        description: 'Policy-enforced AI proxy',
        endpoints: [
            {
                method: 'GET',
                path: '/health',
                description: 'Health check',
                response: '{ "status": "ok", "policies_loaded": 5 }',
            },
            {
                method: 'POST',
                path: '/v1/chat/completions',
                description: 'OpenAI-compatible chat (with policy enforcement)',
                body: '{ "model": "...", "messages": [...] }',
                response: 'Proxied response with policy headers',
            },
            {
                method: 'GET',
                path: '/policies',
                description: 'List active policies',
                response: '{ "policies": ["pii_filter", "content_safety", ...] }',
            },
        ]
    },
    {
        category: 'Mirror API',
        baseUrl: 'https://mirror.activemirror.ai',
        description: 'Reflection and conversation API',
        endpoints: [
            {
                method: 'GET',
                path: '/health',
                description: 'Health check',
                response: '{ "status": "ok", "version": "1.0.0" }',
            },
            {
                method: 'POST',
                path: '/reflect',
                description: 'Send reflection prompt',
                body: '{ "prompt": "...", "twin": "guardian", "context": {...} }',
                response: '{ "response": "...", "glyph": "⟡" }',
            },
        ]
    },
];

const sdks = [
    { name: 'Python', status: 'Available', package: 'pip install mirrordna', color: 'blue' },
    { name: 'JavaScript', status: 'Available', package: 'npm install @mirrordna/sdk', color: 'yellow' },
    { name: 'Go', status: 'Coming Soon', package: 'go get github.com/mirrordna/go-sdk', color: 'cyan' },
    { name: 'Rust', status: 'Coming Soon', package: 'cargo add mirrordna', color: 'orange' },
];

function CodeBlock({ code, language = 'json', isDark }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative rounded-lg overflow-hidden ${
            isDark ? 'bg-black/50' : 'bg-zinc-900'
        }`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-xs text-zinc-500 font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                    {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-zinc-300 font-mono">{code}</code>
            </pre>
        </div>
    );
}

function EndpointCard({ endpoint, isDark }) {
    const methodColors = {
        GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
        }`}>
            <div className="flex items-start gap-3 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-mono font-semibold border ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                </span>
                <code className={`text-sm font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {endpoint.path}
                </code>
            </div>
            <p className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {endpoint.description}
            </p>
            {endpoint.body && (
                <div className="mb-3">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Request Body:
                    </span>
                    <CodeBlock code={endpoint.body} language="json" isDark={isDark} />
                </div>
            )}
            <div>
                <span className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Response:
                </span>
                <CodeBlock code={endpoint.response} language="json" isDark={isDark} />
            </div>
        </div>
    );
}

export default function API() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeCategory, setActiveCategory] = useState('MirrorBrain');

    const activeEndpoints = endpoints.find(e => e.category === activeCategory);

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Code size={32} className="text-purple-400" />
                        </div>
                    </div>

                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        API Reference
                    </h1>

                    <p className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Build with the MirrorDNA protocol. RESTful APIs for cognitive assessment, policy enforcement, and sovereign reflection.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4">
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                            isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                            <Activity size={16} className="text-emerald-500" />
                            <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                All systems operational
                            </span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${
                            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                v1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authentication */}
            <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Key size={24} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Authentication
                        </h2>
                    </div>

                    <div className={`p-6 rounded-xl ${
                        isDark ? 'bg-zinc-900/50 border border-white/10' : 'bg-white border border-zinc-200'
                    }`}>
                        <p className={`mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            Most public endpoints don't require authentication. For rate-limited or private endpoints, use Bearer token authentication:
                        </p>
                        <CodeBlock
                            code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://brain.activemirror.ai/api/protected`}
                            language="bash"
                            isDark={isDark}
                        />
                        <p className={`mt-4 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            Contact <a href="mailto:paul@activemirror.ai" className="text-purple-400 hover:underline">paul@activemirror.ai</a> for API keys.
                        </p>
                    </div>
                </div>
            </section>

            {/* Endpoints */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Endpoints
                    </h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {endpoints.map((cat) => (
                            <button
                                key={cat.category}
                                onClick={() => setActiveCategory(cat.category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeCategory === cat.category
                                        ? 'bg-purple-600 text-white'
                                        : isDark
                                            ? 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                            >
                                {cat.category}
                            </button>
                        ))}
                    </div>

                    {/* Active Category */}
                    {activeEndpoints && (
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Server size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                    <code className={`text-sm font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                        {activeEndpoints.baseUrl}
                                    </code>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {activeEndpoints.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {activeEndpoints.endpoints.map((endpoint, i) => (
                                    <EndpointCard key={i} endpoint={endpoint} isDark={isDark} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* SDKs */}
            <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        SDKs & Libraries
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {sdks.map((sdk) => (
                            <div
                                key={sdk.name}
                                className={`p-4 rounded-xl border ${
                                    isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-zinc-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {sdk.name}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        sdk.status === 'Available'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-zinc-500/20 text-zinc-400'
                                    }`}>
                                        {sdk.status}
                                    </span>
                                </div>
                                <code className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {sdk.package}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-3xl mx-auto text-center p-8 rounded-2xl ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20'
                        : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Need Help?
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Check out the docs, explore the repos, or reach out directly.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/docs"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium"
                        >
                            Read Docs
                        </Link>
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
                                isDark
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                            }`}
                        >
                            <ExternalLink size={16} />
                            GitHub
                        </a>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
