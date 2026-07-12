#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const failures = [];
const checks = [];

function check(condition, label, detail = '') {
    checks.push({ label, passed: Boolean(condition), detail });
    if (!condition) failures.push(detail ? `${label}: ${detail}` : label);
}

async function readText(relativePath) {
    return fs.readFile(path.join(ROOT, relativePath), 'utf8');
}

async function readJson(relativePath) {
    return JSON.parse(await readText(relativePath));
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await walk(entryPath));
        else files.push(entryPath);
    }
    return files;
}

function lineNumber(source, index) {
    return source.slice(0, index).split('\n').length;
}

function rgb(hex) {
    const value = String(hex).replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(value)) throw new Error(`invalid color ${hex}`);
    return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function luminance(hex) {
    const channels = rgb(hex).map((channel) => (
        channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4
    ));
    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrast(foreground, background) {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function checkContrast(label, foreground, background, floor) {
    const measured = contrast(foreground, background);
    check(measured >= floor, label, `${measured.toFixed(2)}:1, required ${floor}:1`);
}

function cssVariables(block) {
    return Object.fromEntries(
        [...block.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)]
            .map((match) => [match[1], match[2].toUpperCase()]),
    );
}

const lockText = await readText('src/design/amos-design-lock.json');
const lock = JSON.parse(lockText);
const tokensText = await readText('src/design/amos-design-tokens.json');
const tokens = JSON.parse(tokensText);
const trustStates = await readJson('src/design/trust-states.json');
const boundary = await readJson('src/design/authority-and-boundary.json');
const tokenCss = await readText('src/design/amos-design-tokens.css');
const home = await readText('src/pages/HomePage.jsx');
const rail = await readText('src/components/TrustStatusRail.jsx');
const main = await readText('src/main.jsx');
const projection = await readText('docs/design-system/ACTIVE_MIRROR_DESIGN_PROJECTION.md');
const generated = await readText('docs/design-system/activemirror/MASTER.md');

check(sha256(tokensText) === lock.tokens_sha256, 'token snapshot hash matches design lock');
check(lock.generator?.version === '2.10.2', 'generator version is pinned');
check(lock.generator?.status === 'rejected', 'generated candidate is explicitly rejected');
check(
    generated.includes(`Generated candidate SHA-256:** \`${lock.generator?.candidate_sha256}\``),
    'generated proposal carries its original candidate hash',
);
check(generated.includes('Reconciliation status:** `rejected`'), 'generated proposal is visibly rejected');
check(projection.includes('Status: `reconciled`'), 'product projection is visibly reconciled');

const governanceIds = trustStates.governance_states?.map((item) => item.id) || [];
check(
    JSON.stringify(governanceIds) === JSON.stringify(['proposed', 'verified', 'rejected', 'rolled_back']),
    'governance vocabulary is fixed',
    governanceIds.join(', '),
);
const actionIds = trustStates.action_outcomes?.map((item) => item.id) || [];
check(actionIds.includes('blocked') && actionIds.includes('executed'), 'action outcomes remain separate from governance states');
check(trustStates.color_only_allowed === false, 'trust states prohibit color-only meaning');
check(
    boundary.authority_levels?.some((item) => item.id === 'act' && item.approval_required === true),
    'act authority requires approval',
);
check(
    ['local_device', 'private_mesh', 'external_provider'].every((id) => (
        boundary.processing_boundaries?.some((item) => item.id === id)
    )),
    'all processing boundaries are contracted',
);

check(main.includes("./design/amos-design-tokens.css"), 'semantic token CSS loads before the app');
check(home.includes('data-product-mode="mirror"'), 'home declares Mirror product mode');
check(home.includes('<TrustStatusRail'), 'home renders the trust status rail');
check(home.includes('am-primary-action'), 'home primary action uses the semantic action class');
check(rail.includes('data-authority="draft"'), 'trust rail exposes bounded draft authority');
check(rail.includes('data-processing-boundary'), 'trust rail exposes processing boundary');
check(tokenCss.includes('@media (prefers-reduced-motion: reduce)'), 'reduced motion is enforced');

const rootBlock = tokenCss.match(/:root\s*{([\s\S]*?)}/)?.[1] || '';
const darkBlock = tokenCss.match(/\[data-theme="dark"\]\s*{([\s\S]*?)}/)?.[1] || '';
const rootVars = cssVariables(rootBlock);
const darkVars = cssVariables(darkBlock);
check(rootVars['am-primary'] === tokens.colors.semantic.primary, 'light action token matches canonical JSON');
check(darkVars['am-primary'] === tokens.colors.semantic.primary, 'dark action token preserves contrast-safe jade');
check(darkVars['am-primary-marker'] === tokens.colors.semantic.local_marker_dark, 'dark local marker matches canonical JSON');

checkContrast('light body text contrast', tokens.colors.light.text, tokens.colors.light.canvas, 7);
checkContrast('light muted text contrast', tokens.colors.light.text_muted, tokens.colors.light.canvas, 4.5);
checkContrast('dark body text contrast', tokens.colors.dark.text, tokens.colors.dark.canvas, 7);
checkContrast('dark muted text contrast', tokens.colors.dark.text_muted, tokens.colors.dark.canvas, 4.5);
checkContrast('primary action text contrast', '#FFFFFF', tokens.colors.semantic.primary, 4.5);
checkContrast('dark focus text contrast', darkVars['am-focus'], tokens.colors.dark.surface, 4.5);
checkContrast('dark verified text contrast', darkVars['am-verified'], tokens.colors.dark.surface, 4.5);
checkContrast('dark rejected text contrast', darkVars['am-danger'], tokens.colors.dark.surface, 4.5);

const excluded = new Set([
    'src/components/MirrorSig.jsx',
    'src/pages/MirrorProdStory.css',
    'src/pages/MirrorProdStory.jsx',
]);
const sourceFiles = (await walk(path.join(ROOT, 'src')))
    .map((filePath) => path.relative(ROOT, filePath))
    .filter((relativePath) => /\.(?:css|js|jsx|mjs)$/.test(relativePath))
    .filter((relativePath) => !excluded.has(relativePath));
sourceFiles.push('tailwind.config.js');

const forbidden = [
    ['pink-purple color family', /\b(?:pink|purple|violet|fuchsia|magenta|rose-|indigo-)/i],
    ['forbidden generated color', /#(?:7c3aed|a78bfa|ec4899|faf5ff|4c1d95|ddd6fe)\b/i],
    ['runtime font CDN', /fonts\.googleapis\.com|fonts\.gstatic\.com/i],
    ['external style asset', /url\(\s*["']?https?:\/\//i],
    ['ornamental gradient', /(?:linear|radial|conic)-gradient|bg-gradient/i],
    ['negative letter spacing', /letter-spacing\s*:\s*-|tracking-\[-/i],
    ['viewport-scaled font size', /font-size\s*:[^;\n]*(?:vw|vh|vmin|vmax)/i],
    ['oversized component radius', /rounded-(?:xl|2xl|3xl)|rounded-\[[^\]]+\]/i],
    ['layout-shifting hover transform', /hover:(?:scale|translate|-translate)/i],
    ['pulsing status or loading decoration', /animate-pulse|pulse-slow/i],
    ['custom glow shadow', /shadow-\[[^\]]*rgba/i],
    ['dead fragment link', /href\s*=\s*["']#["']/i],
    ['empty click handler', /onClick\s*=\s*{\s*\(\s*\)\s*=>\s*{\s*}\s*}/i],
];

for (const relativePath of sourceFiles) {
    const source = await readText(relativePath);
    for (const [label, pattern] of forbidden) {
        const match = pattern.exec(source);
        if (match) failures.push(`${relativePath}:${lineNumber(source, match.index)}: ${label}`);
    }
    if (!relativePath.startsWith('src/design/')) {
        const rawColor = /#[0-9a-f]{3,8}\b/i.exec(source);
        if (rawColor) failures.push(`${relativePath}:${lineNumber(source, rawColor.index)}: raw color outside semantic token files`);
    }
}

check(sourceFiles.length >= 20, 'consumer source scan covered expected surface', `${sourceFiles.length} files`);

const report = {
    schema_version: 'active-mirror.design-constitution-guard/v1',
    status: failures.length ? 'FAIL' : 'PASS',
    checked_files: sourceFiles.length,
    checks,
    failures,
    checked_scope: [
        'design snapshot and generator provenance',
        'governance, action-outcome, authority, and processing-boundary contracts',
        'solid-token contrast floor',
        'consumer source prohibited-pattern scan',
        'Mirror home trust rail, product mode, primary action, and reduced motion hooks',
    ],
    excluded_scope: [
        'MirrorProd separately owned brand route',
        'MirrorSig user-generated signature palette',
        'generated proposal content after its rejected header',
        'composited browser pixels and operating-system font rendering',
    ],
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
