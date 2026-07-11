#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { languagePayloadFor } from '../src/lib/language-preference.js';
import { makeOfflineMirrorResult } from '../src/lib/first-turn-fallback.js';

const root = process.cwd();

function read(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
}

const checks = [
    {
        file: 'src/lib/language-preference.js',
        pattern: /language_status:\s*'experimental'/,
        label: 'language payload carries experimental status',
    },
    {
        file: 'src/lib/language-preference.js',
        pattern: /detectPromptLanguage/,
        label: 'prompt language detection exists',
    },
    {
        file: 'src/pages/HomePage.jsx',
        pattern: /languagePayloadFor\(cleanIntent,\s*\{\s*seed\s*\}\)/,
        label: 'reflection route sends reply language',
    },
    {
        file: 'src/pages/HomePage.jsx',
        pattern: /languagePayloadFor\(artifactIntent,\s*\{\s*seed\s*\}\)/,
        label: 'artifact route sends reply language',
    },
    {
        file: 'src/pages/Start.jsx',
        pattern: /language:\s*\{/,
        label: 'portable ID stores language metadata',
    },
    {
        file: 'src/components/TruthStateNotice.jsx',
        pattern: /languagePayloadFor\(intent \|\| mirror\.question \|\| ''\)/,
        label: 'source check route sends reply language',
    },
    {
        file: 'src/lib/first-turn-fallback.js',
        pattern: /LANGUAGE_MIRRORS/,
        label: 'local fallback has multilingual copies',
    },
];

const failures = [];

for (const check of checks) {
    const text = read(check.file);
    if (!check.pattern.test(text)) {
        failures.push(`${check.file}: missing ${check.label}`);
    }
}

const languageCases = [
    {
        text: 'Write a short message asking a friend for honest feedback without sounding needy.',
        expected: 'en',
        label: 'English prompt containing the word message must stay English',
    },
    {
        text: 'Should the glass dashboard be enterprise only?',
        expected: 'en',
        label: 'English decision prompt must stay English',
    },
    {
        text: 'Je veux écrire une réponse courte.',
        expected: 'fr',
        label: 'French prompt should resolve to French',
    },
    {
        text: 'Necesito escribir un mensaje corto.',
        expected: 'es',
        label: 'Spanish prompt should resolve to Spanish',
    },
    {
        text: 'Mujhe ek short reply banana hai.',
        expected: 'hinglish',
        label: 'Hinglish prompt should resolve to Hinglish',
    },
    { text: 'আগামীকাল দোকানের হিসাব শেষ করতে হবে।', expected: 'bn', label: 'Bengali script should resolve to Bengali' },
    { text: 'நாளை வாடிக்கையாளரை அழைக்க வேண்டும்.', expected: 'ta', label: 'Tamil script should resolve to Tamil' },
    { text: 'రేపు దుకాణం ఖాతాలు పూర్తి చేయాలి.', expected: 'te', label: 'Telugu script should resolve to Telugu' },
    { text: 'मला उद्या ग्राहकाला फोन करायचा आहे.', expected: 'mr', label: 'Marathi wording should resolve to Marathi' },
    { text: 'કાલે ગ્રાહકને ફોન કરવો છે.', expected: 'gu', label: 'Gujarati script should resolve to Gujarati' },
    { text: 'ನಾಳೆ ಗ್ರಾಹಕರಿಗೆ ಕರೆ ಮಾಡಬೇಕು.', expected: 'kn', label: 'Kannada script should resolve to Kannada' },
    { text: 'നാളെ ഉപഭോക്താവിനെ വിളിക്കണം.', expected: 'ml', label: 'Malayalam script should resolve to Malayalam' },
    { text: 'ਕੱਲ੍ਹ ਗਾਹਕ ਨੂੰ ਫ਼ੋਨ ਕਰਨਾ ਹੈ।', expected: 'pa', label: 'Gurmukhi script should resolve to Punjabi' },
    { text: 'ଆସନ୍ତାକାଲି ଗ୍ରାହକଙ୍କୁ ଫୋନ୍ କରିବାକୁ ହେବ।', expected: 'or', label: 'Odia script should resolve to Odia' },
    { text: 'مجھے کل گاہک کو فون کرنا ہے۔', expected: 'ur', label: 'Urdu wording should resolve to Urdu' },
];

for (const item of languageCases) {
    const actual = languagePayloadFor(item.text).reply_language;
    if (actual !== item.expected) {
        failures.push(`${item.label}: expected ${item.expected}, got ${actual}`);
    }

    if (['bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur'].includes(item.expected)) {
        const fallback = makeOfflineMirrorResult(item.text, 'network', languagePayloadFor(item.text));
        if (!fallback.mirror?.reflection || /^[\x00-\x7F]*$/.test(fallback.mirror.reflection)) {
            failures.push(`${item.label}: local fallback did not preserve a native-script response`);
        }
    }
}

if (failures.length) {
    console.error('Multilingual guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Multilingual guard PASSED.');
