#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const contextPath = '.mirror/CONTEXT_PACK.yaml';
const automaticIncludes = [
    'docs/CONTINUITY_LEDGER.md',
    'docs/TOPIC_PACKET_TEMPLATE.md',
];
const topicPacketDir = 'docs/topic-packets';
const args = process.argv.slice(2);
const bundleMode = args.includes('--bundle');
const outIndex = args.indexOf('--out');
const outputPath = outIndex >= 0 ? args[outIndex + 1] : '';
const maxBytesIndex = args.indexOf('--max-file-bytes');
const maxFileBytes = maxBytesIndex >= 0 ? Number.parseInt(args[maxBytesIndex + 1] || '', 10) : 40000;

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

function walkMarkdownFiles(relativeDir) {
    const absoluteDir = path.join(root, relativeDir);
    if (!fs.existsSync(absoluteDir)) return [];
    const found = [];
    for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
        const relativePath = path.join(relativeDir, entry.name);
        if (entry.isDirectory()) {
            found.push(...walkMarkdownFiles(relativePath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            found.push(relativePath);
        }
    }
    return found.sort();
}

function unique(values) {
    return [...new Set(values)];
}

function languageFor(relativePath) {
    if (relativePath.endsWith('.md')) return 'markdown';
    if (relativePath.endsWith('.json')) return 'json';
    if (relativePath.endsWith('.yaml') || relativePath.endsWith('.yml')) return 'yaml';
    if (relativePath.endsWith('.mjs') || relativePath.endsWith('.js') || relativePath.endsWith('.jsx')) return 'javascript';
    if (relativePath.endsWith('.sh')) return 'bash';
    if (relativePath.endsWith('.py')) return 'python';
    if (relativePath.endsWith('.html')) return 'html';
    if (relativePath.endsWith('.css')) return 'css';
    return 'text';
}

function fenceContent(text) {
    return text.replaceAll('```', '``\\`');
}

function writeOutput(text) {
    if (!outputPath) {
        console.log(text);
        return;
    }
    const absolute = path.join(root, outputPath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, text);
    console.log(`Wrote ${outputPath}`);
}

if (!exists(contextPath)) {
    console.error(`Missing ${contextPath}`);
    process.exit(1);
}

const context = read(contextPath);
const includePaths = listValues(context, '  include');
const excludeItems = listValues(context, '  exclude');
const topicPacketPaths = walkMarkdownFiles(topicPacketDir);
const allIncludePaths = unique([...includePaths, ...automaticIncludes, ...topicPacketPaths]);
const missing = [];
const included = [];

for (const includePath of allIncludePaths) {
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
        source: includePaths.includes(includePath) ? 'configured' : 'automatic',
        text,
    });
}

const manifestLines = [
    'generated_context_pack:',
    `  source: ${contextPath}`,
    `  repo: ${root}`,
    `  generated_at: ${new Date().toISOString()}`,
    '  automatic_scope:',
    `    - docs/CONTINUITY_LEDGER.md`,
    `    - docs/TOPIC_PACKET_TEMPLATE.md`,
    `    - ${topicPacketDir}/**/*.md`,
    '  checked_scope:',
    ...included.map((item) => `    - ${item.path} source:${item.source} sha256:${item.sha256} bytes:${item.bytes}`),
    '  unchecked_scope:',
    ...excludeItems.map((item) => `    - ${item}`),
    '  missing_includes:',
    ...(missing.length ? missing.map((item) => `    - ${item}`) : ['    - none']),
    '  rule:',
    '    - Generated from files, not chat memory.',
    '    - Provider secrets and unrelated untracked docs stay out.',
];

if (missing.length) process.exit(1);

function renderManifest() {
    return manifestLines.join('\n');
}

function renderBundle() {
    const lines = [
        '# Active Mirror Context Bundle',
        '',
        `Generated: ${new Date().toISOString()}`,
        `Repo: ${root}`,
        `Source: ${contextPath}`,
        '',
        'This bundle is generated from repo files, not chat memory. It is designed for a future model run to ingest the current Active Mirror lane, state, rules, gates, and topic packets without asking Paul to restate the thread.',
        '',
        '## Manifest',
        '',
        '```yaml',
        renderManifest(),
        '```',
        '',
        '## Included Files',
        '',
    ];

    for (const item of included) {
        lines.push(`### ${item.path}`, '');
        lines.push(`- source: ${item.source}`);
        lines.push(`- sha256: ${item.sha256}`);
        lines.push(`- bytes: ${item.bytes}`);
        lines.push('');

        if (item.bytes > maxFileBytes) {
            lines.push(`Content omitted because this file is ${item.bytes} bytes and the bundle cap is ${maxFileBytes} bytes. Use the path and hash above to load it directly when needed.`);
            lines.push('');
            continue;
        }

        lines.push(`\`\`\`${languageFor(item.path)}`);
        lines.push(fenceContent(item.text));
        lines.push('```', '');
    }

    return lines.join('\n');
}

writeOutput(bundleMode ? renderBundle() : renderManifest());
