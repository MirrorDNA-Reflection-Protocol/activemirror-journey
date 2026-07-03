#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const contextPath = '.mirror/CONTEXT_PACK.yaml';

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function listValues(text, key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`^${escapedKey}:\\n((?:\\s+- .+\\n?)+)`, 'm'));
    if (!match) return [];
    return match[1]
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2).trim());
}

function sha256(text) {
    return createHash('sha256').update(text).digest('hex');
}

if (!exists(contextPath)) {
    console.error(`Missing ${contextPath}`);
    process.exit(1);
}

const context = read(contextPath);
const includePaths = listValues(context, '  include');
const excludeItems = listValues(context, '  exclude');
const missing = [];
const included = [];

for (const includePath of includePaths) {
    if (includePath.startsWith('/')) {
        missing.push(`${includePath} is absolute; context includes must be repo-relative`);
        continue;
    }
    if (!exists(includePath)) {
        missing.push(includePath);
        continue;
    }
    const text = read(includePath);
    included.push({
        path: includePath,
        bytes: Buffer.byteLength(text, 'utf8'),
        sha256: sha256(text),
    });
}

const lines = [
    'generated_context_pack:',
    `  source: ${contextPath}`,
    `  repo: ${root}`,
    `  generated_at: ${new Date().toISOString()}`,
    '  checked_scope:',
    ...included.map((item) => `    - ${item.path} sha256:${item.sha256} bytes:${item.bytes}`),
    '  unchecked_scope:',
    ...excludeItems.map((item) => `    - ${item}`),
    '  missing_includes:',
    ...(missing.length ? missing.map((item) => `    - ${item}`) : ['    - none']),
    '  rule:',
    '    - Generated from files, not chat memory.',
    '    - Provider secrets and unrelated untracked docs stay out.',
];

console.log(lines.join('\n'));

if (missing.length) process.exit(1);
