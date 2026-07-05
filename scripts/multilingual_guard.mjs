#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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

if (failures.length) {
    console.error('Multilingual guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Multilingual guard PASSED.');
