/**
 * Setup — MirrorIntake Onboarding
 * Configure trust boundaries, friction mapping, automation targets.
 * Produces a MirrorBlueprint that configures MirrorBalance.
 *
 * Flow: Intro → Sections 1-6 → Scoring → Blueprint → Next Steps
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, ArrowLeft, Shield, Brain, Zap, Lock, Eye,
    ChevronRight, Sparkles, Settings, Check, AlertTriangle,
    Battery, Users, Clock, Target, MessageSquare
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import LightConsentBanner from '../components/LightConsentBanner';
import { useTheme } from '../contexts/ThemeContext';
import { getArchetype, getIntakeDraft, saveIntakeDraft, saveBlueprint } from '../lib/mirror-state';

// ── Scoring (mirrors mirrorbalance/intake/scoring.py) ──

const FRICTION_LEXICON = {
    overwhelm: 0.9, overwhelmed: 0.9, burnout: 1.0, chaos: 0.8,
    forget: 0.6, lost: 0.5, slow: 0.4, manual: 0.5, repetitive: 0.6,
    boring: 0.3, stuck: 0.7, blocked: 0.7, drowning: 0.9,
    exhausted: 0.85, scattered: 0.75, distracted: 0.65, frustrated: 0.7,
};

const COMFORT_MAP = { minimal: 0.25, moderate: 0.50, aggressive: 0.75, full_autopilot: 1.0 };

const MODE_THRESHOLDS = [
    { max: 0.30, mode: 'GUARDIAN', label: 'Guardian', desc: 'Maximum oversight. AI asks before acting.', color: 'blue' },
    { max: 0.55, mode: 'BALANCED', label: 'Balanced', desc: 'Smart defaults. AI asks for important decisions.', color: 'purple' },
    { max: 0.80, mode: 'ACCELERATED', label: 'Accelerated', desc: 'High automation. AI acts, you review.', color: 'emerald' },
    { max: 1.01, mode: 'AUTOPILOT', label: 'Autopilot', desc: 'Full automation. Minimal interruption.', color: 'amber' },
];

const STACK_MAP = {
    'file org': 'File Organizer',
    'summaries': 'Auto-Summarizer',
    'scheduling': 'Smart Calendar',
    'reminders': 'Nudge Engine',
    'research': 'Research Agent',
    'drafts': 'Draft Writer',
};

function clamp(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

function frictionSeverity(text) {
    if (!text) return 0;
    const lower = text.toLowerCase();
    let best = 0;
    for (const [kw, sev] of Object.entries(FRICTION_LEXICON)) {
        if (lower.includes(kw)) best = Math.max(best, sev);
    }
    return best;
}

function computeScores(data) {
    // Friction
    const drains = data.energyDrains?.length || 0;
    const loadRaw = data.cognitiveLoad || 5;
    const textSev = frictionSeverity(data.frictionPrimary);
    const csBonus = (data.energyDrains || []).includes('context switching') ? 0.20 : 0;
    const friction = clamp(drains / 6 * 0.15 + loadRaw / 10 * 0.40 + textSev * 0.25 + csBonus);

    // Trust
    const boundaries = data.trustBoundaries?.length || 0;
    const comfort = COMFORT_MAP[data.automationComfort] || 0.5;
    const trust = clamp((1 - boundaries / 6) * 0.50 + comfort * 0.50);

    // ROI
    const targets = data.automationTargets?.length || 0;
    const hasSurgical = data.surgicalTarget?.trim() ? 1 : 0;
    const roi = clamp(targets / 6 * 0.40 + hasSurgical * 0.30 + friction * 0.30);

    // Cognitive Load Index
    const teamMap = { org: 0.10, small_team: 0.05, solo: 0 };
    const ndBonus = data.neurodivergent === 'yes' ? 0.15 : 0;
    const teamBonus = teamMap[data.teamSize] || 0;
    const cli = clamp(loadRaw / 10 * 0.50 + drains / 6 * 0.25 + ndBonus + teamBonus);

    return {
        friction: Math.round(friction * 1000) / 1000,
        trust: Math.round(trust * 1000) / 1000,
        roi: Math.round(roi * 1000) / 1000,
        cli: Math.round(cli * 1000) / 1000,
    };
}

function getMode(trustScore) {
    return MODE_THRESHOLDS.find(t => trustScore <= t.max) || MODE_THRESHOLDS[1];
}

// ── Phases ──

const PHASES = {
    INTRO: 'intro',
    SECTION: 'section',
    SCORING: 'scoring',
    BLUEPRINT: 'blueprint',
    NEXT_STEPS: 'next_steps',
};

// ── Section Definitions ──

const SECTIONS = [
    {
        id: 'identity',
        title: 'Identity',
        icon: Users,
        questions: [
            { key: 'roles', label: "What's your primary role?", type: 'select',
              options: ['founder', 'engineer', 'creative', 'ops', 'researcher', 'other'] },
            { key: 'teamSize', label: 'Solo or team?', type: 'select',
              options: [
                  { value: 'solo', label: 'Solo' },
                  { value: 'small_team', label: 'Small team' },
                  { value: 'org', label: 'Organization' },
              ]},
        ],
    },
    {
        id: 'thinking',
        title: 'Thinking',
        icon: Brain,
        questions: [
            { key: 'thinkingStyle', label: 'How do you make decisions?', type: 'select',
              options: ['data-first', 'gut-then-validate', 'collaborative', 'deadline-driven'] },
            { key: 'peakHours', label: 'When do you do your best work?', type: 'multi',
              options: ['morning', 'afternoon', 'evening', 'night'] },
            { key: 'neurodivergent', label: 'Do you identify as neurodivergent?', type: 'select',
              options: [
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ]},
        ],
    },
    {
        id: 'energy',
        title: 'Energy',
        icon: Battery,
        questions: [
            { key: 'energyDrains', label: 'What drains you most?', type: 'multi',
              options: ['context switching', 'email', 'meetings', 'admin', 'decisions', 'waiting'] },
            { key: 'frictionPrimary', label: "What's your biggest recurring friction?", type: 'text',
              placeholder: 'e.g., "drowning in admin tasks"' },
            { key: 'cognitiveLoad', label: 'Current cognitive load', type: 'slider', min: 1, max: 10 },
        ],
    },
    {
        id: 'trust',
        title: 'Trust',
        icon: Shield,
        questions: [
            { key: 'trustBoundaries', label: 'What should AI never do without asking?', type: 'multi',
              options: ['send messages', 'spend money', 'delete files', 'commit code', 'schedule meetings', 'contact people'] },
            { key: 'automationTargets', label: 'What could AI just handle for you?', type: 'multi',
              options: ['file org', 'summaries', 'scheduling', 'reminders', 'research', 'drafts'] },
            { key: 'automationComfort', label: 'How much automation?', type: 'select',
              options: [
                  { value: 'minimal', label: 'Minimal — I want full control' },
                  { value: 'moderate', label: 'Moderate — smart defaults' },
                  { value: 'aggressive', label: 'Aggressive — automate everything you can' },
                  { value: 'full_autopilot', label: 'Autopilot — just handle it' },
              ]},
        ],
    },
    {
        id: 'interaction',
        title: 'Style',
        icon: MessageSquare,
        questions: [
            { key: 'interactionModel', label: 'How should your Mirror talk to you?', type: 'select',
              options: [
                  { value: 'terse', label: 'Terse — bullets, not paragraphs' },
                  { value: 'conversational', label: 'Conversational — like a friend' },
                  { value: 'detailed', label: 'Detailed — explain everything' },
                  { value: 'adaptive', label: 'Adaptive — match my energy' },
              ]},
            { key: 'challengeLevel', label: 'How should you be challenged?', type: 'select',
              options: [
                  { value: 'never', label: 'Never — just support me' },
                  { value: 'gently', label: 'Gently — suggest alternatives' },
                  { value: 'directly', label: 'Directly — tell me when I\'m wrong' },
                  { value: 'aggressively', label: 'Aggressively — push me hard' },
              ]},
        ],
    },
    {
        id: 'goals',
        title: 'Goals',
        icon: Target,
        questions: [
            { key: 'successDefinition', label: 'What does a perfect week look like?', type: 'text',
              placeholder: 'e.g., "Ship one feature, zero meetings, deep focus blocks"' },
            { key: 'surgicalTarget', label: "One thing you'd automate today?", type: 'text',
              placeholder: 'e.g., "Organize my project files automatically"' },
        ],
    },
];

// ── Main Component ──

export default function Setup() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [phase, setPhase] = useState(PHASES.INTRO);
    const [sectionIndex, setSectionIndex] = useState(0);
    const [data, setData] = useState(() => getIntakeDraft() || {});
    const [scores, setScores] = useState(null);
    const [adjustments, setAdjustments] = useState({});
    const [adjusted, setAdjusted] = useState(false);
    const [blueprint, setBlueprint] = useState(null);

    // Load archetype from shared state
    const [archetype, setArchetype] = useState(null);
    useEffect(() => {
        setArchetype(getArchetype());
    }, []);

    // Auto-save draft via shared state
    useEffect(() => {
        saveIntakeDraft(data);
    }, [data]);

    const updateField = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const toggleMulti = (key, value) => {
        setData(prev => {
            const arr = prev[key] || [];
            return {
                ...prev,
                [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
            };
        });
    };

    const handleSectionNext = () => {
        if (sectionIndex < SECTIONS.length - 1) {
            setSectionIndex(sectionIndex + 1);
        } else {
            // All sections done — compute scores
            const s = computeScores(data);
            setScores(s);
            setPhase(PHASES.SCORING);
        }
    };

    const handleSectionBack = () => {
        if (sectionIndex > 0) {
            setSectionIndex(sectionIndex - 1);
        } else {
            setPhase(PHASES.INTRO);
        }
    };

    const handleAdjust = (field, delta) => {
        if (adjusted) return; // One pass only
        const clamped = clamp(delta, -0.1, 0.1);
        setAdjustments(prev => ({ ...prev, [field]: (prev[field] || 0) + clamped }));
    };

    const handleConfirmScores = () => {
        // Apply adjustments
        let finalScores = { ...scores };
        if (Object.keys(adjustments).length > 0) {
            for (const [field, delta] of Object.entries(adjustments)) {
                if (finalScores[field] !== undefined) {
                    finalScores[field] = clamp(Math.round((finalScores[field] + clamp(delta, -0.1, 0.1)) * 1000) / 1000);
                }
            }
            setAdjusted(true);
        }
        setScores(finalScores);

        // Generate blueprint
        const mode = getMode(finalScores.trust);
        const stack = (data.automationTargets || [])
            .filter(t => STACK_MAP[t] && finalScores.roi > 0.3)
            .map(t => STACK_MAP[t]);

        const bp = {
            blueprintId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
            sessionToken: localStorage.getItem('mirrorId') || Date.now().toString(36),
            schemaVersion: '1.0.0',
            scoringVersion: '1.0.0',
            generatedAt: new Date().toISOString(),
            archetype: archetype || null,
            scores: finalScores,
            scoresAdjusted: Object.keys(adjustments).length > 0,
            mode: mode.mode,
            modeLabel: mode.label,
            modeDescription: mode.desc,
            recommendedStack: stack,
            trustBoundaries: data.trustBoundaries || [],
            neurodivergent: data.neurodivergent === 'yes',
            interactionModel: data.interactionModel || 'adaptive',
            challengeLevel: data.challengeLevel || 'directly',
            surgicalTarget: data.surgicalTarget || '',
        };

        setBlueprint(bp);

        // Persist via shared state
        saveBlueprint(bp);

        setPhase(PHASES.BLUEPRINT);
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
            isDark ? 'bg-[#08080a] text-white' : 'bg-[#fafafa] text-zinc-900'
        }`}>
            <div className={`fixed inset-0 transition-opacity duration-500 ${
                isDark
                    ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent'
                    : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent'
            }`} />

            <LightConsentBanner feature="setup" onConsent={() => {}} isDark={isDark} />

            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pb-24">
                <AnimatePresence mode="wait">
                    {phase === PHASES.INTRO && (
                        <IntroPhase
                            key="intro"
                            archetype={archetype}
                            onStart={() => { setPhase(PHASES.SECTION); setSectionIndex(0); }}
                            isDark={isDark}
                        />
                    )}

                    {phase === PHASES.SECTION && (
                        <SectionPhase
                            key={`section-${sectionIndex}`}
                            section={SECTIONS[sectionIndex]}
                            sectionIndex={sectionIndex}
                            totalSections={SECTIONS.length}
                            data={data}
                            updateField={updateField}
                            toggleMulti={toggleMulti}
                            onNext={handleSectionNext}
                            onBack={handleSectionBack}
                            isDark={isDark}
                        />
                    )}

                    {phase === PHASES.SCORING && scores && (
                        <ScoringPhase
                            key="scoring"
                            scores={scores}
                            adjustments={adjustments}
                            adjusted={adjusted}
                            onAdjust={handleAdjust}
                            onConfirm={handleConfirmScores}
                            isDark={isDark}
                        />
                    )}

                    {phase === PHASES.BLUEPRINT && blueprint && (
                        <BlueprintPhase
                            key="blueprint"
                            blueprint={blueprint}
                            onContinue={() => setPhase(PHASES.NEXT_STEPS)}
                            isDark={isDark}
                        />
                    )}

                    {phase === PHASES.NEXT_STEPS && blueprint && (
                        <NextStepsPhase
                            key="next-steps"
                            blueprint={blueprint}
                            onMirror={() => navigate('/mirror')}
                            onTwins={() => navigate('/twins')}
                            isDark={isDark}
                        />
                    )}
                </AnimatePresence>
            </main>

            <BottomNav />
        </div>
    );
}

// ── Phase Components ──

function IntroPhase({ archetype, onStart, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-lg mx-auto"
        >
            <motion.div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-100 border border-blue-200'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <Settings size={40} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </motion.div>

            {archetype && (
                <motion.p
                    className={`text-sm mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Configuring for {archetype.archetypeName || 'your archetype'}
                </motion.p>
            )}

            <motion.h1
                className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Configure Your Mirror
            </motion.h1>

            <motion.p
                className={`text-lg mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Tell us how you work. We'll configure your trust boundaries, automation level, and pacing.
            </motion.p>

            <motion.div
                className={`mb-8 p-4 rounded-xl text-left ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-100 border border-zinc-200'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <ul className={`text-sm space-y-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <li className="flex items-center gap-2"><Shield size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} /> Set your trust boundaries</li>
                    <li className="flex items-center gap-2"><Zap size={14} className={isDark ? 'text-amber-400' : 'text-amber-600'} /> Map your friction points</li>
                    <li className="flex items-center gap-2"><Eye size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} /> See your scores with full transparency</li>
                    <li className="flex items-center gap-2"><Lock size={14} className={isDark ? 'text-purple-400' : 'text-purple-600'} /> Generate your MirrorBalance config</li>
                </ul>
            </motion.div>

            <motion.button
                onClick={onStart}
                className="px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Begin Setup <ArrowRight size={20} />
            </motion.button>

            <motion.div
                className={`mt-8 flex items-center justify-center gap-6 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <span className="flex items-center gap-1"><Clock size={14} /> 2 minutes</span>
                <span className="flex items-center gap-1"><Lock size={14} /> Private</span>
                <span className="flex items-center gap-1"><Shield size={14} /> You control it</span>
            </motion.div>
        </motion.div>
    );
}

function SectionPhase({ section, sectionIndex, totalSections, data, updateField, toggleMulti, onNext, onBack, isDark }) {
    const Icon = section.icon;
    const progress = ((sectionIndex + 1) / totalSections) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl"
        >
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <Icon size={16} /> {section.title}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {sectionIndex + 1} / {totalSections}
                    </span>
                </div>
                <div className={`h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`}>
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {section.questions.map((q, qi) => (
                    <motion.div
                        key={q.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qi * 0.1 }}
                    >
                        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            {q.label}
                        </label>

                        {q.type === 'select' && (
                            <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt) => {
                                    const val = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    const selected = data[q.key] === val || (Array.isArray(data[q.key]) && data[q.key].includes(val));
                                    return (
                                        <button
                                            key={val}
                                            onClick={() => updateField(q.key, val)}
                                            className={`p-3 rounded-xl text-sm text-left transition-all ${
                                                selected
                                                    ? isDark
                                                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                                                        : 'bg-blue-100 border border-blue-300 text-blue-800'
                                                    : isDark
                                                        ? 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                                                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {q.type === 'multi' && (
                            <div className="flex flex-wrap gap-2">
                                {q.options.map((opt) => {
                                    const selected = (data[q.key] || []).includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => toggleMulti(q.key, opt)}
                                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                                selected
                                                    ? isDark
                                                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                                                        : 'bg-blue-100 border border-blue-300 text-blue-800'
                                                    : isDark
                                                        ? 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                                                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                            }`}
                                        >
                                            {selected && <Check size={12} className="inline mr-1" />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {q.type === 'text' && (
                            <input
                                type="text"
                                value={data[q.key] || ''}
                                onChange={(e) => updateField(q.key, e.target.value)}
                                placeholder={q.placeholder}
                                className={`w-full p-3 rounded-xl text-sm transition-all ${
                                    isDark
                                        ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-blue-500/40'
                                        : 'bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-300'
                                } outline-none`}
                            />
                        )}

                        {q.type === 'slider' && (
                            <div>
                                <input
                                    type="range"
                                    min={q.min}
                                    max={q.max}
                                    value={data[q.key] || 5}
                                    onChange={(e) => updateField(q.key, parseInt(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                                <div className="flex justify-between text-xs mt-1">
                                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Low</span>
                                    <span className={isDark ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold'}>
                                        {data[q.key] || 5}/10
                                    </span>
                                    <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>High</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Nav */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                        isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {sectionIndex < SECTIONS.length - 1 ? 'Next' : 'See My Scores'} <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
}

