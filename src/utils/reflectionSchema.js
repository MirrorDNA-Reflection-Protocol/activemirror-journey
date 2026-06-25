/**
 * Reflection Schema v3.0 — MirrorDNA Lite Edition
 * Presence over productivity. Reflection over transaction.
 */

export const SCHEMA_VERSION = "3.0";

// ═══════════════════════════════════════════════════════════════
// INTENT SCORES
// ═══════════════════════════════════════════════════════════════

export const INTENT_SCORES = {
    UTILITY: 0,
    INFO: 1,
    CHOICE: 2,
    PERSONAL: 3
};

// ═══════════════════════════════════════════════════════════════
// SCHEMA VALIDATION v3.0
// ═══════════════════════════════════════════════════════════════

/**
 * Validate schema from model output
 * v3.0: Mirror is optional (mirror.present can be false)
 */
export function validateSchema(obj) {
    const errors = [];

    if (!obj || typeof obj !== 'object') {
        return { valid: false, errors: ['not_an_object'] };
    }

    // Direct lane (required)
    if (!obj.direct || typeof obj.direct !== 'object') {
        errors.push('missing_direct');
    } else {
        if (!obj.direct.content || typeof obj.direct.content !== 'string') {
            errors.push('missing_direct_content');
        }
    }

    // Mirror lane (required but can be empty)
    if (!obj.mirror || typeof obj.mirror !== 'object') {
        errors.push('missing_mirror');
    } else {
        // v3.0: mirror.present controls whether mirror content is shown
        // If present is false, we don't require observation/question
        if (obj.mirror.present === true) {
            // Question must end with ? if provided
            if (obj.mirror.question && typeof obj.mirror.question === 'string') {
                if (!obj.mirror.question.trim().endsWith('?')) {
                    errors.push('question_no_mark');
                }
            }
        }
        // If present is false or undefined, mirror content is optional
    }

    // Content safety — check entire object
    const allText = JSON.stringify(obj).toLowerCase();
    const forbidden = ['you should', 'i recommend', 'definitely', 'you must', 'you need to'];
    for (const phrase of forbidden) {
        if (allText.includes(phrase)) {
            errors.push(`forbidden: ${phrase}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY: Convert v2 to v3 schema
// ═══════════════════════════════════════════════════════════════

/**
 * Convert old v2 schema (assumptions/tradeoffs) to v3 (observation/question)
 */
export function normalizeSchema(obj) {
    if (!obj) return obj;
    
    // Already v3 format
    if (obj.mirror && 'present' in obj.mirror) {
        return obj;
    }
    
    // Convert v2 to v3
    if (obj.mirror && obj.mirror.assumptions) {
        return {
            ...obj,
            mirror: {
                present: true,
                observation: obj.mirror.assumptions.join(' '),
                question: obj.mirror.question || null
            }
        };
    }
    
    return obj;
}

// ═══════════════════════════════════════════════════════════════
// JSON PARSING
// ═══════════════════════════════════════════════════════════════

/**
 * Parse JSON from model output (handles markdown wrapping)
 */
export function parseModelOutput(raw) {
    if (!raw || typeof raw !== 'string') {
        return { parsed: null, error: 'invalid_input' };
    }

    try {
        const parsed = JSON.parse(raw);
        return { parsed: normalizeSchema(parsed), error: null };
    } catch (e) {
        // Try extracting from markdown
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                const parsed = JSON.parse(match[0]);
                return { parsed: normalizeSchema(parsed), error: null };
            } catch (e2) {
                return { parsed: null, error: 'json_parse_failed' };
            }
        }
        return { parsed: null, error: 'json_parse_failed' };
    }
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const FALLBACK_SCHEMA = {
    schema_version: SCHEMA_VERSION,
    direct: {
        type: "acknowledge",
        content: "I hear you."
    },
    mirror: {
        present: false
    },
    safety: {
        illegal: false,
        crisis: false,
        mlf: false,
        rewrite_count: 0
    }
};

/**
 * Get utility-only fallback (for intent 0)
 */
export function getUtilityFallback(content = "I'm not sure about that.") {
    return {
        schema_version: SCHEMA_VERSION,
        direct: {
            type: "answer",
            content
        },
        mirror: {
            present: false
        },
        safety: {
            illegal: false,
            crisis: false,
            mlf: false,
            rewrite_count: 0
        }
    };
}
