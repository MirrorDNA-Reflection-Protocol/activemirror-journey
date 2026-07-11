const STORAGE_KEY = 'active_mirror_reply_language_v1';

const LANGUAGES = {
    en: { code: 'en', label: 'English', instruction: 'Reply in English. Keep it short, plain, and useful.' },
    hi: { code: 'hi', label: 'Hindi', instruction: 'Reply in Hindi using natural Devanagari. Keep it short, plain, and useful.' },
    hinglish: { code: 'hinglish', label: 'Hinglish', instruction: 'Reply in natural Hinglish. Use simple Roman Hindi plus English where it feels normal. Avoid technical English such as tradeoff, friction, frame, or premise. Keep it short and useful.' },
    bn: { code: 'bn', label: 'Bengali', instruction: 'Reply in natural Bengali script. Keep it short, plain, and useful.' },
    ta: { code: 'ta', label: 'Tamil', instruction: 'Reply in natural Tamil script. Keep it short, plain, and useful.' },
    te: { code: 'te', label: 'Telugu', instruction: 'Reply in natural Telugu script. Keep it short, plain, and useful.' },
    mr: { code: 'mr', label: 'Marathi', instruction: 'Reply in natural Marathi using Devanagari. Keep it short, plain, and useful.' },
    gu: { code: 'gu', label: 'Gujarati', instruction: 'Reply in natural Gujarati script. Keep it short, plain, and useful.' },
    kn: { code: 'kn', label: 'Kannada', instruction: 'Reply in natural Kannada script. Keep it short, plain, and useful.' },
    ml: { code: 'ml', label: 'Malayalam', instruction: 'Reply in natural Malayalam script. Keep it short, plain, and useful.' },
    pa: { code: 'pa', label: 'Punjabi', instruction: 'Reply in natural Punjabi using Gurmukhi. Keep it short, plain, and useful.' },
    or: { code: 'or', label: 'Odia', instruction: 'Reply in natural Odia script. Keep it short, plain, and useful.' },
    ur: { code: 'ur', label: 'Urdu', instruction: 'Reply in natural Urdu script. Keep it short, plain, and useful.' },
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
const ENGLISH_HINT_RE = /\b(?:i|me|my|we|you|want|need|help|make|write|draft|create|build|fix|understand|decide|compare|should|latest|current|message|friend|feedback|without|what|how|why|when|where|please)\b/i;
const MARATHI_HINT_RE = /(?:मला|माझे|माझी|माझा|आहे|करायचे|करायचं|कसे|कशी|उद्या|नाही)/u;
const URDU_HINT_RE = /(?:مجھے|میرا|میری|کیا|کیسے|کرنا|چاہیے|نہیں|مدد)/u;

function normalizeCode(value = '') {
    const code = String(value || '').trim().toLowerCase().replace('_', '-');
    if (!code) return '';
    if (LANGUAGES[code]) return code;
    const base = code.split('-')[0];
    if (LANGUAGES[base]) return base;
    return '';
}

export function detectPromptLanguage(text = '') {
    const value = String(text || '');
    if (URDU_HINT_RE.test(value)) return LANGUAGES.ur;
    if (/[\u0600-\u06ff]/u.test(value)) return LANGUAGES.ar;
    if (/[\u0980-\u09ff]/u.test(value)) return LANGUAGES.bn;
    if (/[\u0a00-\u0a7f]/u.test(value)) return LANGUAGES.pa;
    if (/[\u0a80-\u0aff]/u.test(value)) return LANGUAGES.gu;
    if (/[\u0b00-\u0b7f]/u.test(value)) return LANGUAGES.or;
    if (/[\u0b80-\u0bff]/u.test(value)) return LANGUAGES.ta;
    if (/[\u0c00-\u0c7f]/u.test(value)) return LANGUAGES.te;
    if (/[\u0c80-\u0cff]/u.test(value)) return LANGUAGES.kn;
    if (/[\u0d00-\u0d7f]/u.test(value)) return LANGUAGES.ml;
    if (MARATHI_HINT_RE.test(value)) return LANGUAGES.mr;
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
