/**
 * Intent Router — Two-Lane Conversation System
 * Determines intent score (0-3) from user input using weighted signals
 * 
 * 0 = Utility (math, conversions, quick lookups)
 * 1 = Info Discussion (explain, compare, summarize)
 * 2 = Choice (decisions, trade-offs, planning)
 * 3 = Personal/Identity (emotions, values, relationships)
 */

// ═══════════════════════════════════════════════════════════════
// SIGNAL PATTERNS
// ═══════════════════════════════════════════════════════════════

const UTILITY_SIGNALS = [
    { pattern: /[\d]+\s*[\+\-\*\/\=]\s*[\d]+/, weight: 3 },  // Math expressions
    { pattern: /\b(calculate|compute|what is|equals|sum|divide|multiply)\b/i, weight: 3 },
    { pattern: /\b(convert|conversion|how many|how much is)\b/i, weight: 3 },
    { pattern: /\b(time in|date|timezone|spell|spelling|syntax|grammar)\b/i, weight: 3 },
    { pattern: /\b(define|definition|meaning of)\b/i, weight: 2 },
];

const INFO_SIGNALS = [
    { pattern: /\b(summarize|summary|explain|explanation|describe)\b/i, weight: 2 },
    { pattern: /\b(compare|comparison|versus|vs|difference between)\b/i, weight: 2 },
    { pattern: /\b(pros and cons|advantages|disadvantages|benefits)\b/i, weight: 2 },
    { pattern: /\b(examples|example of|outline|overview)\b/i, weight: 2 },
    { pattern: /\b(what is|what are|tell me about)\b/i, weight: 1 },  // Lower weight, can be utility too
];

const CHOICE_SIGNALS = [
    { pattern: /\bshould i\b/i, weight: 3 },
    { pattern: /\b(which is better|which one|decide|deciding|decision)\b/i, weight: 3 },
    { pattern: /\b(choose|choice|option|options|alternative)\b/i, weight: 3 },
    { pattern: /\b(trade-?off|priority|prioritize|plan|planning)\b/i, weight: 3 },
    { pattern: /\b(torn between|weighing|considering|stuck between)\b/i, weight: 3 },
];

const PERSONAL_SIGNALS = [
    { pattern: /\bi (feel|felt|am feeling)\b/i, weight: 3 },
    { pattern: /\b(anxious|anxiety|stressed|stress|overwhelmed|burned out|burnout)\b/i, weight: 3 },
    { pattern: /\b(stuck|lost|confused|afraid|scared|worried|frustrated)\b/i, weight: 3 },
    { pattern: /\b(ashamed|shame|guilty|guilt|sad|sadness|angry|anger)\b/i, weight: 3 },
    { pattern: /\b(my partner|my friend|my family|my boss|relationship)\b/i, weight: 2 },
    { pattern: /\b(meaning|purpose|identity|who am i|self-worth)\b/i, weight: 3 },
    { pattern: /\b(overthinking|can't stop thinking|keeps coming back)\b/i, weight: 2 },
];

// ═══════════════════════════════════════════════════════════════
// INTENT COMPUTATION
// ═══════════════════════════════════════════════════════════════

/**
 * Compute intent score from input
 * @param {string} input - User message
 * @returns {{ score: number, signals: object }}
 */
export function computeIntent(input) {
    const lower = input.toLowerCase();
    const wordCount = input.trim().split(/\s+/).length;

    // Collect weighted scores
    const scores = {
        utility: 0,
        info: 0,
        choice: 0,
        personal: 0
    };

    // Utility signals
    for (const { pattern, weight } of UTILITY_SIGNALS) {
        if (pattern.test(input)) scores.utility += weight;
    }

    // Short queries with numbers boost utility
    if (wordCount < 12 && /\d/.test(input)) {
        scores.utility += 2;
    }

    // Info signals
    for (const { pattern, weight } of INFO_SIGNALS) {
        if (pattern.test(input)) scores.info += weight;
    }

    // Choice signals
    for (const { pattern, weight } of CHOICE_SIGNALS) {
        if (pattern.test(input)) scores.choice += weight;
    }

    // Personal signals
    for (const { pattern, weight } of PERSONAL_SIGNALS) {
        if (pattern.test(input)) scores.personal += weight;
    }

    // Determine intent score (0-3)
    // Priority order for ties: personal > choice > info > utility
    const maxScore = Math.max(scores.utility, scores.info, scores.choice, scores.personal);

    let intentScore;
    if (maxScore === 0) {
        // No clear signals — default to info (1) for general queries
        intentScore = 1;
    } else if (scores.personal === maxScore) {
        intentScore = 3;
    } else if (scores.choice === maxScore) {
        intentScore = 2;
    } else if (scores.info === maxScore) {
        intentScore = 1;
    } else {
        intentScore = 0;  // Utility
    }

    return {
        score: intentScore,
        signals: scores
    };
}

/**
 * Get intent label from score
 */
export function getIntentLabel(score) {
    const labels = ['utility', 'info', 'choice', 'personal'];
    return labels[score] || 'info';
}

/**
 * Check if input is a pure utility query (no reflection needed)
 */
export function isPureUtility(input) {
    const { score, signals } = computeIntent(input);
    // Pure utility: score 0 AND no personal/choice signals
    return score === 0 && signals.personal === 0 && signals.choice === 0;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY HARD SHORTCUT (v0.2 Polish)
// ═══════════════════════════════════════════════════════════════

// Pattern matches: "2*2", "2+2", "what is 5*10", "calculate 100/4"
const MATH_PATTERN = /^(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)\s*\??$/i;

/**
 * Try to compute utility locally without model call
 * Returns { handled: true, result: "4" } or { handled: false }
 */
export function tryUtilityShortcut(input) {
    const trimmed = input.trim();

    // Try math
    const match = trimmed.match(MATH_PATTERN);
    if (match) {
        const a = parseFloat(match[1]);
        const op = match[2].toLowerCase();
        const b = parseFloat(match[3]);

        let result;
        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*':
            case 'x':
            case '×': result = a * b; break;
            case '/':
            case '÷': result = b !== 0 ? a / b : 'undefined (division by zero)'; break;
            default: return { handled: false };
        }

        // Format result nicely
        const formatted = typeof result === 'number' ?
            (Number.isInteger(result) ? result.toString() : result.toFixed(2)) :
            result;

        return {
            handled: true,
            result: formatted,
            schema: {
                direct: { type: 'answer', content: formatted },
                mirror: null
            }
        };
    }

    return { handled: false };
}
