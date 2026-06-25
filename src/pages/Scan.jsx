/**
 * BrainScan — Cognitive Architecture Quiz
 *
 * 8 questions → Your brain archetype
 * Connects to brain API at localhost:8100
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Brain, Sparkles, Share2, Home, Users } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import LightConsentBanner from '../components/LightConsentBanner';
import { useTheme } from '../contexts/ThemeContext';
import { loadBrainQuestions, submitBrainAnswers } from '../lib/brainFallback';

const BRAIN_API = 'https://brain.activemirror.ai';

// Archetype colors for results
const ARCHETYPE_COLORS = {
    architect: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    explorer: { bg: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    builder: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' },
    analyst: { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
    connector: { bg: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    creative: { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
    scholar: { bg: 'from-gray-400/20 to-zinc-500/20', border: 'border-gray-400/30', text: 'text-gray-300', glow: 'shadow-gray-400/20' },
    strategist: { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
};

// Dimension labels
const DIMENSION_INFO = {
    topology: { label: 'Topology', desc: 'Connectedness', icon: '🔗' },
    velocity: { label: 'Velocity', desc: 'Speed of thought', icon: '⚡' },
    depth: { label: 'Depth', desc: 'Deep diving', icon: '🔬' },
    entropy: { label: 'Entropy', desc: 'Chaos tolerance', icon: '🌀' },
    evolution: { label: 'Evolution', desc: 'Growth rate', icon: '🌱' },
};

export default function Scan() {
    const [consentGiven, setConsentGiven] = useState(false);
    const [phase, setPhase] = useState('intro'); // intro, quiz, loading, results
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fetch questions on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const data = await loadBrainQuestions(BRAIN_API);
            setQuestions(data || []);
            setError(null);
        } catch (err) {
            setError('Could not connect to Brain API. Please try again later.');
        }
    };

    const handleStart = () => {
        setPhase('quiz');
        setCurrentQuestion(0);
        setAnswers([]);
    };

    const handleAnswer = async (answerIndex) => {
        const newAnswers = [...answers, { question_id: questions[currentQuestion].id, answer_index: answerIndex }];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Submit quiz
            setPhase('loading');
            try {
                const data = await submitBrainAnswers(BRAIN_API, newAnswers);
                setResult(data);
                // Save brain ID for twins
                if (data.brain_id) {
                    localStorage.setItem('mirrorBrainId', data.brain_id);
                }
                setPhase('results');
            } catch (err) {
                setError('Failed to process your results. Please try again.');
                setPhase('intro');
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setAnswers(answers.slice(0, -1));
        }
    };

    const handleRetake = () => {
        setPhase('intro');
        setResult(null);
        setAnswers([]);
        setCurrentQuestion(0);
    };

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden selection:bg-purple-500/30 transition-colors ${
            isDark ? 'bg-[#08080a] text-white' : 'bg-zinc-50 text-zinc-900'
        }`}>
            {/* Light Consent Banner */}
            <LightConsentBanner
                feature="brainscan"
                onConsent={() => setConsentGiven(true)}
                isDark={isDark}
            />

            {/* Ambient Background */}
            <div className={`fixed inset-0 z-0 ${
                isDark
                    ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#08080a] to-[#08080a]'
                    : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-100/40 via-zinc-50 to-zinc-50'
            }`} />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${
                isDark ? 'bg-[#08080a]/80 border-white/[0.08]' : 'bg-white/90 border-zinc-200'
            }`}>
                <div className="flex justify-between items-center py-3 px-4 max-w-4xl mx-auto">
                    <Link to="/" className={`flex items-center gap-2 transition-colors ${
                        isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-800'
                    }`}>
                        <MirrorLogo className="w-6 h-6" />
                        <span className="text-sm font-medium">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Brain size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20 pb-24">
                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <IntroScreen
                            key="intro"
                            onStart={handleStart}
                            error={error}
                            questionsLoaded={questions.length > 0}
                            isDark={isDark}
                        />
                    )}
                    {phase === 'quiz' && questions.length > 0 && (
                        <QuizScreen
                            key="quiz"
                            question={questions[currentQuestion]}
                            questionNumber={currentQuestion + 1}
                            totalQuestions={questions.length}
                            onAnswer={handleAnswer}
                            onBack={handleBack}
                            canGoBack={currentQuestion > 0}
                            isDark={isDark}
                        />
                    )}
                    {phase === 'loading' && (
                        <LoadingScreen key="loading" isDark={isDark} />
                    )}
                    {phase === 'results' && result && (
                        <ResultsScreen
                            key="results"
                            result={result}
                            onRetake={handleRetake}
                            isDark={isDark}
                        />
                    )}
                </AnimatePresence>
            </main>
            <BottomNav />
        </div>
    );
}

function IntroScreen({ onStart, error, questionsLoaded, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
        >
            <div className={`text-center p-8 sm:p-12 rounded-2xl border backdrop-blur-xl ${
                isDark
                    ? 'border-purple-500/20 bg-black/40'
                    : 'border-zinc-200 bg-white/80 shadow-xl'
            }`}>
                {/* Icon */}
                <motion.div
                    className="mb-6 flex justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        isDark
                            ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30'
                            : 'bg-purple-100 border border-purple-200'
                    }`}>
                        <Brain size={40} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                </motion.div>

                {/* Headline */}
                <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${
                    isDark
                        ? 'bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent'
                        : 'text-zinc-900'
                }`}>
                    BrainScan
                </h1>
                <p className={`mb-6 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Discover your thinking style in 8 questions.
                </p>

                {/* What is this? - Simple explanation */}
                <div className={`mb-6 p-4 rounded-xl text-left ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-200'
                }`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What is this?
                    </h3>
                    <ul className={`text-sm space-y-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        <li>1. Answer 8 simple questions</li>
                        <li>2. Learn how your brain works</li>
                        <li>3. Get matched with an AI companion</li>
                    </ul>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={onStart}
                    disabled={!questionsLoaded}
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {questionsLoaded ? (
                        <>
                            Start <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </>
                    ) : (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Loading...
                        </>
                    )}
                </button>

                {/* Info */}
                <p className={`mt-6 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Takes 2 minutes • Free • Private
                </p>
            </div>
        </motion.div>
    );
}

