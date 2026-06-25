const FALLBACK_ARCHETYPES = {
    architect: {
        name: 'The Architect',
        emoji: '🏗️',
        description: 'You naturally look for structure, systems, and the hidden pattern beneath surface noise.',
        strengths: ['Systems thinking', 'Pattern recognition', 'Long-horizon planning'],
        scores: { topology: 92, velocity: 58, depth: 84, entropy: 46, evolution: 71 },
    },
    explorer: {
        name: 'The Explorer',
        emoji: '🧭',
        description: 'You move toward the new, the strange, and the edge of what is not fully mapped yet.',
        strengths: ['Curiosity', 'Adaptability', 'Connection finding'],
        scores: { topology: 64, velocity: 78, depth: 62, entropy: 81, evolution: 86 },
    },
    builder: {
        name: 'The Builder',
        emoji: '🛠️',
        description: 'You want ideas to become real. Progress matters most when it can be shipped and felt.',
        strengths: ['Execution', 'Pragmatism', 'Momentum'],
        scores: { topology: 72, velocity: 83, depth: 59, entropy: 52, evolution: 74 },
    },
    analyst: {
        name: 'The Analyst',
        emoji: '📊',
        description: 'You trust the map that survives scrutiny. Evidence sharpens your sense of reality.',
        strengths: ['Critical thinking', 'Detail orientation', 'Objectivity'],
        scores: { topology: 78, velocity: 55, depth: 88, entropy: 36, evolution: 63 },
    },
    connector: {
        name: 'The Connector',
        emoji: '🌐',
        description: 'You think in relationships, people, and resonance. Meaning often appears to you as a network.',
        strengths: ['Empathy', 'Networking', 'Communication'],
        scores: { topology: 86, velocity: 69, depth: 57, entropy: 67, evolution: 77 },
    },
    creative: {
        name: 'The Creative',
        emoji: '🎨',
        description: 'You see alternate worlds in the same material. Possibility pulls harder than convention.',
        strengths: ['Innovation', 'Lateral thinking', 'Vision'],
        scores: { topology: 61, velocity: 74, depth: 66, entropy: 87, evolution: 82 },
    },
    scholar: {
        name: 'The Scholar',
        emoji: '📚',
        description: 'You go deep instead of wide. You prefer mastery, continuity, and well-earned precision.',
        strengths: ['Deep expertise', 'Patience', 'Thoroughness'],
        scores: { topology: 73, velocity: 43, depth: 94, entropy: 34, evolution: 58 },
    },
    strategist: {
        name: 'The Strategist',
        emoji: '♟️',
        description: 'You are drawn to leverage, timing, and the hidden game behind visible decisions.',
        strengths: ['Strategic thinking', 'Anticipation', 'Resource optimization'],
        scores: { topology: 82, velocity: 67, depth: 79, entropy: 48, evolution: 69 },
    },
};

