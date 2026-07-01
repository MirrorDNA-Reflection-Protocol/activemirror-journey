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
    'src/components/MirrorFeedback.jsx',
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
    { pattern: /\bChatGPT\b/i, label: 'provider name: ChatGPT' },
    { pattern: /\bClaude\b/i, label: 'provider name: Claude' },
    { pattern: /\bAnthropic\b/i, label: 'provider name: Anthropic' },
    { pattern: /\bGemini\b/i, label: 'provider name: Gemini' },
    { pattern: /\bCopilot\b/i, label: 'provider name: Copilot' },
    { pattern: /\bOpenAI\b/i, label: 'provider name: OpenAI' },
    { pattern: /\bGPT[-\w.]*\b/i, label: 'model name: GPT' },
    { pattern: /\b(?:raw|entire|whole)\s+vault\b/i, label: 'unsupported vault authority claim' },
    { pattern: /\ball\s+(?:your|the)\s+memories\b/i, label: 'unsupported vault authority claim' },
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
    { pattern: /need to hear|want to hear/i, label: 'paternal promise' },
    { pattern: /\byou\s+(?:keep|are|you're|seem to|may be|might be)\s+[^.!?]{0,80}\b(?:avoid|avoiding|delay|delaying|procrastinat|hiding|dodging)\b/i, label: 'blamey motive-reading' },
    { pattern: /\byou\s+(?:use|are using|you're using)\s+[^.!?]{0,80}\b(?:to avoid|to delay|as a way to avoid|as a way to delay)\b/i, label: 'blamey motive-reading' },
    { pattern: /honest next move/i, label: 'wordy honesty phrasing' },
    { pattern: /Getting honest pushback|How should I push back|Push back/i, label: 'internal setup copy' },
    { pattern: /\bADHD\b|neurodivergent|neuroD/i, label: 'diagnostic audience language' },
];

const requiredTerms = [
    { pattern: /What do you want\?/i, label: 'front-door question' },
    { pattern: /Start here/i, label: 'front-door start button' },
    { pattern: /Already have ID\?/i, label: 'front-door upload button' },
    { pattern: /Or type what you want/i, label: 'plain first-use helper' },
    { pattern: /Your thoughts stay yours/i, label: 'privacy choice promise' },
    { pattern: /What do you usually need help with\?/i, label: 'setup: help question' },
    { pattern: /How direct should it be\?/i, label: 'setup: directness question' },
    { pattern: /What gets annoying fast\?/i, label: 'setup: friction question' },
    { pattern: /What kind of answers help you move\?/i, label: 'setup: answer question' },
    { pattern: /Your mirror is ready\./i, label: 'setup: ready state' },
    { pattern: /Start chat/i, label: 'setup: start chat' },
    { pattern: /Saved in this browser/i, label: 'setup: saved confirmation' },
    { pattern: /Download ID/i, label: 'setup: portable download' },
    { pattern: /Different angle/i, label: 'first-use follow-up: different angle' },
    { pattern: /Draft it/i, label: 'first-use follow-up: draft it' },
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