function ScoreBar({ label, value, color, isDark }) {
    const pct = Math.round(value * 100);
    const colorMap = {
        blue: 'from-blue-500 to-blue-400',
        amber: 'from-amber-500 to-amber-400',
        emerald: 'from-emerald-500 to-emerald-400',
        purple: 'from-purple-500 to-purple-400',
    };
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{label}</span>
                <span className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{pct}%</span>
            </div>
            <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`}>
                <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.blue}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

function ScoringPhase({ scores, adjustments, adjusted, onAdjust, onConfirm, isDark }) {
    const mode = getMode(scores.trust + (adjustments.trust || 0));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg"
        >
            <div className="text-center mb-6">
                <motion.div
                    className="text-4xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <Eye size={40} className={`mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </motion.div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Your Scores
                </h2>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Transparent. You can adjust each score once.
                </p>
            </div>

            <div className={`p-6 rounded-2xl mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200 shadow-lg'
            }`}>
                <ScoreBar label="Friction (how much pain)" value={scores.friction + (adjustments.friction || 0)} color="amber" isDark={isDark} />
                <ScoreBar label="Trust (automation comfort)" value={scores.trust + (adjustments.trust || 0)} color="blue" isDark={isDark} />
                <ScoreBar label="Automation ROI" value={scores.roi + (adjustments.roi || 0)} color="emerald" isDark={isDark} />
                <ScoreBar label="Cognitive Load" value={scores.cli + (adjustments.cli || 0)} color="purple" isDark={isDark} />

                {!adjusted && (
                    <div className={`mt-4 p-3 rounded-xl text-xs ${
                        isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                        Tap a score label to adjust it slightly. One adjustment pass allowed.
                    </div>
                )}
            </div>

            {/* Mode Preview */}
            <div className={`p-4 rounded-xl mb-6 text-center ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-200'
            }`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Your MirrorBalance Mode</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{mode.label}</p>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{mode.desc}</p>
            </div>

            {/* Anti-gaming warning */}
            {(scores.trust + (adjustments.trust || 0)) > 0.8 && (
                <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 ${
                    isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                }`}>
                    <AlertTriangle size={16} className={isDark ? 'text-amber-400 mt-0.5' : 'text-amber-600 mt-0.5'} />
                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        Autopilot mode gives maximum automation with minimal oversight. Your trust boundaries still apply.
                    </p>
                </div>
            )}

            <button
                onClick={onConfirm}
                className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
                <Shield size={20} /> Generate My Blueprint
            </button>
        </motion.div>
    );
}

