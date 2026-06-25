/**
 * Brief — Temporal Intelligence Dashboard
 *
 * Daily briefings, predictions, timeline
 * Connects to brief API at localhost:8200
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, Moon, Calendar, Mail, Cloud, Github,
    Target, TrendingUp, Clock, CheckCircle, XCircle,
    AlertCircle, Plus, ChevronRight, RefreshCw,
    Zap, Activity, Brain
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import LightConsentBanner from '../components/LightConsentBanner';
import { useTheme } from '../contexts/ThemeContext';

const BRIEF_API = 'https://brief.activemirror.ai';

// Tab definitions
const TABS = {
    briefing: { label: 'Briefing', icon: Sun },
    predictions: { label: 'Predictions', icon: Target },
    timeline: { label: 'Timeline', icon: Activity }
};

// Section emoji mapping
const SECTION_ICONS = {
    '📅': Calendar,
    '📧': Mail,
    '🌤️': Cloud,
    '🔧': Github,
    '🧠': Brain,
    '📰': Zap,
    '📌': AlertCircle,
    '📭': AlertCircle
};

// Confidence colors
const CONFIDENCE_COLORS = {
    low: { bg: 'bg-zinc-500/20', border: 'border-zinc-500/30', text: 'text-zinc-400' },
    medium: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    high: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    certain: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' }
};

// Status colors
const STATUS_COLORS = {
    pending: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', icon: Clock },
    correct: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle },
    incorrect: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: XCircle },
    partial: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: AlertCircle },
    expired: { bg: 'bg-zinc-500/20', border: 'border-zinc-500/30', text: 'text-zinc-400', icon: Clock }
};

export default function Brief() {
    const [consentGiven, setConsentGiven] = useState(false);
    const [activeTab, setActiveTab] = useState('briefing');
    const [briefing, setBriefing] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [stats, setStats] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [briefRes, predRes, statsRes, timelineRes] = await Promise.all([
                fetch(`${BRIEF_API}/api/briefing/today`).catch(() => null),
                fetch(`${BRIEF_API}/api/predictions?limit=20`),
                fetch(`${BRIEF_API}/api/predictions/stats`),
                fetch(`${BRIEF_API}/api/timeline/today`)
            ]);

            if (briefRes?.ok) {
                setBriefing(await briefRes.json());
            }
            if (predRes.ok) {
                setPredictions(await predRes.json());
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (timelineRes.ok) {
                setTimeline(await timelineRes.json());
            }
        } catch (err) {
            setError('Could not connect to Brief API. Please try again later.');
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-purple-500/30">
            {/* Light Consent Banner */}
            <LightConsentBanner
                feature="brief"
                onConsent={() => setConsentGiven(true)}
                isDark={true}
            />

            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black z-0" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-500/10">
                <div className="flex justify-between items-center py-3 px-4 max-w-4xl mx-auto">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <MirrorLogo className="w-6 h-6" />
                        <span className="text-sm font-medium">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Zap size={16} className="text-amber-400" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen pt-20 pb-24 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                            Temporal Intelligence
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </motion.div>

                    {/* Error State */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Stats Bar */}
                    {stats && (
                        <motion.div
                            className="grid grid-cols-3 gap-3 mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-xl font-bold text-white">{stats.total}</div>
                                <div className="text-xs text-zinc-400">Predictions</div>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                <div className="text-xl font-bold text-amber-400">{stats.pending}</div>
                                <div className="text-xs text-zinc-400">Pending</div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                <div className="text-xl font-bold text-emerald-400">{Math.round(stats.accuracy_rate * 100)}%</div>
                                <div className="text-xs text-zinc-400">Accuracy</div>
                            </div>
                        </motion.div>
                    )}

                    {/* Tabs */}
                    <motion.div
                        className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {Object.entries(TABS).map(([key, tab]) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'briefing' && (
                            <BriefingTab key="briefing" briefing={briefing} loading={loading} />
                        )}
                        {activeTab === 'predictions' && (
                            <PredictionsTab key="predictions" predictions={predictions} onRefresh={fetchData} />
                        )}
                        {activeTab === 'timeline' && (
                            <TimelineTab key="timeline" events={timeline} />
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to="/" className="text-xs text-zinc-400 hover:text-amber-400 transition-colors">
                            ← Back to Home
                        </Link>
                    </motion.div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}

function BriefingTab({ briefing, loading }) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
            >
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"
                    >
                        <Sun size={24} className="text-amber-400" />
                    </motion.div>
                    <p className="text-zinc-400 text-sm">Loading briefing...</p>
                </div>
            </motion.div>
        );
    }

    if (!briefing) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <SpotlightCard className="p-8 text-center border border-amber-500/20 bg-amber-500/5">
                    <Moon size={48} className="mx-auto mb-4 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">No briefing yet today</h3>
                    <p className="text-sm text-zinc-400">
                        Briefings are generated from your calendar, email, and other sources.
                    </p>
                </SpotlightCard>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <SpotlightCard className="border border-amber-500/20 bg-black/40 overflow-hidden">
                {/* Greeting */}
                <div className="p-6 border-b border-amber-500/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <p className="text-amber-400 text-lg font-medium">{briefing.greeting}</p>
                    <h2 className="text-xl font-bold text-white mt-1">{briefing.title}</h2>
                </div>

                {/* Sections */}
                <div className="p-4 space-y-3">
                    {briefing.sections?.map((section, index) => {
                        const IconComponent = SECTION_ICONS[section.emoji] || AlertCircle;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/20 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{section.emoji}</span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white">{section.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">{section.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-white/5 text-xs text-zinc-400 flex justify-between">
                    <span>ID: {briefing.briefing_id}</span>
                    <span>Generated by {briefing.ai_voices?.join(', ') || 'AI'}</span>
                </div>
            </SpotlightCard>
        </motion.div>
    );
}

function PredictionsTab({ predictions, onRefresh }) {
    const [showForm, setShowForm] = useState(false);
    const [newPrediction, setNewPrediction] = useState({
        statement: '',
        confidence: 'medium',
        horizon: 'this_week',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPrediction.statement.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${BRIEF_API}/api/prediction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrediction)
            });
            if (res.ok) {
                setShowForm(false);
                setNewPrediction({
                    statement: '',
                    confidence: 'medium',
                    horizon: 'this_week',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    reasoning: ''
                });
                onRefresh();
            }
        } catch (err) {
            console.error('Failed to create prediction:', err);
        }
        setSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {/* New Prediction Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Make a Prediction
                </button>
            )}

            {/* New Prediction Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                    >
                        <SpotlightCard className="border border-amber-500/30 bg-amber-500/5 space-y-4">
                            <h3 className="font-medium text-white">New Prediction</h3>

                            <input
                                type="text"
                                placeholder="What do you predict will happen?"
                                value={newPrediction.statement}
                                onChange={(e) => setNewPrediction(p => ({ ...p, statement: e.target.value }))}
                                className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Confidence</label>
                                    <select
                                        value={newPrediction.confidence}
                                        onChange={(e) => setNewPrediction(p => ({ ...p, confidence: e.target.value }))}
                                        className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="certain">Certain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Horizon</label>
                                    <select
                                        value={newPrediction.horizon}
                                        onChange={(e) => setNewPrediction(p => ({ ...p, horizon: e.target.value }))}
                                        className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                                    >
                                        <option value="today">Today</option>
                                        <option value="this_week">This Week</option>
                                        <option value="this_month">This Month</option>
                                        <option value="this_quarter">This Quarter</option>
                                        <option value="this_year">This Year</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                                <input
                                    type="date"
                                    value={newPrediction.due_date}
                                    onChange={(e) => setNewPrediction(p => ({ ...p, due_date: e.target.value }))}
                                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                                />
                            </div>

                            <textarea
                                placeholder="Reasoning (optional)"
                                value={newPrediction.reasoning}
                                onChange={(e) => setNewPrediction(p => ({ ...p, reasoning: e.target.value }))}
                                rows={2}
                                className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newPrediction.statement.trim() || submitting}
                                    className="flex-1 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </SpotlightCard>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Predictions List */}
            {predictions.length === 0 ? (
                <SpotlightCard className="p-8 text-center border border-white/10">
                    <Target size={48} className="mx-auto mb-4 text-zinc-400" />
                    <p className="text-zinc-400">No predictions yet. Make your first one above.</p>
                </SpotlightCard>
            ) : (
                <div className="space-y-3">
                    {predictions.map((pred, index) => {
                        const conf = CONFIDENCE_COLORS[pred.confidence] || CONFIDENCE_COLORS.medium;
                        const status = STATUS_COLORS[pred.status] || STATUS_COLORS.pending;
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={pred.prediction_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <SpotlightCard className={`border ${status.border} ${status.bg}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${status.bg}`}>
                                            <StatusIcon size={18} className={status.text} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium">{pred.statement}</p>
                                            {pred.reasoning && (
                                                <p className="text-sm text-zinc-400 mt-1">{pred.reasoning}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-xs ${conf.bg} ${conf.text} border ${conf.border}`}>
                                                    {pred.confidence}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-zinc-400 border border-white/10">
                                                    {pred.horizon.replace('_', ' ')}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-zinc-400 border border-white/10">
                                                    Due: {new Date(pred.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

function TimelineTab({ events }) {
    if (events.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <SpotlightCard className="p-8 text-center border border-white/10">
                    <Activity size={48} className="mx-auto mb-4 text-zinc-400" />
                    <p className="text-zinc-400">No events today.</p>
                </SpotlightCard>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
        >
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />

            {/* Events */}
            <div className="space-y-4">
                {events.map((event, index) => (
                    <motion.div
                        key={event.event_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-14"
                    >
                        {/* Dot */}
                        <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-amber-500/20 border-2 border-amber-500/50 z-10" />

                        <SpotlightCard className="border border-white/10 bg-black/40">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-white">{event.title}</p>
                                    {event.description && (
                                        <p className="text-sm text-zinc-400 mt-1">{event.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
