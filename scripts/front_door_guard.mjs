#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const scanFiles = [
    'index.html',
    'src/App.jsx',
    'src/pages/HomePage.jsx',
    'src/pages/Start.jsx',
    'src/pages/DeviceExperience.jsx',
    'src/pages/Privacy.jsx',
    'src/pages/Terms.jsx',
    'src/components/ReflectionCardActions.jsx',
];

const bannedConsumerTerms = [
    { pattern: /\bviewport(s)?\b/i, label: 'internal language: viewport' },
    { pattern: /\bwidget(s)?\b/i, label: 'internal language: widget' },
    { pattern: /\broute airlock\b/i, label: 'internal language: route airlock' },
    { pattern: /\bOPFS\b/i, label: 'internal implementation: OPFS' },
    { pattern: /\bWebLLM\b/i, label: 'internal/provider implementation: WebLLM' },
    { pattern: /\bSovereign Mode\b/i, label: 'stale mode label: Sovereign Mode' },
    { pattern: /\bv0\.1\b/i, label: 'version leakage: v0.1' },
    { pattern: /\bkernel\b/i, label: 'internal architecture: kernel' },
    { pattern: /\bhash chain\b/i, label: 'enterprise proof machinery on consumer surface' },
    { pattern: /\bcryptographic\b/i, label: 'enterprise proof machinery on consumer surface' },
    { pattern: /\bGroq\b/i, label: 'provider name: Groq' },
    { pattern: /\bClaude\b/i, label: 'provider name: Claude' },
    { pattern: /\bAnthropic\b/i, label: 'provider name: Anthropic' },
    { pattern: /\bGemini\b/i, label: 'provider name: Gemini' },
    { pattern: /\bOpenAI\b/i, label: 'provider name: OpenAI' },
    { pattern: /\bGPT[-\w.]*\b/i, label: 'model name: GPT' },
    { pattern: /\bmodel route\b/i, label: 'internal routing language: model route' },
    { pattern: /\bmirror route\b/i, label: 'internal routing language: mirror route' },
    { pattern: /\bmodel routing\b/i, label: 'internal routing language: model routing' },
    { pattern: /\bModel and source routes\b/i, label: 'internal routing language: model and source routes' },
    { pattern: /\bsource routes\b/i, label: 'internal routing language: source routes' },
    { pattern: /\bprovider routes\b/i, label: 'internal routing language: provider routes' },
    { pattern: /\banswer provider\b/i, label: 'internal routing language: answer provider' },
    { pattern: /\bAI provider\b/i, label: 'internal/vendor language: AI provider' },
    { pattern: /\bcloud model\b/i, label: 'internal/vendor language: cloud model' },
    { pattern: /\bsearch providers\b/i, label: 'internal/vendor language: search providers' },
];

const requiredTerms = [
    { pattern: /What do you want\?/i, label: 'front-door question' },
    { pattern: /Start here/i, label: 'front-door start button' },
    { pattern: /Already have ID\?/i, label: 'front-door upload button' },
    { pattern: /Or type what you want/i, label: 'plain first-use helper' },
    { pattern: /Your thoughts stay yours/i, label: 'privacy choice promise' },
    { pattern: /Make it feel like yours\./i, label: 'setup: plain promise' },
    { pattern: /What do you need first\?/i, label: 'setup: entry question' },
    { pattern: /What helps first\?/i, label: 'setup: first-answer question' },
    { pattern: /What should it avoid\?/i, label: 'setup: boundary question' },
    { pattern: /Save and start/i, label: 'setup: explicit save' },
    { pattern: /Saved in this browser/i, label: 'setup: saved confirmation' },
    { pattern: /Download choices/i, label: 'setup: portable download' },
    { pattern: /Ask this/i, label: 'response label: ask this' },
    { pattern: /Try this/i, label: 'response label: try this' },
    { pattern: /What else\?/i, label: 'first-use follow-up: what else' },
    { pattern: /Challenge me/i, label: 'first-use follow-up: challenge' },
    { pattern: /Make it sendable/i, label: 'first-use follow-up: sendable' },
    { pattern: /Pick the move/i, label: 'loop brake follow-up' },
];

function read(file) {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) return '';
    return fs.readFileSync(absolute, 'utf8');
}

const failures = [];
let combined = '';

for (const file of scanFiles) {
    const text = read(file);
    combined += `\n\n/* ${file} */\n${text}`;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
        if (/<meta\s+name=["']viewport["']/i.test(line)) return;
        for (const rule of bannedConsumerTerms) {
            if (rule.pattern.test(line)) {
                failures.push(`${file}:${index + 1} ${rule.label}: ${line.trim()}`);
            }
        }
    });
}

for (const rule of requiredTerms) {
    if (!rule.pattern.test(combined)) {
        failures.push(`missing ${rule.label}`);
    }
}

if (failures.length) {
    console.error('Front door guard FAILED.');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exit(1);
}

console.log('Front door guard PASSED.');
