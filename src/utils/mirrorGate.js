/**
 * MirrorGate v5.1 — Two-Lane + Polish
 * Gate → Intent Router → Utility Shortcut → Process → Lane Mix → Render
 */

import { validateSchema, parseModelOutput, FALLBACK_SCHEMA, getUtilityFallback } from './reflectionSchema';
import { renderTwoLane, renderUtility, renderFallback } from './reflectionTemplates';
import { computeIntent, isPureUtility, getIntentLabel, tryUtilityShortcut } from './intentRouter';
import { computeLaneConfig } from './laneMixer';

// ═══════════════════════════════════════════════════════════════
// PRE-INFERENCE GATES
// ═══════════════════════════════════════════════════════════════

const CRISIS_PATTERNS = [
    /\b(suicide|suicidal|kill myself|end(ing)? my life|want to die)\b/i,
    /\b(self.?harm|cut myself|hurt myself)\b/i,
    /\b(take my (own )?life|better off dead)\b/i,
    /\b(being abused|hits me|rape|raped)\b/i,
];

const ILLEGAL_PATTERNS = [
    /\b(how to (make|build) (a |)(bomb|explosive|weapon))\b/i,
    /\b(synthesize|manufacture) (drugs|meth|fentanyl)\b/i,
    /\b(child porn|csam|underage)\b/i,
    /\b(hack into|malware|exploit vulnerability)\b/i,
];

const CRISIS_RESPONSE = `I can hear you're in a difficult place. I'm not equipped for this — please reach out:

🆘 Crisis Text Line: Text HOME to 741741
🆘 Suicide & Crisis Lifeline: 988 (US)
🆘 Emergency: 911

You matter. Please reach out now.`;

/**
 * Gate 0.7: Pre-inference safety check
 */
export function gateInput(input) {
    for (const p of CRISIS_PATTERNS) {
        if (p.test(input)) return { allowed: false, reason: 'crisis', response: CRISIS_RESPONSE };
    }
    for (const p of ILLEGAL_PATTERNS) {
        if (p.test(input)) return { allowed: false, reason: 'illegal', response: "I can't engage with that." };
    }
    if (input.length > 2000) {
        return { allowed: false, reason: 'too_long', response: "That's a lot. What's the core question?" };
    }
    return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════
// INTENT ROUTING (with Utility Shortcut)
// ═══════════════════════════════════════════════════════════════

/**
 * Gate 0.8: Compute intent and lane configuration
 * Returns shortcut result if math can be computed locally
 */
export function routeIntent(input, dial = 0.5) {
    // TRY UTILITY SHORTCUT FIRST (no model call)
    const shortcut = tryUtilityShortcut(input);
    if (shortcut.handled) {
        console.log('⟡ Utility shortcut: computed locally');
        return {
            intentScore: 0,
            intentLabel: 'utility',
            signals: { utility: 10, info: 0, choice: 0, personal: 0 },
            shortcut: shortcut,  // Pass result through
            laneMix: { direct: 1, mirror: 0 },
            maxQuestions: 0,
            showDirect: true,
            showMirror: false,
            directFirst: true
        };
    }

    // Normal routing
    const { score, signals } = computeIntent(input);
    const laneConfig = computeLaneConfig(score, dial);

    return {
        intentScore: score,
        intentLabel: getIntentLabel(score),
        signals,
        ...laneConfig
    };
}

// ═══════════════════════════════════════════════════════════════
// POST-INFERENCE PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Process raw model output → validated schema → rendered text
 */
export function processAndRender(rawOutput, intentConfig) {
    const { intentScore, laneMix, maxQuestions, showDirect, showMirror, directFirst } = intentConfig;

    // Handle null/empty output
    if (!rawOutput) {
        console.log('⟡ No model output, using fallback');
        if (intentScore === 0) {
            const fallback = getUtilityFallback();
            return { text: renderUtility(fallback.direct.content), schema: fallback, valid: false };
        }
        return { text: renderFallback(), schema: FALLBACK_SCHEMA, valid: false };
    }

    // Parse JSON
    const { parsed, error } = parseModelOutput(rawOutput);

    if (!parsed) {
        console.log('⟡ JSON parse failed:', error);
        if (intentScore === 0) {
            const fallback = getUtilityFallback();
            return { text: renderUtility(fallback.direct.content), schema: fallback, valid: false };
        }
        return { text: renderFallback(), schema: FALLBACK_SCHEMA, valid: false };
    }

    // Validate
    const validation = validateSchema(parsed);

    if (!validation.valid) {
        console.log('⟡ Schema validation failed:', validation.errors);
        if (intentScore === 0) {
            const fallback = getUtilityFallback();
            return { text: renderUtility(fallback.direct.content), schema: fallback, valid: false };
        }
        return { text: renderFallback(), schema: FALLBACK_SCHEMA, valid: false };
    }

    // Build lane config for renderer  
    const laneConfig = {
        showDirect,
        showMirror,
        directFirst,
        maxQuestions,
        intentScore
    };

    // Render Two-Lane output
    const text = renderTwoLane(parsed, laneConfig);

    return { text, schema: parsed, valid: true, laneConfig };
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Complete gate → route → process → render pipeline
 */
export function fullPipeline(input, rawOutput, dial = 0.5) {
    // Gate
    const gateResult = gateInput(input);
    if (!gateResult.allowed) {
        return {
            allowed: false,
            reason: gateResult.reason,
            text: gateResult.response,
            schema: null
        };
    }

    // Route
    const intentConfig = routeIntent(input, dial);

    // Process & Render
    const result = processAndRender(rawOutput, intentConfig);

    return {
        allowed: true,
        ...result,
        intentConfig
    };
}

// Re-exports for convenience
export { FALLBACK_SCHEMA } from './reflectionSchema';
export const FALLBACK_RESPONSE = renderFallback();
