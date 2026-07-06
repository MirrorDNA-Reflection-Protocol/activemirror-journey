const STORAGE_KEY = 'active_mirror_reply_language_v1';

const LANGUAGES = {
    en: { code: 'en', label: 'English', instruction: 'Reply in English. Keep it short, plain, and useful.' },
    hi: { code: 'hi', label: 'Hindi', instruction: 'Reply in Hindi using natural Devanagari. Keep it short, plain, and useful.' },
    hinglish: { code: 'hinglish', label: 'Hinglish', instruction: 'Reply in natural Hinglish. Use simple Roman Hindi plus English where it feels normal. Keep it short and useful.' },
    es: { code: 'es', label: 'Spanish', instruction: 'Reply in Spanish. Keep it short, plain, and useful.' },
    fr: { code: 'fr', label: 'French', instruction: 'Reply in French. Keep it short, plain, and useful.' },
    ar: { code: 'ar', label: 'Arabic', instruction: 'Reply in Arabic. Keep it short, plain, and useful.' },
    pt: { code: 'pt', label: 'Portuguese', instruction: 'Reply in Portuguese. Keep it short, plain, and useful.' },
    de: { code: 'de', label: 'German', instruction: 'Reply in German. Keep it short, plain, and useful.' },
};

const HINGLISH_HINT_RE = /\b(?:mujhe|mujhse|mera|meri|mere|kya|kaise|nahi|nahin|haan|bhai|yaar|karna|bana|banana|chahiye|samajh|samjhao|kaam|shuru|madad)\b/i;
const SPANISH_HINT_RE = /\b(?:quiero|necesito|ayuda|hacer|decidir|arreglar|entender|pagina|página|mensaje|trabajo|hoy)\b/i;
const FRENCH_HINT_RE = /\b(?:je veux|j'ai besoin|aide|faire|decider|décider|corriger|comprendre|travail)\b/i;
const PORTUGUESE_HINT_RE = /\b(?:quero|preciso|ajuda|fazer|decidir|corrigir|entender|pagina|página|mensagem|trabalho)\b/i;
const GERMAN_HINT_RE = /\b(?:ich will|ich möchte|brauche|hilfe|machen|entscheiden|reparieren|verstehen|seite|nachricht|arbeit)\b/i;
const ENGLISH_HINT_RE = /\b(?:i|me|my|we|you|want|need|help|make|write|draft|create|build|fix|understand|decide|compare|latest|current|message|friend|feedback|without|what|how|why|when|where|please)\b/i;

function normalizeCode(value = '') {
    const code = String(value || '').trim().toLowerCase().replace('_', '-');
    if (!code) return '';
    if (LANGUAGES[code]) return code;
    const base = code.split('-')[0];
    if (LANGUAGES[base]) return base;
    if (base === 'ur') return 'hi';
    return '';
}

export function detectPromptLanguage(text = '') {
    const value = String(text || '');
    if (/[\u0600-\u06ff]/u.test(value)) return LANGUAGES.ar;
    if (/[\u0900-\u097f]/u.test(value)) return LANGUAGES.hi;
    if (HINGLISH_HINT_RE.test(value)) return LANGUAGES.hinglish;
    if (SPANISH_HINT_RE.test(value)) return LANGUAGES.es;
    if (FRENCH_HINT_RE.test(value)) return LANGUAGES.fr;
    if (PORTUGUESE_HINT_RE.test(value)) return LANGUAGES.pt;
    if (GERMAN_HINT_RE.test(value)) return LANGUAGES.de;
    if (ENGLISH_HINT_RE.test(value)) return LANGUAGES.en;
    return null;
}

export function detectBrowserLanguage() {
    if (typeof navigator === 'undefined') return LANGUAGES.en;
    const candidates = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    for (const candidate of candidates) {
        const code = normalizeCode(candidate);
        if (code && LANGUAGES[code]) return LANGUAGES[code];
    }
    return LANGUAGES.en;
}

export function getStoredReplyLanguage() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const code = normalizeCode(localStorage.getItem(STORAGE_KEY));
        return code ? LANGUAGES[code] : null;
    } catch {
        return null;
    }
}

export function saveReplyLanguage(code) {
    const normalized = normalizeCode(code);
    if (!normalized || typeof localStorage === 'undefined') return null;
    try {
        localStorage.setItem(STORAGE_KEY, normalized);
        return LANGUAGES[normalized];
    } catch {
        return null;
    }
}

export function resolveReplyLanguage(text = '', options = {}) {
    const seedCode = normalizeCode(
        options.seed?.language?.reply ||
        options.seed?.mirrorSeed?.language?.reply ||
        options.seed?.reply_language ||
        '',
    );
    const stored = getStoredReplyLanguage();
    const promptLanguage = detectPromptLanguage(text);
    return promptLanguage || (seedCode ? LANGUAGES[seedCode] : null) || stored || detectBrowserLanguage();
}

export function languagePayloadFor(text = '', options = {}) {
    const language = resolveReplyLanguage(text, options);
    return {
        reply_language: language.code,
        language_label: language.label,
        language_status: 'experimental',
        language_instruction: language.instruction,
    };
}

export function currentLanguageSnapshot() {
    const language = getStoredReplyLanguage() || detectBrowserLanguage();
    return {
        reply: language.code,
        label: language.label,
        source: getStoredReplyLanguage() ? 'stored' : 'browser',
    };
}