export const FALLBACK_QUESTIONS = [
    {
        id: 'q1',
        question: 'When a complex problem lands in your lap, what happens first in your head?',
        options: [
            'I start mapping the structure underneath it.',
            'I look for the most interesting unknown.',
            'I look for the fastest concrete move.',
            'I think about the people and dynamics involved.',
        ],
        archetypes: ['architect', 'explorer', 'builder', 'connector'],
    },
    {
        id: 'q2',
        question: 'What kind of work gives you the strongest feeling of momentum?',
        options: [
            'Designing the system that makes everything else cleaner.',
            'Following an unusual thread until it reveals something new.',
            'Turning ambiguity into something real and usable.',
            'Generating a surprising angle nobody saw coming.',
        ],
        archetypes: ['architect', 'explorer', 'builder', 'creative'],
    },
    {
        id: 'q3',
        question: 'In group situations, what role do you drift toward naturally?',
        options: [
            'The one who sees the long game.',
            'The one who connects the right people.',
            'The one who tests whether the claim is actually true.',
            'The one who makes sure something ships.',
        ],
        archetypes: ['strategist', 'connector', 'analyst', 'builder'],
    },
    {
        id: 'q4',
        question: 'What kind of information do you trust most?',
        options: [
            'A clean model that explains the whole field.',
            'Direct evidence that survives pressure.',
            'Lived signals from the edge of the situation.',
            'A deep body of knowledge built over time.',
        ],
        archetypes: ['architect', 'analyst', 'explorer', 'scholar'],
    },
    {
        id: 'q5',
        question: 'Which frustration hits you hardest?',
        options: [
            'Noise without structure.',
            'Routine without possibility.',
            'Talking without action.',
            'Shallow thinking pretending to be deep.',
        ],
        archetypes: ['architect', 'creative', 'builder', 'scholar'],
    },
    {
        id: 'q6',
        question: 'How do you usually make a hard decision?',
        options: [
            'I compare scenarios and leverage points.',
            'I examine the evidence until the answer sharpens.',
            'I feel for what has energy and follow it.',
            'I pick the move that creates the most useful progress.',
        ],
        archetypes: ['strategist', 'analyst', 'creative', 'builder'],
    },
    {
        id: 'q7',
        question: 'What kind of learning feels most like home?',
        options: [
            'Mastering a domain deeply.',
            'Seeing how separate ideas connect into one whole.',
            'Exploring many things until a pattern emerges.',
            'Learning by doing and iterating in public.',
        ],
        archetypes: ['scholar', 'architect', 'explorer', 'builder'],
    },
    {
        id: 'q8',
        question: 'What do people rely on you for most often?',
        options: [
            'Clarity and synthesis.',
            'A grounded reality check.',
            'Fresh possibility and new doors.',
            'Reading the room and building alignment.',
        ],
        archetypes: ['architect', 'analyst', 'creative', 'connector'],
    },
];

function makeFallbackBrainId() {
    return `fallback-${Date.now().toString(36)}`;
}

function shouldTryRemoteBrainApi() {
    if (typeof window === 'undefined') return true;
    return /(^|\.)activemirror\.ai$/.test(window.location.hostname);
}

function pickWinningArchetype(scores) {
    return Object.entries(scores).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
    })[0][0];
}

export function evaluateFallbackAnswers(rawAnswers) {
    const tally = Object.keys(FALLBACK_ARCHETYPES).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

    rawAnswers.forEach((answer) => {
        const selectedIndex = answer.answer_index ?? answer.selected_option ?? 0;
        const question = FALLBACK_QUESTIONS.find((item) => item.id === answer.question_id);
        const archetype = question?.archetypes?.[selectedIndex];
        if (archetype && tally[archetype] !== undefined) {
            tally[archetype] += 1;
        }
    });

    const archetype = pickWinningArchetype(tally);
    const meta = FALLBACK_ARCHETYPES[archetype];

    return {
        archetype,
        archetype_name: meta.name,
        archetype_emoji: meta.emoji,
        description: meta.description,
        strengths: meta.strengths,
        scores: meta.scores,
        brain_id: makeFallbackBrainId(),
        source: 'fallback',
    };
}

export async function loadBrainQuestions(apiBase) {
    if (!shouldTryRemoteBrainApi()) {
        return FALLBACK_QUESTIONS;
    }

    try {
        const res = await fetch(`${apiBase}/api/quiz/questions`);
        if (!res.ok) throw new Error('question fetch failed');
        const data = await res.json();
        const questions = data.questions || data;
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('empty question payload');
        }
        return questions;
    } catch {
        return FALLBACK_QUESTIONS;
    }
}

export async function submitBrainAnswers(apiBase, answers) {
    if (!shouldTryRemoteBrainApi()) {
        return evaluateFallbackAnswers(answers);
    }

    try {
        const res = await fetch(`${apiBase}/api/quiz/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers }),
        });
        if (!res.ok) throw new Error('submit failed');
        return await res.json();
    } catch {
        return evaluateFallbackAnswers(answers);
    }
}
