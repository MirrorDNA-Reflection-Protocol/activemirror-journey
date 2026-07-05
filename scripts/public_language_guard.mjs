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
];

const requiredResearchLanguage = [
    { pattern: /\bReal work, safely anonymized\./i, label: 'plain anonymized proof heading' },
    { pattern: /\bProof you can open\./i, label: 'plain public proof heading' },
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
