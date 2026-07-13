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
    'src/components/MirrorMoment.jsx',
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
    { pattern: /\bPerplexity\b/i, label: 'provider name: Perplexity' },
    { pattern: /\bMistral\b/i, label: 'provider name: Mistral' },
    { pattern: /\bDeepSeek\b/i, label: 'provider name: DeepSeek' },
    { pattern: /\bCohere\b/i, label: 'provider name: Cohere' },
    { pattern: /\bHugging\s*Face\b/i, label: 'provider name: Hugging Face' },
    { pattern: /\bQwen\b/i, label: 'model/provider name: Qwen' },
    { pattern: /\bLlama\b/i, label: 'model/provider name: Llama' },
    { pattern: /\bGrok\b/i, label: 'model/provider name: Grok' },
    { pattern: /\bxAI\b/i, label: 'provider name: xAI' },
    { pattern: /\bOllama\b/i, label: 'runtime/provider name: Ollama' },
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
    { pattern: /stuck point/i, label: 'clunky reflection wording' },
    { pattern: /held the turn|sensitive context/i, label: 'scary privacy hold wording' },
    { pattern: /Remember this|choose Remember/i, label: 'old memory action label' },
    { pattern: /\byou\s+(?:keep|are|you're|seem to|may be|might be)\s+[^.!?]{0,80}\b(?:avoid|avoiding|delay|delaying|procrastinat|hiding|dodging)\b/i, label: 'blamey motive-reading' },
    { pattern: /\byou\s+(?:use|are using|you're using)\s+[^.!?]{0,80}\b(?:to avoid|to delay|as a way to avoid|as a way to delay)\b/i, label: 'blamey motive-reading' },
    { pattern: /honest next move/i, label: 'wordy honesty phrasing' },
    { pattern: /Getting honest pushback|How should I push back|Push back/i, label: 'internal setup copy' },
    { pattern: /\bADHD\b|neurodivergent|neuroD/i, label: 'diagnostic audience language' },
    { pattern: /Challenge it|what I may be avoiding/i, label: 'harsh repair prompt' },
    { pattern: /you are treating|you're treating|the real question is|the loop is that|whole frame|this voice|specific,\s*bounded,\s*and usable/i, label: 'meta-analysis phrasing' },
];

const requiredTerms = [
    { pattern: /Bring the unfinished thing\./i, label: 'front-door creation promise' },
    { pattern: /Set a private context/i, label: 'front-door private-context path' },
    { pattern: /Load saved context/i, label: 'front-door upload button' },
    { pattern: /Start messy: I have an idea, but I do not know how to ship it\./i, label: 'plain first-use helper' },
    { pattern: /Make/i, label: 'front-door starter: make' },
    { pattern: /Decide/i, label: 'front-door starter: decide' },
    { pattern: /Fix/i, label: 'front-door starter: fix' },
    { pattern: /Understand/i, label: 'front-door starter: understand' },
    { pattern: /Talk/i, label: 'front-door starter: talk' },
    { pattern: /Think aloud/i, label: 'front-door starter: talk caption' },
    { pattern: /Save only if you choose/i, label: 'privacy choice promise' },
    { pattern: /Set it up\./i, label: 'setup: quick setup headline' },
    { pattern: /What are you here for\?/i, label: 'setup: help question' },
    { pattern: /What tone helps\?/i, label: 'setup: tone question' },
    { pattern: /What should it skip\?/i, label: 'setup: friction question' },
    { pattern: /What should it give you\?/i, label: 'setup: answer question' },
    { pattern: /Ready\./i, label: 'setup: ready state' },
    { pattern: /Start chat/i, label: 'setup: start chat' },
    { pattern: /Saved on this device/i, label: 'setup: saved confirmation' },
    { pattern: /Keep a copy/i, label: 'setup: portable download' },
    { pattern: /Working read/i, label: 'first response working-read heading' },
    { pattern: /Challenge/i, label: 'first response challenge action' },
    { pattern: /Improve/i, label: 'first response improve action' },
    { pattern: /Evidence and boundary/i, label: 'first response evidence action' },
    { pattern: /Public draft/i, label: 'first response public draft remains bounded' },
];

const mainEntry = read('src/main.jsx');
const viteConfig = read('vite.config.js');
const offlineE2E = read('scripts/offline_app_shell_e2e.mjs');
const productionBundleServer = read('scripts/production_bundle_server.mjs');
const privacyEvents = read('src/lib/privacy-events.js');

if (!mainEntry.includes(".register(`${import.meta.env.BASE_URL}service-worker.js`")) {
    failures.push('missing production service-worker registration for the /app scope');
}
if (!viteConfig.includes("name: 'active-mirror-app-shell-service-worker'")) {
    failures.push('missing generated offline app-shell worker');
}
if (!viteConfig.includes("request.method !== 'GET'") || !viteConfig.includes("request.mode === 'navigate'")) {
    failures.push('offline app-shell worker must reject writes and bound navigation fallback');
}
if (!viteConfig.includes("'index.html',") || !viteConfig.includes('const APP_INDEX')) {
    failures.push('offline app-shell worker must precache the navigation fallback');
}
if (!viteConfig.includes("url.pathname.startsWith") || !viteConfig.includes("v1/")) {
    failures.push('offline app-shell worker must exclude API traffic');
}
if (!viteConfig.includes("caches.match(request, { ignoreVary: true })")) {
    failures.push('offline app-shell worker must match same-origin hashed assets across Vary headers');
}
if (!viteConfig.includes("PRIVATE_RECALL_RUNTIME_CACHE = 'active-mirror-private-recall-runtime-v1'") || !viteConfig.includes('PRIVATE_RECALL_RUNTIME_PREFIX')) {
    failures.push('private recall must persist its self-hosted runtime only after opt-in');
}
if (!offlineE2E.includes('context.setOffline(true)') || !offlineE2E.includes('playwright-trace.zip')) {
    failures.push('missing real-browser offline reload and trace evidence harness');
}
if (!offlineE2E.includes('startProductionBundleServer') || !offlineE2E.includes('navigator.serviceWorker.controller')) {
    failures.push('offline shell E2E must exercise the production bundle with a bounded service-worker check');
}
if (!productionBundleServer.includes("'service-worker.js'") || !productionBundleServer.includes("request.method || ''")) {
    failures.push('missing bounded local production-bundle server for browser E2E');
}
if (!read('src/pages/HomePage.jsx').includes('if (!navigator.onLine)') || !privacyEvents.includes('if (!navigator.onLine) return;')) {
    failures.push('known-offline use must not attempt model or telemetry network routes');
}

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
        if (/<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(line)) return;
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
