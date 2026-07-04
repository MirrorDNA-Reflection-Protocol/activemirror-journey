#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dossierDir = path.join(repoRoot, 'docs', 'dossiers');

const requiredFiles = [
    'README.md',
    'TEMPLATE.md',
];

const requiredSections = [
    '## Objective',
    '## User Outcome',
    '## Scope',
    '## Boundaries',
    '## Required Inputs',
    '## Implementation Surface',
    '## Checks',
    '## Challenge Contract',
    '## Bad News / Limits',
    '## Handoff',
];

const errors = [];

if (!fs.existsSync(dossierDir)) {
    errors.push(`missing dossier dir: ${dossierDir}`);
} else {
    for (const file of requiredFiles) {
        const fullPath = path.join(dossierDir, file);
        if (!fs.existsSync(fullPath)) errors.push(`missing required dossier file: ${file}`);
    }

    const dossierFiles = fs.readdirSync(dossierDir)
        .filter((file) => file.endsWith('.md'))
        .filter((file) => !requiredFiles.includes(file))
        .sort();

    if (!dossierFiles.length) {
        errors.push('no active dossier files found');
    }

    for (const file of dossierFiles) {
        const fullPath = path.join(dossierDir, file);
        const text = fs.readFileSync(fullPath, 'utf8');

        if (!text.startsWith('# Dossier: ')) {
            errors.push(`${file}: missing "# Dossier: " title`);
        }

        for (const section of requiredSections) {
            if (!text.includes(section)) {
                errors.push(`${file}: missing ${section}`);
            }
        }

        if (/sk-[A-Za-z0-9_-]{20,}/.test(text)) {
            errors.push(`${file}: possible provider secret detected`);
        }
    }
}

if (errors.length) {
    console.error('Dossier guard FAILED');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log('Dossier guard PASSED.');
