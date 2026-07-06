#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { languagePayloadFor } from '../src/lib/language-preference.js';

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
];

for (const item of languageCases) {
    const actual = languagePayloadFor(item.text).reply_language;
    if (actual !== item.expected) {
        failures.push(`${item.label}: expected ${item.expected}, got ${actual}`);
    }
}

if (failures.length) {
    console.error('Multilingual guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Multilingual guard PASSED.');
