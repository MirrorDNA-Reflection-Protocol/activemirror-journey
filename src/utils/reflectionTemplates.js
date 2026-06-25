/**
 * Reflection Template Library v3.0 — MirrorDNA Lite Edition
 * Presence over productivity. Reflection over transaction.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// META-LANGUAGE STRIP LIST
// ═══════════════════════════════════════════════════════════════

const META_STRIP_PATTERNS = [
    /\b(I am a logic engine)[^.]*\./gi,
    /\b(I am designed to)[^.]*\./gi,
    /\b(my role is)[^.]*\./gi,
    /\b(as an AI|as an assistant)[^.]*\./gi,
    /\b(the system|the model|the prompt)[^.]*\./gi,
    /\b(I can't access|I cannot access)[^.]*\./gi,
    /^(Here's the quick answer:|Let me clarify:|I'd like to understand this better\.)\s*/i,
    /^(Here's a quick explanation:|Here's a comparison:)\s*/i,
    /^(To summarize:|In short:|The key points:)\s*/i,
    /^(That said, here's what I notice:)\s*/i,
    /^(Worth considering:)\s*/i,
];

/**
 * Strip meta-language and filler from rendered output
 */
function stripMetaLanguage(text) {
    let clean = text;
    for (const pattern of META_STRIP_PATTERNS) {
        clean = clean.replace(pattern, '');
    }
    return clean.replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '').replace(/  +/g, ' ');
}

// ═══════════════════════════════════════════════════════════════
// TWO-LANE RENDERER v3.0
// ═══════════════════════════════════════════════════════════════

/**
 * Render Two-Lane output (v3.0 - mirror is optional)
 * @param {object} schema - { direct, mirror }
 * @param {object} laneConfig - { showDirect, showMirror, directFirst, maxQuestions }
 * @returns {string} Rendered conversational output
 */
export function renderTwoLane(schema, laneConfig) {
    const parts = [];
    const { showDirect, showMirror, directFirst, maxQuestions } = laneConfig;

    // Always render direct content if available
    if (schema.direct?.content) {
        parts.push(schema.direct.content);
    }

    // Only render mirror if:
    // 1. showMirror is true in lane config
    // 2. mirror.present is true in schema (model decided to include it)
    // 3. There's actual content to show
    if (showMirror && schema.mirror?.present === true) {
        // Observation (what we notice)
        if (schema.mirror.observation) {
            parts.push(schema.mirror.observation);
        }

        // Question (only if within question budget)
        if (maxQuestions > 0 && schema.mirror.question) {
            parts.push(`⟡ ${schema.mirror.question}`);
        }
    }

    // Legacy v2 support: handle assumptions/tradeoffs format
    if (showMirror && schema.mirror && !('present' in schema.mirror)) {
        if (schema.mirror.assumptions?.length > 0) {
            const assumptionText = schema.mirror.assumptions.slice(0, 2).join('. ');
            parts.push(assumptionText);
        }
        if (maxQuestions > 0 && schema.mirror.question) {
            parts.push(`⟡ ${schema.mirror.question}`);
        }
    }

    const output = parts.join('\n\n');
    return stripMetaLanguage(output);
}

// ═══════════════════════════════════════════════════════════════
// UTILITY-ONLY RENDERER
// ═══════════════════════════════════════════════════════════════

/**
 * Render utility-only response (no mirror, no filler)
 */
export function renderUtility(content) {
    return stripMetaLanguage(content);
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════

export function renderFallback() {
    const fallbacks = [
        "I hear you. What feels most important right now?",
        "Tell me more about that.",
        "What's on your mind?",
        "I'm here. Take your time."
    ];
    return pick(fallbacks);
}

// Keep v1 function for backward compat
export function renderReflection(schema) {
    const v3Schema = {
        direct: { type: 'acknowledge', content: '' },
        mirror: {
            present: true,
            observation: schema.assumptions?.join(' ') || '',
            question: schema.question || ''
        }
    };

    const laneConfig = {
        showDirect: false,
        showMirror: true,
        directFirst: false,
        maxQuestions: 1,
        intentScore: 2
    };

    return renderTwoLane(v3Schema, laneConfig);
}

// Export strip function for use in proxy
export { stripMetaLanguage };
