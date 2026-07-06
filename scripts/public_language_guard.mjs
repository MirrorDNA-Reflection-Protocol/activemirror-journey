#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const scanFiles = [
    'src/pages/HomePage.jsx',
    'src/pages/Start.jsx',
    'src/pages/DeviceExperience.jsx',
    'src/pages/Enterprise.jsx',
    'src/pages/Research.jsx',
    'src/pages/FeedbackDashboard.jsx',
    'src/components/MirrorFeedback.jsx',
    'src/components/ReflectionCardActions.jsx',
    'src/components/TruthStateNotice.jsx',
];

const frontDoorFiles = new Set([
    'src/pages/HomePage.jsx',
    'src/pages/Start.jsx',
    'src/pages/DeviceExperience.jsx',
    'src/pages/FeedbackDashboard.jsx',
    'src/components/MirrorFeedback.jsx',
    'src/components/ReflectionCardActions.jsx',
    'src/components/TruthStateNotice.jsx',
]);

const blockedPublicLanguage = [
    { pattern: /\bwhat we can claim\b/i, label: 'internal proof-control language' },
    { pattern: /\bclient exposure\b/i, label: 'defensive client-disclosure language' },
    { pattern: /\bwithout client exposure\b/i, label: 'defensive client-disclosure language' },
    { pattern: /\bnamed client claims?\b/i, label: 'internal approval language' },
    { pattern: /\bpublic story can describe\b/i, label: 'internal story-control language' },
    { pattern: /\bstronger public claim\b/i, label: 'internal approval language' },
    { pattern: /\bwhat is publicly sayable\b/i, label: 'internal approval language' },
    { pattern: /\bapproval to name\b/i, label: 'internal approval language' },
    { pattern: /\bclaim hierarchy\b/i, label: 'internal positioning language' },
    { pattern: /\bdefensible claim\b/i, label: 'internal positioning language' },
    { pattern: /\binside[- ]baseball\b/i, label: 'internal critique language' },
    { pattern: /\bkernel\b/i, label: 'architecture leakage' },
    { pattern: /\borchestration kernel\b/i, label: 'architecture leakage' },
    { pattern: /\bContext Compiler\b/i, label: 'architecture leakage' },
    { pattern: /\bTrust Compiler\b/i, label: 'architecture leakage' },
    { pattern: /\bLoopDNA\b/i, label: 'architecture leakage' },
    { pattern: /\bDrift Firewall\b/i, label: 'architecture leakage' },
    { pattern: /\bReasoning Dataset Generator\b/i, label: 'architecture leakage' },
    { pattern: /\bsemantic UI compiler\b/i, label: 'architecture leakage' },
    { pattern: /\bMirrorDNA\b/i, label: 'internal protocol language on public surface' },
    { pattern: /\bMirrorSeed\b/i, label: 'internal protocol language on public surface' },
    { pattern: /\bBrainScan\b/i, label: 'internal protocol language on public surface' },
    { pattern: /\bsovereign\b/i, label: 'internal strategy language' },
    { pattern: /\bcryptographic\b/i, label: 'enterprise proof machinery as public copy' },
    { pattern: /\bhash chain\b/i, label: 'enterprise proof machinery as public copy' },
    { pattern: /\bSWFI\b/i, label: 'client name leakage' },
    { pattern: /\bpublished protocols?\b/i, label: 'proof-room language before user value' },
    { pattern: /\bsource-backed\b/i, label: 'proof-room language before user value' },
    { pattern: /\bsource backed\b/i, label: 'proof-room language before user value' },
    { pattern: /\bproduct claims?\b/i, label: 'internal product-claim language' },
    { pattern: /\bbefore public language\b/i, label: 'internal critique accidentally exposed' },
    { pattern: /\bPublic trail\b/i, label: 'proof-room heading before user value' },
    { pattern: /\bdeployment evidence\b/i, label: 'proof-room language before user value' },
    { pattern: /\bgovernance-oriented\b/i, label: 'architecture language before user value' },
    { pattern: /\bgovernance layer\b/i, label: 'architecture language before user value' },
    { pattern: /\bgoverned\b/i, label: 'architecture language before user value' },
    { pattern: /\bsource-heavy\b/i, label: 'internal source-control language' },
    { pattern: /\bunsupported claims?\b/i, label: 'internal claim-control language' },
    { pattern: /\bapproval-ready\b/i, label: 'internal approval language' },
    { pattern: /\bblind claims?\b/i, label: 'internal claim-control language' },
];

const blockedFrontDoorLanguage = [
    { pattern: /\bproof\b/i, label: 'front-door proof-room language' },
    { pattern: /\breceipts?\b/i, label: 'front-door receipt machinery' },
    { pattern: /\bclaims?\b/i, label: 'front-door claim-control language' },
    { pattern: /\bsource[- ]?checked\b/i, label: 'front-door source-check status language' },
    { pattern: /\bsource-backed\b/i, label: 'front-door proof-room language' },
    { pattern: /\bpublished\b/i, label: 'front-door research-room language' },
    { pattern: /\bprotocols?\b/i, label: 'front-door protocol language' },
    { pattern: /\bgoverned\b/i, label: 'front-door governance language' },
];

const requiredResearchLanguage = [
    { pattern: /\bHow we build it\./i, label: 'research plain-language hero' },
    { pattern: /\bField story, anonymized\./i, label: 'plain anonymized field heading' },
    { pattern: /\bOpen references\./i, label: 'plain open references heading' },
];

function hasLikelyVisibleText(line = '') {
    if (/(?:href|src|import)\s*[:=]/i.test(line)) return false;
    if (/\b(?:const|let|var|function|return)\s+[A-Za-z0-9_$]+\s*[=({]/.test(line) && !/['"`]/.test(line)) return false;
    return /['"`][^'"`]{3,}['"`]/.test(line) || />[^<]{3,}</.test(line);
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
        if (!hasLikelyVisibleText(line)) return;
        for (const rule of blockedPublicLanguage) {
            if (rule.pattern.test(line)) {
                failures.push(`${file}:${index + 1} ${rule.label}: ${line.trim()}`);
            }
        }
        if (frontDoorFiles.has(file)) {
            for (const rule of blockedFrontDoorLanguage) {
                if (rule.label === 'front-door receipt machinery' && /\bmirror\.receipt\b/.test(line)) continue;
                if (rule.pattern.test(line)) {
                    failures.push(`${file}:${index + 1} ${rule.label}: ${line.trim()}`);
                }
            }
        }
    });
}

for (const rule of requiredResearchLanguage) {
    if (!rule.pattern.test(combined)) {
        failures.push(`missing ${rule.label}: ${rule.pattern}`);
    }
}

if (failures.length) {
    console.error('Public language guard FAILED.');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exit(1);
}

console.log('Public language guard PASSED.');
