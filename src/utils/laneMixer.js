/**
 * Lane Mixer v3.0 — MirrorDNA Lite Edition
 * More conservative with questions. Presence over interrogation.
 */

// ═══════════════════════════════════════════════════════════════
// BASELINE LANE MIX BY INTENT
// ═══════════════════════════════════════════════════════════════

// v3.0: More conservative mirror baselines
const BASELINE_MIRROR = {
    0: 0.00,   // Utility → 100% Direct, no questions
    1: 0.10,   // Info → 90% Direct, rarely ask
    2: 0.25,   // Choice → 75% Direct, sometimes reflect
    3: 0.50    // Personal → 50/50, reflect when meaningful
};

// ═══════════════════════════════════════════════════════════════
// DIAL EFFECT
// ═══════════════════════════════════════════════════════════════

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Compute effective lane mix from intent score and dial
 * v3.0: Dial has reduced effect (±15% instead of ±20%)
 */
export function computeLaneMix(intentScore, dial = 0.5) {
    const M_base = BASELINE_MIRROR[intentScore] ?? BASELINE_MIRROR[1];

    // v3.0: Reduced dial effect (±15%)
    const dialEffect = (dial - 0.5) * 0.3;

    // v3.0: Lower mirror cap (70% max)
    const mirror = clamp(M_base + dialEffect, 0, 0.70);
    const direct = 1 - mirror;

    return { direct, mirror };
}

// ═══════════════════════════════════════════════════════════════
// QUESTION CAPS — v3.0 CONSERVATIVE
// ═══════════════════════════════════════════════════════════════

/**
 * Get maximum questions allowed
 * v3.0: Much more conservative — questions are rare, not default
 */
export function getMaxQuestions(dial, intentScore) {
    // Utility (0) and Info (1) → NO questions unless dial is very high
    if (intentScore <= 1) {
        return dial > 0.8 ? 1 : 0;
    }

    // Choice (2) → 1 question only if dial is above center
    if (intentScore === 2) {
        return dial > 0.5 ? 1 : 0;
    }

    // Personal (3) → 1 question allowed, but model decides via mirror.present
    if (intentScore === 3) {
        return 1;
    }

    return 0;
}

// ═══════════════════════════════════════════════════════════════
// RENDERING DECISION
// ═══════════════════════════════════════════════════════════════

/**
 * Determine what to render based on lane mix
 * v3.0: Always show direct, mirror only when significant
 */
export function getRenderStrategy(laneMix) {
    const showDirect = true;  // v3.0: Always show direct
    const showMirror = laneMix.mirror > 0.15;  // v3.0: Higher threshold
    const directFirst = true;  // v3.0: Always lead with direct

    return { showDirect, showMirror, directFirst };
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Compute full lane configuration
 */
export function computeLaneConfig(intentScore, dial = 0.5) {
    const laneMix = computeLaneMix(intentScore, dial);
    const maxQuestions = getMaxQuestions(dial, intentScore);
    const renderStrategy = getRenderStrategy(laneMix);

    return {
        intentScore,
        dial,
        laneMix,
        maxQuestions,
        ...renderStrategy
    };
}