function BlueprintPhase({ blueprint, onContinue, isDark }) {
    const mode = MODE_THRESHOLDS.find(m => m.mode === blueprint.mode) || MODE_THRESHOLDS[1];

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirror-blueprint-${blueprint.blueprintId.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg text-center"
        >
            <motion.div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <Shield size={40} className="text-white" />
            </motion.div>

            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Blueprint Generated
            </h2>
            <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Your Mirror is configured and ready.
            </p>

            {/* Blueprint Summary */}
            <div className={`p-6 rounded-2xl text-left mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200 shadow-lg'
            }`}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Mode</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{mode.label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Trust Boundaries</span>
                        <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{blueprint.trustBoundaries.length} rules</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Neurodivergent Mode</span>
                        <span className={blueprint.neurodivergent
                            ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            : (isDark ? 'text-zinc-500' : 'text-zinc-400')
                        }>{blueprint.neurodivergent ? 'Active' : 'Off'}</span>
                    </div>
                    {blueprint.recommendedStack.length > 0 && (
                        <div>
                            <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Automation Stack</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {blueprint.recommendedStack.map(s => (
                                    <span key={s} className={`px-2 py-1 rounded-lg text-xs ${
                                        isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {blueprint.surgicalTarget && (
                        <div>
                            <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>First Automation</span>
                            <p className={`text-sm mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{blueprint.surgicalTarget}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onContinue}
                    className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center gap-2"
                >
                    Continue <ChevronRight size={20} />
                </button>
                <button
                    onClick={handleExport}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-sm border ${
                        isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-900'
                    }`}
                >
                    Export Blueprint (.json)
                </button>
            </div>
        </motion.div>
    );
}

function NextStepsPhase({ blueprint, onMirror, onTwins, isDark }) {
    const steps = [
        { label: 'Blueprint generated', done: true },
        { label: `MirrorBalance mode: ${blueprint.modeLabel}`, done: true },
        { label: `${blueprint.trustBoundaries.length} trust boundaries configured`, done: true },
        { label: blueprint.surgicalTarget ? `First automation: ${blueprint.surgicalTarget}` : 'No surgical target set', done: !!blueprint.surgicalTarget },
        { label: 'Re-intake scheduled: 90 days', done: true },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg text-center"
        >
            <motion.div
                className="text-5xl mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <Sparkles size={48} className={`mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </motion.div>

            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                You're Ready
            </h2>
            <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Your Mirror knows how you work. Here's what's configured.
            </p>

            {/* Checklist */}
            <div className={`p-6 rounded-2xl text-left mb-8 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200 shadow-lg'
            }`}>
                {steps.map((step, i) => (
                    <motion.div
                        key={i}
                        className="flex items-start gap-3 mb-3 last:mb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            step.done
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                                : isDark ? 'bg-zinc-700 text-zinc-500' : 'bg-zinc-200 text-zinc-400'
                        }`}>
                            {step.done ? <Check size={12} /> : <span className="text-xs">-</span>}
                        </div>
                        <span className={`text-sm ${
                            step.done
                                ? isDark ? 'text-zinc-300' : 'text-zinc-700'
                                : isDark ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>{step.label}</span>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-3">
                <button
                    onClick={onMirror}
                    className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-violet-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                    <Sparkles size={20} /> Start Reflecting <ArrowRight size={18} />
                </button>
                <button
                    onClick={onTwins}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-sm ${
                        isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                    }`}
                >
                    <Users size={16} /> Meet Your AI Twins
                </button>
            </div>
        </motion.div>
    );
}
