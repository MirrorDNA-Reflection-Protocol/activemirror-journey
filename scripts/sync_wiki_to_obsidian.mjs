#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const wikiDir = path.join(repoRoot, 'docs', 'wiki');
const defaultVault = '/Users/mirror-pro/MirrorDNA-Vault';
const vaultRoot = process.env.ACTIVE_MIRROR_OBSIDIAN_VAULT || defaultVault;
const targetDir = process.env.ACTIVE_MIRROR_OBSIDIAN_WIKI_DIR
    || path.join(vaultRoot, '01_ACTIVE', 'ActiveMirror', 'Product Wiki');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function read(relativePath) {
    return fs.readFileSync(path.join(wikiDir, relativePath), 'utf8');
}

function writeFile(filePath, content) {
    if (dryRun) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

function gitValue(argsList) {
    try {
        return execFileSync('git', argsList, { cwd: repoRoot, encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
}

if (!fs.existsSync(wikiDir)) {
    console.error(`missing wiki dir: ${wikiDir}`);
    process.exit(1);
}

if (!fs.existsSync(vaultRoot)) {
    console.error(`missing Obsidian vault root: ${vaultRoot}`);
    process.exit(1);
}

const files = fs.readdirSync(wikiDir)
    .filter((file) => file.endsWith('.md'))
    .sort();

if (!files.length) {
    console.error(`no wiki markdown files found in ${wikiDir}`);
    process.exit(1);
}

const syncedAt = new Date().toISOString();
const commit = gitValue(['rev-parse', '--short', 'HEAD']);
const branch = gitValue(['branch', '--show-current']);
const sourceRepo = repoRoot;
const records = [];

const titleMap = {
    'README.md': 'Start Here',
    'build-and-deploy.md': 'Build And Deploy',
    'current-product-map.md': 'Current Product Map',
    'language-guide.md': 'Language Guide',
    'open-questions.md': 'Open Questions',
    'user-flow.md': 'User Flow',
};

for (const file of files) {
    const body = read(file);
    const sourcePath = path.join(wikiDir, file);
    const sourceHash = sha256(body);
    const mirrored = [
        '---',
        'generated: true',
        'mirror_status: obsidian_reference_copy',
        'canonical_source: activemirror-journey/docs/wiki',
        `source_file: ${sourcePath}`,
        `source_sha256: ${sourceHash}`,
        `source_commit: ${commit}`,
        `synced_at: ${syncedAt}`,
        'tags:',
        '  - active-mirror',
        '  - product-wiki',
        '---',
        '',
        '> Reference copy. Edit the repo wiki, then run `npm run wiki:obsidian` to refresh this note.',
        '',
        body.trimEnd(),
        '',
    ].join('\n');
    const targetPath = path.join(targetDir, file);
    writeFile(targetPath, mirrored);
    records.push({
        file,
        title: titleMap[file] || file.replace(/\.md$/, ''),
        sourcePath,
        targetPath,
        sourceHash,
        bytes: Buffer.byteLength(mirrored),
    });
}

const indexLines = [
    '---',
    'generated: true',
    'mirror_status: obsidian_reference_index',
    'canonical_source: activemirror-journey/docs/wiki',
    `source_repo: ${sourceRepo}`,
    `source_branch: ${branch}`,
    `source_commit: ${commit}`,
    `synced_at: ${syncedAt}`,
    'tags:',
    '  - active-mirror',
    '  - product-wiki',
    '---',
    '',
    '# Active Mirror Product Wiki',
    '',
    'This is an Obsidian reference mirror of the repo-local product wiki.',
    '',
    'Canonical source: `/Users/mirror-pro/repos/activemirror-journey/docs/wiki/`',
    '',
    '## Start Here',
    '',
    ...records.map((record) => `- [[${record.file.replace(/\.md$/, '')}|${record.title}]]`),
    '',
    '## Rule',
    '',
    'Edit the repo wiki first. Refresh this mirror with:',
    '',
    '```bash',
    'npm run wiki:obsidian',
    '```',
    '',
];

writeFile(path.join(targetDir, 'Active Mirror Product Wiki.md'), indexLines.join('\n'));

const receiptLines = [
    '---',
    'generated: true',
    'mirror_status: obsidian_sync_receipt',
    'canonical_source: activemirror-journey/docs/wiki',
    `source_commit: ${commit}`,
    `source_branch: ${branch}`,
    `synced_at: ${syncedAt}`,
    'tags:',
    '  - active-mirror',
    '  - product-wiki',
    '  - receipt',
    '---',
    '',
    '# Active Mirror Wiki Sync Receipt',
    '',
    `- Source repo: \`${sourceRepo}\``,
    `- Source commit: \`${commit}\``,
    `- Target folder: \`${targetDir}\``,
    `- Mode: ${dryRun ? 'dry-run' : 'write'}`,
    '',
    '## Files',
    '',
    ...records.map((record) => `- \`${record.file}\` -> \`${path.relative(vaultRoot, record.targetPath)}\` sha256:\`${record.sourceHash}\``),
    '',
    '## Boundary',
    '',
    '- This sync copies public product-wiki notes only.',
    '- It does not export private vault content.',
    '- It does not delete stale Obsidian notes.',
    '',
];

writeFile(path.join(targetDir, '_SYNC_RECEIPT.md'), receiptLines.join('\n'));

console.log(JSON.stringify({
    ok: true,
    dryRun,
    source: wikiDir,
    target: targetDir,
    source_commit: commit,
    files: records.map((record) => ({
        file: record.file,
        sha256: record.sourceHash,
        bytes: record.bytes,
    })),
}, null, 2));