function QuizScreen({ question, questionNumber, totalQuestions, onAnswer, onBack, canGoBack, isDark }) {
    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
        >
            <div className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-xl ${
                isDark
                    ? 'border-purple-500/20 bg-black/40'
                    : 'border-zinc-200 bg-white/80 shadow-xl'
            }`}>
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Question {questionNumber}/{totalQuestions}
                        </span>
                        <span className={`text-xs font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Question */}
                <h2 className={`text-xl sm:text-2xl font-semibold mb-8 leading-relaxed ${
                    isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                    {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => onAnswer(index)}
                            className={`w-full text-left p-4 rounded-xl border transition-all group ${
                                isDark
                                    ? 'border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/30'
                                    : 'border-zinc-200 bg-white hover:bg-purple-50 hover:border-purple-300'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono transition-colors ${
                                    isDark
                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20'
                                        : 'bg-purple-100 border border-purple-200 text-purple-600 group-hover:bg-purple-200'
                                }`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className={`transition-colors ${
                                    isDark
                                        ? 'text-zinc-300 group-hover:text-white'
                                        : 'text-zinc-700 group-hover:text-zinc-900'
                                }`}>
                                    {option}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Back Button */}
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className={`mt-6 flex items-center gap-2 transition-colors text-sm ${
                            isDark ? 'text-zinc-400 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                    >
                        <ArrowLeft size={16} /> Previous
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function LoadingScreen({ isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <motion.div
                className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30'
                        : 'bg-purple-100 border border-purple-200'
                }`}
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sparkles size={40} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            </motion.div>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Analyzing...
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Discovering your thinking style
            </p>
        </motion.div>
    );
}

function ResultsScreen({ result, onRetake, isDark }) {
    const archetype = result.archetype?.toLowerCase() || 'explorer';
    const colors = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS.explorer;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
        >
            <div className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                isDark
                    ? `${colors.border} bg-black/40 ${colors.glow}`
                    : 'border-zinc-200 bg-white/90'
            }`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="text-6xl mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        {result.archetype_emoji}
                    </motion.div>
                    <motion.h1
                        className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? colors.text : 'text-zinc-900'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {result.archetype_name}
                    </motion.h1>
                    <motion.p
                        className={`leading-relaxed max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {result.description}
                    </motion.p>
                </div>

                {/* What this means */}
                <motion.div
                    className={`mb-8 p-4 rounded-xl ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-200'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        What this means
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Your thinking style is "{result.archetype_name}". This affects how you approach problems, make decisions, and interact with others.
                    </p>
                </motion.div>

                {/* Strengths */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Your Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(result.strengths || []).map((strength, index) => (
                            <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    isDark
                                        ? `border ${colors.border} bg-gradient-to-r ${colors.bg} ${colors.text}`
                                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                                }`}
                            >
                                {strength}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    {/* Primary CTA - Meet Twins */}
                    <Link
                        to="/twins"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
                    >
                        <Users size={20} /> Meet Your AI Companion <ArrowRight size={18} />
                    </Link>

                    {/* Secondary Actions */}
                    <div className="flex gap-3">
                        <Link
                            to="/"
                            className={`flex-1 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                                isDark
                                    ? 'border-purple-500/20 bg-white/5 text-white hover:bg-purple-500/10'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                            }`}
                        >
                            <Home size={16} /> Home
                        </Link>
                        <button
                            onClick={onRetake}
                            className={`flex-1 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                                isDark
                                    ? 'border-purple-500/20 bg-white/5 text-white hover:bg-purple-500/10'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                            }`}
                        >
                            <ArrowLeft size={16} /> Retake
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
